import { redirect } from 'next/navigation';
import { getJourney, requireProgram } from '@/lib/program';
import { stepPath } from '@/programs/registry';
import { METRICS } from '@/engine/definitions';
import { LENS_COPY, PHYSICAL_TESTS, GOAL_LABEL } from '@/lib/copy';
import Steps from '@/components/Steps';
import { chooseBaseline, saveMeasurements } from '../actions';

const ERR: Record<string, string> = {
  none: 'Choose at least one measure.',
  empty: 'Enter at least one value.',
  save: 'That did not save. Please try again.'
};

export default async function BaselinePage({ params, searchParams }: { params: Promise<{ program: string }>; searchParams: Promise<{ error?: string; metric?: string }> }) {
  const { member, program } = await requireProgram((await params).program);
  const j = await getJourney(member.id, program);
  if (!j.result) redirect(stepPath(program, 'readiness'));
  const { error, metric } = await searchParams;
  const reviewFirst = j.result.readiness_route === 'professional_review';
  const goal = j.orientation?.valued_function_goal;
  const recommended = new Set(j.result.baseline_metrics.filter(c => !(reviewFirst && PHYSICAL_TESTS.has(c))));
  const allowed = METRICS.filter(m => !(reviewFirst && PHYSICAL_TESTS.has(m.code)));
  const errorText = error === 'range'
    ? `${METRICS.find(m => m.code === metric)?.title ?? 'A value'} is outside the range we can accept. Please check it.`
    : error ? ERR[error] : null;

  if (!j.baseline) {
    return (
      <div className="app-wrap">
        <Steps current="baseline" />
        <h1 className="app-h1">Choose your baseline measures</h1>
        <p className="lede">
          These are matched to your goal{goal ? <> (<strong>{GOAL_LABEL[goal] ?? goal}</strong>)</> : null} and your profile.
          You will repeat the same measures at Day 30, so a few you can do well beats many.
        </p>
        {reviewFirst && (
          <p className="app-note warn">Because a professional review comes first, physical tests are left out for now. Your clinician can add them once you have been reviewed.</p>
        )}
        {errorText && <p className="app-note error" role="alert">{errorText}</p>}
        <form action={chooseBaseline.bind(null, program.route)} className="app-card">
          <fieldset className="app-q" style={{ marginTop: 0, paddingTop: 0 }}>
            <legend>Recommended for you</legend>
            <div className="app-options">
              {allowed.filter(m => recommended.has(m.code)).map(m => (
                <label key={m.code} className="app-opt">
                  <input type="checkbox" name="metric" value={m.code} defaultChecked />
                  <span><strong>{m.title}</strong> <span className="app-muted">· {LENS_COPY[m.lens].name} lens</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="app-q">
            <legend>Optional extras</legend>
            <div className="app-options cols-2">
              {allowed.filter(m => !recommended.has(m.code)).map(m => (
                <label key={m.code} className="app-opt">
                  <input type="checkbox" name="metric" value={m.code} />
                  <span>{m.title} <span className="app-muted">· {LENS_COPY[m.lens].name}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="app-actions"><button className="mmm-btn mmm-btn-primary" type="submit">Use these measures</button></div>
        </form>
      </div>
    );
  }

  const values = Object.fromEntries(j.measurements.map(m => [m.metric_code, m.value]));
  return (
    <div className="app-wrap">
      <Steps current="baseline" />
      <h1 className="app-h1">Record your baseline</h1>
      <p className="lede">Enter what you measure today. Leave any blank and add it later. These are your raw numbers; nothing is judged yet.</p>
      {errorText && <p className="app-note error" role="alert">{errorText}</p>}
      <p className="app-note warn">For any physical test: warm up first, use a stable support, and stop straight away if you feel chest pain, dizziness, unusual breathlessness or sharp pain.</p>
      <form action={saveMeasurements.bind(null, program.route)} className="app-card">
        {j.baseline.selected_metrics.map(code => {
          const m = METRICS.find(x => x.code === code);
          if (!m) return null;
          return (
            <div key={code} className="app-field">
              <label htmlFor={code}>{m.title}</label>
              <p className="method">{m.method}</p>
              <div className="app-input-row">
                <input id={code} name={code} className="app-input" inputMode="decimal" type="number" step="any"
                       min={m.min} max={m.max} defaultValue={values[code] ?? ''} style={{ maxWidth: 180 }} />
                <span className="app-unit">{m.unit}</span>
              </div>
            </div>
          );
        })}
        <div className="app-actions"><button className="mmm-btn mmm-btn-primary" type="submit">Save my baseline</button></div>
      </form>
    </div>
  );
}
