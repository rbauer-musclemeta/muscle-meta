import Link from 'next/link';
import { requireMember } from '@/lib/program';
import { programByRoute } from '@/programs/registry';
import { PUBLIC_SITE_URL } from '@/lib/env';

/* Shown when a signed-in member opens a program their account does not
   include. Says what the program is and where to get it; never a lock or a
   blurred preview (CLAUDE.md, "Gating is REMOVED"). */
export default async function NoAccess({ searchParams }: { searchParams: Promise<{ program?: string }> }) {
  const member = await requireMember();
  const program = programByRoute((await searchParams).program ?? '');
  return (
    <div className="app-wrap">
      <span className="eyebrow">{program?.title ?? 'MatrixApp'}</span>
      <h1 className="app-h1">Your account is ready</h1>
      <p className="lede">
        You are signed in as {member.email}.{' '}
        {program ? <>This account does not include the {program.title} yet.</> : <>This account does not include that program yet.</>}
      </p>
      <div className="app-card">
        {program && <><h2>What the program includes</h2><p>{program.summary}</p></>}
        <div className="app-actions">
          {program && <a className="mmm-btn mmm-btn-primary" href={`${PUBLIC_SITE_URL}${program.salesPath}`}>See the program</a>}
          <Link className="mmm-btn mmm-btn-ghost" href="/">My programs</Link>
        </div>
        <p className="app-muted" style={{ marginTop: 'var(--s-4)' }}>Already enrolled and still seeing this? Reply to your welcome email and we will fix it.</p>
      </div>
    </div>
  );
}
