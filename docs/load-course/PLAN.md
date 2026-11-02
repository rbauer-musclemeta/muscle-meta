# Load as Medicine: implementation plan

Owner: Randy Bauer, PT. Repository: `rbauer-musclemeta/muscle-meta`.
Status: decisions D2, D4 and D5 answered. Others below are defaults and need confirmation at Gate G0.

## 1. What we are building

A connected joint-health set on muscle-meta.com, built inside the existing repository:

1. A free joint-load check (`/tools/joint-load-check/`) with a red-flag screen first, belief and load questions, and plain guidance. It shows no composite score.
2. Free downloads (`/downloads/`): the Post-Arthroplasty Loading Guide (access: email) and the Acceptable Pain Loading Tracker (access: open or email).
3. A blog cluster (`/blog/`), four to six posts, all tagged to the Joint Health category.
4. A sales page for the course (`/courses/load-course/`), price $37.00, one-time (assumed).
5. A paid three-lesson course inside MatrixApp (`/app/load-course/`). Lessons are scroll-driven pages, each with a video of about two minutes, an interactive, a tracker and a download.
6. Email: Kit only, with a welcome sequence and a course nurture sequence.
7. A Joint Health category page under `/learn/exercise-mobility/` (pillar 1, category P1-C1) that links the new assets.

Audience: adults 50 and over with knee or hip osteoarthritis, including people after knee replacement and active players who want to keep playing. Tone: plain, warm and science-backed. Research citations stay, placed as short notes beside each claim. Few technical terms, each explained once.

## 2. Decisions

| ID | Decision | Status | Value |
|---|---|---|---|
| D1 | Main magnet and host | Default, confirm | Free check plus downloads. Sales page at `/courses/load-course/`. No composite score for users. |
| D2 | Course host and payment | Answered | Site-hosted. Paid through Stripe at $37.00, one-time (assumed). Access via MatrixApp. |
| D3 | Email platform | Default, confirm | Kit only. |
| D4 | Video | Answered | Randy on camera. About two minutes per lesson. Scroll-driven HTML. |
| D5 | Scope of first release | Answered | Core launch: check, downloads, sales page, three lessons, four blog posts, newsletter issue 1. |
| D6 | Clinical review and data | Default, confirm | A second clinical reviewer signs off on red flags and claims before launch. Only email and download tag reach Kit. No health answers reach Kit or Stripe. |
| D7 | Public title | Default, confirm | Keep "Load as Medicine". Subtitle: "An educational course, not treatment." |
| D8 | Consent | Default, confirm | Double opt-in in Kit. |

Open dependency: paid launch needs Stripe checkout and entitlements (milestone M4), which are documented but not yet built. Free assets do not wait for M4.

## 3. Architecture (what already exists)

- Free tools: `site/tools/<slug>/index.html`, one self-contained page each.
- Free downloads: `content/downloads/<slug>.md` builds a page at `/downloads/<slug>/`. The PDF goes in `site/downloads/files/`. `access: email` needs its own `kit_form_id`.
- Blog: `content/blog/<slug>.md`, built by `scripts/build-blog.mjs`. The build refuses any post that breaks the rules.
- Course sales page: static HTML, like `site/courses/oxygen-engine/index.html`.
- Paid course: MatrixApp at `/app/load-course/`. Needs a new `course` kind in `app/src/programs/registry.ts`, Supabase rows (products, lessons, course), lessons stored as `lessons.body_md`, and row-level security.
- Videos: private storage bucket with signed links. Never in the repository, because everything in the repository is publicly fetchable.
- Stripe sells, the database grants. Health data never goes to Stripe.

## 4. Non-negotiable rules

From CLAUDE.md, restated for this workstream:

- Colours, fonts and spacing come only from `site/assets/mm.css`. No hex values in pages. Fonts: Cormorant Garamond (display) and Outfit (body).
- No emoji anywhere in product UI or marketing copy. Sentence case for headings, buttons and labels.
- Pillar and category names are canon: pillar 1 "Exercise & Mobility" (`exercise-mobility`); Joint Health is P1-C1.
- Nothing is gated by pillar or category. Only products (the course) carry an entitlement.
- No composite risk percentage in any user view. The user-facing scale runs higher-is-better. Higher-is-worse scores stay clinician-only.
- Every clinical claim carries a grade: Established, Promising or Unproven-Bridge.
- Every PMID must resolve in PubMed before any file ships. Any citation without a verified PMID stays out.
- No diagnosis language. Safety screens stay in. Bounded reassurance only.
- The medical disclaimer appears on every page and download, not only in the course.
- Kajabi is discontinued. Do not reference it, link to it or use its skills.

## 5. Phases and gates

| Phase | Work | Gate to pass before next phase |
|---|---|---|
| P0 | Confirm decisions D1, D3, D6, D7, D8 | G0: Randy confirms decisions in writing |
| P1 | Evidence and safety: claims register, red-flag copy, pain-rule wording, grades | G1: every claim graded; every PMID resolves; clinical reviewer signs off |
| P2 | Free check, downloads, sales page, P1-C1 category page | G2: build passes; checks at 390px pass; Randy wires Kit form IDs |
| P3 | Four blog posts and newsletter issue 1 (drafts) | G3: posts build; Randy switches Draft off when ready |
| P4 | Paid course in MatrixApp (blocked until M4) | G4: RLS tests pass; security advisors clean; purchase works end to end in Stripe test mode |
| P5 | Email sequences and final QA | G5: sequences tested; accessibility and link checks pass |
| P6 | Launch: merge to `main`, production deploy | G6: Randy approves the merge |

## 6. Human approvals (agents never do these)

- Confirming decisions (G0).
- Creating Kit forms and sending any email.
- Switching any post or page from draft to live.
- Merging to `main`.
- Enabling Stripe in live mode.
- Any clinical or legal sign-off.

## 7. Open items

- Clinical reviewer name (D6).
- Legal review of privacy, terms and refund policy before taking payment.
- Lesson video files from Randy (Phase 4).
- Whether the tracker is open or email-gated (default: open).
