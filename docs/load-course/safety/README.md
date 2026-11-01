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
| `copy-fixes.md` | A4, A5, A6, A7, A8 | Each source sentence that must change, with its replacement |

## Status of this wording

- **Draft. Not approved.** Only the second clinical reviewer named by Randy
  (decision D6) can approve the red-flag questions, the clinician messages and
  the clinical claims in these files. That reviewer has not yet been named.
  Nothing here ships before that sign-off (Gate G1).
- **Claims are placeholders.** The claims register from A1 had not merged when
  this was written. Every clinical claim carries `[CLAIM-Cnn]`, keyed to the
  seed IDs C01 to C13 in `docs/load-course/agents/A1-evidence.md`. Claims that
  are not in the seed list carry `[CLAIM-NEW-n]`; the list of these is at the
  end of `copy-fixes.md` so A1 can give each one a register ID. When the
  register merges, a placeholder is replaced by its grade, or the sentence is
  cut if the claim did not survive.
- **No PMIDs.** None are cited here. Citations come from the register only.
- **Placeholders must not reach a live page.** A placeholder in square brackets
  is a build note, not reader copy. Remove it when the claim is resolved.

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
