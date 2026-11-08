# A5 GLP-1 blog draft: build notes (2026-11-08)

Post: `content/blog/glp1-medicines-and-your-joints.md`, title "GLP-1 medicines
and your joints: what we know so far". `draft: true`; Randy edits it in Sveltia
and switches Draft off himself. Pillar `exercise-mobility`, categories P1-C1
and P2-C7. Branch `load-course/A5-glp1-blog` from `load-course/A1-glp1`.

Audience: adults 50 and over with knee or hip arthritis who take, or are
considering, a GLP-1 medicine. Built with mm-blog-publish (schema and rules)
and the house style of the four Joint Health drafts.

## References (6) and claims

Grades from `evidence/claims-register.csv`; they appear only in frontmatter.

| # | PMID | Source | Claims | Grade |
|---|---|---|---|---|
| 1 | 39476339 | Bliddal 2024 (knee trial) | C28, C29, C30, C33, C58 | Established |
| 2 | 15986358 | Messier 2005 | C39 | Promising |
| 3 | 17204567 | Christensen 2007 | C42 | Established |
| 4 | 41877354 | Eisa 2026 | C34, C35 (with C13's "likely but not yet proven") | Established |
| 5 | 39811151 | Porto 2025 | C37, both directions, association only | Promising |
| 6 | 39482213 | Kindel 2024 (cached Surg Obes Relat Dis version) | C46 | Established |

All six PMIDs are in `content/pmid-cache.json` and were re-read in PubMed
(`get_article_metadata`) on 2026-11-08 for citation details. Advice-only lines
with no citation: C36 (protein: ask your doctor or a registered dietitian; no
number) and C44 (gout: tell your doctor before starting).

Not used: C31 (dropped), C32, C38, C40, C43, C45, C47 to C57. No brand names,
no dose, no drug-class comparison, no regulatory, pipeline or cost figures, no
"heals cartilage", no protein number. Semaglutide is named only as the drug
tested in the knee trial.

Format: 2 pull quotes (C28/C29; C34). Visual: two `mm-asset pillar-1` cards
for C37 ("Fewer replacements" in people who already had arthritis; "More new
arthritis" in people without), followed by "How to read a study like this"
(links not cause, one year, findings pull both ways). Full red-flag list and
the A2 page disclaimer in `mm-article-disclaimer`. About 1,000 prose words,
8 H2s, 2 H3s, 3 FAQ answers.

## Checks

- `CONTEXT=deploy-preview PMID_OFFLINE=1 npm run build`: passed; the draft was
  written with banner and noindex, and its PMIDs all matched the cache.
  `CONTEXT=production`: "skip draft". Generated output discarded.
- 390px local render (headless Chrome): cards stack, pull quotes and the
  disclaimer box fit, no horizontal scroll.
- No gating words, emoji, hex, Kajabi, "cleared", relative figures or grade
  words in the prose. Summary 154 characters.
- mm-humanizer-voice: cut a run-up ("The honest answer has two parts"), a
  rhetorical "So the natural question is", an unsourced FAQ sentence, and
  an uncited lab-research line (C47/C48), replaced by the trial's own limit
  (it did not measure cartilage). Em dashes only in the verbatim disclaimer.

## Links not yet live

`/downloads/joint-health-on-a-glp1/` (being built) and
`/learn/exercise-mobility/joint-health/` (A6) do not exist on this branch.
mm-blog-publish says never link to a missing page, so the draft must not go
live before both exist. `/tools/joint-load-check/` comes from A3.
