import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProgramAccess, getJourney } from '@/lib/program';
import Steps from '@/components/Steps';
import ResultView from '@/components/ResultView';

export default async function ResultsPage() {
  const member = await requireProgramAccess();
  const j = await getJourney(member.id);
  if (!j.result) redirect('/program/readiness');
  return (
    <div className="app-wrap">
      <Steps current="results" />
      <h1 className="app-h1">Your starting point</h1>
      <p className="lede">What your answers suggest about where to begin, and where to focus first.</p>
      <ResultView result={j.result} overrides={j.overrides} />
      <div className="app-actions">
        <Link className="mmm-btn mmm-btn-primary" href={j.baseline ? '/dashboard' : '/program/baseline'}>
          {j.baseline ? 'Go to my dashboard' : 'Next: record my baseline'}
        </Link>
      </div>
    </div>
  );
}
