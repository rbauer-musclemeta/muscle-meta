# muscle-meta.com — project brief

You are working on the Muscle-Meta Matrix™ platform: one domain carrying every
tool, course, assessment and article. Randy Bauer, PT — Mayo Clinic trained,
35+ years clinical — is the sole author and the audience is active adults 45+.

Read this file before changing anything. The rules below are not style
preferences; several of them have already caused real bugs.

---

## 1. Hard rules — violating these is a defect, not a judgement call

### Brand tokens are absolute
Every color, font and spacing value comes from `assets/mm.css`. Never write a
literal hex value in a page. If a page needs a color the tokens do not have,
that is a conversation, not a local override.

- Display / headings: **Cormorant Garamond**. Body / UI: **Outfit**. Nothing else.
- Teal `#009090` primary · Gold `#D4AF37` accent · Ink `#1a2332` headings
- Page background is `--surface` `#f7f6f3`. **Never pure white.** This applies to
  the page ground only — `--white` cards sitting on that ground are correct and
  used throughout.
- Gold has drifted before (`#C9A24B` shipped once). If you see a gold that is
  not `#D4AF37`, it is wrong.

### No emoji in product UI or marketing copy. Ever.
### Sentence case for every heading, button and label.
Exception: "Muscle-Meta Matrix™" is always capitalized.

### Framework integrity

**Pillar naming is SETTLED. Decided by Randy, 2026-09-16. These four names,
letters, slugs and colors are canon — do not substitute, reorder or reword them
anywhere: UI copy, page titles, URL slugs, database rows, schema markup, alt
text, email subject lines.**

| # | Name | Letter | Slug | Categories | Color |
|---|---|---|---|---|---|
| 1 | Exercise & Mobility | E (top, −90°) | `exercise-mobility` | 5 | teal `#009090` |
| 2 | Nutrition & Metabolism | N (right, 0°) | `nutrition-metabolism` | 2 | gold `#D4AF37` |
| 3 | Recovery & Stress | R (bottom, 90°) | `recovery-stress` | 3 | purple `#7c3aed` |
| 4 | Balance & Brain Health | B (left, 180°) | `balance-brain-health` | 2 | green `#16a34a` |

A competing set was in circulation during review — *Metabolic Flexibility &
Nutrition, Recovery & Stress Reduction, Brain & Balance*. **It is rejected.** If
you find those strings in any file, they are stale: replace them with the table
above. Two reasons they lose, so nobody relitigates this:

1. The radar diamond is labeled **E / N / R / B** and its geometry note is written
   against those letters. "Metabolic Flexibility & Nutrition" makes the letter M
   and breaks the label, the geometry comment and every existing radar asset.
2. No pillar may share its name with a category it contains. "Metabolic
   Flexibility" is a **category inside** Pillar 2; promoting the phrase to the
   pillar label makes the taxonomy ambiguous in code and in copy.

The names live in **two places on purpose**: `site/assets/mm.js` → `PILLAR_DEFS`
(runtime), and hard-coded in the HTML of every indexable page, because AI and
search crawlers do not execute JS. A naming change is therefore a two-file
change, and `grep -rn "Exercise & Mobility" site/` must find both. Never
client-render a pillar name onto a page that needs to rank.

### Category numbering is SETTLED. Decided by Randy, 2026-09-16.

**Category numbers run 1–12 continuously across the whole matrix. They do NOT
restart at 1 inside each pillar.** The canonical identifier is `P#-C#`, and the
C number is globally unique, so `P1-C5` and `P2-C6` are adjacent, not parallel.
Use `P#-C#` as the stable key in the database, in URLs, in research-tracker rows
and in every asset filename.

| Key | Category | Pillar |
|---|---|---|
| P1-C1 | Joint Health | Exercise & Mobility |
| P1-C2 | Functional Independence | Exercise & Mobility |
| P1-C3 | Mobility | Exercise & Mobility |
| P1-C4 | Strength | Exercise & Mobility |
| **P1-C5** | **Endurance** | Exercise & Mobility |
| P2-C6 | Nutrition | Nutrition & Metabolism |
| P2-C7 | Metabolic Flexibility | Nutrition & Metabolism |
| P3-C8 | Recovery | Recovery & Stress |
| P3-C9 | Lifestyle | Recovery & Stress |
| P3-C10 | Stress Management | Recovery & Stress |
| P4-C11 | Balance | Balance & Brain Health |
| P4-C12 | Brain Health | Balance & Brain Health |

**Endurance is P1-C5 and Strength is P1-C4.** `muscle-meta-design`'s framework
reference has them the other way round (Endurance 4, Strength 5) — that file is
the outlier and is wrong on this point. `mm-research-to-asset-orchestrator`
(`architecture-integrity.md`) and `mm-aeo-seo` (`pillar_keyword_clusters.md`)
both independently number them 4-Strength / 5-Endurance, and the live research
corpus and Kajabi course agree. Do not "fix" the pair back.

Category weights are **not** equal and are not derivable from these numbers. A
Pillar 2 category carries ~50 points of its pillar, a Pillar 1 category ~20.
Aggregate construct → category → pillar → total. Never divide by twelve.

### Gating is REMOVED. Decided by Randy, 2026-09-16.

**There is no gated pillar, no gated category, no upgrade-lock, no tease-only
content and no Founding Member tier in the framework.** All 4 pillars and all 12
categories are shown, scored, explained and cross-linked to every visitor.

Randy's reason, which is the thing to protect: the matrix is a model of
*interconnectedness*. Cross-pillar and cross-category relationships — the
convergence patterns, the GMMBB axis, osteosarcopenia, the catabolic cascade —
are the substance of the framework, and they are unexplainable when two of the
twelve categories have to be withheld mid-argument. A gate cuts the argument in
half and leaves the half that does not persuade.

**Consequences, so this is applied and not merely agreed with:**
- Never render a lock, blur, "unlock", "upgrade to see", "Founding Members" or
  partially-obscured score anywhere in product UI or marketing copy.
- No `gated` / `locked` / `tier_required` flag on a pillar or category, in the
  runtime data or in the database. Entitlements still exist, but they attach to
  **products** — a course, a program, a saved history, a clinician report — never
  to a region of the framework.
- Free assets may name, score and explain P4-C11 Balance and P4-C12 Brain Health
  in full, same as any other category.
- What is sold is the *thing built on top of* the framework — the prescription,
  the programming, the longitudinal tracking, the interpretation — not access to
  a slice of the map. The map is public; the route is the product.

**Three skills encode the gate and will try to reintroduce it.** Exact locations,
so this can be checked rather than remembered:

| Skill | File | What it says |
|---|---|---|
| `muscle-meta-design` | `SKILL.md` (Violation 2) | "Pillar 4 … permanently gated for non-Founding Members" |
| `muscle-meta-design` | `references/framework.md` | "⚠ GATE: Pillar 4 is permanently locked" |
| `mm-research-to-asset-orchestrator` | `SKILL.md` (Architecture integrity) | "gated at every tier boundary … never partially unlock" |
| `mm-aeo-seo` | `references/pillar_keyword_clusters.md` | C10, C11, C12 marked "UPGRADE-LOCKED — tease copy only" |
| `mm-aeo-seo` | `references/eeat_health_requirements.md` | "Upgrade-Lock Copy Rules (Categories 10, 11, 12)" |
| `mm-aeo-seo` | `references/aeo_technical_checklist.md` | "Upgrade-locked categories (10, 11, 12) get tease links only" |

All six are **superseded by this file**. If a generated asset comes back with a
lock, a tease, an upgrade CTA in place of content, or a category held back, that
is the skill talking, not the spec — strip it and keep going. `CLAUDE.md` wins
over any skill on framework questions; that is what this file is for.

A gate reintroduced as a *feature request* is still a gate. Entitlements gate
**products**; nothing gates a pillar, a category, a score, or an explanation.

- **4 pillars, 12 categories, distribution 5-2-3-2.** Not 3 per pillar. Never
  divide a total by twelve.
- Pillar 2's two categories split **56/44**, not 50/50.
- GMMBB is a 5-axis diagnostic pentagon (25/25/20/15/15), **not a pillar**.
- **No pillar or category is gated.** See "Gating is REMOVED" above.
- The database enforces this. If an insert is rejected, the insert is wrong.

### Two scoring scales run in opposite directions
- **MM™ Health Score** — 0–100, higher is better, user-facing.
- **CCRAF** — higher is worse, **clinician-only**. Never render a raw CCRAF
  number, its evidence basis, or its citations in a user view.
Confusing these caused a live scoring bug. `tier_systems` stores the direction
and audience explicitly — read it rather than assuming.

### Evidence rules
- Every clinical claim carries a grade: Established / Promising / Unproven-Bridge.
- **Every PMID must resolve through PubMed before it ships.** Three fabricated or
  mismatched citations have been caught already.
- No diagnosis language. Bounded reassurance only. Safety screens stay in.

---

## 2. Two architectural constraints that decide how things are built

### Paid content cannot be a file
Netlify edge gating with an external JWT is an Enterprise feature; this site is
on Pro. Anything in this repo is publicly fetchable by URL.

- **Free tools and free articles** → plain HTML files in the repo. Good.
- **Paid lesson content** → lives in Supabase (`lessons.body_md`), fetched at
  runtime through row-level security. The page in the repo is a *shell*.

### Indexable content cannot be client-rendered
AI crawlers (`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`) largely do not
execute JavaScript, and Google renders it slowly and unreliably.

- Anything that must rank — articles, pillar hubs, category pages — must be
  **real HTML in the response**. Never fetch-and-inject prose you want indexed.
- Paid lesson content is the deliberate opposite: it should *not* be crawlable.

---

## 3. Layout

Only `site/` is published. Everything above it — this file, `docs/`, notes —
stays in the repo and out of the public website. If you add a documentation
file, it does not go in `site/`.

```
site/
/                     hub
/tools/<slug>/        interactive tools — free, self-contained HTML
/learn/<pillar>/      pillar hubs and category pages — must be real HTML
/blog/<slug>/         articles — GENERATED from content/blog/*.md; never hand-edit
/cms/                 Sveltia CMS content editor (noindex); saves to content/blog/
/courses/<slug>/      course shells — content from the database
/downloads/<slug>/    free lead magnets, each behind an email capture
/legal/               privacy, terms, medical disclaimer
/assets/mm.css        the ONLY copy of the design tokens
/assets/mm.js         the ONLY copy of auth, entitlement, capture, analytics
```

Outside `site/` (never published by the public site):

```
app/                  member app → app.muscle-meta.com (Next.js; see docs/program-1/)
app/src/engine/       scoring + routing engine: pure TS, fixture-tested, versioned
supabase/migrations/  every schema change, in order; apply through a migration only
supabase/functions/   edge functions (complete-assessment writes results)
supabase/tests/       SQL access tests; run after any schema change
content/, scripts/    blog source and the blog build
```

Rules: every page links `assets/mm.css` and `assets/mm.js`. No page redefines a
token. No page ships its own copy of the tier labels or the pillar list.

### The blog build (added 2026-09-28)
The site has exactly one build step: `npm run build` runs
`scripts/build-blog.mjs`, which renders `content/blog/*.md` into
`site/blog/<slug>/`, regenerates `site/blog/index.html` and `site/blog/feed.xml`,
and inserts post URLs into `site/sitemap.xml` between the `blog:start` /
`blog:end` markers. Every other page is still a hand-written file.

The build **refuses to publish** a post that breaks the rules in this file:
non-canonical pillar or category key, a reference without an evidence grade,
a PMID whose PubMed first author and year do not match the citation, gate or
upgrade wording, emoji, or a literal hex colour. A failed build leaves the live
site unchanged. `content/pmid-cache.json` holds PMIDs already read in PubMed;
anything not in it is checked live against PubMed on every build. Drafts
(`draft: true`) render on deploy previews only, never on production.
Full workflow: `docs/blog-workflow.md`.

---

## 4. Supabase

Project ref `bxpferfuwoiulnqnfqhf`. Row-level security on every table. Every
schema change is a file in `supabase/migrations/` (the 2026-09-12 baseline
migrations were applied before this folder existed; see
`supabase/schema/2026-09-28-inventory.md`).

- The **publishable (anon) key is public** and may appear in HTML and in
  `app/netlify.toml`. RLS is the protection.
- The **service role key must never appear in this repo** or in the member
  app. It exists only inside Supabase edge functions.
- Members can never write derived results, grant access or edit definitions.
  Results are written only by `supabase/functions/complete-assessment`, which
  scores from the stored answers with the engine in `app/src/engine/`
  (copied into the function by `app/scripts/sync-engine.mjs`; a test fails if
  the copies differ).
- Published assessment versions and derived results are immutable (triggers).
  Corrections are a new version or an appended `result_overrides` row.
- Roles: `user_roles` (member, coach, admin, owner, agent_service). Staff
  checks use `private.is_staff()`. Owner alone manages roles.
- After any schema change: run `supabase/tests/rls_program1.sql` (must end
  `RLS_TESTS_PASSED`) and the Supabase security advisors.
- Adding an assessment or program is **rows, not code**: a new
  `assessment_versions` row, `metric_definitions`, a program and course.
  New scoring logic is a new versioned engine module with its own fixtures.

---

## 5. Workflow

1. Branch. Netlify builds a deploy preview per branch.
2. Check the preview URL renders before merging — an API saying "updated" is not
   proof a page draws.
3. Merge to `main` deploys to production.
4. Run the Supabase security advisors after any schema change.

**Definition of done for a new asset:** renders at 390px wide · 44px minimum hit
targets · 16px minimum body text · WCAG AA contrast · no emoji · tokens only ·
every claim graded · every PMID verified · linked from its category page ·
appears in `sitemap.xml`.

---

## 5b. Domain architecture — one domain, many assets

**Subfolder by default. A subdomain only for a surface that must never rank.**
Topical authority, internal link equity and the accumulated trust that lets a
solo clinician rank in YMYL health do not pool across a subdomain boundary.

| Surface | Lives at | Why |
|---|---|---|
| Course and program sales pages | `muscle-meta.com/courses/<slug>/`, `/programs/<slug>/` | Indexable, citable, carries the evidence and the credential. |
| Member area: programs, assessments, results, dashboard, admin | `app.muscle-meta.com` (Next.js, `app/` in this repo, its own Netlify site) | Private and `noindex`. Never competes with the sales pages. |
| Free tools and screeners | `muscle-meta.com/tools/`, `/assess/` | Own HTML. Never a subdomain. |
| Blog, about, guides | `muscle-meta.com/blog/`, `/about/`, `/downloads/` | Same. |

**Decided 2026-09-27/28 (replaces the 2026-09-20 Kajabi rule):** course
delivery and payments leave Kajabi. Stripe takes payments (M4), Kit stays for
email, Supabase owns identity, access and results. `learn.muscle-meta.com`
(Kajabi) is retired once existing students are migrated; redirect it to
`app.muscle-meta.com`.

The member app follows every rule in this file: tokens come from
`site/assets/mm.css` (copied at build by `app/scripts/sync-tokens.mjs`, never
edited in `app/`), no emoji, sentence case, canonical pillar and category keys,
nothing gated by pillar or category.

## 6. Known stale things — do not trust these blindly

- Until 2026-09-28 the database numbered Endurance 4 and Strength 5 and marked
  Pillar 4 as gated. Both were fixed by migration `20260928120000`; any export,
  spreadsheet or asset made from the database before that date may carry the
  reversed numbers.

- `mm-kajabi-landing-builder` encodes the **Encore** theme. The Kajabi site now
  builds landing pages on **Nova**. Its block schema is wrong for new pages.
- `mm-aeo-seo` calls FAQ schema non-negotiable for rich results. Google removed
  FAQ rich results in **May 2026**. Keep FAQ content for AI extraction; drop the
  expectation of search real estate.
- Postgres needs a version check before launch; it was behind on patches as of
  September 2026. Check the current state rather than trusting this line.
