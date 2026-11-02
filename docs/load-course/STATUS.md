# Load as Medicine: status

Maintained by the orchestrator. This is the only file the orchestrator writes.
Branch: `feature/load-course-setup`. Last updated: 2026-11-01.

## Current position

- Phase: **P1**. Gate G0 passed 2026-11-01 (Randy confirmed all defaults).
- Wave 1 (A1, A2, A3, A7, A10) all reported 2026-11-01. A3, A7, A10 done; A1 and A2 need Randy's decisions.
- Next: Randy answers A1's 7 evidence decisions and A2's red-flag review; then A2 follow-up pass (map claims to register, apply red-flag edits) and A3 placeholder pass; then G1 is put to Randy. Wave 2 waits on G1.

## Task table

| ID | Agent | Wave | Depends on | Branch | Status | Open items |
|---|---|---|---|---|---|---|
| G0 | Orchestrator with Randy | 0 | none | `feature/load-course-setup` | done (2026-11-01) | |
| A1 | Evidence | 1 | G0 | `load-course/A1-evidence` | done 2026-11-02, second follow-up (report checked, writes in scope) | 26 claims. C18 now sourced (Mauck 2003, Graham 2017), Unproven-Bridge, movement part worded "lab studies on cartilage samples suggest". C25 (exercise in inflammatory arthritis, EULAR 2018) and C26 (OA affects the whole joint, Loeser 2012) added, Established. Do not cite until build confirms: 17107655, 26564575, 34916210, 29934429. Open with Randy: C20 grade; C18 movement wording. |
| A2 | Safety and clinical copy | 1 | G0 | `load-course/A2-safety` | follow-up done 2026-11-02 (report checked: required checks present, 73 claim tags verified against register, writes in scope); Randy's sign-off recorded | Waiting on: C20 grade (Randy); A1 to source C18 (cartilage nourished by joint fluid; Randy kept it, decision 6, but no citation yet), UNREGISTERED-1 (exercise in inflammatory arthritis), UNREGISTERED-2 (OA affects the whole joint), or those sentences are cut. Lesson 3 script timing (F23). |
| A3 | Assessment tool | 1 | G0 | `load-course/A3-tool` | done 2026-11-01 (report checked: required checks present incl. 390px local render; orchestrator spot-check: no hex, no composite/tier, no storage; writes limited to `site/tools/joint-load-check/`) | Netlify preview URL not yet confirmed (checked locally only). TODO-A2 and TODO-A1 placeholders to replace after the A2 follow-up pass. TODO-A6: next step links /downloads/ until the sales page exists. Outside A3 scope: add to sitemap, /tools/ hub, P1-C1 page (A6). Shared header logo/nav under 44px site-wide (scoped fix on this page only). Decisions: stop screen offers only start over (allow going back?); keep GLP-1 question; "gets stuck" for locking (clinical). |
| A7 | Email copy | 1 | G0 | `load-course/A7-email` | phase A done 2026-11-01 (report checked: required checks present, writes limited to `docs/load-course/emails/`) | 9 emails drafted, ran without `marketing:email-sequence`; `[CLAIM-Cnn]` and `[A2-...]` placeholders until A1/A2 merge; Kit footer placeholders (phase B); tracker and blog slugs to re-check after A4/A5; nurture exit on purchase needs a non-health purchase signal into Kit (phase B design). Decisions for Randy: approve copy (G5), sequence lengths 1/4/3/1, send days (welcome 1,3,6,10; nurture 14,18,22), newsletter extra links, nurture subscribers also get newsletter, price $37 |
| A10 | Legal | 1 | G0 | `load-course/A10-legal` | done 2026-11-01 (report checked: required checks present, writes limited to 4 legal drafts) | 45 to-confirm items in `docs/load-course/legal/review-notes.md` (on branch); privacy page is still a placeholder and must be approved and live before any Kit capture (G2), not only before payment; payment must not open before counsel reviews terms and refunds; `[A2-red-flag-screen]` placeholder; existing `site/legal/*` pages use a literal hex colour (fix when approved text is applied) |
| A4 | Downloads | 2 | G1 (A1, A2) | `load-course/A4` | not started | |
| A5 | Blog | 2 | G1 (A1, A2) | `load-course/A5` | not started | |
| A6 | Sales page and category hub | 2 | G1 (A1), A3 merged | `load-course/A6` | not started | |
| A9 | QA and verification | 3 | all wave 2 branches | `load-course/A9` | not started | |
| M4 | Stripe checkout and entitlements | external | Randy's Stripe account | n/a | not started | Owner to be named |
| A8 | Course in MatrixApp | 4 | M4 merged, G4 prerequisites | `load-course/A8` | not started (waiting on M4) | Dev Supabase `ikjadymjalaelkpivveh` only |
| A9b | QA on course | 4 | A8 | `load-course/A9b` | not started | Reads dev Supabase only |
| A7b | Sequences live in Kit | 5 | G4, Randy approves copy | n/a | not started | Kit actions need Randy's written approval |
| A9c | Final QA | 5 | A7b, A8, A9b | `load-course/A9c` | not started | |
| G6 | Merge to `main`, production deploy | 6 | G5 | n/a | not started | Randy only |

## Gate G0: decisions

| ID | Decision | Default (PLAN.md) | Randy's answer | Date |
|---|---|---|---|---|
| D1 | Main magnet and host | Free check plus downloads; sales page at `/courses/load-course/`; no composite score for users | confirmed default | 2026-11-01 |
| D3 | Email platform | Kit only | confirmed default | 2026-11-01 |
| D6 | Clinical review and data | Second clinical reviewer signs off red flags and claims before launch; only email and download tag reach Kit; no health answers to Kit or Stripe | confirmed; clinical reviewer named as Randy (Randall) Bauer, PT, so there is no separate second reviewer | 2026-11-01 |
| D7 | Public title | "Load as Medicine", subtitle "An educational course, not treatment." | confirmed default | 2026-11-01 |
| D8 | Consent | Double opt-in in Kit | confirmed default | 2026-11-01 |

Also decided 2026-11-01: **audience is adults 50 and over** (replaces the course's 45–75).

Already answered in PLAN.md: D2 (site-hosted, Stripe, $37.00 one-time, assumed),
D4 (Randy on camera, about two minutes per lesson), D5 (core launch scope).

## Evidence decisions (A1), Randy 2026-11-02

| # | Claim | Decision |
|---|---|---|
| 1 | C02 5/10 acceptable pain rule | Keep as labelled clinical guidance, Unproven-Bridge, A1's wording |
| 2 | C08 Wei 2024 resistance after knee replacement | Grade Promising |
| 3 | C11 "60% less arthritis" | Drop the 60% figure; raw 3.5% vs 10.2% only, as an association. Randy: "movement is good" stays the message |
| 4 | C20 exercise vs medication | Use A1's wording ("about as much as anti-inflammatory tablets ... serious side effects not reported") |
| 5 | C13 GLP-1 | Include in first release, graded Promising (Randy: "GLP-1s are promising"). C19 protein and vitamin C not addressed: held out of first release unless Randy says otherwise |
| 6 | C03 / C18 | Cite Gilbert 2021 for C03; drop the "brittle sponge" claim, keep "movement feeds the joint fluid" |
| 7 | C12 medication wording | Approved as clinical reviewer, with Randy's addition: medicines and joint injections are prescribed by a medical doctor, so the closing line points to the reader's doctor |

## Clinical decisions (red-flag screen and free check), Randy as clinical reviewer, 2026-11-02

- RF1 stops the check only when giving way or getting stuck is new or getting worse.
- RF5 adds "most nights for two weeks or more". RF6 adds "about 10 pounds or more without trying".
- RF8, RF9, RF10 kept.
- "Not sure" counts as "yes".
- RF2, RF3, RF4, RF7 approved as written.
- "Cut back to about half" kept, labelled as Randy Bauer, PT's clinical guidance.
- Free check (A3): add "Go back and change an answer" to the stop screen; keep the GLP-1 question with its neutral prescriber line; "gets stuck so you can't fully bend or straighten it" approved in place of "locking".
- C18 (Randy, 2026-11-02): use A1's wording, Unproven-Bridge, framed as part of joint metabolic health (synovial fluid, joint metabolism, chondral health). Movement part keeps "lab studies on cartilage samples suggest".
- Still open: C20 grade (currently Unproven-Bridge; orchestrator suggests Promising).

## Gates

| Gate | Status |
|---|---|
| G0 | passed 2026-11-01 (Randy) |
| G1 | not reached |
| G2 | not reached |
| G3 | not reached |
| G4 | not reached |
| G5 | not reached |
| G6 | not reached |

## Skills check (2026-11-01)

| Skill | Status | Note |
|---|---|---|
| randy-brand-voice | present (repo copy) | Not installed as a skill. Per README override, rules at `docs/load-course/source/SKILL.md` and `docs/load-course/source/references/*.md`. Agents get these paths. |
| mm-humanizer-voice | present | |
| mm-research-validator | present | |
| muscle-meta-design | present | Its gating rule (Violation 2, `references/framework.md`) and its Endurance/Strength numbering are superseded by CLAUDE.md. Agents are told so. |
| muscle-meta-html-templates | present | |
| mm-aeo-seo | present | Its upgrade-lock rules (C10 to C12) and FAQ-rich-result claim are superseded by CLAUDE.md. Agents are told so. |
| mm-blog-publish | present | |
| marketing:email-sequence (A7) | missing | A7 runs without it and says so in its report, unless Randy installs it. |
| mm-kajabi-landing-builder | **loaded, cannot be unloaded from this session** | Also a Kajabi connector is attached to the session. Neither will be used or passed to any agent; every dispatch says Kajabi is out of scope (CLAUDE.md 7.3). Randy can disable both in claude.ai settings. |

## Database use

Rule (README override, Randy 2026-11-01): production `bxpferfuwoiulnqnfqhf` is
never touched by this workstream before Randy approves a merge. Development
`ikjadymjalaelkpivveh` only, by A8 and A9b. Randy is told in chat before every
action (what, why, read or write) and gets the result after. Every sub-agent
dispatch carries this rule.

| Date | Agent | Project | Action | Read or write | Result |
|---|---|---|---|---|---|
| none yet | | | | | |

## Notes from the orchestrator's source read-through (2026-11-01)

In addition to the items already in `README.md` (no PMIDs in sources, causal
wording, "unlocking", Lesson 3 timing, audience age), for A1 and A2:

- **"5/10 acceptable pain" attributed to Gilbert 2021.** Check that Gilbert 2021
  actually states the rule; the pain-monitoring model is usually traced to other
  sources. A1 confirms or re-sources.
- **Strong mechanistic claims** likely to grade Promising or Unproven-Bridge, not
  Established: AMPK coupling of load to chondrocyte mitochondria; "mitochondrial
  dysfunction is a primary driver of OA"; catabolic shift "within days" of
  immobilisation; "fear-avoidance predicts disability more accurately than
  radiographic severity" (no source given).
- **"rebuild cartilage" / "biological rebuilding"** throughout the course: human
  evidence for cartilage regrowth from exercise is weak. A2 bounds this wording.
- **Wei 2024 table:** "6 out of 9 measures", "+0.13 walking speed", "+2.74°
  flexion", "significant reduction in pain" all need checking against the paper.
  "Active resistance is the evidence-based default" is stronger than one
  meta-analysis supports.
- **Mo 2023 modality ranking** (cycling and aquatic for pain, yoga for
  stiffness) is a network meta-analysis ranking; copy should say "ranked
  highest in one analysis", not "most effective".
- **Tracker rule "reduce volume by 50%"** has no source. A2 decides whether it
  stays as clinical guidance, labelled as such.
- **"Clinical outcomes are gated by the patient's belief system"** (framework
  doc, section 7) uses "gated"; reword wherever it is reused.
- **GLP-1 section** and **nutrition substrates (protein, vitamin C)** carry no
  citations; out of first-release scope unless A1 sources them.
- **Source tool HTML** also uses literal hex values and Font Awesome icons, on top
  of the composite risk percentage and five-tier bar. A3 rebuilds from scratch;
  nothing is copied.

## Wave updates sent to Randy

| Date | Summary |
|---|---|
| 2026-11-01 | Setup read-through done; G0 question asked. |
| 2026-11-02 | C18 kept, framed as joint metabolic health. A2 tagging pass dispatched. C20 grade still open. |
| 2026-11-02 | Randy signed off the red-flag screen, the half rule and A3's three questions. A2 follow-up pass dispatched; A3 pass follows A2. |
| 2026-11-02 | Randy answered A1's 7 evidence decisions (see table). Red-flag review (A2) and A3's 3 questions still open. |
| 2026-11-01 | Wave 1 reported: A3, A7, A10 done; A1, A2 need decisions (evidence and red-flag review). G1 pending. |
| 2026-11-01 | Clinical reviewer named: Randy (Randall) Bauer, PT. |
| 2026-11-01 | G0 passed: D1, D3, D6, D7, D8 confirmed as defaults. Open: clinical reviewer name (needed for G1); audience age 45–75 (course) vs 50+ (PLAN). |
