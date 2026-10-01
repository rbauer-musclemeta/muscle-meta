import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getJourney, requireProgram } from '@/lib/program';
import { stepPath } from '@/programs/registry';
import Steps from '@/components/Steps';
import ResultView from '@/components/ResultView';

export default async function ResultsPage({ params }: { params: Promise<{ program: string }> }) {
  const { member, program } = await requireProgram((await params).program);
  const j = await getJourney(member.id, program);
  if (!j.result) redirect(stepPath(program, 'readiness'));
  return (
    <div className="app-wrap">
      <Steps current="results" />
      <h1 className="app-h1">Your starting point</h1>
      <p className="lede">What your answers suggest about where to begin, and where to focus first.</p>
      <ResultView result={j.result} overrides={j.overrides} />
      <div className="app-actions">
        <Link className="mmm-btn mmm-btn-primary" href={j.baseline ? stepPath(program, 'dashboard') : stepPath(program, 'baseline')}>
          {j.baseline ? 'Go to my dashboard' : 'Next: record my baseline'}
        </Link>
      </div>
    </div>
  );
}
