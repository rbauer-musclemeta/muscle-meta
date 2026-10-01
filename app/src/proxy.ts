import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/env';
import { originForHost } from './lib/origin';

/* Refreshes the Supabase session cookie on every page request and sends
   signed-out visitors to /app/sign-in. Paths here are relative to the
   /app base path (Next strips it from nextUrl.pathname). Authorization itself is enforced by RLS
   in the database; this only keeps the session fresh and the UX tidy. */
const PUBLIC_PATHS = ['/sign-in', '/auth/callback', '/auth/confirm'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const { data } = await supabase.auth.getUser();
  const isPublic = PUBLIC_PATHS.some(p => request.nextUrl.pathname.startsWith(p));
  if (!data.user && !isPublic) {
    // Built from the public origin, not request.url: behind the
    // muscle-meta.com proxy, request.url carries this site's own netlify.app
    // host, which members must never be sent to.
    const origin = originForHost(request.headers.get('x-forwarded-host') ?? request.headers.get('host'));
    return NextResponse.redirect(`${origin}${request.nextUrl.basePath}/sign-in`);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg|mm.css|app.css|robots.txt).*)']
};
