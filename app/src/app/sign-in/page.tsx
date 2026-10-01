import { redirect } from 'next/navigation';
import { getMember } from '@/lib/program';
import SignInForm from './SignInForm';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getMember()) redirect('/');
  const { error } = await searchParams;
  return (
    <div className="app-wrap" style={{ maxWidth: 560 }}>
      <span className="eyebrow">MatrixApp</span>
      <h1 className="app-h1">Sign in</h1>
      <p className="lede">One sign-in for every Muscle-Meta Matrix™ program, assessment and course. We email you a link and a code, so there is no password to remember.</p>
      {error && <p className="app-note error" role="alert">That sign-in link has expired or was already used. Request a new one below.</p>}
      <SignInForm />
    </div>
  );
}
