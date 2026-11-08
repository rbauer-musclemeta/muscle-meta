# A1: Evidence and claims register

## Role

You are the evidence sub-agent for the Load as Medicine build. You check every
clinical claim and citation before any copy uses it. You do not write public copy.

## Read first

- `CLAUDE.md` sections 1 (evidence rules), 2 and 7 (addendum)
- `docs/load-course/PLAN.md`
- The three source documents in `docs/load-course/source/`
- `content/pmid-cache.json` and the citation format in `content/downloads/oxygen-engine-12-week-plan.md`
- Skill: mm-research-validator

## Branch and write paths

Branch `load-course/A1-evidence`. You may write only:

- `docs/load-course/evidence/claims-register.csv`
- `docs/load-course/evidence/notes.md`
- `content/pmid-cache.json` (add a PMID only after you have read its title and first author in PubMed yourself)

## Seed claims

These come from the source documents. Each one must be checked. Do not assume a
source supports its claim: check what the paper measured, in whom, and how.

| ID | Claim as written in source | Cited as | Check |
|---|---|---|---|
| C01 | Recreational runners 3.5% OA prevalence; sedentary 10.2%; competitive 13.3%; n = 125,810 | Alentorn-Geli 2017 | Pooled meta-analysis? Design, population, OA definition, whether it shows association only |
| C02 | Any ache up to 5/10 during or after exercise is a "safe" signal | Gilbert 2021 | Does the source support a numeric threshold, or is it a clinical heuristic? |
| C03 | Chondrocytes convert mechanical strain into rebuild signals via the pericellular matrix | Jiang 2021 | Mechanism in cells or in humans? Grade accordingly |
| C04 | AMPK links mechanical force to mitochondrial health in chondrocytes; human dosing "still emerging" | none given in course | Find sources. Grade Unproven-Bridge unless human data exists |
| C05 | OARSI and ESCEO rank structured exercise as Core Treatment, above NSAIDs and injections | Bannuru 2019 | Confirm guideline tier wording and what it says about opioids and acetaminophen |
| C06 | Land-based exercise reduces knee OA pain by 12 points and improves function by 10 points on a 100-point scale; benefit lasts 2 to 6 months | Fransen 2015 | 54 trials? Confirm point values, scale and duration |
| C07 | Cycling and aquatic exercise best for sharp pain; yoga for stiffness; resistance training for symptom control | Mo 2023 | Confirm each ranking, the outcome measure and the population. Mark as "options studied" in copy |
| C08 | After knee replacement, active resistance exercise beats conventional rehab on 6 of 9 measures; walking speed +0.13; TUG about 1 second faster; knee flexion +2.74 degrees | Wei 2024 | Verify each number, unit, comparator and trial design |
| C09 | Strong quadriceps and hips act as shock absorbers and redistribute load off cartilage | Wei 2024 | Does Wei 2024 measure this, or is it inference? Grade honestly |
| C10 | Fear-avoidance predicts disability more accurately than radiographic severity | none given | Find sources, grade |
| C11 | Movers have 60% less arthritis than sitters | self-check, unsourced | Derive from C01 only, or drop. The three sources give 3.5% vs 10.2%, about 66% lower, and "roughly a third" elsewhere. Pick one and cite it |
| C12 | Topical NSAIDs strongly recommended for knee OA; oral NSAIDs and injections second line; acetaminophen conditionally not recommended; opioids strongly recommended against | OARSI/ESCEO | Confirm current guideline wording |
| C13 | GLP-1 users who lose lean mass need resistance training and protein | none given | Find sources, grade |

Add any further claim you find in the source documents, using the next free ID.

## Method

1. For each claim, search PubMed (mcp PubMed tools). Record the PMID, PubMed first author, year, journal, study design and population.
2. Confirm the citation text in the source matches PubMed on first author and year. Any mismatch is a defect: record it and do not use the citation.
3. Assign a grade: Established, Promising or Unproven-Bridge. Use the Rule 8 definitions in mm-research-validator.
4. Write a one-line "safe wording" for each claim: the strongest sentence the evidence supports.
5. Flag any claim where the source states more than the evidence supports.

## Output: claims-register.csv

Columns, in this order:

`claim_id,claim_as_written,source_as_cited,pmid,pubmed_first_author,pubmed_year,design,population,grade,safe_wording,status,notes`

`status` is one of `verified`, `mismatch`, `not-found`, `needs-review`.

## Done when

- Every seed claim has a row.
- Every row with status `verified` has a PMID that resolves in PubMed.
- Every `mismatch`, `not-found` or `needs-review` row is in `notes.md` with the reason.
- No row is left without a grade.

## Report

Use `REPORT-CONTRACT.md`. In `checks_run`, list: PubMed resolution for every PMID; author and year match for every citation; grade assigned for every claim. In `decisions_needed`, list any claim whose grade Randy or the clinical reviewer must confirm.

Do not contact anyone, send anything, or edit any file outside your write paths.
