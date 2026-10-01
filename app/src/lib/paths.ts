import 'server-only';
import { headers } from 'next/headers';
import { originForHost } from './origin';

/* MatrixApp's base path. Next adds it to <Link>, redirect() and router
   pushes automatically; it must be added by hand to raw <a>, <link>,
   metadata URLs, HTTP Location headers and sign-in email links. */
export const BASE_PATH = '/app';

export const withBase = (path: string) => `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;

/* The origin members actually see; see originForHost. */
export async function publicOrigin(): Promise<string> {
  const h = await headers();
  return originForHost(h.get('x-forwarded-host') ?? h.get('host'));
}
