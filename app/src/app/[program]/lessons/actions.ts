'use server';
import { supabaseServer } from '@/lib/supabase/server';
import { requireProgram } from '@/lib/program';
import { getLesson } from '@/lib/course';
import { lessonPath, programHome } from '@/programs/registry';
import { TRACKS, type Track } from '@/course/content';
import type { StepResult } from '@/components/ActionForm';

/* Lesson actions return the next address; ActionForm loads it as a page
   (components/ActionForm.tsx explains why they do not call redirect()). */

function readTrack(form: FormData): Track | null {
  const t = String(form.get('track') || '');
  return (TRACKS as readonly string[]).includes(t) ? (t as Track) : null;
}

async function save(route: string, slug: string, patch: { track?: Track | null; completed?: boolean }) {
  const { member, program } = await requireProgram(route);
  const { outline, lesson } = await getLesson(member.id, program, slug);
  const supabase = await supabaseServer();

  // First write in the course: record the enrollment (RLS checks access).
  const { data: enrolled } = await supabase.from('program_enrollments').select('started_on')
    .eq('user_id', member.id).eq('program_id', outline.programId).limit(1).maybeSingle();
  if (!enrolled) await supabase.from('program_enrollments').insert({ user_id: member.id, program_id: outline.programId });

  const row: Record<string, unknown> = { user_id: member.id, lesson_id: lesson.id, updated_at: new Date().toISOString() };
  if (patch.track !== undefined) row.track = patch.track;
  if (patch.completed) row.completed_at = new Date().toISOString();
  const { error } = await supabase.from('lesson_progress').upsert(row, { onConflict: 'user_id,lesson_id' });
  if (error) throw new Error(`Could not save progress: ${error.message}`);
  return { program, lesson };
}

export async function completeLesson(route: string, slug: string, form: FormData): Promise<StepResult> {
  const { program, lesson } = await save(route, slug, { completed: true, track: readTrack(form) ?? undefined });
  return { next: lesson.next ? lessonPath(program, lesson.next.slug) : `${programHome(program)}?finished=1` };
}

export async function chooseTrack(route: string, slug: string, form: FormData): Promise<StepResult> {
  const { program } = await save(route, slug, { track: readTrack(form) });
  return { next: `${lessonPath(program, slug)}#plan` };
}
