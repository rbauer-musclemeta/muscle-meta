# A6: Course sales page and category hub

## Role

You build two pages: the sales page for the course at `/courses/load-course/`,
and the Joint Health category page under the Exercise and Mobility pillar. The
sales page takes no payment yet. Stripe checkout arrives with milestone M4.

## Read first

- `CLAUDE.md` sections 1, 3, 5b and 7
- `site/courses/oxygen-engine/index.html` (the pattern for the sales page)
- `site/learn/index.html` (the existing pillar index: check its links and structure)
- `site/tools/index.html` and `site/blog/index.html` (to link correctly)
- Skills: muscle-meta-design, muscle-meta-html-templates, mm-aeo-seo
- A1's claims register and A2's safety wording (merged versions only)
- A3's merged tool URL (`/tools/joint-load-check/`)

## Branch and write paths

Branch `load-course/A6-sales`. You may write only:

- `site/courses/load-course/index.html`
- `site/learn/exercise-mobility/index.html` and `site/learn/exercise-mobility/joint-health/index.html`
- `site/learn/index.html`, only to add the link to the new pillar page

## Sales page: `/courses/load-course/`

Structure, top to bottom:

1. Title and promise in plain words, for adults 50 and over with knee or hip osteoarthritis.
2. The belief reframe, in one paragraph, with the 3.5% and 10.2% figure only if A1 has verified it and the claim is worded as an association.
3. Who the course is for. Name the three cases from the source: people managing knee or hip osteoarthritis; people after knee replacement (with the post-surgery caveat); active players who want to keep playing.
4. The three lessons, described in plain words, with the length of each video.
5. What is included: the three lessons, the interactives, the trackers and the downloads.
6. Price: **$37.00**, shown as the one-time price. The purchase button is **not active yet**. Show a disabled button labelled "Opens soon" with a line that says the course is being finished and the free check is available now. Add a link to the free check and the free guide.
7. Evidence summary: the graded claims the course rests on, each with its citation.
8. FAQ from the source framework section 8, rewritten to pass A2's copy rules. Keep the content for AI extraction; do not expect rich results.
9. The medical disclaimer.

Schema: `Course` schema with the name, description and provider, as in the Oxygen Engine page. Do not include `offers` with a live price until M4 is merged; use the price in text only.

## Category hub: `/learn/exercise-mobility/`

- Pillar name exactly: "Exercise & Mobility" (slug `exercise-mobility`). This name is canon. Do not reword it.
- Category page for P1-C1 Joint Health at `/learn/exercise-mobility/joint-health/`.
- Show the pillar's five categories as a list with links. Only P1-C1 gets a full page in this release.
- Link the four blog posts, the free check, both downloads and the sales page. Use the URLs from the content files on A5 and A4's branches.
- Real HTML in the response. No client-side rendering of text that should rank.

## Rules

- Tokens only from `site/assets/mm.css`. No hex. No inline colour values.
- No emoji. Sentence case headings and buttons.
- No gating words. Nothing is described as locked, members-only or upgrade-to-see.
- The sales page never states a payment is taken, or that a payment is available, until M4 is merged.
- Mobile first: 390px with no horizontal scroll, 44px tap targets, 16px body text.

## Done when

- Both pages render at 390px and at desktop width (give preview URLs).
- The disabled purchase button is present and no live payment element exists.
- Every internal link resolves in the preview.
- The pillar name matches the canon exactly in title, heading and schema.
- No `Kajabi` string, no hex, no emoji.

## Report

`REPORT-CONTRACT.md`. In `checks_run`, list each item under "Done when". In `open_items`, list any claim IDs still without a grade, and any link that depends on another branch not yet merged.
