import 'server-only';
import { notFound } from 'next/navigation';
import { supabaseServer } from './supabase/server';
import type { ProgramConfig } from '@/programs/registry';
import type { Content, Reference, Track } from '@/course/content';

export type CourseLesson = {
  id: string; slug: string; title: string; position: number; est_minutes: number | null;
  code: string | null; completed: boolean; track: Track | null;
};
export type CourseModule = { id: string; slug: string; title: string; summary: string | null; position: number; lessons: CourseLesson[] };
export type CourseOutline = {
  courseId: string; programId: string; title: string; subtitle: string | null;
  modules: CourseModule[]; total: number; done: number; track: Track | null;
};

/* The course outline with this member's progress. Rows come back through RLS:
   a member without the course sees nothing even if they reach this code. */
export async function getCourse(userId: string, config: ProgramConfig): Promise<CourseOutline> {
  if (config.kind !== 'course' || !config.courseSlug) notFound();
  const supabase = await supabaseServer();
  const [{ data: course }, { data: program }] = await Promise.all([
    supabase.from('courses').select('id, title, subtitle').eq('slug', config.courseSlug).single(),
    supabase.from('programs').select('id').eq('slug', config.dbSlug).single()
  ]);
  if (!course || !program) throw new Error(`Course ${config.courseSlug} is not set up`);

  const { data: modules } = await supabase.from('modules').select('id, slug, title, summary, position')
    .eq('course_id', course.id).order('position');
  const moduleIds = (modules ?? []).map(m => m.id);
  const { data: lessons } = moduleIds.length
    ? await supabase.from('lessons').select('id, module_id, slug, title, position, est_minutes, code:content->>code')
      .in('module_id', moduleIds).not('content', 'is', null).order('position')
    : { data: [] as never[] };
  const lessonIds = (lessons ?? []).map(l => l.id);
  const { data: progress } = lessonIds.length
    ? await supabase.from('lesson_progress').select('lesson_id, completed_at, track, updated_at')
      .eq('user_id', userId).in('lesson_id', lessonIds).order('updated_at', { ascending: false })
    : { data: [] as never[] };
  const byLesson = new Map((progress ?? []).map(p => [p.lesson_id as string, p]));

  const outline: CourseModule[] = (modules ?? []).map(m => ({
    ...m,
    lessons: (lessons ?? []).filter(l => l.module_id === m.id).map(l => ({
      id: l.id, slug: l.slug, title: l.title, position: l.position, est_minutes: l.est_minutes,
      code: (l as { code?: string | null }).code ?? null,
      completed: !!byLesson.get(l.id)?.completed_at,
      track: (byLesson.get(l.id)?.track as Track | null) ?? null
    }))
  }));
  const all = outline.flatMap(m => m.lessons);
  const latestTrack = (progress ?? []).find(p => p.track)?.track as Track | undefined;
  return {
    courseId: course.id, programId: program.id, title: course.title, subtitle: course.subtitle,
    modules: outline, total: all.length, done: all.filter(l => l.completed).length, track: latestTrack ?? null
  };
}

export type LessonPage = {
  id: string; slug: string; title: string; est_minutes: number | null; module: CourseModule;
  content: Content; references: Record<string, Reference>; worksheets: { id: string; title: string; url: string | null }[];
  prev: CourseLesson | null; next: CourseLesson | null; completed: boolean;
};

export async function getLesson(userId: string, config: ProgramConfig, slug: string): Promise<{ outline: CourseOutline; lesson: LessonPage }> {
  const outline = await getCourse(userId, config);
  const flat = outline.modules.flatMap(m => m.lessons.map(l => ({ l, m })));
  const i = flat.findIndex(x => x.l.slug === slug);
  if (i < 0) notFound();
  const { l, m } = flat[i];

  const supabase = await supabaseServer();
  const [{ data: row }, { data: assets }] = await Promise.all([
    supabase.from('lessons').select('content').eq('id', l.id).single(),
    supabase.from('assets').select('id, title, storage_path').eq('lesson_id', l.id).order('created_at')
  ]);
  if (!row?.content) notFound();
  const content = row.content as Content & { references?: Record<string, Reference> };
  // Signed links expire after ten minutes; a guessed address does not work.
  const worksheets = await Promise.all((assets ?? []).map(async a => {
    const { data } = await supabase.storage.from('program-assets').createSignedUrl(a.storage_path, 600, { download: true });
    return { id: a.id, title: a.title, url: data?.signedUrl ?? null };
  }));
  return {
    outline,
    lesson: {
      id: l.id, slug: l.slug, title: l.title, est_minutes: l.est_minutes, module: m,
      content, references: content.references ?? {}, worksheets,
      prev: flat[i - 1]?.l ?? null, next: flat[i + 1]?.l ?? null, completed: l.completed
    }
  };
}
