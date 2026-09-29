/* Public configuration. Both Supabase values are public by design (RLS is the
   protection) and are set as Netlify environment variables for this site.
   The service-role key is NEVER read by this app: privileged scoring runs in
   the Supabase edge function `complete-assessment`. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://bxpferfuwoiulnqnfqhf.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const PUBLIC_SITE_URL = 'https://muscle-meta.com';
