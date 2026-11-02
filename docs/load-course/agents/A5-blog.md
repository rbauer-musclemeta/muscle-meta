# A5: Blog cluster

## Role

You write four blog posts for the Joint Health cluster, in the repository's
Markdown format, all as drafts. The build turns them into pages. Randy decides
when each one goes live.

## Read first

- `CLAUDE.md` sections 1, 3 (blog build), 5 and 7
- `docs/blog-workflow.md` (fields and the checks that stop a post)
- `content/blog/*.md` (two existing posts, for format and tone)
- `scripts/build-blog.mjs`
- Source: the course lessons and the clinical framework
- A1's `claims-register.csv` and A2's `safety/*.md` (both must be merged first)
- Skills: randy-brand-voice, mm-humanizer-voice, mm-aeo-seo

## Branch and write paths

Branch `load-course/A5-blog`. You may write only `content/blog/*.md` for the four files below, and `docs/load-course/blog/*.md` for build notes.

## The four posts

| Slug | Working title (sentence case) | Based on | Categories |
|---|---|---|---|
| `why-rest-is-the-wrong-prescription-for-a-sore-joint` | Why rest is the wrong prescription for a sore joint | Lesson 1 | P1-C1 |
| `the-5-out-of-10-rule-and-how-to-read-a-flare` | The 5 out of 10 rule, and how to read a flare | Lesson 2 | P1-C1 |
| `choosing-an-exercise-for-a-painful-knee-or-hip` | Choosing an exercise for a painful knee or hip | Lesson 3, after A1 grades the modality claims | P1-C1 |
| `what-the-runner-data-does-and-does-not-show` | What the runner data does and does not show | Framework section 4 | P1-C1 |

All four: `pillar: exercise-mobility`, `draft: true`, a summary of 70 to 170 characters, a description for any image, and a references block with a grade and a verified PMID for every citation. Every reference must be cited in the text and every `[n]` must have a reference.

A knee-replacement post is a candidate for the fifth slot (D5 allows four for core launch). Do not write it. Note it in `open_items` only.

## Content rules

- Open each post with a real experience or a plain question, not a statistic.
- One reframe, one mechanism in plain words, one practical next step, and the disclaimer link.
- Causal words only where the grade supports them. Otherwise "associated with".
- The modality post lists options that studies have tested. It does not prescribe.
- The runner post reports the study design and population, and says what the study cannot show.
- Link each post to the free joint-load check and to the relevant download. Use the live paths from `PLAN.md`.
- Run mm-humanizer-voice on every draft. Record the run in the report.
- No emoji. Sentence case headings. No hex values. No Kajabi.

## Done when

- `npm run build` passes for all four posts with `draft: true`. Give the build log summary.
- Every reference has a grade and a PMID the build verifies.
- No gating words ("locked", "unlock", "upgrade", "members only").
- Each post's summary is inside the 70 to 170 character limit.
- The mm-aeo-seo checks you ran are listed in the report. FAQ rich-result expectations do not apply; keep FAQ for AI extraction only.

## Report

`REPORT-CONTRACT.md`. In `checks_run`, list the build result and the humanizer run for each post. In `decisions_needed`, note whether the modality post may name specific effect sizes, which depends on A1's grades.
