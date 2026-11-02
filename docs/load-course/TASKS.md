# Task graph: Load as Medicine build

Waves run in order. Tasks inside a wave run in parallel once their dependencies are done.

| ID | Agent | Wave | Depends on | Writes (branch `load-course/<id>`) | Gate passed when |
|---|---|---|---|---|---|
| G0 | Orchestrator with Randy | 0 | none | `docs/load-course/STATUS.md` | Decisions D1, D3, D6, D7, D8 confirmed |
| A1 | Evidence | 1 | G0 | `docs/load-course/evidence/claims-register.csv`, `content/pmid-cache.json` | Part of G1 |
| A2 | Safety and clinical copy | 1 | G0 | `docs/load-course/safety/*.md` | Part of G1 |
| A3 | Assessment tool | 1 | G0 | `site/tools/joint-load-check/index.html` | Part of G2 (uses A2 copy once merged; placeholders until then) |
| A7 | Email copy | 1 | G0 | `docs/load-course/emails/*.md` (drafts only, no Kit calls) | Part of G5 |
| A10 | Legal | 1 | G0 | `docs/load-course/legal/review-notes.md`, draft edits to `site/legal/*` | Randy and counsel review before any payment |
| A4 | Downloads | 2 | G1 (A1, A2) | `content/downloads/*.md`, `site/downloads/files/*.pdf` | Part of G2 |
| A5 | Blog | 2 | G1 (A1, A2) | `content/blog/*.md` (all `draft: true`) | G3 |
| A6 | Sales page and category hub | 2 | G1 (A1), A3 merged | `site/courses/load-course/index.html`, `site/learn/exercise-mobility/*` | Part of G2 |
| A9 | QA and verification | 3 | all wave 2 branches | `docs/load-course/qa/*.md` (report only, no code changes) | G2 and G3 |
| M4 | Stripe checkout and entitlements | external | Randy's Stripe account; M4 owner | Per existing matrixapp.md design | Milestone M4 merged |
| A8 | Course in MatrixApp | 4 | M4 merged, G4 prerequisites | `supabase/migrations/*load_course*`, `supabase/tests/*load_course*`, `app/src/programs/registry.ts`, `app/src/programs/load-course/*` | G4 |
| A9b | QA on course | 4 | A8 | `docs/load-course/qa/course-*.md` | G4 |
| A7b | Sequences live in Kit | 5 | G4, Randy approves copy | Kit (via connector, only after Randy's written approval) | G5 |
| A9c | Final QA | 5 | A7b, A8, A9b | `docs/load-course/qa/final-*.md` | G5 |
| - | Merge to `main` and production deploy | 6 | G5 | none | G6, Randy approves |

## Notes

- A3 can start in wave 1 because the tool's structure does not depend on final copy. It uses placeholder text marked `TODO-A2` until A2 is merged, then A3 re-runs its checks.
- A6 needs A3's final URL for the free check. If A3 is late, A6 links to the placeholder path and the QA report flags it.
- A8 cannot start until M4 is merged. Until then, the orchestrator reports A8 as `waiting on M4` in `STATUS.md`, not `blocked`.
- A9 never edits code. It only reads branches and writes reports. Any fix goes back to the owning agent.
