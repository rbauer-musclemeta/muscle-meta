import type { Metadata } from 'next';
import Link from 'next/link';
import { getMember } from '@/lib/program';
import { withBase } from '@/lib/paths';
import { signOut } from './actions';

export const metadata: Metadata = {
  title: { default: 'MatrixApp · Muscle-Meta Matrix™', template: '%s · MatrixApp' },
  description: 'Your Muscle-Meta Matrix™ programs, assessments and courses.',
  robots: { index: false, follow: false },
  // Metadata URLs are not given the base path automatically.
  icons: { icon: withBase('/favicon.svg') }
};

const FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@400;500;600;700&display=swap';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const member = await getMember();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
        <link rel="stylesheet" href={withBase('/mm.css')} />
        <link rel="stylesheet" href={withBase('/app.css')} />
      </head>
      <body>
        <header className="mm-nav">
          <div className="mm-nav-inner">
            <Link href="/" className="mm-logo">
              Muscle-Meta Matrix<sup style={{ color: 'var(--teal)', fontSize: '55%' }}>™</sup>
              <span>MatrixApp</span>
            </Link>
            {member && (
              <nav className="app-nav-links" aria-label="Main">
                <Link href="/">My programs</Link>
                {member.isStaff && <Link href="/admin">Admin</Link>}
                <form action={signOut}><button type="submit">Sign out</button></form>
              </nav>
            )}
          </div>
        </header>
        <main>{children}</main>
        <footer className="mm-footer">
          <div className="mmm-container">
            <span className="wordmark">Muscle-Meta Matrix™</span>
            <p style={{ marginTop: 6 }}>Clinical intelligence for active aging · Randy Bauer, PT</p>
            <p style={{ marginTop: 'var(--s-4)' }}>
              Educational program. It does not diagnose or treat any condition. ·{' '}
              <a href="https://muscle-meta.com/legal/privacy/">Privacy</a> ·{' '}
              <a href="https://muscle-meta.com/legal/terms/">Terms</a> ·{' '}
              <a href="https://muscle-meta.com/legal/medical-disclaimer/">Medical disclaimer</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
