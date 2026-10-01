import { describe, expect, it } from 'vitest';
import { originForHost } from '../src/lib/origin';

/* MatrixApp is served at muscle-meta.com/app through a proxy, so the host it
   sees in production is its own netlify.app name. Redirects and sign-in
   links must still go to muscle-meta.com. */
describe('originForHost', () => {
  it('sends production traffic to muscle-meta.com, never the netlify.app name', () => {
    expect(originForHost('muscle-meta-matrixapp.netlify.app')).toBe('https://muscle-meta.com');
    expect(originForHost('muscle-meta.com')).toBe('https://muscle-meta.com');
  });
  it('keeps deploy previews and branch deploys on their own address', () => {
    expect(originForHost('deploy-preview-4--muscle-meta-matrixapp.netlify.app')).toBe('https://deploy-preview-4--muscle-meta-matrixapp.netlify.app');
  });
  it('keeps local development local', () => {
    expect(originForHost('localhost:3000')).toBe('http://localhost:3000');
  });
  it('uses the first host when a proxy chain lists several', () => {
    expect(originForHost('muscle-meta.com, muscle-meta-matrixapp.netlify.app')).toBe('https://muscle-meta.com');
  });
  it('falls back to muscle-meta.com for anything unexpected', () => {
    expect(originForHost(null)).toBe('https://muscle-meta.com');
    expect(originForHost('evil.example')).toBe('https://muscle-meta.com');
  });
});
