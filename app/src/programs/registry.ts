/* MatrixApp program registry: the one place that says which programs exist
   and how each one is wired. Every program lives at
   muscle-meta.com/app/<route>/… and is reached through the same template.

   Adding a program:
     1. Database rows (a migration): the program, its course and modules, the
        product and price, and — for an assessment journey — the assessment,
        a published assessment_versions row and its metric_definitions.
     2. One entry below. `route` is the short web address; `dbSlug` is the
        programs.slug row it maps to (they may differ, as for four-lens).
     3. Only a program with genuinely new behaviour needs new code: a new
        `kind`, or a new versioned engine module with its own fixtures.

   Access is never decided here. `access` names the entitlement key the
   database checks with row-level security; this file only uses it to choose
   which screens to show. Entitlements attach to products, never to a pillar
   or category (CLAUDE.md, "Gating is REMOVED"). */

export type ProgramKind = 'assessment-journey';

export type ProgramConfig = {
  route: string;          // URL segment: /app/<route>/
  dbSlug: string;         // programs.slug
  kind: ProgramKind;
  title: string;          // shown in MatrixApp
  summary: string;        // one line for the My programs card
  durationDays: number | null;
  access: string;         // entitlement feature_key that unlocks it
  addOns: { key: string; label: string }[]; // extra entitlements (e.g. one-to-one)
  assessmentCode?: string; // assessment-journey only
  salesPath: string;      // public page on muscle-meta.com that sells it
};

export const PROGRAMS: readonly ProgramConfig[] = [
  {
    route: 'four-lens',
    dbSlug: 'four-lens-30',
    kind: 'assessment-journey',
    title: '30-Day Four-Lens Program',
    summary: 'Orientation, a readiness check, your Four-Lens profile, a baseline matched to your goal and a Day 30 reassessment.',
    durationDays: 30,
    access: 'program:four-lens',
    addOns: [{ key: 'coaching:four-lens-1to1', label: 'one-to-one' }],
    assessmentCode: 'FLR_READINESS_01',
    // Becomes /programs/four-lens/ once its sales page ships with Stripe (M4).
    salesPath: '/courses/'
  }
];

/* Top-level MatrixApp screens. A program route may never use these names. */
export const RESERVED_ROUTES: ReadonlySet<string> = new Set(['admin', 'sign-in', 'auth', 'no-access', 'api', '_next']);

export function programByRoute(route: string): ProgramConfig | null {
  return PROGRAMS.find(p => p.route === route) ?? null;
}

/* Every entitlement key a staff member may grant by hand from /admin. */
export const GRANTABLE_KEYS: ReadonlySet<string> = new Set(
  PROGRAMS.flatMap(p => [p.access, ...p.addOns.map(a => a.key)])
);

/* The steps of an assessment journey, in order. Paths are relative to the
   program: /app/<route>/<step>. */
export const JOURNEY_STEPS = ['orientation', 'safety', 'readiness', 'results', 'baseline', 'dashboard'] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];

export function stepPath(program: ProgramConfig, step: JourneyStep): string {
  return `/${program.route}/${step}`;
}

export function programHome(program: ProgramConfig): string {
  return `/${program.route}`;
}
