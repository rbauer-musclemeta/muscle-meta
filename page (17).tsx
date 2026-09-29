import { redirect } from 'next/navigation';
import { requireProgramAccess, getJourney } from '@/lib/program';
import { SAFETY_GATE } from '@/engine/definitions';
import Steps from '@/components/Steps';
import { saveSafety } from '../actions';

export default async function SafetyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const member = await requireProgramAccess();
  const j = await getJourney(member.id);
  if (!j.orientation?.completed_at) redirect('/program/orientation');
  const { error } = await searchParams;
  const current = j.orientation.safety_review_status;
  return (
    <div className="app-wrap">
      <Steps current="safety" />
      <h1 className="app-h1">A quick safety check</h1>
      <p className="lede">This answer never changes a score. It decides whether a professional review should come before any new activity recommendations.</p>
      {error === 'choose' && <p className="app-note error" role="alert">Please choose an answer.</p>}
      {error === 'save' && <p className="app-note error" role="alert">That did not save. Please try again.</p>}
      <form action={saveSafety} className="app-card">
        <fieldset className="app-q" style={{ marginTop: 0, paddingTop: 0 }}>
          <legend>{SAFETY_GATE.title}</legend>
          <div className="app-options">
            {SAFETY_GATE.options.map(o => (
              <label key={o.value} className="app-opt">
                <input type="radio" name="safety_review_status" value={o.value} defaultChecked={current === o.value} required />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="app-note warn">
          If you choose <strong>Yes</strong> or <strong>Not sure</strong>, you can still take the readiness check and use the education in
          this program. We will suggest a professional review before any new physical-activity plan. Seek urgent care for severe
          or rapidly worsening symptoms.
        </p>
        <div className="app-actions">
          <button className="mmm-btn mmm-btn-primary" type="submit">Continue</button>
        </div>
      </form>
    </div>
  );
}
