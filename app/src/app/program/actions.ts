'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';
import { requireProgramAccess, getJourney, ASSESSMENT_CODE } from '@/lib/program';
import { ORIENTATION, SAFETY_GATE, METRICS } from '@/engine/definitions';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';

const optionValues = (field: string) =>
  new Set<string>((ORIENTATION.questions.find(q => q.field === field)?.options ?? []).map(o => o.value));

/* Orientation: stored as its own record, never read by scoring except the
   safety answer, which is collected on the next screen. */
export async function saveOrientation(form: FormData) {
  const member = await requireProgramAccess();
  const supabase = await supabaseServer();
  const journey = await getJourney(member.id);

  const reasons = form.getAll('orientation_reason').map(String).filter(v => optionValues('orientation_reason').has(v)).slice(0, 2);
  const goal = String(form.get('valued_function_goal') || '');
  const support = form.getAll('assessment_support_need').map(String).filter(v => optionValues('assessment_support_need').has(v));
  const pace = String(form.get('preferred_pace') || '');

  const row = {
    orientation_reason: reasons,
    valued_function_goal: optionValues('valued_function_goal').has(goal) ? goal : null,
    assessment_support_need: support,
    preferred_pace: optionValues('preferred_pace').has(pace) ? pace : null,
    completed_at: new Date().toISOString()
  };

  // First write of the program: make sure the member is enrolled.
  if (!journey.enrolledOn) {
    await supabase.from('program_enrollments').insert({ user_id: member.id, program_id: journey.programId });
  }

  // Edit the current orientation until a result has been derived from it;
  // after that, a change starts a new orientation record.
  if (journey.orientation && !journey.result) {
    const { error } = await supabase.from('orientation_sessions').update(row).eq('id', journey.orientation.id);
    if (error) redirect('/program/orientation?error=save');
  } else {
    const { error } = await supabase.from('orientation_sessions')
      .insert({ ...row, user_id: member.id, program_id: journey.programId });
    if (error) redirect('/program/orientation?error=save');
  }
  revalidatePath('/', 'layout');
  redirect('/program/safety');
}

export async function saveSafety(form: FormData) {
  const member = await requireProgramAccess();
  const value = String(form.get('safety_review_status') || '');
  if (!SAFETY_GATE.options.some(o => o.value === value)) redirect('/program/safety?error=choose');
  const journey = await getJourney(member.id);
  if (!journey.orientation) redirect('/program/orientation');
  const supabase = await supabaseServer();
  const { error } = await supabase.from('orientation_sessions')
    .update({ safety_review_status: value, safety_answered_at: new Date().toISOString() })
    .eq('id', journey.orientation.id);
  if (error) redirect('/program/safety?error=save');
  revalidatePath('/', 'layout');
  redirect('/program/readiness');
}

/* Saves answers; when all ten are present, asks the complete-assessment
   edge function to score from the STORED answers and write the result. */
export async function submitReadiness(form: FormData) {
  const member = await requireProgramAccess();
  const supabase = await supabaseServer();
  const journey = await getJourney(member.id);
  if (!journey.orientation?.safety_review_status) redirect('/program/safety');

  const { data: version } = await supabase.from('assessment_versions')
    .select('id, definition, assessments!inner(code)')
    .eq('status', 'published').eq('assessments.code', ASSESSMENT_CODE)
    .order('published_at', { ascending: false }).limit(1).single();
  if (!version) redirect('/program/readiness?error=unavailable');

  let sessionId = journey.openSessionId;
  if (!sessionId) {
    const { data: created, error } = await supabase.from('assessment_sessions').insert({
      user_id: member.id, assessment_version_id: version.id,
      orientation_session_id: journey.orientation.id, program_id: journey.programId
    }).select('id').single();
    if (error || !created) redirect('/program/readiness?error=start');
    sessionId = created.id;
  }

  const questions = (version.definition as { questions: { field: string }[] }).questions;
  const rows = questions.flatMap(q => {
    const v = form.get(q.field);
    const n = v === null ? NaN : Number(v);
    return Number.isInteger(n) && n >= 0 && n <= 3 ? [{ session_id: sessionId, user_id: member.id, question_code: q.field, raw_value: n }] : [];
  });
  if (rows.length) {
    const { error } = await supabase.from('assessment_responses').upsert(rows, { onConflict: 'session_id,question_code' });
    if (error) redirect('/program/readiness?error=save');
  }
  if (form.get('intent') === 'save') redirect('/?saved=1');
  if (rows.length < questions.length) redirect('/program/readiness?error=missing');

  const { data: sess } = await supabase.auth.getSession();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/complete-assessment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sess.session?.access_token ?? ''}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session_id: sessionId }),
    cache: 'no-store'
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    redirect(`/program/readiness?error=${encodeURIComponent(body.error || 'score')}`);
  }
  revalidatePath('/', 'layout');
  redirect('/program/results');
}

export async function chooseBaseline(form: FormData) {
  const member = await requireProgramAccess();
  const journey = await getJourney(member.id);
  if (!journey.result) redirect('/program/readiness');
  const known = new Set(METRICS.map(m => m.code));
  const picked = form.getAll('metric').map(String).filter(c => known.has(c));
  if (!picked.length) redirect('/program/baseline?error=none');
  const supabase = await supabaseServer();
  const { error } = await supabase.from('progress_cycles').insert({
    user_id: member.id, program_id: journey.programId, kind: 'baseline',
    assessment_result_id: journey.result.id, selected_metrics: picked
  });
  if (error) redirect('/program/baseline?error=save');
  revalidatePath('/', 'layout');
  redirect('/program/baseline');
}

export async function saveMeasurements(form: FormData) {
  const member = await requireProgramAccess();
  const journey = await getJourney(member.id);
  if (!journey.baseline) redirect('/program/baseline');
  const supabase = await supabaseServer();
  const rows = journey.baseline.selected_metrics.flatMap(code => {
    const def = METRICS.find(m => m.code === code);
    const raw = String(form.get(code) ?? '').trim();
    if (!def || raw === '') return [];
    const value = Number(raw);
    if (!Number.isFinite(value)) return [];
    return [{ cycle_id: journey.baseline!.id, user_id: member.id, metric_code: code, value, unit: def.unit,
              method_note: String(form.get(`${code}__note`) || '') || null }];
  });
  if (!rows.length) redirect('/program/baseline?error=empty');
  for (const row of rows) {
    const def = METRICS.find(m => m.code === row.metric_code)!;
    if (row.value < def.min || row.value > def.max) {
      redirect(`/program/baseline?error=range&metric=${row.metric_code}`);
    }
  }
  const { error } = await supabase.from('progress_measurements').upsert(rows, { onConflict: 'cycle_id,metric_code' });
  if (error) redirect('/program/baseline?error=save');
  revalidatePath('/', 'layout');
  redirect('/dashboard?saved=baseline');
}
