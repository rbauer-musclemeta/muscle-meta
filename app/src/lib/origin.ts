import { PUBLIC_SITE_URL } from './env';

/* The origin members actually see, worked out from the request's host.
   In production that is always muscle-meta.com, even though requests reach
   this site at its own netlify.app address through the /app proxy. Netlify
   deploy previews and branch deploys (hosts containing "--") and local
   development keep their own origin so they can be tested end to end.
   Pure function: safe in the proxy (middleware), route handlers and actions. */
export function originForHost(rawHost: string | null | undefined): string {
  const host = (rawHost ?? '').split(',')[0].trim();
  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)) return `http://${host}`;
  if (host.endsWith('.netlify.app') && host.includes('--')) return `https://${host}`;
  return PUBLIC_SITE_URL;
}
