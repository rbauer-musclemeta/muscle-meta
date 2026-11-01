# Claims register: notes (A1, 2026-11-01)

Companion to `claims-register.csv`. Every PMID in the register was read in
PubMed (title, first author, year, abstract) through the PubMed connector on
2026-11-01. The full text of Wei 2024 (PMC11395693) was also read. The direct
PubMed E-utilities endpoint is blocked from this session, so the build's own
live check was not run here.

## How to read the register

- `pmid` lists the PMID or PMIDs that support the **safe wording**, not
  necessarily the paper the source cited. Several PMIDs are separated by `;`,
  in the same order as `pubmed_first_author` and `pubmed_year`.
- `status`:
  - `verified`: the safe wording is supported by the listed PMIDs, and any
    citation the source gave matches PubMed and supports the claim.
  - `mismatch`: the source's citation resolves in PubMed but the paper does not
    state the claim (or the citation is swapped). Do not use the source's
    citation. A re-sourced PMID is given where one was found.
  - `needs-review`: a choice for Randy or the clinical reviewer, or part of the
    claim was not traced.
  - `not-found`: no source found.
- `grade` is the grade of the safe wording, using Rule 8: Established (human
  RCT or strong human evidence, guideline consensus), Promising (human
  observational or early or low-certainty human findings), Unproven-Bridge
  (preclinical, mechanistic or clinical guidance with no tested outcome).
- Copy may cite a claim only if its row is graded and its PMID is verified.

## Author and year check on the seven source citations

No citation failed on first author or year. All seven resolve:

| Source citation | PMID | PubMed first author, year | Supports the claim it is attached to? |
|---|---|---|---|
| Alentorn-Geli 2017 | 28504066 | Alentorn-Geli, 2017 | Yes, as an association (C01) |
| Gilbert 2021 | 34948394 | Gilbert, 2021 | **No** for the 5/10 rule (C02) and the sponge analogy (C18). Yes for the pericellular matrix claim (C03), which the source attributed to Jiang |
| Jiang 2021 | 33684550 | Jiang, 2021 | **No** for the pericellular matrix claim (C03). It is the AMPK and mitochondria review (C04) |
| Bannuru 2019 | 31278997 | Bannuru, 2019 | Yes, OARSI only (C05, C12, C22). ESCEO is a separate paper |
| Fransen 2015 | 25569281 | Fransen, 2015 | Yes, with the durability correction (C06) |
| Wei 2024 | 39267026 | Wei, 2024 | Yes for the numbers (C08). **No** for the shock-absorber claim (C09) |
| Mo 2023 | 37346776 | Mo, 2023 | Yes, as rankings in one analysis (C07) |

Bannuru 2019 matched two PMIDs on citation lookup; 31715295 is a letter reply,
not the guideline, and is not used.

## Mismatch rows

- **C02 (5/10 acceptable pain).** Gilbert 2021 is a cartilage mechanobiology
  review with no pain threshold. The pain-monitoring model traces to Thomeé
  1997 and Silbernagel 2007 (patellofemoral pain and Achilles tendinopathy, not
  OA). Neither abstract states the number 5. The number is graded as clinical
  guidance (Unproven-Bridge). "Safe" and "does not signal joint damage"
  overstate it.
- **C03 (pericellular matrix rebuild signals).** The source cited Jiang 2021;
  the matching paper is Gilbert 2021. Swap the citation. Mechanism is from
  cell and animal work, so Unproven-Bridge.
- **C09 (muscles as shock absorbers).** Wei 2024 does not measure this.
  Re-sourced to Øiestad 2021 (quadriceps weakness associated with incident knee
  OA, low-quality evidence). The load-redistribution mechanism stays
  Unproven-Bridge.
- **C18 (sponge, "brittle", mechanical pumping).** Gilbert 2021 does not
  discuss nutrient pumping or brittleness. No PMID was read that supports
  load-driven nutrient transport, so the row has no PMID. Keep the sponge only
  as a labelled analogy, drop "brittle".

## Needs-review rows

- **C11 (movers have 60% less arthritis).** 60% is arithmetically wrong (crude
  prevalence 3.5% vs 10.2% is about 66% lower), and the adjusted odds ratio for
  recreational runners was not significant (0.86, 95% CI 0.69 to 1.07). Any
  relative-reduction figure overstates the evidence. Recommendation: print the
  two raw percentages with the association caveat and no percentage
  reduction. Randy to choose.
- **C19 (protein and vitamin C as substrates for matrix repair).** Vitamin C:
  one cohort association (McAlindon 1996), called preliminary by its authors.
  Protein for cartilage repair: not found. Out of first-release scope unless
  Randy wants it.
- **C20 ("more durable and significantly safer than long-term
  medication").** Fransen 2015 says exercise effects are comparable with
  NSAIDs and smaller at 2 to 6 months. It has no head-to-head safety or
  durability comparison. Replacement wording proposed; needs sign-off.
- **C23 (pain as a protective alarm before harm).** Not traced to a PubMed
  record in this pass. Partly backed by C14 (loading exercise does not appear
  to harm cartilage). A2 bounds the wording.
- **C24 (2 to 3 sessions a week).** The frequency was not traced. Treat as
  clinical guidance until sourced.

## Not-found rows

- **C17 (tracker: cut volume by 50%).** No source. A2 decides whether it stays,
  labelled as clinical guidance.

## Overstatements found in the source documents

Each is on its row; summarised here for A2 and the copy agents.

1. "Rebuild cartilage", "biological rebuilding", "repair": no human evidence of
   regrowth (C14). Safe line: loading exercise does not appear to harm
   cartilage.
2. "Movement is protective", "running is protective", "sedentarism is a
   significant risk factor": association only (C01, C21).
3. Fransen benefit "lasts 2 to 6 months" at 12 and 10 points: at 2 to 6 months
   it is 6 and 3 points (C06).
4. Mo 2023: "most effective" should read "ranked highest in one analysis";
   knee only, not hip; aquatic exercise was not significant on WOMAC pain (C07).
5. Wei 2024: evidence certainty is low; comparator is conventional exercise,
   not "passive" rehab; "evidence-based default" overstates (C08).
6. "Within days" of immobilisation: human data show cartilage thinning over
   weeks, not days (C15).
7. "Mitochondrial dysfunction is a primary driver of OA": reviews say "may" and
   "could be considered" (C16).
8. AMPK: the source paper says "we speculate"; there are no human dosing data
   (C04).
9. "Fear-avoidance predicts disability more accurately than X-ray or MRI": one
   cross-sectional study, X-ray only; "linked with", not "predicts" (C10).
10. OARSI table: intra-articular injections are not recommended for hip OA, and
    oral NSAIDs depend on comorbidity (C12). ESCEO tiers not verified (C05).

## PMID cache

24 PMIDs added to `content/pmid-cache.json`, each read in PubMed on
2026-11-01. Three PMIDs used in the register were **not** added, because the
year PubMed returned is the online date and the journal issue year may differ,
which would make the build's author-and-year check fail on a correct citation:

- 26564575 Sandal (online 2015, issue likely 2016)
- 34916210 Øiestad (online 2021, issue likely 2022)
- 29934429 Bricca (online 2018, issue likely 2019)

When a copy agent cites one of these, let the build check it live, or confirm
the issue year in PubMed before adding it to the cache.

Cache first-author names keep PubMed's accents (Thomeé, Bruyère,
Fernández-Moreno). The build matches the first author as a substring of the
citation text, so citations must spell these names with the same accents.
