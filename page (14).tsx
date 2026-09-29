import { requireProgramAccess, getJourney } from '@/lib/program';
import { ORIENTATION } from '@/engine/definitions';
import Steps from '@/components/Steps';
import OrientationForm from './OrientationForm';
import { saveOrientation } from '../actions';

export default async function OrientationPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const member = await requireProgramAccess();
  const j = await getJourney(member.id);
  const { error } = await searchParams;
  const o = j.orientation;
  return (
    <div className="app-wrap">
      <Steps current="orientation" />
      <h1 className="app-h1">What matters to you</h1>
      <p className="lede">A few questions so the program fits you. There are no right answers, and <strong>nothing here changes a score</strong>. You can skip any question.</p>
      {error && <p className="app-note error" role="alert">That did not save. Please try again.</p>}
      <OrientationForm
        action={saveOrientation}
        questions={ORIENTATION.questions as unknown as OrientationQuestion[]}
        initial={{
          orientation_reason: o?.orientation_reason ?? [],
          valued_function_goal: o?.valued_function_goal ? [o.valued_function_goal] : [],
          assessment_support_need: o?.assessment_support_need ?? [],
          preferred_pace: o?.preferred_pace ? [o.preferred_pace] : []
        }}
      />
    </div>
  );
}

export type OrientationQuestion = {
  field: string; type: 'multi' | 'single'; max?: number; title: string; hint: string;
  options: { value: string; label: string }[];
};
