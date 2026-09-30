'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export type SignInState = { step: 'email' | 'code'; email?: string; message?: string; error?: string };

async function origin() {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${h.get('x-forwarded-host') ?? h.get('host')}`;
}

export async function requestCode(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { step: 'email', error: 'Enter a valid email address.' };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await origin()}/auth/callback`, shouldCreateUser: true }
  });
  if (error) return { step: 'email', email, error: 'We could not send the email. Wait a minute and try again.' };
  return { step: 'code', email, message: `We sent a sign-in email to ${email}. Open the link in it, or type the code from the email below.` };
}

export async function verifyCode(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const token = String(form.get('code') || '').replace(/\s/g, '');
  if (!/^\d{6,10}$/.test(token)) return { step: 'code', email, error: 'Enter the code from the email.' };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) return { step: 'code', email, error: 'That code did not work. It may have expired; request a new email.' };
  redirect('/');
}
