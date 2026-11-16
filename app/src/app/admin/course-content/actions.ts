'use server';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/program';
import { PROGRAMS } from '@/programs/registry';
import { validateBundle, lessonPmids, type Bundle, type Reference } from '@/course/content';
import { checkPubmed } from '@/course/pubmed';

export type ImportResult = { ok: boolean; errors: string[]; warnings: string[]; imported: string[] };

/* Loads a course content bundle into the lessons table. The paid text never
   lives in the public repository; it arrives here, is checked (structure,
   evidence grades, voice rules, PubMed), and is written under the signed-in
   staff member's session so row-level security and the audit trigger apply.
   Nothing is written unless every check passes. */
export async function importCourseContent(_prev: ImportResult | null, form: FormData): Promise<ImportResult> {
  await requireStaff();
  const file = form.get('bundle');
  if (!(file instanceof File) || !file.size) return { ok: false, errors: ['Choose the bundle file (.content.json).'], warnings: [], imported: [] };

  let bundle: Bundle;
  try { bundle = JSON.parse(await file.text()); }
  catch { return { ok: false, errors: ['The file is not valid JSON.'], warnings: [], imported: [] }; }

  const { errors, warnings } = validateBundle(bundle);
  if (errors.length) return { ok: false, errors, warnings, imported: [] };

  const config = PROGRAMS.find(p => p.kind === 'course' && p.courseSlug === bundle.course);
  if (!config) return { ok: false, errors: [`No course program is registered for "${bundle.course}".`], warnings, imported: [] };

  const pub = await checkPubmed(Object.values(bundle.references));
  if (pub.length) return { ok: false, errors: pub, warnings, imported: [] };

  const supabase = await supabaseServer();
  const { data: course } = await supabase.from('courses').select('id').eq('slug', bundle.course).single();
  if (!course) return { ok: false, errors: [`Course "${bundle.course}" is not in the database. Apply the migration first.`], warnings, imported: [] };
  const { data: modules } = await supabase.from('modules').select('id, slug').eq('course_id', course.id);
  const moduleId = new Map((modules ?? []).map(m => [m.slug as string, m.id as string]));
  const missing = [...new Set(bundle.lessons.map(l => l.module))].filter(s => !moduleId.has(s));
  if (missing.length) return { ok: false, errors: [`Modules missing in the database: ${missing.join(', ')}. Apply the migration first.`], warnings, imported: [] };

  const rows = bundle.lessons.map(l => {
    const refs: Record<string, Reference> = {};
    for (const id of lessonPmids(l.content)) if (bundle.references[id]) refs[id] = bundle.references[id];
    return {
      module_id: moduleId.get(l.module)!,
      slug: l.slug,
      title: l.title,
      position: l.position,
      est_minutes: l.minutes,
      body_md: l.body_md,
      content: { ...l.content, code: l.code, references: refs },
      content_version: bundle.version,
      updated_at: new Date().toISOString()
    };
  });
  const { error } = await supabase.from('lessons').upsert(rows, { onConflict: 'module_id,slug' });
  if (error) return { ok: false, errors: [`Database: ${error.message}`], warnings, imported: [] };

  revalidatePath(`/${config.route}`, 'layout');
  revalidatePath('/admin/course-content');
  return { ok: true, errors: [], warnings, imported: bundle.lessons.map(l => `${l.code} ${l.title}`) };
}

/* Records an uploaded worksheet against its lesson. Program, module and
   access key come from the database, not the browser. Re-uploading the same
   file replaces it in place. */
export async function registerWorksheet(form: FormData): Promise<{ ok: boolean; message: string }> {
  const staff = await requireStaff();
  const supabase = await supabaseServer();
  const lessonId = String(form.get('lesson_id'));
  const path = String(form.get('storage_path'));
  const config = PROGRAMS.find(p => p.route === String(form.get('program_route')) && p.kind === 'course');
  if (!config) return { ok: false, message: 'Unknown course.' };
  const [{ data: program }, { data: lesson }] = await Promise.all([
    supabase.from('programs').select('id').eq('slug', config.dbSlug).single(),
    supabase.from('lessons').select('id, module_id').eq('id', lessonId).single()
  ]);
  if (!program || !lesson) return { ok: false, message: 'Lesson or program not found.' };
  const row = {
    title: String(form.get('title') || '').trim(),
    kind: 'worksheet',
    program_id: program.id,
    module_id: lesson.module_id,
    lesson_id: lesson.id,
    access_key: config.access,
    storage_path: path,
    mime_type: 'application/pdf',
    size_bytes: Number(form.get('size_bytes') || 0) || null,
    uploaded_by: staff.id
  };
  const { data: existing } = await supabase.from('assets').select('id').eq('storage_path', path).maybeSingle();
  const { error } = existing
    ? await supabase.from('assets').update(row).eq('id', existing.id)
    : await supabase.from('assets').insert(row);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/course-content');
  return { ok: true, message: existing ? 'Replaced.' : 'Saved.' };
}
