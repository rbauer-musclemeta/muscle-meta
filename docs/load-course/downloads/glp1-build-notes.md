# GLP-1 download: build notes (A4-glp1, 2026-11-08)

Build notes for the "Joint health on a GLP-1" lead magnet. Not published;
only `site/` is. Randy asked for it on 2026-11-02 and said to go ahead on
2026-11-08.

| Item | Path |
|---|---|
| Entry (the build reads it) | `content/downloads/joint-health-on-a-glp1.md` (access: email) |
| PDF people get | `site/downloads/files/joint-health-on-a-glp1.pdf` (US Letter, 7 pages) |
| PDF source | `docs/load-course/downloads/glp1-joint-health-on-a-glp1.source.md` |

## Scope followed

Randy's approved scope in `../evidence/glp1/notes.md` and the STATUS.md
decisions of 2026-11-02:

- No doses, no advice to start, stop, change or choose a medicine, no
  comparison of drugs or drug classes, no brand names. The trial medicine is
  named once by its generic name (semaglutide) so the trial is described
  correctly; no other medicine is named in the copy.
- No trial names, regulatory, approval, pipeline or cost figures.
- No "heals", "rebuilds" or "slows arthritis". The cartilage point is stated
  as "not measured in people" (C33) and the mouse study as lab research
  only (C47, Unproven-Bridge).
- No cohort causation. The Porto 2025 cohort (C37) is left out. C31 is
  dropped and not used. C41 (Felson) was allowed but left out for length.
- No protein number. The reader is sent to a doctor or registered
  dietitian, with the kidney note (C36).
- "Medicines are prescribed by a medical doctor" appears in the opening box
  and in the doctor section.
- The surgery line follows the 2024 multi-society guidance: tell your
  surgeon and anesthesia team; no hold period (C46).
- The gout line is advice only. C44 is `not-found` in the register, so no
  claim, grade or source is printed with it.

## Copy sources

- A2, signed off by Randy: `red-flag-screen.md` short-form box (word for
  word, front of the PDF), `pain-rule-wording.md` short version (word for
  word, in the pain guide box), `disclaimer.md` download version (last page
  of the PDF) and page version (landing page body).
- `post-surgery-caveat.md` is not used: the guide gives no post-surgery
  exercises. The red-flag box and the surgery line cover surgery.
- A1 register safe wording for every graded line. Claim IDs are in HTML
  comments in the source, never printed. Readers see grade labels only.

## Claims used

| Claim | Grade | Status | Where | Cited |
|---|---|---|---|---|
| C28, C29, C30, C58 | Established | verified | Trial results list | Bliddal 2024 (39476339) |
| C33 | Established | verified | "What this trial can't tell us" | Bliddal 2024 |
| C47 | Unproven-Bridge | verified | Same box, lab research only | Qin 2026 (41666927) |
| C39 | Promising | verified | "Why weight matters to a knee" | Messier 2005 (15986358) |
| C42 | Established | verified | Same section | Christensen 2007 (17204567) |
| C34 | Established | verified | "Protect your muscle" | Batsis 2026 (41996180), Eisa 2026 (41877354), Jobanputra 2026 (42319968) |
| C35 | Promising | verified | Strength training | Villareal 2017 (28514618), Eisa 2026 |
| C13 | Promising | verified | Bridge sentence (not tested in GLP-1 users) | sources as C35 |
| C36 | Promising | verified | Protein | Bauer 2013 (23867520), Kim 2016 (26883880) |
| C05 | Established | verified | "Exercise is medicine for the joint" | Bannuru 2019 (31278997) |
| C46 | Established | verified | Surgery line | Kindel 2024 (39482213) |
| C02 | Unproven-Bridge | mismatch, kept by Randy as labelled clinical guidance (2026-11-02) | Pain guide box | none printed (as in A4) |
| C44 | not graded in copy | not-found | Gout line, advice only | none |

Every printed PMID is in `content/pmid-cache.json`. None of the
do-not-cite PMIDs (39370500, 39480373, 26564575, 17107655, 29934429,
30584921, 34916210) is used. Citation volume, issue and pages were read
from PubMed on 2026-11-08.

## Lines that need Randy's clinical sign-off

1. "Randy's starting point: strength training 2 to 3 times a week, working
   the legs, hips and upper body, and building up gradually. Use the
   acceptable pain guide later in this guide to judge the dose." with
   "This is Randy Bauer, PT's clinical guidance, not a research-tested rule
   for people taking a GLP-1. If you're new to strength training, ask your
   doctor or a physical therapist how to start." (no register row; printed
   with a "Clinical guidance" label, not a grade)
2. "This is the guide Randy uses with his patients." (lead-in added above
   A2's approved short version of the acceptable pain guide)
3. "Gout in the past. Tell your doctor about any history of gout before
   starting a GLP-1 medicine, so they can plan with you."
4. "A planned surgery or procedure. If you take a GLP-1 medicine and are
   planning surgery, including a joint replacement, tell your surgeon and
   anesthesia team well ahead of time. They will decide with you whether to
   change your dose or your eating before the operation."
5. "Any change to a medicine. Starting, stopping or changing a medicine,
   including a GLP-1, is a decision for you and the doctor who prescribes it."

## Frontmatter notes

- `pillar: exercise-mobility`, `categories: [P1-C1, P2-C7]`. The reader
  problem is knee and hip arthritis (P1-C1 Joint Health); the weight and
  body-composition content sits in P2-C7 Metabolic Flexibility. Both keys
  are canonical. Randy may prefer `nutrition-metabolism` as the pillar.
- `kit_form_id` is `""` with a `TODO-KIT-FORM-ID` comment: the build accepts
  only a number, so empty gives the expected warning. Randy creates this
  download's own Kit form and pastes its number.
- `kit_tag: dl-glp1-joint`.

## mm-humanizer-voice run (2026-11-08)

Run on all reader copy in the source (A2 blocks and the disclaimer left
word for word). Changes: one staged run-up in the opening box rewritten
("What it will do is..." to "It covers..."); bold labels removed from the
"What this trial can't tell us" list; a one-line closer merged into the
sentence before it ("Muscle gets you out of a chair ... so it is worth
protecting"). No claim, number or source changed. The same wording is used
in the entry body. Bold labels kept on the results and doctor lists, which
readers scan in print.

## How the PDF is made

Same method as `build-notes.md` on `load-course/A4-downloads` (fonts from
`@fontsource/outfit@5.0.13` and `@fontsource/cormorant-garamond@5.0.13`,
`marked` from the repo, Playwright Chromium). Use that `render-pdf.mjs`
unchanged except for three CSS rules added before `.byline{`:

```css
.label-guidance{display:inline-block;font-size:9pt;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:1pt 6pt;border-radius:99pt;vertical-align:1pt;white-space:nowrap;background:var(--surface-tint);color:var(--ink);border:1pt solid var(--border)}
.results-list li{margin-bottom:6pt}
section .box{margin:10pt 0}
```

Run:
`node render-pdf.mjs <repo> <fontDir> glp1-joint-health-on-a-glp1 out/glp1.pdf letter`
and copy the result to `site/downloads/files/joint-health-on-a-glp1.pdf`.

Colours come only from the `:root` tokens in `site/assets/mm.css`. Body text
is 12.5pt. Fonts embedded: Outfit 400 and 600, Cormorant Garamond 700
(checked with `pdffonts`).

## Checks run (2026-11-08)

- Letter render: 7 pages, no overflowing elements, every page inspected as
  an image, no clipped text. A4 render of the same source: 7 pages, no
  overflow (Letter is the shipped file, per Randy).
- Disclaimer is the last block of the PDF, followed only by the byline.
- No hex value, emoji, discontinued-platform name, gate wording, "cleared",
  brand name, dose, protein number or diagnosis wording in the entry, the
  source or the PDF text. "you have" appears only inside A2's approved page
  disclaimer ("particularly if you have a heart condition").
- Every claim ID in the source resolves to a register row; graded lines all
  use `verified` rows at their register grades (C02 and C44 handled as
  above).
- `node scripts/build-downloads.mjs`: passes, one warning (no
  `kit_form_id`). `PMID_OFFLINE=1 npm run build`: passes; all download
  PMIDs come from the cache.
- Generated page at 390px (served locally): no horizontal scroll, no body
  text under 16px, button and input 48px tall.
