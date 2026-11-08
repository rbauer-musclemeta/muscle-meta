# Load as Medicine: status

Maintained by the orchestrator. This is the only file the orchestrator writes.
Branch: `feature/load-course-setup`. Last updated: 2026-11-02.

## Current position

- Last updated 2026-11-02. Gates G0 and G1 passed. Wave 2 built, QA pass 1 clean, draft PRs #10 to #13 open with green Netlify previews.
- In progress: A5 restructuring the four blog posts to Randy's house style (below).
- G2 waits on Randy: preview review, activity-goal lines sign-off, counsel approval of the privacy page, Kit form numbers.
- After G2: GLP-1 lead magnet, newsletter intro and blog draft (evidence done on `load-course/A1-glp1`).

## House style for blog posts (Randy, 2026-11-02)

Model: `content/blog/muscle-power-and-aging-why-speed-declines-faster-than-strength.md`. Applies to every post, including the GLP-1 blog draft.

- Clean reading: not cited literature throughout. About 4 to 6 references per post; each cited once, inside a pull quote or after one highlighted sentence.
- Pull quote: a markdown blockquote (mm.css gold callout) for the key finding.
- Highlighted link: a plain link to the related site asset (check, download, category page).
- Short paragraphs, bullets, H2 and H3.
- One visual per post: an HTML snippet built from existing mm.css classes only, or an image Randy makes or approves.
- Grades stay in the frontmatter references (shown in the build's reference list), never in the prose.
- Route (Randy, 2026-11-08): every post goes through his mm-blog-publish skill and ends in the Sveltia CMS with `draft: true`, where he edits and switches Draft off. mm-humanizer-voice is a required step before hand-off. Updated skill file given to Randy to upload (adds the humanizer step, house style and Sveltia hand-off).
- The four Joint Health posts reach Sveltia when Randy merges PR #12 (drafts only; nothing public changes).

## Task table

| ID | Agent | Wave | Depends on | Branch | Status | Open items |
|---|---|---|---|---|---|---|
| G0 | Orchestrator with Randy | 0 | none | `feature/load-course-setup` | done (2026-11-01) | |
| A1 | Evidence | 1 | G0 | `load-course/A1-evidence` | done 2026-11-02, third follow-up (report checked, writes in scope) | 27 rows: 21 verified, 2 mismatch (C02 kept as labelled guidance; C09 cut), 2 needs-review (C19 held, C24), 1 not-found (C17, kept as Randy's labelled guidance), 1 retired (C20). C23 now Promising. C27 metabolic health added, Promising, association only; diabetes left out (evidence conflicts). Do not cite until build confirms: 17107655, 26564575, 29934429, 30584921, 34916210. Open with Randy: accept C27 wording. |
| A2 | Safety and clinical copy | 1 | G0 | `load-course/A2-safety` | done 2026-11-08 (3b853f2; writes in scope) | All safety copy approved by Randy as clinical reviewer, including activity-goals.md (2026-11-08). Disclaimer exemption recorded in scoring-direction.md. Open: Lesson 3 video script timing (F23), before filming. |
| A3 | Assessment tool | 1 | G0 | `load-course/A3-tool` | done 2026-11-08 (ca8531f): activity-goal lines added per Randy's sign-off, shown after the next step and in print; reframe heading matches A6. Preview green. Writes in scope. | Merge with A6 (course link). |
| A7 | Email copy | 1 | G0 | `load-course/A7-email` | phase A refresh dispatched 2026-11-08 (swap placeholders for final A1/A2 wording; add GLP-1 newsletter intro) | No Kit use until G5. |
| A10 | Legal | 1 | G0 | `load-course/A10-legal` | done 2026-11-01 (report checked: required checks present, writes limited to 4 legal drafts) | 45 to-confirm items in `docs/load-course/legal/review-notes.md` (on branch); privacy page is still a placeholder and must be approved and live before any Kit capture (G2), not only before payment; payment must not open before counsel reviews terms and refunds; `[A2-red-flag-screen]` placeholder; existing `site/legal/*` pages use a literal hex colour (fix when approved text is applied) |
| A4 | Downloads | 2 | G1 (A1, A2) | `load-course/A4-downloads` | QA fixes done 2026-11-02 (page disclaimer added, Kajabi string removed; checks re-run; writes in scope) | kit_form_id empty pending Randy's Kit form. Decisions: tracker access open; US Letter only. Awaiting A9 re-check. |
| A5 | Blog | 2 | G1 (A1, A2) | `load-course/A5-blog` | restructured 2026-11-02 to house style (b08cf61; report checked; writes in scope) | Refs per post: rest 12 to 5, 5/10 10 to 6, modality 4, runner 2. 1 to 2 pull quotes each; one mm.css card visual each (no style attributes); ~750 to 930 words; humanizer run. Image briefs in docs/load-course/blog/image-briefs.md (optional). Dropped claims: C03, C10, C26 and others (see report). All draft: true. PR #12 preview rebuilding. |
| A6 | Sales page and category hub | 2 | G1 (A1), A3 merged | `load-course/A6-sales` | done 2026-11-02 incl. sitemap (4 entries outside markers) and /tools/, /courses/ cards (writes in widened scope) | Merge A3 with A6. Shared mm.css: card text 14.5px and footnote 13px (below 16px), header targets, "Promising" chip contrast: site-wide cleanup, outside this workstream. Old /courses/ and /tools/ copy says "clears clinical review" (pre-existing). |
| A9 | QA and verification | 3 | all wave 2 branches | `load-course/A9-qa` | done 2026-11-02, pass 1 re-check (`docs/load-course/qa/pass1-recheck-2026-11-02.md`) | All 4 fails fixed; no fail open. Pending (not fails): sitemap and hub cards (Randy), kit_form_id (Randy), activity-goal lines (Randy), Netlify previews and font loading need a human check, A3 reframe heading to match A6 ("A joint is living tissue, not a tire") in A3's next pass. Pre-existing items kept for a separate cleanup. |
| A1-glp1 | Evidence for GLP-1 preview | post-launch | Randy's request 2026-11-02 | `load-course/A1-glp1` | done 2026-11-02 (Randy's decisions recorded; writes in scope) | C31 dropped (status "dropped" = never used in copy, like "retired"). C37 Porto cohort blog draft only, both directions. Scope approved. GLP-1 download, newsletter intro and blog draft follow after G2. |
| A4-glp1 | GLP-1 lead-magnet download | post-launch | A1-glp1 | `load-course/A4-glp1` | dispatched 2026-11-08 | Own Kit form needed (`dl-glp1-joint`). |
| A5-glp1 | GLP-1 blog draft (house style, via mm-blog-publish, humanized) | post-launch | A1-glp1 | `load-course/A5-glp1-blog` | dispatched 2026-11-08 | draft: true; lands in Sveltia after Randy merges. |
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
- C20 (Randy, 2026-11-02): retired. The tablet comparison is replaced by the framing line "Exercise is medicine for the joint", resting on C05 (Established, OARSI core treatment), plus "Metabolic health is part of joint health" as new claim C27, to be sourced and graded by A1 before use.
- C23 ("pain during exercise does not by itself mean damage"): graded Unproven-Bridge but status needs-review; A1 asked to source it.

## Decisions, Randy 2026-11-02 (afternoon)

- C27 metabolic health wording accepted (Promising, association only; no diabetes).
- Post-surgery note: "has given you the go-ahead" replaces "has cleared you".
- Results screen keeps the raw 3.5% and 10.2% figures as an association (not a score).
- Activity goals: A2 drafts one or two lines each for pickleball, tennis, golf, hiking and everyday life, for Randy's sign-off; the question stays.
- Randy: "move forward with build". Recorded as Gate G1 passed for the evidence register (A1) and the signed-off safety copy (A2). The activity-goal lines are a separate sign-off and affect only the free check (A3).

## GLP-1 and joint health special preview (Randy, 2026-11-02)

- Source: Randy's uploaded report "The Impact of GLP-1 Receptor Agonists on Joint Health" (no PMIDs; overstated language; medication instructions; surgery-timing guidance may be outdated). Copied into the repo by A1 for checking.
- Form: free lead-magnet download (email sign-up, own Kit form) plus a newsletter intro email. A blog post drafted later, kept on hand.
- Audience: adults 50 and over on or considering a GLP-1.
- Timing: right after core launch. Evidence checking starts now; build and QA after G2.
- Rules: medicines and injections are prescribed by a medical doctor, so medication timing, doses and surgery holds become "talk to your doctor" points, not instructions.

## Decisions, Randy 2026-11-02 ("all as suggested")

- Tracker access open (no email). PDFs US Letter only.
- Blog: effect sizes only for C06 and C08; rankings without percentages; cite Thomee 1997 and Silbernagel 2007 as origin of the 5/10 pain guide (Unproven-Bridge); title "pain guide"; runner post keeps its limits section.
- Joint Health page keeps the GLP-1 paragraph (C13).
- A6 may add the new pages to site/sitemap.xml (outside the build markers) and cards to site/tools/index.html and site/courses/index.html.
- GLP-1 preview: drop C31 (STEP 9 injections and painkillers); leave the Porto 2025 cohort out of the download (blog draft may explain it); scope in glp1/notes.md approved (no dosing, no medicine advice, no "heals cartilage", no causation from cohort data, no protein number, no product, regulatory or cost figures).
- Activity-goal lines: still to be confirmed explicitly (clinical sign-off).

## Gates

| Gate | Status |
|---|---|
| G0 | passed 2026-11-01 (Randy) |
| G1 | passed 2026-11-02 (Randy: "move forward with build"); activity-goal lines for A3 still need his sign-off |
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

## Draft pull requests (deploy previews only; Randy merges)

| PR | Branch | Purpose |
|---|---|---|
| #10 | `load-course/A3-tool` | Free joint-load check |
| #11 | `load-course/A4-downloads` | Loading guide and pain tracker |
| #12 | `load-course/A5-blog` | Four blog drafts |
| #13 | `load-course/A6-sales` | Sales page, pillar page, P1-C1 page, sitemap, hub cards |

Netlify previews (main site `dynamic-duckanoo-9f7287`): #10 https://deploy-preview-10--dynamic-duckanoo-9f7287.netlify.app ready; #11 https://deploy-preview-11--dynamic-duckanoo-9f7287.netlify.app ready; #12 https://deploy-preview-12--dynamic-duckanoo-9f7287.netlify.app ready (blog build passed with live PubMed); #13 https://deploy-preview-13--dynamic-duckanoo-9f7287.netlify.app ready. All four main-site previews built green. The `mm-matrixapp` previews cancel themselves (no app changes), which is expected.

Opened 2026-11-02 at Randy's request, as drafts against `main`, to get Netlify deploy previews. The orchestrator watches them for build failures and review comments. Merging stays with Randy.

## Wave updates sent to Randy

| Date | Summary |
|---|---|
| 2026-11-01 | Setup read-through done; G0 question asked. |
| 2026-11-08 | Randy: working on counsel approval, preview review and Kit form; proceed. Dispatched A4-glp1 (download), A5-glp1 (blog draft), A7 refresh plus GLP-1 intro email. |
| 2026-11-08 | Randy approved the activity-goal lines (clinical sign-off). A3 adding them to the free check (PR #10). Randy confirmed Kajabi is fully retired; muscle-meta.com is the only site. |
| 2026-11-08 | Orchestrator ran mm-humanizer-voice on the four PR #12 posts at Randy's request (11a11af): prose only, 3 posts edited, runner post needed no change. Build passes. |
| 2026-11-08 | Blog route set: skill, then Sveltia, humanizer required. Updated mm-blog-publish skill handed to Randy. |
| 2026-11-02 | Randy set the blog house style; A5 restructuring the four posts. |
| 2026-11-02 | Draft PRs #10–#13 opened for Netlify previews; orchestrator watching. |
| 2026-11-02 | Randy: all as suggested (8 free-asset and 3 GLP-1 decisions). A5, A6, A1-glp1 follow-ups dispatched. |
| 2026-11-02 | A1 GLP-1 evidence check reported: core claims verified, much of the report cut; 3 decisions for Randy. |
| 2026-11-02 | A9 re-check clean. G2 waits on Randy: 9 decisions, Netlify previews, privacy page approval, Kit forms. |
| 2026-11-02 | A9 pass 1: 4 small fails, sent back to A3, A4, A6. Re-check after fixes. |
| 2026-11-02 | Wave 2 reported: A4, A5 need small decisions; A6 sent back for humanizer pass. GLP-1 preview scoped; A1 checking its evidence. |
| 2026-11-02 | G1 passed. Wave 2 (A4, A5, A6) dispatched, branched from `load-course/A1-evidence` so the build has the verified PMID cache. A2 final pass dispatched (C27, go-ahead wording, activity lines). |
| 2026-11-02 | Randy replaced C20 with "Exercise is medicine for the joint" (C05) and "Metabolic health is part of joint health" (new C27). A1 sourcing C27 and C23; A3 final-copy pass dispatched. |
| 2026-11-02 | C18 kept, framed as joint metabolic health. A2 tagging pass dispatched. C20 grade still open. |
| 2026-11-02 | Randy signed off the red-flag screen, the half rule and A3's three questions. A2 follow-up pass dispatched; A3 pass follows A2. |
| 2026-11-02 | Randy answered A1's 7 evidence decisions (see table). Red-flag review (A2) and A3's 3 questions still open. |
| 2026-11-01 | Wave 1 reported: A3, A7, A10 done; A1, A2 need decisions (evidence and red-flag review). G1 pending. |
| 2026-11-01 | Clinical reviewer named: Randy (Randall) Bauer, PT. |
| 2026-11-01 | G0 passed: D1, D3, D6, D7, D8 confirmed as defaults. Open: clinical reviewer name (needed for G1); audience age 45–75 (course) vs 50+ (PLAN). |
