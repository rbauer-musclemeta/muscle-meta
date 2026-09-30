'use client';
import { useActionState } from 'react';
import { requestCode, verifyCode, type SignInState } from './actions';

export default function SignInForm() {
  const [emailState, sendAction, sending] = useActionState<SignInState, FormData>(requestCode, { step: 'email' });
  const [codeState, verifyAction, verifying] = useActionState<SignInState, FormData>(verifyCode, { step: 'code' });
  const onCodeStep = emailState.step === 'code';

  if (!onCodeStep) {
    return (
      <form action={sendAction} className="app-card">
        <div className="app-field" style={{ marginTop: 0 }}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="app-input"
                 defaultValue={emailState.email} placeholder="you@example.com" />
        </div>
        {emailState.error && <p className="app-note error" role="alert">{emailState.error}</p>}
        <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
          <button className="mmm-btn mmm-btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Email me a sign-in link'}</button>
        </div>
        <p className="app-muted" style={{ marginTop: 'var(--s-4)' }}>No password needed. New here? The same email creates your account.</p>
      </form>
    );
  }
  return (
    <form action={verifyAction} className="app-card">
      <p className="app-note" role="status">{emailState.message}</p>
      <input type="hidden" name="email" value={emailState.email} />
      <div className="app-field">
        <label htmlFor="code">Code from the email</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" className="app-input" placeholder="123456" />
      </div>
      {codeState.error && <p className="app-note error" role="alert">{codeState.error}</p>}
      <div className="app-actions" style={{ marginTop: 'var(--s-5)' }}>
        <button className="mmm-btn mmm-btn-primary" disabled={verifying}>{verifying ? 'Checking…' : 'Sign in'}</button>
        <a className="app-small-btn" href="/sign-in">Use a different email</a>
      </div>
    </form>
  );
}
