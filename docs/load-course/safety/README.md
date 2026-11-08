# Safety and clinical copy (A2)

Wording only. Other tasks paste it in; they do not rewrite it. If a sentence
here does not fit a layout, ask for a shorter version rather than editing it.

| File | Used by | What it holds |
|---|---|---|
| `red-flag-screen.md` | A3 (check), A4 (red-flag box on each download), A8 (lessons) | The stop questions, the clinician messages, the short red-flag box |
| `pain-rule-wording.md` | A3, A4 (tracker), A5, A7 (email 2), A8 | The 5 out of 10 and 24-hour guideline, with its exceptions |
| `post-surgery-caveat.md` | A4 (arthroplasty guide), A7 (guide delivery email), A8 | The box above every post-surgery exercise |
| `inflammatory-arthritis-note.md` | A3 (results), A4, A8 | The note for rheumatoid and other inflammatory arthritis |
| `disclaimer.md` | Every task | Page, download, email, lesson and footer versions |
| `scoring-direction.md` | A3, A6, A9 | What the check shows instead of a percentage |
| `activity-goals.md` | A3 (results), A8 | One short block per activity goal; approved by Randy (Randall) Bauer, PT, clinical reviewer, 2026-11-08 |
| `copy-fixes.md` | A4, A5, A6, A7, A8 | Each source sentence that must change, with its replacement |

## Status of this wording

- **Clinical reviewer.** Randy (Randall) Bauer, PT is the clinical reviewer
  (decision D6). He signed off the red-flag screen on 2026-11-02 (see its
  Approval section). Any change to safety wording goes back to him.
- **Claims are mapped to A1's register** (`docs/load-course/evidence/claims-register.csv`
  on `load-course/A1-evidence`, 26 rows, re-read 2026-11-02, including the
  "decision_2026-11-02" and "Second follow-up, 2026-11-02" sections of
  `notes.md`). Each claim is written from the register's safe wording, never
  stronger, and tagged with its ID and grade, for example "(C06,
  Established)". Building agents render the tag as the short note beside the
  claim and add the source author and year from the register.
- **Every claim has a register row.** The two earlier placeholders are now C25
  (inflammatory arthritis note) and C26 (`copy-fixes.md` F34).
- **C20 is retired** (Randy, 2026-11-02). Its two uses now carry the framing line "Exercise is medicine for the joint" (C05, Established). C27 (metabolic health and joint health, Promising) is used once, in `copy-fixes.md` F38.
- **No PMIDs.** None are cited here. Never cite PMIDs 17107655, 26564575,
  34916210 or 29934429 (register: do not cite until the build confirms). C09
  is a mismatch and is not used.

## Shared rules this wording follows

- Plain words for adults 50 and over. A technical term is explained the first
  time it appears.
- No diagnosis. "This can point to", "it is worth checking", "a clinician can
  tell you".
- No promise of outcome. "Some people find", "in the studies we looked at".
- Associations stay associations.
- Sentence case. No emoji. No colour values. No product or platform names
  other than Muscle-Meta Matrix™.
- The words for a joint that catches and will not move are written in plain
  language ("gets stuck") on purpose, so automated checks for gating words do
  not trip on clinical copy.
