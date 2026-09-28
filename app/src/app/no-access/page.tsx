import { requireMember } from '@/lib/program';
import { PUBLIC_SITE_URL } from '@/lib/env';

export default async function NoAccess() {
  const member = await requireMember();
  return (
    <div className="app-wrap">
      <span className="eyebrow">30-Day Four-Lens Program</span>
      <h1 className="app-h1">Your account is ready</h1>
      <p className="lede">You are signed in as {member.email}. This account does not have the Four-Lens Program yet.</p>
      <div className="app-card">
        <h2>What the program includes</h2>
        <p>An orientation and short readiness check, your Four-Lens profile, a baseline matched to the goal you choose, a four-week course, and a Day 30 reassessment showing what changed.</p>
        <div className="app-actions">
          <a className="mmm-btn mmm-btn-primary" href={`${PUBLIC_SITE_URL}/courses/`}>See the program</a>
        </div>
        <p className="app-muted" style={{ marginTop: 'var(--s-4)' }}>Already enrolled and still seeing this? Reply to your welcome email and we will fix it.</p>
      </div>
    </div>
  );
}
