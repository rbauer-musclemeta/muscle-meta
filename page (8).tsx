import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProgramAccess, getJourney, programDay, STEP_PATH } from '@/lib/program';
import { supabaseServer } from '@/lib/supabase/server';
import { METRICS } from '@/engine/definitions';
import { GOAL_LABEL, ROUTE_COPY, ABILITY_COPY, LENS_COPY } from '@/lib/copy';
import ResultView from '@/components/ResultView';
import { formatValue } from '@/lib/format';

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const member = await requireProgramAccess();
  const j = await getJourney(member.id);
  if (!j.result) redirect(STEP_PATH[j.next]);
  const { saved } = await searchParams;
  const r = j.result;
  const day = programDay(j.enrolledOn);
  const goal = j.orientation?.valued_function_goal;

  const byCode = Object.fromEntries(j.measurements.map(m => [m.metric_code, m]));
  const lensMetrics: Record<string, { title: string; value?: string }[]> = {};
  for (const code of j.baseline?.selected_metrics ?? []) {
    const def = METRICS.find(m => m.code === code);
    if (!def) continue;
    const got = byCode[code];
    (lensMetrics[def.lens] ??= []).push({ title: def.title, value: got ? formatValue(got.value, got.unit) : 'not recorded yet' });
  }

  // Program files this member is entitled to (RLS decides; signed links expire).
  const supabase = await supabaseServer();
  const { data: assets } = await supabase.from('assets').select('id, title, kind, storage_path').eq('program_id', j.programId).order('created_at');
  const links = await Promise.all((assets ?? []).map(async a => {
    const { data } = await supabase.storage.from('program-assets').createSignedUrl(a.storage_path, 600);
    return { ...a, url: data?.signedUrl ?? null };
  }));

  const nextAction = !j.baseline ? { href: '/program/baseline', label: 'Choose your baseline measures' }
    : j.measurements.length < j.baseline.selected_metrics.length ? { href: '/program/baseline', label: 'Finish recording your baseline' }
    : null;

  return (
    <div className="app-wrap wide">
      <span className="eyebrow">{j.programTitle}</span>
      <h1 className="app-h1">Your dashboard</h1>
      {saved === 'baseline' && <p className="app-note" role="status">Baseline saved. You will repeat these measures at Day 30.</p>}
      <dl className="app-kv">
        <div><dt>Goal</dt><dd style={{ fontSize: 18 }}>{goal ? GOAL_LABEL[goal] ?? goal : 'Not chosen'}</dd></div>
        <div><dt>Day in program</dt><dd>{day ? `${Math.min(day, 30)} of 30` : '1 of 30'}</dd></div>
        <div><dt>Route</dt><dd style={{ fontSize: 18 }}>{ROUTE_COPY[r.readiness_route].label}</dd></div>
        <div><dt>Ability level</dt><dd>{ABILITY_COPY[r.ability_level].label}</dd></div>
        <div><dt>Primary lens</dt><dd>{r.primary_lens ? LENS_COPY[r.primary_lens].name : 'Balanced'}</dd></div>
        <div><dt>Secondary lens</dt><dd>{r.secondary_lens ? LENS_COPY[r.secondary_lens].name : 'None'}</dd></div>
      </dl>

      <div className="app-card">
        <span className="app-pill gold">Next action</span>
        {nextAction ? (
          <>
            <h2 style={{ marginTop: 'var(--s-3)' }}>{nextAction.label}</h2>
            <div className="app-actions" style={{ marginTop: 'var(--s-4)' }}><Link className="mmm-btn mmm-btn-primary" href={nextAction.href}>Continue</Link></div>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 'var(--s-3)' }}>Week 1: know what you are measuring</h2>
            <p>Your baseline is recorded. The four-week lessons open in the next release of the program; you will get an email when Week 1 is ready.</p>
          </>
        )}
      </div>

      <ResultView result={r} overrides={j.overrides} lensMetrics={lensMetrics} />

      <div className="app-card">
        <h2>Baseline measures</h2>
        <p className="app-muted">Raw values as you recorded them. Day 30 will show baseline, follow-up and the change side by side.</p>
        <div className="app-scroll">
          <table className="app-table">
            <thead><tr><th>Measure</th><th>Lens</th><th>Baseline</th><th>Recorded</th></tr></thead>
            <tbody>
              {(j.baseline?.selected_metrics ?? []).map(code => {
                const def = METRICS.find(m => m.code === code);
                const got = byCode[code];
                return (
                  <tr key={code}>
                    <td>{def?.title ?? code}</td>
                    <td>{def ? LENS_COPY[def.lens].name : ''}</td>
                    <td>{got ? formatValue(got.value, got.unit) : <Link href="/program/baseline">Add</Link>}</td>
                    <td>{got ? new Date(got.measured_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {links.length > 0 && (
        <div className="app-card">
          <h2>Program files</h2>
          <ul>{links.map(a => <li key={a.id}>{a.url ? <a href={a.url}>{a.title}</a> : a.title} <span className="app-muted">· {a.kind}</span></li>)}</ul>
        </div>
      )}
      <p className="app-footer-note"><Link href="/program/orientation">Update my goal or pace</Link></p>
    </div>
  );
}
