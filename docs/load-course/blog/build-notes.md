# A5 blog cluster: build notes

Four Joint Health posts, all `draft: true`, `pillar: exercise-mobility`,
`categories: [P1-C1]`. Branch `load-course/A5-blog` (from
`load-course/A1-evidence`). Randy switches Draft off when each is ready.

| File | Title | Based on |
|---|---|---|
| `content/blog/why-rest-is-the-wrong-prescription-for-a-sore-joint.md` | Why rest is the wrong prescription for a sore joint | Lesson 1 |
| `content/blog/the-5-out-of-10-rule-and-how-to-read-a-flare.md` | The 5 out of 10 pain guide, and how to read a flare | Lesson 2 |
| `content/blog/choosing-an-exercise-for-a-painful-knee-or-hip.md` | Choosing an exercise for a painful knee or hip | Lesson 3 |
| `content/blog/what-the-runner-data-does-and-does-not-show.md` | What the runner data does and does not show | Framework section 4 |

The Lesson 2 title says "pain guide", not "rule" (`safety/pain-rule-wording.md`).
Approved by Randy 2026-11-02; the slug keeps the spec's wording.

## Restructure, 2026-11-02 (Randy's blog format)

Randy asked for clean posts: few citations, each in a pull quote or after one
highlighted sentence; short paragraphs; bullets; H2 and H3; one visual each.

| Post | References before, after | Pull quotes | Visual | Prose words (excluding disclaimer) |
|---|---|---|---|---|
| Rest | 12, 5 | 2 (C15 cartilage thinning; C06 Cochrane) | Two `mmm-card`s: "Short rest has its place" and "Long rest as the default" | about 850 |
| 5 out of 10 | 10, 6 | 2 (C23 pain and X-ray mismatch; "one harder day is information") | Three `mm-asset` cards: during activity up to about 5, ease off above 5, back to usual by next day | about 930 |
| Modality | 4, 4 | 2 (C06 Cochrane; C07 "options studied") | Four `mm-asset` cards: cycling, water, yoga, resistance, each with what it ranked highest for | about 860 |
| Runner | 2, 2 | 1 (C01 3.5% vs 10.2% vs 13.3%, cannot show cause) | Two `mm-asset` cards: 3.5% recreational runners, 10.2% non-runners | about 750 |

Visual rules followed: existing `mm.css` classes only (`mm-card-grid`,
`mm-asset pillar-1`, `.kind`, `mmm-card`, `eyebrow`, `eyebrow-gold`); no style
attributes, no hex, no script, no new CSS. `pillar-1` only (teal, the post's
own pillar), so no other pillar colour is borrowed for meaning. Card body text
is in `<div>` and `<h3>`, not `<p>`, because `.mm-asset p` is 14.5px and the
done-definition asks for 16px body text. Each grid is followed by a heading so
the heading's top margin gives the gap (the grid itself has no bottom margin).
Raw HTML blocks have no blank lines inside, so `marked` passes them through
untouched; checked in the built HTML.

The page disclaimer (A2 `disclaimer.md`, verbatim) now sits in
`<div class="mm-article-disclaimer">` rather than a blockquote, so it does not
look like a pull quote. Optional header-image briefs are in `image-briefs.md`;
`image:` stays empty in every post.

Dropped to keep the reference count down (claims removed from the text, not
left uncited): rest post C01 runner figures (kept only in its FAQ), Vanwanseele
(C15), Mauck (C18), Gilbert (C03), Roos (C14), Loeser (C26), Heuts (C10); 5 out
of 10 post Bricca (C23), Fransen C06 numbers, Heuts and Holla (C10). The sales
page link was dropped; each post links the free check and a download.

## Claims used now, by post

Grades are the register's and appear only in the frontmatter references.

| Post | Claims | PMIDs cited (all in `content/pmid-cache.json`) |
|---|---|---|
| Rest | C15, C18, C14, C05, C06 | 15334465, 28888900, 30320965, 31278997, 25569281 |
| 5 out of 10 | C23, C05, C02, C25; C17 as labelled clinical guidance, uncited | 18764949, 25569281, 31278997, 9413448, 17307888, 29997112 |
| Modality | C05, C06, C07, C08 | 31278997, 25569281, 37346776, 39267026 |
| Runner | C01, C11, C21, C05 | 28504066, 31278997 |

Not used: C09, C19, C20, C31. No do-not-cite PMID (17107655, 26564575,
29934429, 30584921, 34916210). C02 cites Thomeé 1997 and Silbernagel 2007
(accented "Thomeé", as in the cache) as the origin of pain monitoring, with
the text saying neither was in arthritis nor tested the number.

## Build log summary (2026-11-02, after the restructure)

- `CONTEXT=deploy-preview PMID_OFFLINE=1 npm run build`: passed. All four
  drafts written with Draft banner and noindex. Every PMID in them was matched
  from the cache (first author and year), so offline mode skipped nothing in
  them. Only the existing post `muscle-power-and-aging...` has unverified
  (uncached) PMIDs; PubMed is blocked from this session.
- `CONTEXT=production`: all four logged "skip draft".
- Generated output (`site/blog/**`, `site/sitemap.xml`, `site/downloads/*/`)
  discarded, not committed.
- Local 390px check: built pages served from `site/` and captured with headless
  Chrome at 390px wide. Cards stack one per row, pull quotes and the
  disclaimer box fit, no horizontal scroll. Web fonts did not load offline
  (fallback fonts), so final type is checked on the deploy preview.

## Voice and SEO passes

- mm-humanizer-voice on each rewritten post: removed "Rest is not the enemy"
  (aphorism), a duplicated "all five types helped" line, an unsourced
  generalisation in the 5 out of 10 opening ("most people... have stood"), an
  unsourced line about fear being a common reason to stop, and hedged an H3
  ("Movement may help move that fluid"). Em dashes only inside the verbatim
  disclaimer.
- mm-aeo-seo (upgrade-lock and FAQ rich-result rules not applied, per
  CLAUDE.md): question-style H2s from the P1-C1 cluster, 7 H2s per post with
  H3s in longer sections, 3 FAQ answers each (57 to 76 words) for AI
  extraction only, summary 150 to 161 characters, Joint Health keywords,
  internal links to the free check and downloads. Not applied: year in H1
  (titles set by the spec).
