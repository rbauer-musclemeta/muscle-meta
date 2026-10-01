import type { NextConfig } from 'next';

/* MatrixApp is served at muscle-meta.com/app/. The public site's
   netlify.toml proxies /app/* to this Netlify site, so every route, asset and
   redirect lives under /app and visitors only ever see muscle-meta.com. */
const nextConfig: NextConfig = {
  basePath: '/app',
  reactStrictMode: true,
  experimental: {
    // Behind the muscle-meta.com proxy the browser's Origin is muscle-meta.com
    // while this site's Host is its own netlify.app name; without this, Next
    // rejects every form submission as cross-site.
    serverActions: { allowedOrigins: ['muscle-meta.com', 'www.muscle-meta.com'] }
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          // The member app never ranks: every page is private.
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' }
        ]
      }
    ];
  }
};

export default nextConfig;
