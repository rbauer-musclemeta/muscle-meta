import Link from 'next/link';
import { requireProgramAccess, getJourney, STEP_PATH, programDay } from '@/lib/program';
import { GOAL_LABEL } from '@/lib/copy';

const NEXT_COPY = {
  orientation: { title: 'Start with orientation', body: 'Four short questions about what brings you here and what matters most. Nothing here is scored.', cta: 'Begin orientation' },
  safety: { title: 'A quick safety check', body: 'One question about how activity feels for you right now.', cta: 'Continue' },
  readiness: { title: 'Your readiness and ability check', body: 'Ten questions, about four minutes. You can save and come back.', cta: 'Open the check' },
  results: { title: 'See your results', body: 'Your readiness route, ability level and Four-Lens profile.', cta: 'View results' },
  baseline: { title: 'Record your baseline', body: 'Choose and record the few measures that match your goal. You will repeat them at Day 30.', cta: 'Set up my baseline' },
  dashboard: { title: 'Your dashboard', body: 'Your profile, your baseline and your next step.', cta: 'Open dashboard' }
} as const;

export default async function Home({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const member = await requireProgramAccess();
  const j = await getJourney(member.id);
  const { saved } = await searchParams;
  const next = NEXT_COPY[j.next];
  const day = programDay(j.enrolledOn);
  return (
    <div className="app-wrap">
      <span className="eyebrow">{j.programTitle}</span>
      <h1 className="app-h1">{day ? `Day ${Math.min(day, 30)} of 30` : 'Welcome'}</h1>
      <p className="lede">Where should I start? What should I measure? What changed after 30 days? What should I do next?</p>
      {saved && <p className="app-note" role="status">Your answers are saved. Pick up where you left off whenever you are ready.</p>}
      <div className="app-card">
        <span className="app-pill">Next step</span>
        <h2 style={{ marginTop: 'var(--s-3)' }}>{next.title}</h2>
        <p>{next.body}</p>
        <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="mmm-btn mmm-btn-primary" href={STEP_PATH[j.next]}>{next.cta}</Link>
        </div>
      </div>
      {j.orientation?.valued_function_goal && (
        <p className="app-muted" style={{ marginTop: 'var(--s-5)' }}>
          Your goal: <strong>{GOAL_LABEL[j.orientation.valued_function_goal] ?? j.orientation.valued_function_goal}</strong>
          {' · '}<Link href="/program/orientation">Change</Link>
        </p>
      )}
    </div>
  );
}
