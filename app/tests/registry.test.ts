import { describe, expect, it } from 'vitest';
import { PROGRAMS, RESERVED_ROUTES, GRANTABLE_KEYS, programByRoute, stepPath } from '../src/programs/registry';

describe('program registry', () => {
  it('gives every program a unique, URL-safe route that is not reserved', () => {
    const routes = PROGRAMS.map(p => p.route);
    expect(new Set(routes).size).toBe(routes.length);
    for (const r of routes) {
      expect(r).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(RESERVED_ROUTES.has(r)).toBe(false);
    }
  });
  it('gives assessment journeys an assessment code', () => {
    for (const p of PROGRAMS.filter(x => x.kind === 'assessment-journey')) expect(p.assessmentCode).toBeTruthy();
  });
  it('maps four-lens to the existing database program and entitlements', () => {
    const p = programByRoute('four-lens')!;
    expect(p.dbSlug).toBe('four-lens-30');
    expect(p.access).toBe('program:four-lens');
    expect(GRANTABLE_KEYS.has('coaching:four-lens-1to1')).toBe(true);
    expect(stepPath(p, 'readiness')).toBe('/four-lens/readiness');
  });
  it('returns null for unknown routes', () => {
    expect(programByRoute('nope')).toBeNull();
  });
});
