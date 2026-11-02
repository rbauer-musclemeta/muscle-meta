# A5 blog cluster: build notes

Four Joint Health posts, all `draft: true`, `pillar: exercise-mobility`,
`categories: [P1-C1]`. Written 2026-11-02 on `load-course/A5-blog` (from
`load-course/A1-evidence`). Randy switches Draft off when each is ready.

| File | Title | Based on |
|---|---|---|
| `content/blog/why-rest-is-the-wrong-prescription-for-a-sore-joint.md` | Why rest is the wrong prescription for a sore joint | Lesson 1 |
| `content/blog/the-5-out-of-10-rule-and-how-to-read-a-flare.md` | The 5 out of 10 pain guide, and how to read a flare | Lesson 2 |
| `content/blog/choosing-an-exercise-for-a-painful-knee-or-hip.md` | Choosing an exercise for a painful knee or hip | Lesson 3 |
| `content/blog/what-the-runner-data-does-and-does-not-show.md` | What the runner data does and does not show | Framework section 4 |

The Lesson 2 title says "pain guide", not "rule": `safety/pain-rule-wording.md`
says not to call it a rule on its own. The slug keeps the spec's wording.

## Claims used, by post

Grades are the register's (`evidence/claims-register.csv`). Wording comes from
the register's safe wording and A2's `copy-fixes.md`, `pain-rule-wording.md`,
`post-surgery-caveat.md` and `disclaimer.md`.

| Post | Claims | PMIDs cited (all in `content/pmid-cache.json`) |
|---|---|---|
| Rest | C01/C21, C15, C18, C03, C14, C26, C05, C06, C10 | 28504066, 15334465, 12209511, 14618919, 28888900, 34948394, 30320965, 16258919, 22392533, 31278997, 25569281, 15275772 |
| 5 out of 10 | C23, C05, C06, C10, C25; C02 and C17 as labelled clinical guidance, uncited | 18764949, 30320965, 25569281, 31278997, 15275772, 24841177, 29997112 |
| Modality | C05, C06, C07, C08 | 31278997, 25569281, 37346776, 39267026 |
| Runner | C01, C11, C21, C05 | 28504066, 31278997 |

Not used: C09 (cut), C19 (held), C20 (retired; replaced by the C05 framing
line "Exercise is medicine for the joint"), C27 (not needed in these four).
None of the do-not-cite PMIDs (17107655, 26564575, 29934429, 30584921,
34916210) appears. Sandal 2015 (26564575) is the only source for "the rise in
pain shrank over 8 weeks", so that sentence from `pain-rule-wording.md` is left
out of the 5 out of 10 post.

Grade note: `pain-rule-wording.md` tags C23 as Unproven-Bridge; the register
grades C23 Promising (third follow-up). The post uses the register grade.

## Build log summary (2026-11-02)

- `CONTEXT=deploy-preview npm run build`: the four new posts raised no errors.
  The build stopped only on the existing post
  `muscle-power-and-aging-why-speed-declines-faster-than-strength.md`, whose 7
  PMIDs are not cached and PubMed is unreachable from this session (proxy).
  Netlify can reach PubMed, so this should not recur there.
- `CONTEXT=deploy-preview PMID_OFFLINE=1 npm run build`: passed. All four
  drafts written (with Draft banner and noindex); every PMID in them was
  verified from the cache (first author and year matched), so offline mode
  skipped nothing in these posts.
- `CONTEXT=production`: all four logged "skip draft"; none in the sitemap or
  feed.
- Generated output (`site/blog/**`, `site/sitemap.xml`, `site/downloads/*/`)
  was discarded, not committed.

## Voice and SEO passes

- mm-humanizer-voice run on each post: removed staged run-ups ("Here is the
  reassuring part", "Here is why"), one invented clinical anecdote in the
  runner opening, "actually", an authority phrase in an FAQ answer, and a
  closer ("That is the headline"). No em dashes except inside the verbatim
  page disclaimer, which `disclaimer.md` says not to edit.
- mm-aeo-seo checks (upgrade-lock and FAQ rich-result rules not applied, per
  CLAUDE.md): question-style H2s that mirror the P1-C1 question cluster
  ("Does an ache mean damage?", "What about hips?"); 6 to 8 H2s per post;
  3 FAQ answers per post, 40 to 100 words, each naming its source, kept for
  AI extraction only; summary used as meta description (147 to 161
  characters); keywords from the Joint Health cluster; internal links to the
  free check, both downloads and the sales page; byline, BlogPosting,
  citation and FAQPage schema come from the build. Not applied: the year in
  the H1 (titles are set by the spec) and the 1,200-word floor (posts run
  about 990 to 1,300 words).
