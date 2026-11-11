# Program 1 — plan v2 (for approval, nothing applied)

> **Archive note (added 2026-11-01).** Planning snapshot from 2026-09-26, saved so later sessions can read it.
> - **Partly superseded.** Plan v3 (`2026-09-27-platform-foundation-plan-v3.md`) replaces some of the mapping, and work merged to `main` after this date already implemented M0–M2 (see `supabase/migrations/` and `supabase/schema/2026-09-28-inventory.md`).
> - **Database references.** Supabase facts below describe project `bxpferfuwoiulnqnfqhf` as it was on 2026-09-26. Development is moving to project `ikjadymjalaelkpivveh` (decided 2026-11-01). Do not run anything against `bxpferfuwoiulnqnfqhf` from this document.

Status: PLAN ONLY. No repo commits, no pushes, no database writes have been made.
All database facts below were read (read-only SQL + advisors) from Supabase
project `bxpferfuwoiulnqnfqhf` on 2026-09-26. Every table is empty (0 rows, 0 auth users).

---

## A. Decisions recorded from your answers

| # | Decision |
|---|---|
| 1 | Program 1 is delivered in the first-party app at `app.muscle-meta.com`. CLAUDE.md §5b gets amended: Kajabi (`learn.`) = legacy courses during migration only. |
| 2 | Archive `muscle-meta-assessment` only after the audit in §F is resolved. Do not delete it. |
| 3 | Reuse and extend existing tables; new tables only where existing ones cannot represent the requirement cleanly (mapping in §C). |
| 4 | Migrations: local first, then a Supabase **branch** (or a separate dev project if branching is not available). Never production for first application. |
| 5 | No coverage rule. All 10 responses are required before any final result. Incomplete = draft. Unanswered safety = `incomplete_safety_review`. No imputation. |
| 6 | One canonical goal list (10), Q3 support list (8), Q4 styles (4) — see §D. |
| 7 | Admin-granted entitlements only, via a protected server-side operation, audited. |
| 8 | Local draft preserved as `scratchpad/DRAFT-scoring-engine-UNREVIEWED.patch`. Not canonical. Review findings in §E. |

---

## B. Findings in the live database that affect this plan (read-only)

These exist today, independent of Program 1. Each fix is listed as a separate, reviewable migration (M0) — **nothing applied**.

| # | Finding | Why it matters | Proposed fix |
|---|---|---|---|
| B1 | `pillars` row 4 *Balance & Brain Health* has `is_gated = true`, and the column exists | Direct violation of CLAUDE.md "Gating is REMOVED" | Set false, then drop column `is_gated` |
| B2 | `program_enrollments` INSERT policy = "own row" only | Any signed-in user can enroll themselves in any program without an entitlement | INSERT requires `can_access(programs.access_key)`; enrollment creation moves to a server operation |
| B3 | `program_enrollments` UPDATE policy lets a member change any column (`status`, `program_id`, `started_on`) | Member can rewrite program state | Column-level grants: member may update orientation fields only, and only before the assessment is final |
| B4 | `assessment_attempts` UPDATE and `attempt_scores` INSERT are allowed to the member | Scores can be forged from the browser | Member may update only `answers` while the attempt is a draft; scores and results are written only server-side |
| B5 | `has_entitlement`, `can_access`, `handle_new_user` are SECURITY DEFINER and executable by `anon` | Advisor WARN; `handle_new_user` should never be an RPC | Revoke EXECUTE from `anon` (and from `authenticated` on `handle_new_user`) |
| B6 | All 34 tables visible in the GraphQL schema to `anon` | Schema discovery (RLS still blocks rows) | Disable `pg_graphql` if unused (the site and app use REST only) |
| B7 | Email OTP expiry > 1 hour | Advisor WARN; magic links are the primary sign-in | Set ≤ 1 hour (dashboard setting, not a migration) |
| B8 | Postgres 15.8.1.111 has outstanding security patches | Already flagged in CLAUDE.md §6 | Upgrade from the dashboard before launch (your action; has downtime) |
| B9 | No storage buckets, no storage policies, no roles table | Admin uploads and protected assets need these | Created in M3/M4 |
| B10 | `scoring_rules`, `clinical_profiles`, `payment_events` have RLS on and no policies | Deny-all today — correct, keep it | No change |

---

## C. Field-by-field mapping — spec → existing schema

Legend: **REUSE** = use as-is · **EXTEND** = add columns/constraints · **NEW** = new table · **NONE** = spec name not created (explained).

### C1. Identity and roles

| Spec | Decision | Detail |
|---|---|---|
| `profiles` | REUSE | `id` = `auth.users.id`, auto-created by the existing `on_auth_user_created` trigger → `handle_new_user()`. No new columns needed for Phase 1. |
| `user_roles` | **NEW** | `user_id` → auth.users, `role` check (`coach`,`admin`,`owner`,`agent_service`), `granted_by`, `granted_at`, `revoked_at`, `reason`. "member" is implicit (every signed-in user) — not stored. Member can read own rows; only owner can write, via a server function. Helper `has_role(text)` (SECURITY DEFINER, `authenticated` only). |

### C2. Programs, curriculum, access

| Spec | Decision | Detail |
|---|---|---|
| `programs` | EXTEND | Existing: `slug, title, subtitle, description, pillar_id, category_id, goal, duration_weeks!, sessions_per_week, level, access_key!, status`. Add `duration_days smallint` (30), `course_id uuid → courses` (curriculum), `entry_assessment_id uuid → assessments`, `orientation_assessment_id uuid → assessments`, `delivery text check ('app','kajabi')`. Row: `four-lens-30`, `pillar_id = 1`, `category_id = null` (spans the five P1 categories), `duration_weeks = 5`, `duration_days = 30`, `access_key = 'program:four-lens-30'`. |
| `program_modules` | NONE → reuse `modules` | Curriculum already modelled as `courses → modules → lessons`, with RLS keyed on the course `access_key`. One course row `four-lens-30` with the same `access_key`. `program_weeks`/`program_sessions`/`session_blocks` stay the training-session structure (HR zones, RPE) used by Oxygen Engine — not reused for lessons. |
| `lessons` | EXTEND | Existing: `module_id, slug, title, body_md, video_url, audio_url, duration_min, position, is_preview, assessment_id`. Add `lesson_type` check (`education, practice, reflection, assessment, action, download`) and `day_number smallint` (1–30, nullable). Paid text stays in `body_md` (CLAUDE.md §2). |
| `products` | REUSE | Row `four-lens-30`, `feature_key = 'program:four-lens-30'`, `status = 'active'`. |
| `entitlements` | EXTEND | Existing: `user_id, feature_key, source ('stripe','kajabi','manual','trial'), product_id, external_ref, granted_at, expires_at, revoked_at`. Add `granted_by`, `grant_reason`, `revoked_by`, `revoke_reason`. Phase 1 source = `manual`. Grant and revoke only through `admin_grant_entitlement()` / `admin_revoke_entitlement()` (role-checked, write `audit_log`). Existing `has_entitlement()` and `can_access()` stay the single access question. |
| `user_programs` | NONE → EXTEND `program_enrollments` | Existing: `user_id, program_id, started_on, current_week, status (active/paused/completed/abandoned)`, unique `(user_id, program_id, started_on)`. Add orientation fields (C3) + `enrolled_by`. |

### C3. Orientation and safety (non-scored)

| Spec field | Stored on | Type / rule |
|---|---|---|
| `orientation_reason[]` | `program_enrollments` | `text[]`, max 2, values from the orientation definition |
| `valued_function_goal` | `program_enrollments` | `text`, one of the 10 goal codes (§D) |
| `assessment_support_need[]` | `program_enrollments` | `text[]`; `nothing_additional` and `not_sure` are exclusive |
| `preferred_pace` | `program_enrollments` | `text`, one of 4 codes |
| `orientation_completed_at` | `program_enrollments` | `timestamptz` |
| `safety_review_status` | `program_enrollments` | `text check ('no','yes','not_sure')`; **NULL = `incomplete_safety_review`** (derived label, not stored) |
| `safety_answered_at` | `program_enrollments` | new, `timestamptz` |

Question text and options are rows, not code: an `assessments` row `ORIENTATION_01` (`instrument_kind` gains `'orientation'`), items in `assessment_items`. Answers live **only** on the enrollment (one source of truth). Program 2 can point `orientation_assessment_id` at a different orientation.

### C4. Assessment definition and versioning

| Spec | Decision | Detail |
|---|---|---|
| `assessments` | REUSE | Row `FLR_READINESS_01`, `instrument_kind = 'questionnaire'`, `audience = 'user'`, `pillar_id = 1`, `access_key = 'program:four-lens-30'`, `tier_system = null` (it must not map onto the MM™ Health Score tiers). Existing `version` = pointer to the current published version. |
| `assessment_versions` | **NEW** | `assessment_id, version, algorithm_version, status (draft/published/retired), definition_sha256, published_at, published_by, notes`; unique `(assessment_id, version)`. Published versions are immutable (trigger). |
| `questions` | NONE → EXTEND `assessment_items` | Existing: `assessment_id, position, prompt, help_text, input_type, unit, options jsonb, construct_id, category_id, axis_id, weight!, reverse_scored, is_safety_flag, required`. Add `version_id → assessment_versions`, `field_code text` (e.g. `independence_limit`). Replace unique `(assessment_id, position)` with `(version_id, position)` and `(version_id, field_code)` — safe, table is empty. `category_id` links items to P1 categories (Q3→P1-C1, Q8→P1-C2, Q7→P1-C3, Q4/Q5→P1-C4, Q6→P1-C5). `weight = 1` on every item: formula weights live in the versioned engine, not here. |
| `response_options` | NONE → `assessment_items.options` | JSON array `[{value:0,label:"Little or no limitation"}, …]`. A separate table adds joins without adding capability. |
| `scoring_rules` | NOT USED for FLR | Keeping weights in both the engine and this table would create two sources of truth. The engine is the source; `assessment_versions.algorithm_version` pins which engine produced a result. |

### C5. Sessions, responses, results

| Spec | Decision | Detail |
|---|---|---|
| `assessment_sessions` | EXTEND `assessment_attempts` | Existing: `user_id, assessment_id, started_at, completed_at, answers jsonb!, total_score, tier_system, tier_label, safety_flag!`. Add `version_id`, `enrollment_id`, `status check ('draft','final','abandoned')`. `answers` holds the working draft; locked by trigger once `status = 'final'`. `total_score`/`tier_*` stay **null** for FLR. |
| `assessment_responses` | NONE → `assessment_attempts.answers` + result snapshot | The draft lives in `answers`. The final raw responses are frozen verbatim in `assessment_results.inputs`. A third copy would be a duplicate. *Alternative if you want per-item analytics tables later: add it then as a view.* |
| `assessment_results` | **NEW** | `attempt_id` (unique), `user_id`, `assessment_id`, `version_id`, `instrument_code`, `instrument_version`, `algorithm_version`, `inputs jsonb` (10 responses + safety status exactly as consumed), `ability_score`, `ability_calculated_level`, `ability_level`, `ability_reasons text[]`, `readiness_index`, `readiness_calculated_route`, `readiness_route`, `readiness_reasons text[]`, `computed_at`. Insert only by the server; no UPDATE/DELETE for any role (trigger). |
| `four_lens_results` | **NEW** | `result_id` PK → `assessment_results`, `user_id`, `structure_need`, `capacity_need`, `function_need`, `experience_need`, `profile (focused/balanced)`, `primary_lens`, `secondary_lens`, `primary_tied`, and the Pillar 1 profile as typed columns: `joint_health_need, functional_independence_need, mobility_need, strength_need, endurance_need, power_need`, `pillar1_rank text[]`. |
| `attempt_scores` | NOT USED for FLR | Its scopes (construct/category/pillar/total) feed the MM™ Health Score model. Writing need-direction signals there would blend the Four Lenses into the Health Score, which the spec forbids. |

Why the results are split into two tables: `assessment_results` is generic (every future instrument), `four_lens_results` is FLR-specific.

### C6. Metrics and progress

| Spec | Decision | Detail |
|---|---|---|
| `metric_definitions` | **NEW** | `code` PK, `title`, `unit`, `input_type`, `value_min`, `value_max`, `lens`, `pillar_id`, `category_id`, `measurement_method`, `directionality check (higher_better, lower_better, context_only)`, `meaningful_change numeric`, `meaningful_change_study_id → studies`. **Constraint:** `meaningful_change is null or meaningful_change_study_id is not null`. The UI may say "clinically meaningful" only when both are set. |
| goal → baseline package | **NEW** `metric_packages` + `metric_package_items` | `(program_id, goal_code)` → ordered metric codes. Program 2 = new rows. |
| `progress_cycles` | **NEW** | `user_id, enrollment_id, result_id, cycle_type ('baseline','day_30'), package_id, opened_at, closed_at` |
| `progress_measurements` | **NEW** | `cycle_id, user_id, metric_code, value, unit, measured_at, note`; unique `(cycle_id, metric_code)`. Member can insert and update own rows while the cycle is open. |
| `field_test_results` | REUSE unchanged | Stays the Oxygen Engine store. Overlap to decide later: `chair_rise_30s` could exist in both. |

### C7. Content and assets

| Spec | Decision | Detail |
|---|---|---|
| `assets` | **NEW** | `bucket`, `path` (unique), `mime`, `bytes`, `sha256`, `title`, `access_key` (defaults to the linked program's key), `uploaded_by`, `created_at`. Private bucket `member-assets`. |
| `content_relations` | **NEW** | `asset_id` or `content_item_id` → exactly one of `program_id` / `module_id` / `lesson_id` (check `num_nonnulls(...) = 1`), `position`, `role`. Real foreign keys, not polymorphic ids. |
| `content_items` | **NEW, minimal** | `kind`, `title`, `slug`, `status`, `access_key`, `body_md`. Phase 1 only needs it for lesson blocks. Shaped so the publishing work in §G can extend it. |
| Storage policy | NEW | `storage.objects` SELECT in `member-assets` allowed only when an `assets` row matches `name` and `can_access(assets.access_key)`. Upload/delete: admins only, through the server. Downloads use signed URLs with 60-second expiry. |

### C8. Scaffold only (empty, RLS deny-all, no UI)

`coaching_enrollments` (coach ↔ member; the coach-read policy is written and tested now so it isn't bolted on later), `coaching_notes`, `coaching_sessions`, `cohorts`, `agent_submissions`, `publish_jobs`, `content_versions`, `audit_log` (insert-only through functions; owner/admin read).

---

## D. Orientation definition (draft for your review)

**Q1 — What brings you to Muscle-Meta now?** (up to 2; the prototype's list, unchanged)
`injury_surgery`, `illness_inactivity`, `reduced_function`, `glp1`, `healthy_aging`, `return_activity`, `baseline`, `not_sure`

**Q2 — Which ability matters most for you to protect, regain, or improve?** (one; canonical)

| Code | Label | Baseline package (draft) |
|---|---|---|
| `everyday_independence` | Everyday independence | chair_rise_30s · walking_distance · floor_transfer · participation_rating |
| `strength_lifting` | Strength, lifting, or carrying | grip_strength · chair_rise_30s · recovery_rating |
| `walking_stairs` | Walking or stairs | walking_distance · stair_confidence · recovery_rating |
| `mobility_movement` | Mobility and movement | floor_transfer · chair_rise_30s · pain_rating |
| `balance_confidence` | Balance and confidence | **(needs a balance measure — see D-1)** · stair_confidence · participation_rating |
| `energy_endurance` | Energy and endurance | walking_distance · fatigue_rating · recovery_rating |
| `recovery` | Recovery after illness, injury, surgery, or inactivity | chair_rise_30s · walking_distance · recovery_rating · participation_rating |
| `return_to_activity` | Return to recreation, sport, or work | grip_strength · chair_rise_30s · walking_distance · participation_rating |
| `body_composition` | Body composition while protecting function | body_weight · waist_circumference · grip_strength · chair_rise_30s |
| `general_baseline` | General baseline or understanding current health | waist_circumference (Structure) · grip_strength (Capacity) · chair_rise_30s (Function) · participation_rating (Experience) |

Package rule (draft): the goal package, plus one metric from the primary lens if none of the package's metrics measures that lens. Maximum 5. For a balanced profile, the goal package alone.

**Q3 — Is there anything that would make completing the assessment feel easier or more comfortable?** (multi)
`more_time`, `plain_language`, `larger_text`, `pause_and_return`, `help_from_person`, `quiet_private`, `nothing_additional` (exclusive), `not_sure` (exclusive)

**Q4 — Which starting style feels most comfortable for you right now?**
`gentle`, `steady`, `challenging_safe`, `help_me_decide`

**Safety gate (separate screen):** `no`, `yes`, `not_sure`. NULL → `incomplete_safety_review`.

**Open items needing your decision:**
- **D-1** The minimum metric list has no balance measure. Options: add `single_leg_stance_s` (seconds, higher_better, Function lens, P4-C11) plus `balance_confidence_rating`; or use `stair_confidence` alone. Recommendation: add both.
- **D-2** The routing table's "selected task", "goal-specific movement" and "sport task" need a member-defined metric: `goal_task_rating` (0–10 ease rating of a task the member names). Approve?
- **D-3** Rating metrics (pain, fatigue, recovery, participation, stair confidence) — confirm a 0–10 numeric scale with anchors, and directionality: pain and fatigue `lower_better`; recovery, participation and confidence `higher_better`.
- **D-4** Should Q1 reasons (for example `glp1`) change the introduction copy only (the prototype's overlay), or also add a metric such as body_weight? Recommendation: copy only in Phase 1.

---

## E. Scoring rules, revised to your answer 5 — and review of the draft

**Final-result gate (in the engine and in the database):**
1. All 10 items answered with an integer 0–3 → otherwise the attempt stays `draft`; no ability level, readiness route, Four-Lens result or baseline package is produced or stored.
2. Safety status must be `no`, `yes` or `not_sure`. If NULL, the flow shows the safety question, and nothing physical is recommended until it is answered. The engine refuses to finalize with `incomplete_safety_review`.
3. No substitution of missing values anywhere.

**What changes from the draft patch:**

| Draft behaviour | Status |
|---|---|
| Formulas, bands, overrides, reason codes, versions, lens tie-break, Pillar 1 ranking | Compliant — reuse after review |
| 75% coverage rule + renormalisation | **Remove** |
| `SAFETY_UNANSWERED` → professional review | **Replace** with a refusal to finalize (`incomplete_safety_review`) |
| `insufficient_data` lens profile, `INSUFFICIENT_DATA` reason codes, null handling in the Pillar 1 profile | **Remove** (unreachable once all 10 are required) |
| Engine accepts partial responses | **Change** to two functions: `validateDraft()` (partial OK, used for saving) and `scoreFLR()` (throws `IncompleteAssessmentError`) |
| Tests for skipped items | **Rewrite** to assert the refusal, plus one test per missing item |

Unchanged interpretations still needing your confirmation: rounding to 1 decimal before banding · tie order Structure > Capacity > Function > Experience · the Building-cap reason code is recorded even when it doesn't change the level · power = sub-signal of Strength (P1-C4) · "non-override item = 3" means Q1, Q3, Q6, Q8 or Q10.

---

## F. `muscle-meta-assessment` archive audit (read-only)

| Check | Finding | Action before archiving |
|---|---|---|
| Production data | None in the repo. Data would live in the Convex deployment `terrific-scorpion-642` (Clerk users, assessments, `emailLeads`), which I can't reach from here | **You:** check the Convex dashboard for row counts and export any real users or leads |
| Active deployment | Netlify project `muscle-met-assess` exists with **no current deploy** | Delete or unlink the Netlify project after the archive (your action) |
| Domains and email | `env.example` references `musclemetamatrix.com` (app URL) and a Resend sender `results@musclemetamatrix.com` | Confirm whether that domain is live or pointed anywhere |
| Secrets | Placeholders only (`pk_live_...`); no committed secrets found | Rotate the Clerk live keys if they were ever real |
| Unique scoring logic | GMMBB weighted model (25/25/20/15/15 — matches the canon), 5-band risk tiers (higher = worse), compound-risk rules (osteosarcopenia, GLP-1, early bone window, catabolic cascade) | Preserve as `docs/legacy/muscle-meta-assessment-audit.md` in `muscle-meta` — **reference only, not ported** |
| Non-canonical content | Action-plan copy with ungraded clinical prescriptions (e.g. protein 2.5 g/kg for "critical"), a "Founding" access tier and `upgradeToFounding` (gating is rejected), and Endurance/Strength in the wrong order | Record as "do not reuse" in the same doc |
| Redirects | None | — |
| Repo hygiene | Its `.gitignore` was committed as a file named `download` | Irrelevant once archived |

Then: mark archived and read-only on GitHub (your action, or mine with explicit go-ahead).

---

## G. Your question — blog / SEO / AEO / GEO, HTML uploads, downloads, digital products

**Short answer: no, none of that exists yet, and it isn't in Program 1 Phase 1.** Here's what exists today:

| Capability | Today |
|---|---|
| Blog | `site/blog/index.html` is a placeholder hub. No posts, no editor. |
| SEO/AEO/GEO | Done by hand in each static HTML page (title, meta, canonical, JSON-LD on the homepage). No tooling. |
| HTML post upload | None. |
| Downloads / lead magnets | `site/downloads/` with a Kit capture form (`kitFormId` still empty, so it's inert). Files would be public static files. |
| Calculators / tools | `site/tools/oxygen-engine/` — hand-built HTML. |
| Paid digital products | `products`, `prices`, `entitlements`, `payment_events` tables exist; no UI, no Stripe. |

**Architectural constraint (from CLAUDE.md §2):** anything that must rank has to be **real HTML in the response on `muscle-meta.com`**. A database-backed blog rendered by the app would either be client-rendered (invisible to AI crawlers) or sit on the `app.` subdomain (splitting search authority). Neither is acceptable. So a publishing admin must produce **static files in `site/` through a reviewed pull request**, not "save to database and it's live". That is exactly what the handoff's deferred `agent_submissions / publish_jobs / content_versions` + "GitHub publishing UI" describe.

**Proposed shape (a later milestone, not Phase 1):**

1. **Content registry** (extends `content_items`): `kind` = `article | lead_magnet | checklist | tracker | calculator | download | guide`, `access` = `free | email_capture | product` (product → `feature_key`; never a pillar or category, per CLAUDE.md), `pillar_id/category_id` (P#-C#), SEO/AEO fields (title ≤ 60, meta description, canonical, primary question, answer summary, FAQ pairs, schema type, `claims` rows with evidence grades and PMIDs).
2. **Authoring:** a Markdown editor, or upload of an HTML file → sanitized, re-wrapped in the canonical template (shared `mm.css`/`mm.js`, header, footer, JSON-LD). Raw uploaded HTML/JS is never served as-is: executable content on the site's origin is a cross-site-scripting risk.
3. **Publish gate:** automatic checks (brand tokens only, no emoji, sentence case, PMIDs resolve through PubMed, every claim graded, links resolve, sitemap entry) → `publish_jobs` opens a GitHub PR into `site/blog/<slug>/` → Netlify deploy preview → you approve and merge. That matches your rule: no auto-publishing of clinical content.
4. **Free downloads** (lead magnets): the file in `site/downloads/`, delivered by a Kit sequence. **Paid downloads:** the Supabase private bucket + entitlement (the same mechanism Phase 1 builds for Program 1 assets).
5. **Calculators and trackers** are code, not uploads: each new tool is a reviewed file in `site/tools/<slug>/`. Trackers that save data use Supabase tables with RLS, like `field_test_results`.

**What Phase 1 does to make this cheaper later:** `content_items`, `assets`, `content_relations`, private storage, entitlements-to-products and `audit_log` are built generically now. Paid downloads work as soon as Phase 1 ships.

**Question G-1:** keep publishing as the milestone right after Phase 1 (my recommendation), or pull it ahead of Program 1?

---

## H. Migration set (all written as files first, applied only after approval)

| File | Contents |
|---|---|
| `M0_existing_security_fixes.sql` | B1–B6. Separate so it can be approved on its own. |
| `M1_roles_audit.sql` | `user_roles`, `has_role()`, `audit_log`, entitlement admin columns and functions |
| `M2_program_curriculum.sql` | `programs` / `lessons` / `program_enrollments` extensions and tightened policies |
| `M3_assessment_versioning_results.sql` | `assessment_versions`, item/attempt extensions, `assessment_results`, `four_lens_results`, immutability triggers |
| `M4_metrics_progress.sql` | `metric_definitions`, `metric_packages*`, `progress_cycles`, `progress_measurements` |
| `M5_content_assets_storage.sql` | `content_items`, `assets`, `content_relations`, `member-assets` bucket and storage policies |
| `M6_scaffold_coaching_governance.sql` | Empty deny-all tables + the coach-read policy |
| `seed_program1.sql` | Program, course, product, `ORIENTATION_01`, `FLR_READINESS_01` v1 + items, metrics, packages |
| `tests/permissions/*.sql` | Two members + non-entitled member + admin: isolation, entitlement, storage, immutability, forged-score attempts |

**Validation path:** local Supabase (Docker is available in this environment) → run every permission test → **Supabase branch**.
**Branch note:** the project has no branches yet. Creating one is a **billable** action (Pro plan, charged per hour of branch compute) and needs your explicit go-ahead. Otherwise, a separate dev project (also billable). I won't create either without approval.

---

## I. Approval checklist

- [ ] §B fixes M0 (especially B1 un-gating Pillar 4 and B2–B4 closing self-enrollment and score forgery)
- [ ] §C mapping as written
- [ ] §D lists; D-1 to D-4
- [ ] §E interpretations
- [ ] §F you check Convex data and the `musclemetamatrix.com` domain
- [ ] §G-1 publishing milestone placement
- [ ] §H permission to create a Supabase branch (billable)
