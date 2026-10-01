import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabaseServer } from '@/lib/supabase/server';
import { withBase, publicOrigin } from '@/lib/paths';

/* Finishes an email sign-in. Handles both link styles Supabase can send:
   ?code= (PKCE) and ?token_hash=&type= (email template with TokenHash). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const supabase = await supabaseServer();
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;

  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  // The public origin, not url.origin: behind the proxy, url.origin is this
  // site's own netlify.app address.
  return NextResponse.redirect(`${await publicOrigin()}${withBase(ok ? '/' : '/sign-in?error=link')}`, 303);
}
