import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import type { ResultRow } from '@/lib/program';
import { METRICS } from '@/engine/definitions';
import { GOAL_LABEL } from '@/lib/copy';
import ResultView from '@/components/ResultView';
import { formatValue } from '@/lib/format';
import { addOverride } from '../../actions';

export default async function AdminMember({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const supabase = await supabaseServer();
  const { data: members } = await supabase.rpc('admin_members');
  const m = (members ?? []).find((x: { user_id: string }) => x.user_id === id) as { email: string } | undefined;
  if (!m) notFound();

  const [orientation, sessions, results, cycles, audit] = await Promise.all([
    supabase.from('orientation_sessions').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('assessment_sessions').select('id, status, started_at, completed_at, assessment_versions(version_label, algorithm_version)').eq('user_id', id).order('started_at', { ascending: false }),
    supabase.from('assessment_results').select('*').eq('user_id', id).order('derived_at', { ascending: false }),
    supabase.from('progress_cycles').select('id, kind, selected_metrics, started_at').eq('user_id', id),
    supabase.from('audit_log').select('action, entity, created_at').eq('detail->new->>user_id', id).order('created_at', { ascending: false }).limit(20)
  ]);
  const latest = (results.data?.[0] ?? null) as ResultRow | null;
  const [responses, measurements, overrides] = await Promise.all([
    latest ? supabase.from('assessment_responses').select('question_code, raw_value, answered_at').eq('session_id', latest.session_id) : Promise.resolve({ data: [] }),
    supabase.from('progress_measurements').select('metric_code, value, unit, measured_at, source').eq('user_id', id),
    latest ? supabase.from('result_overrides').select('field, from_value, to_value, reason, created_at').eq('result_id', latest.id).order('created_at') : Promise.resolve({ data: [] })
  ]);
  const o = orientation.data?.[0];

  return (
    <>
      <h1 className="app-h1">{m.email}</h1>
      {saved && <p className="app-note">Override recorded. The original result is unchanged and both are visible to the member.</p>}
      {error && <p className="app-note error">The override did not save. The reason must be at least ten characters.</p>}

      <div className="app-card">
        <h2>Orientation</h2>
        {o ? (
          <dl className="app-kv">
            <div><dt>Goal</dt><dd style={{ fontSize: 17 }}>{o.valued_function_goal ? GOAL_LABEL[o.valued_function_goal] : '—'}</dd></div>
            <div><dt>Reasons</dt><dd style={{ fontSize: 15 }}>{o.orientation_reason.join(', ') || '—'}</dd></div>
            <div><dt>Support</dt><dd style={{ fontSize: 15 }}>{o.assessment_support_need.join(', ') || '—'}</dd></div>
            <div><dt>Pace</dt><dd style={{ fontSize: 17 }}>{o.preferred_pace ?? '—'}</dd></div>
            <div><dt>Safety answer</dt><dd style={{ fontSize: 17 }}>{o.safety_review_status ?? '—'}</dd></div>
          </dl>
        ) : <p className="app-muted">Not started.</p>}
      </div>

      {latest ? (
        <>
          <ResultView result={latest} overrides={overrides.data ?? []} />
          <div className="app-card">
            <h2>Raw answers</h2>
            <p className="app-muted">Stored exactly as given. Session {latest.session_id.slice(0, 8)} · algorithm {latest.algorithm_version} · fingerprint kept for replay checks.</p>
            <div className="app-scroll"><table className="app-table">
              <thead><tr><th>Question</th><th>Raw (0-3)</th><th>Answered</th></tr></thead>
              <tbody>{(responses.data ?? []).map((r: { question_code: string; raw_value: number | null; answered_at: string }) => (
                <tr key={r.question_code}><td>{r.question_code}</td><td>{r.raw_value ?? 'skipped'}</td><td>{new Date(r.answered_at).toLocaleString('en-US')}</td></tr>
              ))}</tbody>
            </table></div>
          </div>
          <div className="app-card">
            <h2>Clinician override</h2>
            <p>Adds a new record with your name, reason and time. It never edits the instrument result.</p>
            {(overrides.data ?? []).length > 0 && (
              <ul>{(overrides.data ?? []).map((x: { field: string; from_value: string | null; to_value: string; reason: string; created_at: string }) => (
                <li key={x.created_at}>{x.field}: {x.from_value ?? '—'} → {x.to_value} · “{x.reason}” · {new Date(x.created_at).toLocaleDateString('en-US')}</li>
              ))}</ul>
            )}
            <form action={addOverride}>
              <input type="hidden" name="result_id" value={latest.id} />
              <input type="hidden" name="user_id" value={id} />
              <input type="hidden" name="from_value" value={latest.readiness_route} />
              <input type="hidden" name="field" value="readiness_route" />
              <div className="app-field">
                <label htmlFor="to_value">Change the starting route to</label>
                <select id="to_value" name="to_value" className="app-input" defaultValue={latest.readiness_route}>
                  <option value="standard_start">Standard start</option>
                  <option value="modified_start">Modified start</option>
                  <option value="professional_review">Professional review first</option>
                </select>
              </div>
              <div className="app-field">
                <label htmlFor="reason">Reason (shown to the member)</label>
                <textarea id="reason" name="reason" className="app-input" rows={3} style={{ maxWidth: '100%' }} required minLength={10} />
              </div>
              <div className="app-actions" style={{ marginTop: 'var(--s-4)' }}><button className="mmm-btn mmm-btn-primary" type="submit">Record override</button></div>
            </form>
          </div>
        </>
      ) : <div className="app-card"><p className="app-muted">No result yet.</p></div>}

      <div className="app-card">
        <h2>Sessions and measures</h2>
        <ul>{(sessions.data ?? []).map((s: { id: string; status: string; started_at: string }) => (
          <li key={s.id}>{s.status} · started {new Date(s.started_at).toLocaleDateString('en-US')}</li>
        ))}</ul>
        <div className="app-scroll"><table className="app-table">
          <thead><tr><th>Measure</th><th>Value</th><th>Source</th><th>Date</th></tr></thead>
          <tbody>{(measurements.data ?? []).map((x: { metric_code: string; value: number; unit: string; source: string; measured_at: string }) => (
            <tr key={x.metric_code}><td>{METRICS.find(mm => mm.code === x.metric_code)?.title ?? x.metric_code}</td><td>{formatValue(x.value, x.unit)}</td><td>{x.source}</td><td>{new Date(x.measured_at).toLocaleDateString('en-US')}</td></tr>
          ))}</tbody>
        </table></div>
        <p className="app-muted">Cycles: {(cycles.data ?? []).map((c: { kind: string }) => c.kind).join(', ') || 'none'}</p>
      </div>

      <div className="app-card">
        <h2>Access history</h2>
        <ul>{(audit.data ?? []).map((a: { action: string; entity: string; created_at: string }, i: number) => (
          <li key={i}>{a.entity} {a.action} · {new Date(a.created_at).toLocaleString('en-US')}</li>
        ))}</ul>
      </div>
    </>
  );
}
