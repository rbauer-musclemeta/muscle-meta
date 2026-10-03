'use client';
import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react';

/* Every journey form submits through this wrapper.

   The server action saves, then RETURNS the next address ({ next }) instead
   of calling redirect(). The browser then loads that address as an ordinary
   page. Why: behind the muscle-meta.com → mm-matrixapp proxy on Netlify, a
   redirect() thrown inside a server action saved the answers but left the
   member on the same screen (2026-10-03, orientation → safety). A plain page
   load after the save has no such failure mode, and every journey page is
   dynamic, so the next screen always shows fresh data.

   While saving, the buttons are disabled and the pressed one says so, which
   also stops repeat submissions. If the request fails, the answers stay on
   screen and a message asks the member to press the button again. */

export type StepResult = { next: string };

const BASE_PATH = '/app';

const Saving = createContext<{ pending: boolean; pressed: string | null }>({ pending: false, pressed: null });

function isNextNavigation(err: unknown): boolean {
  return !!err && typeof err === 'object' && 'digest' in err &&
    /^NEXT_(REDIRECT|HTTP_ERROR_FALLBACK|NOT_FOUND)/.test(String((err as { digest: unknown }).digest));
}

export function ActionForm({ action, className, children }: {
  action: (form: FormData) => Promise<StepResult>;
  className?: string;
  children: ReactNode;
}) {
  const [pending, setPending] = useState(false);
  const [pressed, setPressed] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const form = new FormData(e.currentTarget);
    if (submitter?.name) form.set(submitter.name, submitter.value);
    setFailed(false);
    setPending(true);
    setPressed(submitter?.name ? submitter.value : '');
    action(form).then(
      ({ next }) => { window.location.assign(`${BASE_PATH}${next}`); },
      (err) => {
        // Sign-in and no-access redirects travel as errors; the router follows them.
        if (isNextNavigation(err)) return;
        setPending(false);
        setPressed(null);
        setFailed(true);
      }
    );
  };

  return (
    <Saving.Provider value={{ pending, pressed }}>
      <form className={className} onSubmit={onSubmit} aria-busy={pending}>
        {failed && (
          <p className="app-note error" role="alert">
            That did not go through. Check your connection and press the button again; your answers are still here.
          </p>
        )}
        {children}
      </form>
    </Saving.Provider>
  );
}

/* A submit button that shows when its form is saving. With several buttons
   on one form (name/value), only the one pressed changes its label. */
export function SubmitButton({ children, className = 'mmm-btn mmm-btn-primary', name, value, pendingLabel = 'Saving…' }: {
  children: ReactNode;
  className?: string;
  name?: string;
  value?: string;
  pendingLabel?: string;
}) {
  const { pending, pressed } = useContext(Saving);
  const isPressed = pending && (name ? pressed === value : true);
  return (
    <button className={className} type="submit" name={name} value={value} disabled={pending}>
      {isPressed ? pendingLabel : children}
    </button>
  );
}
