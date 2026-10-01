import Link from 'next/link';
import { getJourney, programDay, requireProgram } from '@/lib/program';
import { stepPath } from '@/programs/registry';
import { GOAL_LABEL } from '@/lib/copy';

const NEXT_COPY = {
  orientation: { title: 'Start with orientation', body: 'Four short questions about what brings you here and what matters most. Nothing here is scored.', cta: 'Begin orientation' },
  safety: { title: 'A quick safety check', body: 'One question about how activity feels for you right now.', cta: 'Continue' },
  readiness: { title: 'Your readiness and ability check', body: 'Ten questions, about four minutes. You can save and come back.', cta: 'Open the check' },
  results: { title: 'See your results', body: 'Your readiness route, ability level and Four-Lens profile.', cta: 'View results' },
  baseline: { title: 'Record your baseline', body: 'Choose and record the few measures that match your goal. You will repeat them at Day 30.', cta: 'Set up my baseline' },
  dashboard: { title: 'Your dashboard', body: 'Your profile, your baseline and your next step.', cta: 'Open dashboard' }
} as const;

export default async function Home({ params, searchParams }: { params: Promise<{ program: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { member, program } = await requireProgram((await params).program);
  const j = await getJourney(member.id, program);
  const { saved } = await searchParams;
  const next = NEXT_COPY[j.next];
  const day = programDay(j.enrolledOn);
  const total = program.durationDays ?? 30;
  return (
    <div className="app-wrap">
      <span className="eyebrow">{j.programTitle}</span>
      <h1 className="app-h1">{day ? `Day ${Math.min(day, total)} of ${total}` : 'Welcome'}</h1>
      <p className="lede">Where should I start? What should I measure? What changed after 30 days? What should I do next?</p>
      {saved && <p className="app-note" role="status">Your answers are saved. Pick up where you left off whenever you are ready.</p>}
      <div className="app-card">
        <span className="app-pill">Next step</span>
        <h2 style={{ marginTop: 'var(--s-3)' }}>{next.title}</h2>
        <p>{next.body}</p>
        <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
          <Link className="mmm-btn mmm-btn-primary" href={stepPath(program, j.next)}>{next.cta}</Link>
        </div>
      </div>
      {j.orientation?.valued_function_goal && (
        <p className="app-muted" style={{ marginTop: 'var(--s-5)' }}>
          Your goal: <strong>{GOAL_LABEL[j.orientation.valued_function_goal] ?? j.orientation.valued_function_goal}</strong>
          {' · '}<Link href={stepPath(program, 'orientation')}>Change</Link>
        </p>
      )}
    </div>
  );
}
