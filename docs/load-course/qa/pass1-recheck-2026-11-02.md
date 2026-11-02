# QA pass 1 re-check (A9), 2026-11-02

This re-check covers the four fails from `pass1-2026-11-02.md` after A3, A4 and A6 pushed fixes. Every pass 1 check was run again on the new heads, including the link crawl and the 390px check. This is a report only: no branch under test was changed.

## Heads under test

| Branch | Pass 1 | Re-check | What changed since pass 1 |
|---|---|---|---|
| `load-course/A3-tool` | `aeb23dd` | `2f30de3` | "has cleared you" became "has given you the go-ahead". A "See the course" button now links to `/courses/load-course/`, replacing the TODO-A6 comment. |
| `load-course/A4-downloads` | `0da2267` | `d794557` | Both download entries now end with a `## Medical disclaimer` section holding the page version. The word "Kajabi" was removed from `build-notes.md`. |
| `load-course/A5-blog` | `d622a0b` | `d622a0b` | No change. |
| `load-course/A6-sales` | `566408e` | `ab006f8` | The persona cards were reworded and no longer say "You have". The lede now reads "you will leave with a plan". The reframe heading changed from "Your joint is…" to "A joint is living tissue, not a tire". |
| `load-course/A1-evidence` | `dce52ce` | `dce52ce` | Base for A4, A5 and A6. Still an ancestor of A4 and A6. |

`git merge-tree` shows all four branches still merge cleanly onto A1-evidence. The local integration, which was never pushed, was rebuilt from these heads.

## Environment limits (same as pass 1, not counted against any agent)

- Netlify previews cannot be reached from here. Links and the 390px check ran on a local build (`CONTEXT=deploy-preview PMID_OFFLINE=1`), served on 127.0.0.1 and checked with Playwright/Chromium at 390 x 844. Each branch preview still needs a person to look at it before merge.
- PubMed is blocked. The online build on every branch stops first on the existing post `muscle-power-and-aging…` (PMID 41094174 and 6 more not cached). The offline build passes.
- Google Fonts is blocked, so font rendering still needs checking on the preview.

## Orchestrator exemption

The verbatim A2 page disclaimer contains "particularly if you have a heart condition". It is exempt from the "you have" check everywhere. That phrase appears once in each of these 10 files and is recorded, not failed: the A3 tool, both A4 entries, the 4 A5 posts, and the 3 new A6 pages.

## Results

| # | Check | Branch | Result | Evidence |
|---|---|---|---|---|
| 1 | Build | A3, A4, A5, A6 | pass (env) | Online: each branch stops with `[blog] BUILD STOPPED: 7 problem(s)` on the existing `muscle-power-and-aging` post (PubMed cannot be reached). Offline: exit 0 on all four. A4 writes both download pages. A5 writes 4 drafts. |
| 1 | Build | integration | pass (env) | Wrote 6 posts and 3 downloads. One warning: `post-arthroplasty-loading-guide.md: no kit_form_id yet` (pending). |
| 2 | Tokens | all | pass | No hex values, `rgb(` or `hsl(` in any changed file, the PDF text or the rendered download pages. The A4 disclaimer `h2` gets its inline style from the shared template, and that style uses only `var()`. The one inline colour, the `<sup style="color:var(--teal)">` on `/learn/`, was already there before this work. |
| 3 | Emoji | all | pass | 0 matches. |
| 4 | Kajabi | all | pass | 0 matches in changed files. A4's build notes now say "discontinued-platform name". **Pass 1 fail closed.** |
| 5 | Gating words | all | pass | 0 matches. |
| 6 | Composite, risk score, tier | all | pass | 0 matches in visible text. `--tier-*` appears only as CSS token names. On the results screen the only percentages are 3.5% and 10.2%. |
| 7 | PMIDs | A4, A5 (and A6, A3) | pass | All cited PMIDs are in `content/pmid-cache.json`, and the lists match pass 1. None of 17107655, 26564575, 29934429, 30584921 or 34916210 is cited. 26564575 appears only in the A4 source comment that says it was left out. All five appear in `docs/load-course/blog/build-notes.md:32` as the do-not-cite list. These are internal notes, not citations. |
| 8 | Links | integration | pass | Same 29 internal URLs as pass 1, all 200, no 404. The new A3 "See the course" link to `/courses/load-course/` resolves. |
| 9 | Mobile 390px | all 11 pages | pass | `scrollWidth` is 390 on every page, with nothing overflowing and nothing clipped. The 3 new A6 pages have no target under 44px. On the other pages, every target under 44px comes from shared templates and was there before this work (see pass 1 notes). On the A3 results screen, the "Browse the free guides" (194x44) and "See the course" (142x44) buttons fit within 390. |
| 10 | Sentence case | all | pass (note kept) | No heading, button or label is in title case. One note stays open: the A3 next step names the "Post-Arthroplasty Loading Guide" in body text, using the wording from A2's `scoring-direction.md`. |
| 11 | Pillar names | all | pass | Only "Exercise & Mobility" and `exercise-mobility` appear. Category keys are canonical. |
| 12 | Disclaimer | A4 landing pages | pass | Both `/downloads/acceptable-pain-tracker/` and `/downloads/post-arthroplasty-loading-guide/` now render a "Medical disclaimer" section. Its text matches A2's `disclaimer.md` page version word for word, and the footer line follows it. **Pass 1 fail closed.** |
| 12 | Disclaimer | A3, A5, A6, PDFs | pass | The page version is on the tool (start, results and stop screens), on the 4 posts and on the 3 A6 pages. Both PDFs end with the download version. |
| 13 | Secrets | all | pass | 0 matches. |

### Extra checks

| Check | Branch | Result | Evidence |
|---|---|---|---|
| No "60%", "66%" or "one-third" | all | pass | 0 matches. |
| No "cleared" in reader copy | A3 | pass | Line 843 now reads "has given you the go-ahead for them". A Playwright flow (replacement scheduled) reaches the results screen and the forbidden-word scan finds no "cleared". **Pass 1 fail closed.** |
| No "cleared" in reader copy | A4, A5, A6 | pass | The word appears only in A4's internal notes, which record the replacement. |
| No C09, C19 or C20 claims | all | pass | None appear in reader copy. |
| "You have" | A6 | pass | Removed from the persona cards ("Living with knee or hip osteoarthritis", "After a knee replacement", "If a clinician has told you…"). The only remaining match is the exempt disclaimer. **Pass 1 fail closed.** |
| "You have" | A3, A4, A5 | pass | The only matches are the exempt disclaimer. On the A3 results screen, the one match is "particularly if you have a heart condition". |
| "this confirms", "damaged" | all | pass | No "this confirms". "Damaged" appears only in the negated C23 sentence. |
| Red-flag screen | A3 | pass | Each of the 10 questions was answered yes and not sure in turn (20 runs). Every run stopped the check and showed one message at the right level. With several flags, only "now" shows. With no answers, an error shows. |
| Answers not stored or sent | A3 | pass | Over 22 runs: 0 storage writes (localStorage, cookies, IndexedDB) and 0 network requests during the check. |
| Sales page | A6 | pass | The disabled "Opens soon" button is unchanged. There is no payment element and no `offers` in the schema. |

## Fails

None open. All four pass 1 fails are closed:

1. A3 "has cleared you": fixed in `2f30de3`.
2. A4 landing-page disclaimer: fixed in `d794557`.
3. A4 "Kajabi" in build notes: fixed in `d794557`.
4. A6 "You have" persona lines: fixed in `ab006f8`.

## Still open, not failed

- **Pending sign-offs:** sitemap entries and hub cards for `/tools/` and `/courses/` are awaiting Randy. `kit_form_id` is still empty on both downloads, because Randy creates the Kit forms. The activity-goal lines are pending sign-off.
- **Merge order:** A6 links to the 4 A5 posts, which are still drafts and will 404 on production until they are published. A6 and A5 link to the A3 tool, so their per-branch previews 404 on `/tools/joint-load-check/` unless A3 merges first. A3 now links to `/courses/load-course/`, so A3's own preview 404s on that link until A6 merges.
- **A2 wording conflict:** A3's reframe step still uses the heading "Your joint is living tissue, not a tire". That wording is approved in A2's `copy-fixes.md` F47, and the step is not the results screen. A6 has moved to "A joint is…". A2 should decide which wording stays so the two match.
- **Previews:** a person still has to check every branch preview.
- **Existing issues, carried from pass 1:** `muscle-power-and-aging` is missing from the sitemap, and its 7 PMIDs are not cached. The 32px `.mm-navtoggle` and the small template links are on every page. `site/courses/oxygen-engine/index.html:64` has a Kajabi comment.
