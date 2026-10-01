import Link from 'next/link';
import { requireMember, hasAccess, getJourney, programDay } from '@/lib/program';
import { PROGRAMS, programHome, stepPath } from '@/programs/registry';
import { PUBLIC_SITE_URL } from '@/lib/env';

/* MatrixApp home: every program the member has, with where they are in it,
   followed by the programs they could add. Programs come from the registry;
   access comes from the member's entitlements (and RLS behind them). */
export default async function MyPrograms() {
  const member = await requireMember();
  const mine = PROGRAMS.filter(p => hasAccess(member, p.access));
  const others = PROGRAMS.filter(p => !hasAccess(member, p.access));

  const cards = await Promise.all(mine.map(async p => {
    const j = await getJourney(member.id, p);
    const day = programDay(j.enrolledOn);
    const total = p.durationDays;
    const status = !j.enrolledOn ? 'Not started'
      : j.next === 'dashboard' ? (day && total ? `Day ${Math.min(day, total)} of ${total}` : 'In progress')
      : 'In progress';
    const href = j.enrolledOn ? (j.next === 'dashboard' ? stepPath(p, 'dashboard') : programHome(p)) : programHome(p);
    return { p, status, href, cta: j.enrolledOn ? 'Continue' : 'Start' };
  }));

  return (
    <div className="app-wrap">
      <span className="eyebrow">MatrixApp</span>
      <h1 className="app-h1">My programs</h1>
      {cards.length === 0 && (
        <p className="lede">You are signed in as {member.email}. You do not have a program yet; the ones below are available.</p>
      )}
      {cards.map(({ p, status, href, cta }) => (
        <div key={p.route} className="app-card">
          <span className="app-pill">{status}</span>
          <h2 style={{ marginTop: 'var(--s-3)' }}>{p.title}</h2>
          <p>{p.summary}</p>
          <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
            <Link className="mmm-btn mmm-btn-primary" href={href}>{cta}</Link>
          </div>
        </div>
      ))}
      {others.length > 0 && (
        <>
          <h2 style={{ marginTop: 'var(--s-8)' }}>Available programs</h2>
          {others.map(p => (
            <div key={p.route} className="app-card">
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <div className="app-actions" style={{ marginTop: 'var(--s-4)' }}>
                <a className="mmm-btn mmm-btn-ghost" href={`${PUBLIC_SITE_URL}${p.salesPath}`}>See the program</a>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
