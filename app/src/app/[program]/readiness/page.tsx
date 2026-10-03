import { redirect } from 'next/navigation';
import { getJourney, requireProgram } from '@/lib/program';
import { stepPath } from '@/programs/registry';
import { supabaseServer } from '@/lib/supabase/server';
import Steps from '@/components/Steps';
import { submitReadiness } from '../actions';
import { ActionForm, SubmitButton } from '@/components/ActionForm';

type Definition = {
  version_label: string;
  scale: { value: string; label: string }[];
  questions: { q: number; field: string; prompt: string }[];
};

const ERRORS: Record<string, string> = {
  missing: 'Please answer every question to see your results. Your answers so far are saved.',
  insufficient_information: 'Please answer every question to see your results. Your answers so far are saved.',
  save: 'Your answers did not save. Please try again.',
  start: 'We could not start the check. Please try again.',
  unavailable: 'The check is not available right now. Please try again later.',
  orientation_required: 'Please complete orientation first.',
  algorithm_mismatch: 'This check was updated since you started. Please contact us so we can move your answers across.'
};

export default async function ReadinessPage({ params, searchParams }: { params: Promise<{ program: string }>; searchParams: Promise<{ error?: string }> }) {
  const { member, program } = await requireProgram((await params).program);
  const j = await getJourney(member.id, program);
  if (!j.orientation?.completed_at) redirect(stepPath(program, 'orientation'));
  if (!j.orientation.safety_review_status) redirect(stepPath(program, 'safety'));
  if (j.result && !j.openSessionId) redirect(stepPath(program, 'results'));
  const { error } = await searchParams;

  const supabase = await supabaseServer();
  // Wording comes from the PUBLISHED version snapshot, the same one scoring pins.
  const { data: version } = await supabase.from('assessment_versions')
    .select('id, definition, assessments!inner(code)')
    .eq('status', 'published').eq('assessments.code', program.assessmentCode ?? '')
    .order('published_at', { ascending: false }).limit(1).single();
  if (!version) return <div className="app-wrap"><p className="app-note error">The check is not available right now.</p></div>;
  const def = version.definition as Definition;

  const saved: Record<string, number> = {};
  if (j.openSessionId) {
    const { data } = await supabase.from('assessment_responses').select('question_code, raw_value').eq('session_id', j.openSessionId);
    (data ?? []).forEach(r => { if (r.raw_value !== null) saved[r.question_code] = r.raw_value; });
  }
  const reviewFirst = j.orientation.safety_review_status !== 'no';

  return (
    <div className="app-wrap">
      <Steps current="readiness" />
      <h1 className="app-h1">Readiness and ability check</h1>
      <p className="lede">Ten questions about the past few weeks. For each, choose how much it limits you right now.</p>
      {reviewFirst && (
        <p className="app-note warn">You told us activity may not feel safe right now. Your results will recommend a professional review before any new activity plan.</p>
      )}
      {error && <p className="app-note error" role="alert">{ERRORS[error] ?? 'Something went wrong. Your answers are saved; please try again.'}</p>}
      <ActionForm action={submitReadiness.bind(null, program.route)} className="app-card">
        {def.questions.map(q => (
          <fieldset key={q.field} className="app-q">
            <legend>{q.q}. {q.prompt}</legend>
            <div className="app-scale">
              {def.scale.map(s => (
                <label key={s.value} className="app-opt">
                  <input type="radio" name={q.field} value={s.value} defaultChecked={saved[q.field] === Number(s.value)} />
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="app-actions">
          <SubmitButton name="intent" value="finish" pendingLabel="Calculating…">See my results</SubmitButton>
          <SubmitButton className="mmm-btn mmm-btn-ghost" name="intent" value="save">Save and finish later</SubmitButton>
        </div>
        <p className="app-muted" style={{ marginTop: 'var(--s-4)' }}>Check version {def.version_label}. Your answers are stored as you gave them; the result is calculated from them on our server.</p>
      </ActionForm>
    </div>
  );
}
