# Muscle-Meta platform foundation — plan v3 (for approval)

> **Archive note (added 2026-11-01).** Planning snapshot from 2026-09-27, saved so later sessions can read it.
> - **Partly implemented.** Work merged to `main` after this date implemented M0–M2 and the Program 1 app (`app/`, `supabase/migrations/`); check `main` before acting on any item here.
> - **Database references.** Supabase facts below describe project `bxpferfuwoiulnqnfqhf` as it was on 2026-09-27. Development of the assessment foundation is moving to project `ikjadymjalaelkpivveh` (decided 2026-11-01). Do not run anything against `bxpferfuwoiulnqnfqhf` from this document.
> - **4P assessment.** The 4P assessment it mentions is now specified in `mm-4p-assessment-spec-v1.md` (approved 2026-10-08).

**Status: PLAN ONLY.** No commits, pushes, database writes, or repo archiving have been done.
This supersedes plan v2 where noted; v2's Program 1 detail still stands inside this larger frame.

**Sources read (read-only):**
- the `muscle-meta` repo, including the new `main` commit (redirect from `musclemetamatrix.com`)
- Supabase `bxpferfuwoiulnqnfqhf`: schema, policies, functions, advisors
- 13 other repos in your GitHub account (§2)
- the uploaded handoff, framework, assessment and prototype files

The live site could not be fetched from this environment (the network policy blocks it). Its state was taken from the repo it deploys from.

---

## 1. The foundation in one picture

```
muscle-meta.com  (Netlify site 1, publish = site/, NO build — unchanged rule)
│  Public, indexable, real HTML: hub, /learn/ pillar + category pages, /blog/,
│  /courses/<slug>/ sales pages, /assess/<slug>/ assessment landing pages,
│  /tools/<slug>/ stateless calculators, /downloads/ lead magnets, /legal/
│  Generated or edited only through reviewed pull requests (§6 publishing).
│
app.muscle-meta.com  (Netlify site 2, base = app/, Next.js build)
│  Member area: sign-in, assessment runner, results, programs, lessons,
│  measurements, member dashboard.  /admin: owner/admin dashboard.
│  noindex. Server code holds the only privileged credentials.
│
packages/  (shared TypeScript, no framework)
│  scoring-engine/   one versioned, pure module per instrument
│  framework/        typed read of the canonical taxonomy (generated from DB rows, not re-typed)
│
supabase/  (source of truth for the database)
│  migrations/  seed/  tests/  — every schema change is a migration file in git
│
Supabase project bxpferfuwoiulnqnfqhf
   Postgres + RLS · Auth · private Storage · (Edge Functions only if needed)
```

**Rules that make this one platform rather than a pile of apps:**
1. **One database, one auth, one scoring engine, one token file.** Every legacy tool that saves data is migrated onto these; none keeps its own backend (Convex, SQLite, Kit-as-database).
2. **Adding an assessment, program, course, product or article is data plus, at most, one scoring module.** It is never a new app.
3. **Anything that must rank is static HTML on `muscle-meta.com`.** Anything personal or paid lives in the app, behind RLS.
4. **No pillar or category is ever gated.** Entitlements attach to products only, and the database enforces it (§4.1).

---

## 2. What already exists — legacy inventory and proposed disposition

| Repo / asset | What it is | Tech today | Framework fit | Proposed disposition |
|---|---|---|---|---|
| `muscle-meta` (live) | Public site | Static HTML | Canonical | **Keep.** It is the public layer. |
| `cra-assessment-preview` | **Catabolic Risk Assessment (CRA)**: 56 question ids, sections, conditional questions, 5 risk tiers (0–450, higher = worse), protective factors, compound-risk flags (for example GLP-1 + weight loss + bone) | Vite/React + Convex | Scoring is sound to port. UI has emoji icons and literal hex colours (both banned) | **Port.** Questions → rows. Scoring → `scoring-engine/cra-01`. Tiers → `tier_systems`/`risk_tiers`. Rebuild the UI in the app with tokens. **Free lead-magnet assessment.** |
| `muscle-meta-score-app` | **Catabolic Crisis Screen** + **Functional Decline & Muscle Risk Scorecard** (98 question/option ids, overrides, pathway routing, CTA map), with full specs in `docs/` | Convex | Well specified; the specs already match this plan's shape (server scoring, overrides, result snapshots) | **Port.** Highest-quality legacy spec; reuse its docs as the port spec. |
| `recovery-reserve-check` | **Recovery Reserve Check™**: safety screen, sectioned score, 5 risk tiers, "bottleneck category", retest comparison | Static HTML + Netlify function writing **scores into Kit custom fields and tags** | Good flow. **Health data stored in the email platform** — see §8 question 5 | **Port.** Kit keeps receiving *tags for email sequences only*; scores move to Supabase. |
| `sarcopenia-risk-calculator` | **Sarcopenia Risk & Muscle Age**: SARC-F, grip, chair stand, gait speed | Static HTML | Physical-performance tests with norms | **Split.** SARC-F → questionnaire rows. Grip, chair stand and gait speed → **metric definitions + norm tables** (§4.5). Stateless calculator can stay at `/tools/`. |
| `oxygen-engine` (+ `site/tools/oxygen-engine/`) | **Oxygen Engine**: Rockport, Cooper, 6MWT, talk test, VO2max, zone 2 | Single HTML file; own tokens and Supabase client; writes `field_test_results` | Already on the right database | **Keep as a /tools/ page, refactor onto shared `mm.css`/`mm.js`** (outstanding task in `deployment-checklist.md`). Its tests become metric definitions. One gating string to remove. |
| `qmma-assessment` | **QMMA** preview: 0–400 score across 4 pillars and 12 categories, action plan | One React file | Uses canonical pillar names. This is the **comprehensive Matrix assessment / MM™ Health Score** | **Port as the flagship instrument.** Needs your confirmation of its question bank and category weights (the 5-2-3-2 weighting in CLAUDE.md, not ÷12). |
| `muscle-meta-assessment` | Convex/Clerk app: 11 assessment *types* declared (GMMBB 46Q, CRA 30Q, 4P_MMA 60Q, GLP-1, Pickleball, Post-Hospital, CCRAF 95Q, MFAT, Bone Health, Brain-Muscle, Catabolic Crisis). GMMBB weights, compound-risk rules | Next 14 + Convex + Clerk | Types only — **no question banks in the repo**. "Founding" tier (gating, rejected). Endurance/Strength numbered the wrong way round | **Reference only**, then archive (v2 §F). The type list becomes the instrument registry backlog. |
| `anabolic-breaker` | Protein/leucine calculator + protein quality quiz, with Gemini-generated plans | Vite/React + Gemini | **Security: `vite.config.ts` bakes `GEMINI_API_KEY` into the browser bundle.** If ever deployed, the key is public — rotate it | **Stateless tool → `/tools/`.** Remove the client-side AI call or move it behind a server function. |
| `metaburst-vilpa-tracker` | VILPA activity tracker: activities, logs, goals | Express + SQLite (Drizzle) | Tracker data belongs in Supabase | **Port the data model** into programs/`session_logs`/measurements. Retire the server. |
| `muscle-meta-platform` | Course admin + lesson player HTML on Supabase | Static HTML | 21 gating/lock/upgrade strings | **Reference for admin UX only.** Not ported as-is. |
| `GMMBB_Axis`, `muscle-meta-matrix`, `mito-health-survey` | — | Empty repos | — | Nothing to port. Question banks may live elsewhere (§8 question 7). |
| 5 paused Supabase projects (GLP, METABurst VILPA PWA, METABlast Tracker, Metabolic Health MMM Framework, course-learn) | Possibly past data | Paused | Unknown | Inspecting them means **restoring** them (billable, your approval). Recommend restoring only those you believe hold real user data. |

**How "already built" assessments come in:** each ported instrument keeps its **original identity and scoring, frozen as version 1**. That means its questions, options, weights, thresholds and override rules are transcribed and tested against the legacy implementation with the same inputs and the same outputs. It is then rebuilt on the shared runner. Changes (tokens, no emoji, evidence grading) are UI and copy only. Any scoring change is a deliberate version 2.

---

## 3. Instrument model — one registry for every assessment type

`assessments.instrument_kind` is extended to cover everything you have built:

| Kind | Examples | Saves results? | Where it runs |
|---|---|---|---|
| `orientation` | Program 1 orientation | Metadata only, never scored | app |
| `screen` | Catabolic Crisis Screen, safety gates | Yes, routes and flags | app |
| `questionnaire` | CRA, RRC, FLR_READINESS_01, SARC-F, QMMA | Yes | app runner; indexable landing at `/assess/<slug>/` |
| `field_test` | Rockport, Cooper, 6MWT, 30-s chair stand, grip, gait speed, TUG, single-leg stance | Yes, as **measurements** (§4.5) | app, plus the stateless `/tools/` calculator |
| `composite` | MM™ Health Score (QMMA + field tests), GMMBB axis profile | Yes | app |
| `calculator` | Protein/leucine, muscle age | No (stateless), unless signed in | `/tools/` |

**Common result contract** (every instrument's scoring module returns this, and the database stores it write-once):
- `instrument_code`, `instrument_version`, `algorithm_version`, `inputs` (frozen)
- `scores[]` — each with `scope` (total/pillar/category/construct/axis/section/lens), `ref` (for example `P1-C4`, `structure`), `value`, `max`, and **`score_family`** (which scale, direction and audience — §4.3)
- `classification` — tier/route/level labels + **reason codes**
- `flags[]` — compound risks and safety flags, each with `audience` (user or clinician)
- `next_actions[]` — pathway/CTA codes (resolved to content by data, not hard-coded copy)

This single contract lets:
- the member dashboard show any assessment's history and trend;
- the admin view inspect any result;
- Program 2 add an instrument without new tables.

---

## 4. Data model — domains, reuse vs new

Existing = 34 tables (all empty). Reuse wherever the meaning matches (your answer 3).

### 4.1 Framework / taxonomy — **existing, keep**
`pillars`, `categories`, `constructs`, `gmmbb_axes`, `tier_systems`, `risk_tiers`, `population_overlays`, and the function `assert_taxonomy_integrity()`.
- **Fix:** Pillar 4 is stored with `is_gated = true`. Set it false and **drop the column**.
- **Add:** a constraint so no `access_key` on programs, courses, assessments or products can name a pillar or category. That makes "entitlements gate products, never the framework" a database rule, not a convention.

### 4.2 Identity, access, commerce
| Table | Status |
|---|---|
| `profiles` | existing, keep (auto-created at sign-up) |
| `user_roles` | **new** — coach/admin/owner/agent_service; `has_role()` |
| `products`, `prices`, `entitlements`, `payment_events` | existing — `entitlements` gains `granted_by/grant_reason/revoked_by/revoke_reason` |
| `audit_log` | **new** — every admin write, entitlement change, publish and role change |
| `leads` | **new** — email captures (email, source asset, consent text and version, Kit sync status). Kit stays the email engine. **Health scores never go to Kit** (proposed rule, §8 question 5) |

### 4.3 Instruments and scoring
| Table | Status |
|---|---|
| `assessments` | existing — extend `instrument_kind`; add `slug`, `landing_path`, `is_public_runner` (anonymous start allowed, save on sign-in) |
| `assessment_versions` | **new** (as v2) |
| `assessment_items` | existing — add `version_id`, `field_code`, `section_code`, `visible_if jsonb` (CRA's conditional questions), `scored bool` |
| `norm_tables` | existing — used for field-test bands by age/sex, with `study_id` required for display |
| `tier_systems` / `risk_tiers` | existing — **generalised as the score-family registry**: each stored score names its family, and the family carries `direction` and `audience`. Families: `mm_health_score` (higher better, user), `ccraf` (higher worse, clinician), `cra_risk`, `rrc_risk`, `flr_need` (higher = more need, user, *not* a Health Score), `flr_readiness` and so on. **This generalises CLAUDE.md's "two scales" rule so the opposite-direction bug cannot recur.** |
| `scoring_rules` | existing, **not used** — algorithms live in versioned code; keeping weights in two places would create two sources of truth. Keep the table empty, or drop it (your call). |

### 4.4 Attempts and results (**changes v2**)
| Table | Status |
|---|---|
| `assessment_attempts` | existing — add `version_id`, `enrollment_id`, `status (draft/final/abandoned)`, `anonymous_token` (public runner before sign-in). Members may edit `answers` only while `draft`. |
| `assessment_results` | **new**, write-once, the common contract above (typed common columns + `classification`/`details jsonb`) |
| `attempt_scores` | existing — **reused for every instrument's scores** (not just the Health Score), adding `score_family`, `scope` values `lens`/`section`, and writes server-side only. *v2 kept FLR out of this table to avoid mixing with the Health Score; the `score_family` column now does that separation explicitly, so one generic table serves every program.* |
| `result_flags` | **new** — compound risks and safety flags (from CRA / legacy Convex `compoundRiskFlags`), `audience` user or clinician |
| `four_lens_results` | **a database view** over `attempt_scores` + `assessment_results` — keeps the spec's name for the dashboard without a duplicate table |
| `clinical_profiles` | existing, clinician-only (CCRAF) — unchanged, deny-all to members |

### 4.5 Physical performance and measurements (**changes v2**)
| Table | Status |
|---|---|
| `metric_definitions` | **new** registry for *every* measurable thing: field tests (30-s chair stand, grip, gait speed, TUG, 4-stage balance, single-leg stance, 6MWT, Rockport, Cooper, SPPB components), body metrics (weight, waist), and ratings (pain, fatigue, recovery, participation, confidence). Holds directionality, unit, lens, `P#-C#`, protocol text, and the "meaningful change only with a cited study" constraint. |
| `field_test_results` | existing — **becomes the single measurement store** (add `metric_code`, `cycle_id`, `attempt_id`, `source`). Oxygen Engine already writes here. *v2's new `progress_measurements` table is dropped: two stores for the same chair-stand value would be a duplicate source of truth.* |
| `progress_cycles` | **new** — baseline / day 30 / reassessment windows that group measurements and results |
| `metric_packages`, `metric_package_items` | **new** — goal → baseline package (Program 1) and any future program |

### 4.6 Programs and learning — **existing, keep and extend**
- **`programs`** — add `course_id`, `entry_assessment_id`, `orientation_assessment_id`, `duration_days`, `delivery`.
- **`program_weeks` / `program_sessions` / `session_blocks` / `session_logs` / `weekly_audits`** — the training-session structure (Oxygen Engine, METABurst VILPA).
- **`courses` / `modules` / `lessons` / `lesson_progress`** — curriculum; `lessons` gains `lesson_type` and `day_number`.
- **`program_enrollments`** — gains the orientation and safety fields (v2 §C3). Self-enrolment is closed.

### 4.7 Content, SEO/AEO/GEO and publishing — **new domain**
| Table | Purpose |
|---|---|
| `content_items` | One registry for every public or paid asset: `kind` (article, pillar_hub, category_page, assessment_landing, tool, lead_magnet, checklist, tracker, worksheet, guide, download, course_page, lesson_block); `slug`, `path`; `status` (draft → in_review → approved → published → archived); `access` (free / email_capture / product → `feature_key`); `pillar_id`/`category_id` (`P#-C#`); author; reviewed_by; `published_at`/`updated_at` |
| `content_versions` | Every saved revision (Markdown source + rendered HTML + SEO fields); the published version is pinned |
| `content_seo` | title (≤ 60), meta description, canonical, OG/social image, robots, schema type(s), **JSON-LD** (generated then editable), breadcrumb |
| `content_aeo` | **primary question** · 40–60-word direct-answer summary · key takeaways · FAQ pairs · "what the evidence says" block · entities/terms · target queries — the AEO/GEO extraction surface |
| `content_claims` | Links content to the existing **`claims`** and **`studies`** tables: every clinical claim carries a grade (Established / Promising / Unproven-Bridge) and a PMID that was **verified** (with a `verified_at` timestamp) |
| `content_links` | Internal links (from → to), used to enforce "linked from its category page" and to find orphans |
| `keyword_clusters` | Optional: the `mm-aeo-seo` pillar keyword clusters as data |
| `assets` | Files: images, PDFs, video/audio. Public bucket for site media; **private** bucket for paid files |
| `content_relations` | Asset/content ↔ program/module/lesson (real foreign keys) |
| `publish_jobs` | Approved version → generated static page → **GitHub PR into `site/`** → Netlify preview URL → merged state (+ sitemap and redirects updates) |
| `agent_submissions` | AI/agent drafts land here as `draft` only; never publish directly |
| `redirects` | Source of truth for `site/_redirects` lines (written by publish jobs) |

### 4.8 Coaching (scaffold now, UI later)
`coaching_enrollments` (coach ↔ member; the coach-read policy is written and tested now), `coaching_notes`, `coaching_sessions`, `cohorts`.

### 4.9 Security posture across all domains
- RLS on every table.
- Member = own rows only. Coach = assigned members only. Admin/owner = through `has_role()`.
- Scores and results are written only by server code; they are immutable, and never recomputed with a newer algorithm.
- The service-role key lives only in app **server** environment variables, never with a `NEXT_PUBLIC_` prefix.
- Private files are served only through signed URLs after an entitlement check.
- **v2 §B fixes (M0) still apply:** un-gate Pillar 4, close self-enrolment and score forgery, revoke anonymous RPC access, OTP expiry, Postgres patch.

---

## 5. Dashboards and UX

### 5.1 Member dashboard (`app.muscle-meta.com`)
| Area | Contents |
|---|---|
| Home | One next action (from the latest result's `next_actions` and program day), safety banner if review is pending |
| My Matrix | The 4-pillar diamond (E/N/R/B) for the MM™ Health Score, **all 12 categories shown and explained, never locked** |
| Assessments | Every instrument taken, with history, trend, and "what changed since last time" (per-metric direction; "meaningful" only with a cited threshold) |
| Measurements | Physical performance tests over time vs norm bands (age/sex, with source) |
| Programs | Enrolled programs, today's lesson, progress; Program 1 uses the **four separate lens panels**, not the radar |
| Library | Downloads and tools the member owns or can use (free, email-captured, purchased) |
| Account | Profile, units, data export, delete account, consent history |

### 5.2 Admin dashboard (`app.muscle-meta.com/admin`)
| Module | Phase | Contents |
|---|---|---|
| Overview | 1 | Sign-ups, active members, assessments completed, programs active, safety reviews pending |
| Members | 1 | List, detail (profile, enrolments, results, measurements), **grant/revoke entitlements with reason** |
| Assessments | 1 → 2 | Instrument registry, versions (draft → published → retired), item editor, **test harness** (enter answers, see score and reason codes against the engine), result inspector |
| Performance tests | 2 | Metric registry, protocols, norm tables with source studies |
| Programs & curriculum | 1 → 2 | Programs, modules, lessons (Markdown), lesson types, day plan |
| Assets | 1 | Upload to private/public bucket, attach to program/module/lesson, access check |
| **Content studio** | 3 | Blog/articles, pillar hubs, category pages, assessment landings, lead magnets, checklists, trackers, downloads; Markdown editor **or HTML upload (sanitised and re-templated)** |
| **SEO / AEO / GEO panel** | 3 | Live checks per page: title/meta length, one H1 + heading outline, canonical, JSON-LD validity (Article/MedicalWebPage/HowTo/FAQ/Course/Person for E-E-A-T), primary question + direct answer present, FAQ pairs, entity coverage, internal links in/out, category-page link present, image alt text, reading level, sitemap inclusion, `llms.txt` entry, **claims graded + PMIDs verified**, no emoji, sentence case, tokens only |
| Evidence | 3 | `studies` and `claims` library; PubMed verification; where each claim is used |
| Publishing queue | 3 | Approved items → PR → preview link → merged; rollback = revert PR |
| Products & leads | 2 → 4 | Products, prices, Kit sync status, lead sources; Stripe later |
| Audit log | 1 | Who changed what and why |
| Coaching, agent inbox, analytics | 4+ | Scaffolded now |

### 5.3 UI foundation
- **Tokens:** `site/assets/mm.css` remains the **only** token file. The app **imports that file at build time**, never a copy. The pillar and category *data* is read from the database (the canonical rows), not re-typed in app code.
- **Definition of done inherited from CLAUDE.md for every screen:** works at 390 px · 44 px targets · 16 px minimum text · WCAG AA · no emoji · sentence case · Cormorant Garamond / Outfit only.
- **Ported legacy UIs are rebuilt, not copied.** CRA's emoji icons and literal colours, and Oxygen Engine's private tokens, are stripped.
- **Audience 45+:** one question per screen, save and resume, a visible progress indicator, plain language, the "pause and return" and "larger text" supports chosen in orientation, and reduced motion.

---

## 6. Blog / SEO / AEO / GEO publishing — how it stays indexable

1. You write in the admin (Markdown editor or HTML upload). An AI draft can arrive through `agent_submissions` but only as a draft.
2. The page renders through the canonical page template. Uploaded HTML is sanitised; scripts and inline styles are removed, because executable HTML on the public domain is a security risk.
3. Automatic checks run (SEO/AEO/GEO panel above, plus link check).
4. You approve. A publish job opens a **GitHub pull request** adding `site/blog/<slug>/index.html` and updating `sitemap.xml` (and `_redirects` if the slug changed).
5. Netlify builds a **deploy preview**; you check it; you merge. `main` goes live.

The result: real HTML in the response (rankable and citable by AI crawlers), a git history of every page, and no clinical content published without your approval. It also keeps `site/` build-free.

---

## 7. Phased roadmap

| Phase | Scope | Proves |
|---|---|---|
| **0 — Governance** | CLAUDE.md amendments (§9) · M0 security fixes (including un-gating Pillar 4) · repo layout (`app/`, `packages/`, `supabase/`) · second Netlify site for `app.` · archive audit of `muscle-meta-assessment` | Rules and structure agreed before code |
| **1 — Platform core + Program 1** | Auth, roles, entitlements admin, instrument registry + versioning, generic runner, write-once results, member dashboard shell, admin shell (overview, members, assessments, assets, audit) · **FLR_READINESS_01 + orientation + Program 1 baseline** · **CRA ported as the second instrument** (public runner, lead magnet) | The engine is generic: two very different instruments on one runner |
| **2 — Performance + legacy ports** | Metric registry, norm tables, measurement entry and trends · Oxygen Engine onto shared assets and measurements · sarcopenia tests · Catabolic Crisis Screen + Functional Decline Scorecard · RRC · Program 1 curriculum | Legacy assessments live on one backend |
| **3 — Content studio + publishing** | Content registry, SEO/AEO/GEO panel, evidence library, PR-based publishing, lead magnets and downloads | Blog and assets without hand-editing HTML |
| **4 — Commerce + flagship** | Stripe → entitlements, QMMA / MM™ Health Score composite, coaching, remaining legacy types (GLP-1, Pickleball, Post-Hospital, Bone, Brain-Muscle, MFAT, CCRAF clinician view) | Paid products end-to-end |

Each phase: migrations tested locally (Docker is available here) → Supabase branch → deploy preview → your approval → merge.

---

## 8. Decisions needed

1. **Assessment placement.** Recommend: an indexable landing page at `muscle-meta.com/assess/<slug>/`, with the interactive runner in the app (anonymous start allowed; save on sign-in). Stateless calculators stay at `/tools/`. The current CLAUDE.md says "assessments … never a subdomain", so this needs the §9 amendment. *Alternative:* build a runner inside the static site too — two renderers to maintain, which is not recommended.
2. **Single measurement store:** extend `field_test_results` for all measurements, instead of a separate `progress_measurements` table (changes v2).
3. **Generic scores:** `attempt_scores` + `score_family` for every instrument, with `four_lens_results` as a view (changes v2).
4. **Legacy dispositions** in §2. Which built assessments matter most to port first? The recommended order is CRA → Catabolic Crisis/Functional Decline → RRC → sarcopenia tests → Oxygen Engine → QMMA.
5. **Health data in Kit:** RRC currently writes risk tiers and scores into Kit custom fields and tags. Recommend: Kit gets only neutral sequence tags (for example "completed RRC"), and scores stay in Supabase under RLS. Approve as a rule?
6. **`scoring_rules` table:** leave empty, or drop?
7. **Missing question banks:** GMMBB 46Q, 4P_MMA 60Q, CCRAF 95Q, GLP-1, Pickleball, Post-Hospital, MFAT, Bone, Brain-Muscle — none are in any repo I can see. Where do they live (Drive, Notion, the Convex deployment, the paused Supabase projects)?
8. **Paused Supabase projects:** restore any of them to check for past data? (Billable.)
9. **Anabolic Breaker:** was it ever deployed? If yes, rotate the Gemini key.
10. **Which CLAUDE.md governs this repo.** The `CLAUDE.md` you uploaded (the "constitution": Karpathy principles + Memory OS) points at `Muscle Meta Research Assistant/…` files that are not in this repo. The repo's `CLAUDE.md` is the project brief. Recommend: the repo keeps its brief and adds a short pointer that the constitution applies globally.
11. All open items from plan v2 still stand (D-1 to D-4, the Supabase branch, the Convex data check, the publishing milestone).

---

## 9. Proposed CLAUDE.md changes (text for your approval — not applied)

| § | Current | Proposed |
|---|---|---|
| Header / §3 | "No build step" implied site-wide | "**`site/` has no build step.** `app/` is a separate Next.js build deployed as its own Netlify site. `site/` never imports from `app/`." Add `app/`, `packages/`, `supabase/` to the layout. |
| §1 "Two scoring scales" | MM™ Health Score vs CCRAF | "**Every stored score names its score family** (`tier_systems`), which carries direction and audience. Families include `mm_health_score` (higher better), `ccraf` (higher worse, clinician-only), Four-Lens need signals (higher = more need; *not* part of the Health Score), and CRA/RRC risk (higher worse). Never render a score without its family's direction." |
| §1 Gating | Strong already | Add: "The database rejects any `access_key` naming a pillar or category. `pillars.is_gated` was removed on <date>. All 12 categories are scored and shown in every assessment result, free or paid." |
| §2 new | — | "**Assessment integrity:** scoring lives in `packages/scoring-engine/<instrument>`, versioned. A scoring change is a new `algorithm_version`; stored results are never recomputed. Missing answers are never imputed. Safety answers are workflow triggers, not scores." |
| §2 new | — | "**Health data never leaves Supabase.** Email platforms receive neutral tags only." *(if you approve §8 question 5)* |
| §4 Supabase | "34 tables" · "service role key … Edge function environments only" | Remove the table count (it goes stale). "Service role key: only in server-side environments (`app/` server env, Edge Functions). Never `NEXT_PUBLIC_*`, never in `site/`." "Schema changes are migration files in `supabase/migrations/`, tested locally and on a branch before production." |
| §5b Domains | Delivery = Kajabi on `learn.` · "Assessments … never a subdomain" | "Member delivery = **`app.muscle-meta.com`** (first-party). Kajabi `learn.` = legacy courses during migration only. Both `noindex`." "Assessments: indexable landing at `/assess/<slug>/` on the main domain; the interactive runner and saved results live in `app.`. Stateless calculators stay at `/tools/`." |
| §5b new | — | "**Publishing:** public pages are created or changed only by a reviewed PR into `site/` (by hand or by an admin publish job). Nothing auto-publishes clinical content." |
| §6 Stale | — | Add: "`muscle-meta-assessment` (Convex/Clerk) is superseded — do not build on it." |

The gating language itself needs **no weakening**. It is correct and the plan enforces it in the database.
