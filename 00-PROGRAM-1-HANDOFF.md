# Program 1 — 30-Day Four-Lens Program: implementation record

One source of truth for what was built in M0–M2, where each rule lives, and
what still needs an owner decision. The handoff's twelve spec files are
consolidated here (the handoff allows this); each section names the file or
table that enforces the rule, so nothing is stated in two places.

Built 2026-09-28. Branch `feature/program-1-foundation`.

## Architecture as built

| Piece | Where | Notes |
| --- | --- | --- |
| Public site | `site/` → muscle-meta.com (existing Netlify site) | Unchanged apart from the blog build. Astro migration deferred until after the pilot. |
| Member app | `app/` → app.muscle-meta.com (second Netlify site, base directory `app`) | Next.js 16 App Router, TypeScript, `@supabase/ssr`. `noindex` on every response. |
| Scoring engine | `app/src/engine/` | Pure TypeScript, no dependencies. Runs in Node, the browser and Deno. |
| Result writer | `supabase/functions/complete-assessment/` | Edge function; the only code that writes `assessment_results`. Holds the service role inside Supabase, so the app never has it. |
| Database | Supabase project `bxpferfuwoiulnqnfqhf` | Migrations in `supabase/migrations/`, access tests in `supabase/tests/`. |
| Content editor | `site/cms/` (Sveltia) | Public blog only. Paid content never lives in the repo. |

Deviation from the handoff: none on the app location (it is
app.muscle-meta.com, as specified). The plan document's earlier
`muscle-meta.com/app/` idea was dropped in favour of the handoff on 2026-09-28.

## Member journey (02-user-flow)

`/sign-in` (email link or code) → `/` shows the next step → `/program/orientation`
→ `/program/safety` → `/program/readiness` → `/program/results` →
`/program/baseline` (choose, then enter) → `/dashboard`.
The next step is derived from stored state in `app/src/lib/program.ts#getJourney`,
so leaving and returning, or signing in on another device, resumes in place.

Access: every program screen calls `requireProgramAccess()`; the database
independently refuses orientation, sessions and baseline rows for anyone
without the `program:four-lens` entitlement (RLS).

## Orientation (03-orientation-spec)

- Definition: `app/src/engine/definitions.ts#ORIENTATION` (4 questions).
- Stored in `orientation_sessions`: `orientation_reason[]` (max 2, enforced by a
  CHECK), `valued_function_goal`, `assessment_support_need[]`, `preferred_pace`,
  `completed_at`.
- Never scored. The engine reads only `valued_function_goal` (to pick baseline
  measures) and the safety answer (to route). A test proves identical answers
  with different goals give identical scores.
- Safety gate: separate screen, `safety_review_status` ∈ no / yes / not_sure.
  Yes or not sure → `professional_review` route; physical tests are removed from
  the baseline and a professional-review message is shown before any activity
  recommendation.
- Goal list: the handoff's ten goals (the prototype's eight plus mobility and
  body composition; "understanding my current health" became
  `general_baseline`).

## Readiness and ability check (04-readiness-assessment-spec)

- `assessments.code = FLR_READINESS_01`; published as `assessment_versions`
  `1.0.0-pilot` with the full definition as an immutable JSON snapshot.
- A session pins its version when it starts. A trigger refuses any edit to a
  published definition; a change means a new version.
- Responses: `assessment_responses` (raw 0–3, CHECK constrained; a trigger
  rejects any question code not in the pinned version).
- Wording: **draft**, written from the handoff constructs. See open approvals.

## Scoring and routing (05-scoring-routing-spec)

Implemented exactly as handoff sections 7–13 in `app/src/engine/scoring.ts`,
algorithm `flr-readiness-alg-1.0.0`.

Decisions the handoff left open, now explicit:

| Question | Decision | Why |
| --- | --- | --- |
| Rounding | Scores are exact multiples of 5/3; bands are compared exactly, display rounds to 0.1 | No boundary case depends on floating-point noise (79.99 vs 80). |
| Missing answers | No result. Status `insufficient_information` with the missing fields | Outcomes framework: "insufficient information" instead of forced classification. |
| Lens ties | Fixed order Structure, Capacity, Function, Experience | Deterministic and documented. |
| Modified-start override on a PR base | Never softens a route | Severity only goes up. |
| "Non-override readiness item" | Q1, Q3, Q6, Q8, Q10 (Q2 = 3 and Q9 = 3 already route to review) | Reading of section 9. |
| Power | Shown inside Strength (P1-C4), not as a category | No new categories. |

Reason codes are stored with every result and shown in plain language
(`app/src/lib/copy.ts`). Fixture tests: `app/tests/scoring.test.ts`, 40 cases
covering every band, every override, lens primary/secondary/balanced, Pillar 1
ranking, goal routing, missing answers and the separation rules. Gate 2 asks
Randy to approve these fixtures.

## Data model (06-data-model)

Reused: `programs`, `courses`, `modules`, `lessons`, `products`, `prices`,
`entitlements`, `program_enrollments`, `assessments`, `profiles`.

Added: `user_roles`, `audit_log`, `coach_assignments`, `assessment_versions`,
`orientation_sessions`, `assessment_sessions`, `assessment_responses`,
`assessment_results`, `result_overrides`, `metric_definitions`,
`progress_cycles`, `progress_measurements`, `assets`, storage bucket
`program-assets`.

Mapping to the handoff's table names: `questions` and `response_options` live
inside the immutable `assessment_versions.definition` snapshot (one row per
version rather than per question); `four_lens_results` are columns of
`assessment_results`; `user_programs` is the existing `program_enrollments`;
`program_modules` is `modules` under the program's course. Deferred to their
milestones: `content_items`, `content_relations`, `coaching_notes`,
`coaching_sessions`, `cohorts`, `agent_submissions`, `publish_jobs`,
`content_versions`.

## Dashboard (07-dashboard-spec)

Header: goal, day in program, route, ability level, primary and secondary lens.
Four separate lens panels (never the pillar radar, never summed), Pillar 1
priority list, baseline values as raw numbers, next action, program files.
Day 30 comparison arrives in M3.

## Course content model (08)

Program → course `four-lens-30` → four week modules (seeded) → lessons
(M3) → assets. Week titles follow the handoff curriculum.

## Admin (09-admin-spec)

`/admin` (staff only, and every admin query is also staff-only in RLS):
member list with Program 1 status; give/remove program or one-to-one access
(pilot has no checkout yet); member detail with orientation, result, raw
answers, measurements, access history; clinician override (appended, reason
required, shown to the member, original kept); protected file upload to the
private bucket and assignment to the program or a week module.

## Security (10-security-rls)

- Member: own rows only; cannot write results, grant roles or entitlements,
  edit definitions, or complete a session themselves.
- Coach: reads assigned members only (`private.coaches()`); UI in M5.
- Admin/owner: `private.is_staff()`. Owner alone manages roles; nobody can
  grant themselves a role. `rbauer@bauerpt.com` becomes owner automatically on
  first sign-in (`private.role_bootstrap`).
- Agent service: role exists; no policy grants it anything yet.
- Service role: only inside the edge function.
- Anonymous: no access to any member table; GraphQL endpoint removed.
- Audit: entitlement, role, asset, version and override changes are logged by
  triggers.

## Tests (11-acceptance-tests)

| Suite | How to run | Last result |
| --- | --- | --- |
| Scoring fixtures + engine copy check | `cd app && npm test` | 43 passed |
| Access (RLS, storage, immutability, audit) | run `supabase/tests/rls_program1.sql` | RLS_TESTS_PASSED checks=27 |
| Type check and production build | `cd app && npm run typecheck && npm run build` | passing |

The end-to-end acceptance list (sign up → dashboard → sign out → back in →
same state; admin upload; non-entitled download refused) runs on the deploy
preview once the two dashboard settings below are made. Record the result
here.

## Deployment (12-deployment-plan)

1. Merge nothing to `main` until the preview passes.
2. Netlify → Add new site → same repo → **Base directory `app`**. Build
   settings come from `app/netlify.toml`. Domain: `app.muscle-meta.com`
   (CNAME at GoDaddy to the new site's `*.netlify.app` address).
3. Supabase → Authentication → URL configuration: Site URL
   `https://app.muscle-meta.com`; redirect URLs `https://app.muscle-meta.com/**`,
   `https://*--<new-site-name>.netlify.app/**`, `http://localhost:3000/**`.
4. Supabase → Authentication → Email templates → Magic link: include both
   `{{ .ConfirmationURL }}` and `{{ .Token }}` so members can click or type
   the code.
5. Supabase → Authentication → set email OTP expiry to 3600 seconds or less;
   Settings → Infrastructure → upgrade Postgres (both advisor warnings).
6. Sign in once as rbauer@bauerpt.com (becomes owner), then give yourself and
   a test account program access from `/admin`.

## Open approvals (owner)

1. Readiness item wording (ten prompts in `definitions.ts`). Changing them
   publishes `1.0.1-pilot`; nothing already answered is re-scored.
2. The 40 fixture cases as the Gate 2 reference.
3. Metric registry mappings (lens, category, units, ranges) and the
   goal-to-metric packages. The balance goal has no balance performance
   measure yet (e.g. single-leg or tandem stance time).
4. One-to-one monthly price and what it includes.
5. Legal pages (privacy, terms, refund, medical disclaimer) must be reviewed
   before pilot members enter health information.
