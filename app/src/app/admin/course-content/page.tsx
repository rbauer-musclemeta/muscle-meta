import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { PROGRAMS, programHome } from '@/programs/registry';
import ImportForm from './ImportForm';
import WorksheetUpload, { type Expected } from './WorksheetUpload';

export const metadata: Metadata = { title: 'Course content' };

export default async function CourseContent() {
  const config = PROGRAMS.find(p => p.kind === 'course')!;
  const supabase = await supabaseServer();
  const { data: course } = await supabase.from('courses').select('id, title').eq('slug', config.courseSlug!).maybeSingle();
  const { data: modules } = course
    ? await supabase.from('modules').select('id, title, position').eq('course_id', course.id).order('position')
    : { data: [] };
  const ids = (modules ?? []).map(m => m.id);
  const { data: lessons } = ids.length
    ? await supabase.from('lessons').select('id, module_id, title, position, content_version, updated_at, code:content->>code, ws:content->worksheet').in('module_id', ids)
    : { data: [] };
  const lessonIds = (lessons ?? []).map(l => l.id);
  const { data: assets } = lessonIds.length
    ? await supabase.from('assets').select('lesson_id, storage_path').in('lesson_id', lessonIds).eq('kind', 'worksheet')
    : { data: [] };

  const order = (l: { module_id: string; position: number }) => (modules!.find(m => m.id === l.module_id)?.position ?? 0) * 1000 + l.position;
  const sorted = [...(lessons ?? [])].sort((a, b) => order(a) - order(b));
  const expected: Expected[] = sorted.filter(l => l.ws).map(l => {
    const ws = l.ws as { title: string; file_name: string };
    return { lesson_id: l.id, lesson: `${l.code ?? ''} ${l.title}`.trim(), title: ws.title, file_name: ws.file_name, uploaded: !!assets?.some(a => a.lesson_id === l.id) };
  });
  const version = sorted[0]?.content_version;

  return (
    <>
      <h1 className="app-h1">Course content</h1>
      <p className="lede">Lesson text and worksheets for {config.title} live in the database and private storage, never in the public code repository. Load them here, in order.</p>
      {!course && <p className="app-note error" role="alert">The course is not in the database yet. Apply the course migration in Supabase, then reload this page.</p>}
      <p className="app-muted">
        {sorted.length ? `${sorted.length} lessons loaded${version ? `, content version ${version}` : ''}.` : 'No lessons loaded yet.'}{' '}
        <Link href={programHome(config)}>Open the course</Link>
      </p>
      {course && <ImportForm />}
      {course && <WorksheetUpload programRoute={config.route} programSlug={config.dbSlug} expected={expected} />}
    </>
  );
}
