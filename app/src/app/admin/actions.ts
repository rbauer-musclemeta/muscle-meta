'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { requireStaff } from '@/lib/program';
import { GRANTABLE_KEYS, PROGRAMS } from '@/programs/registry';

/* Manual access for the pilot (payments arrive in M4). Recorded in the
   audit log by a database trigger. */
export async function grantAccess(form: FormData) {
  await requireStaff();
  const userId = String(form.get('user_id'));
  const feature = String(form.get('feature'));
  if (!GRANTABLE_KEYS.has(feature)) return;
  const supabase = await supabaseServer();
  await supabase.from('entitlements').insert({ user_id: userId, feature_key: feature, source: 'manual' });
  revalidatePath('/admin');
}

export async function revokeAccess(form: FormData) {
  await requireStaff();
  const userId = String(form.get('user_id'));
  const feature = String(form.get('feature'));
  const supabase = await supabaseServer();
  await supabase.from('entitlements').update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId).eq('feature_key', feature).is('revoked_at', null);
  revalidatePath('/admin');
}

export async function addOverride(form: FormData) {
  await requireStaff();
  const supabase = await supabaseServer();
  const userId = String(form.get('user_id'));
  const row = {
    result_id: String(form.get('result_id')),
    user_id: userId,
    field: String(form.get('field')),
    from_value: String(form.get('from_value') || '') || null,
    to_value: String(form.get('to_value')),
    reason: String(form.get('reason') || '').trim()
  };
  const { error } = await supabase.from('result_overrides').insert(row);
  redirect(`/admin/members/${userId}${error ? '?error=override' : '?saved=override'}`);
}

export async function registerAsset(form: FormData) {
  const staff = await requireStaff();
  const supabase = await supabaseServer();
  const program = PROGRAMS.find(p => p.route === String(form.get('program_route')));
  if (!program) return { ok: false, message: 'Unknown program.' };
  const moduleId = String(form.get('module_id') || '') || null;
  const lessonId = String(form.get('lesson_id') || '') || null;
  const { error } = await supabase.from('assets').insert({
    title: String(form.get('title') || '').trim(),
    kind: String(form.get('kind') || 'download'),
    program_id: String(form.get('program_id')),
    module_id: moduleId,
    lesson_id: lessonId,
    access_key: program.access,
    storage_path: String(form.get('storage_path')),
    mime_type: String(form.get('mime_type') || '') || null,
    size_bytes: Number(form.get('size_bytes') || 0) || null,
    uploaded_by: staff.id
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/assets');
  return { ok: true, message: 'Saved.' };
}

export async function reassignAsset(form: FormData) {
  await requireStaff();
  const supabase = await supabaseServer();
  await supabase.from('assets').update({
    module_id: String(form.get('module_id') || '') || null,
    lesson_id: String(form.get('lesson_id') || '') || null
  }).eq('id', String(form.get('asset_id')));
  revalidatePath('/admin/assets');
}
