import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { PROGRAM_ACCESS, COACHING_ACCESS } from '@/lib/program';
import { ROUTE_COPY, ABILITY_COPY, LENS_COPY } from '@/lib/copy';
import { grantAccess, revokeAccess } from './actions';

type MemberRow = {
  user_id: string; email: string; display_name: string | null; joined_at: string; last_sign_in_at: string | null;
  roles: string[]; four_lens_access: boolean; coaching_access: boolean;
  orientation_completed_at: string | null; safety_review_status: string | null;
  latest_result_at: string | null; readiness_route: keyof typeof ROUTE_COPY | null;
  ability_level: keyof typeof ABILITY_COPY | null; primary_lens: string | null; baseline_measures: number;
};

const d = (s: string | null) => (s ? new Date(s).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '');

function AccessButton({ userId, feature, has, label }: { userId: string; feature: string; has: boolean; label: string }) {
  return (
    <form action={has ? revokeAccess : grantAccess} style={{ display: 'inline' }}>
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="feature" value={feature} />
      <button className="app-small-btn" type="submit">{has ? `Remove ${label}` : `Give ${label}`}</button>
    </form>
  );
}

export default async function AdminMembers() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc('admin_members');
  const rows = (data ?? []) as MemberRow[];
  const withAccess = rows.filter(r => r.four_lens_access).length;
  const withResult = rows.filter(r => r.latest_result_at).length;
  return (
    <>
      <h1 className="app-h1">Members and Program 1 status</h1>
      {error && <p className="app-note error">{error.message}</p>}
      <dl className="app-kv">
        <div><dt>Accounts</dt><dd>{rows.length}</dd></div>
        <div><dt>Program access</dt><dd>{withAccess}</dd></div>
        <div><dt>Results</dt><dd>{withResult}</dd></div>
        <div><dt>Review first</dt><dd>{rows.filter(r => r.readiness_route === 'professional_review').length}</dd></div>
      </dl>
      <div className="app-card app-scroll">
        <table className="app-table">
          <thead>
            <tr><th>Member</th><th>Access</th><th>Orientation</th><th>Safety</th><th>Result</th><th>Baseline</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.user_id}>
                <td>
                  <Link href={`/admin/members/${r.user_id}`}><strong>{r.email}</strong></Link>
                  <div className="app-muted">{r.roles.filter(x => x !== 'member').join(', ') || 'member'} · joined {d(r.joined_at)}</div>
                </td>
                <td style={{ display: 'grid', gap: 6 }}>
                  <span>{r.four_lens_access ? <span className="app-pill">Program</span> : <span className="app-pill grey">No program</span>}{' '}
                    {r.coaching_access && <span className="app-pill gold">One-to-one</span>}</span>
                  <span><AccessButton userId={r.user_id} feature={PROGRAM_ACCESS} has={r.four_lens_access} label="program" /></span>
                  <span><AccessButton userId={r.user_id} feature={COACHING_ACCESS} has={r.coaching_access} label="one-to-one" /></span>
                </td>
                <td>{r.orientation_completed_at ? d(r.orientation_completed_at) : <span className="app-muted">Not yet</span>}</td>
                <td>{r.safety_review_status === 'no' ? 'Clear' : r.safety_review_status ? <span className="app-pill red">{r.safety_review_status === 'yes' ? 'Yes' : 'Not sure'}</span> : ''}</td>
                <td>{r.readiness_route ? (
                  <>
                    <span className={`app-pill${r.readiness_route === 'professional_review' ? ' red' : r.readiness_route === 'modified_start' ? ' gold' : ''}`}>{ROUTE_COPY[r.readiness_route].label}</span>
                    <div className="app-muted">{r.ability_level ? ABILITY_COPY[r.ability_level].label : ''}{r.primary_lens ? ` · ${LENS_COPY[r.primary_lens].name}` : ''} · {d(r.latest_result_at)}</div>
                  </>
                ) : <span className="app-muted">None</span>}</td>
                <td>{r.baseline_measures || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
