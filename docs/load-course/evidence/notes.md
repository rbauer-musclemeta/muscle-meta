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
- **C09 (muscles as shock absorbers).** Wei 2024 does not measure this.
  Re-sourced to Øiestad 2021 (quadriceps weakness associated with incident knee
  OA, low-quality evidence). The load-redistribution mechanism stays
  Unproven-Bridge.

C03 was a mismatch on 2026-11-01 (the source cited Jiang 2021). On 2026-11-02
its cited source was changed to Gilbert 2021 and it is now verified.

C18 was a mismatch on 2026-11-01 (the source cited Gilbert 2021, which does
not cover nutrient transport). On 2026-11-02 it was re-sourced (see
"Second follow-up, 2026-11-02" below) and is now verified at Unproven-Bridge.

## Needs-review rows

- **C19 (protein and vitamin C as substrates for matrix repair).** Vitamin C:
  one cohort association (McAlindon 1996), called preliminary by its authors.
  Protein for cartilage repair: not found. **Held, not for first release**
  (decision 2026-11-02). Row kept.
- **C23 (pain as a protective alarm before harm).** Not traced to a PubMed
  record. Partly backed by C14 (loading exercise does not appear to harm
  cartilage). A2 bounds the wording.
- **C24 (2 to 3 sessions a week).** The frequency was not traced. Treat as
  clinical guidance until sourced.

C11 and C20 were needs-review on 2026-11-01 and are verified after the
2026-11-02 decisions below.

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
2026-11-01. Gilbert 2021 (34948394) was re-read on 2026-11-02 for the C03
change.

Five PMIDs added on 2026-11-02, each read in PubMed that day: 14618919
Mauck, 28888900 Graham, 29997112 and 30622734 Rausch Osthoff, 22392533
Loeser.

Four PMIDs used in the register are **not** in the cache and are marked
**do not cite until build confirms**:

- 26564575 Sandal (C02): PubMed record date 2015 (online); journal issue
  Osteoarthritis Cartilage volume 24 (likely 2016)
- 34916210 Øiestad (C09): PubMed record date 2021 (online); issue Br J Sports
  Med volume 56 (likely 2022)
- 29934429 Bricca (C14): PubMed record date 2018 (online); issue Br J Sports
  Med volume 53 (likely 2019)
- 17107655 Zhang (C18): PubMed record date 2006 (online); issue Arch Biochem
  Biophys volume 457 (likely 2007)

On 2026-11-02 I re-checked the first three with PubMed citation lookup using both
candidate years. Lookup matched the same PMID for both years, so it does not
settle which year PubMed's own citation uses, and the E-utilities summary
that the build reads is blocked from this session. Caching a guessed year
could make the build pass a wrong citation or fail a right one. The build
checks these three live on the next run.

Cache first-author names keep PubMed's accents (Thomeé, Bruyère,
Fernández-Moreno). The build matches the first author as a substring of the
citation text, so citations must spell these names with the same accents.

## decision_2026-11-02

Randy (owner and clinical reviewer) answered the seven A1 decisions on
2026-11-02. Each is also recorded in the row's `notes` column.

| Claim | Decision | Register change |
|---|---|---|
| C02 | Keep the 5/10 rule as labelled clinical guidance, Unproven-Bridge, with the A1 safe wording. | Status stays `mismatch` because Gilbert 2021 does not support it; the safe wording is approved as clinical guidance, not as a cited claim. |
| C08 | Grade Promising confirmed. | Note added. |
| C11 | Drop "60% less". Use the raw 3.5% vs 10.2% only, as an association. Randy's message to keep: movement is good. | Safe wording rewritten; status `verified`. |
| C20 | Replacement wording approved. | Status `verified`. |
| C13 | Include GLP-1 in the first release, graded Promising. | Note added. |
| C19 | Protein and vitamin C held, not for first release. | Row kept; status stays `needs-review`. |
| C03 | Cited source changed to Gilbert 2021. | PMID 34948394 re-read in PubMed: abstract says PCM components transduce mechanical signals to chondrocytes and physiological loading keeps building and breakdown in balance (animal and cell studies). Status `verified`, grade Unproven-Bridge. |
| C18 | Drop the "brittle" sponge claim; keep "movement circulates joint fluid that nourishes cartilage" at its grade. | Safe wording rewritten; grade Unproven-Bridge, no PMID; status stays `mismatch` for Gilbert 2021. |
| C12 | Approved by the clinical reviewer. Closing line ends "talk them through with your doctor", because a medical doctor prescribes medicines and joint injections. Name OARSI only. | Safe wording updated. |
| Uncached PMIDs | Cache if read, or mark "do not cite until build confirms". | All three marked "do not cite until build confirms" (see PMID cache above). |

## Second follow-up, 2026-11-02

The coordinator asked A1 to source three statements A2 still uses. C20's grade
is still with Randy and was not changed.

| Claim | Result | Grade | Sources (each read in PubMed) |
|---|---|---|---|
| C18: cartilage has no blood supply, is fed from joint fluid, and movement helps circulate that fluid | Re-sourced. The avascular, fed-by-diffusion part is well supported. Movement helping transport is shown only in lab cartilage samples and models, and mainly for larger molecules. Small nutrients such as glucose move mostly by diffusion, and one model (Gardiner 2007, PMID 17671860) found loading had a negligible long-term effect on IGF-I transport. Safe wording says "lab studies on cartilage samples suggest". Status changed from mismatch to verified; Gilbert 2021 stays rejected. | Unproven-Bridge | Mauck 2003 (14618919), Graham 2017 (28888900), Zhang 2006 (17107655, not cached) |
| C25 (new, A2 UNREGISTERED-1): exercise is often part of care for inflammatory arthritis | EULAR 2018 advocates physical activity as an integral part of standard care for rheumatoid arthritis, spondyloarthritis and hip or knee OA. | Established | Rausch Osthoff 2018 (29997112, guideline); Rausch Osthoff 2018 (30622734, supporting meta-analysis) |
| C26 (new, A2 UNREGISTERED-2): OA affects the whole joint, not just the cartilage | Loeser 2012 full text describes changes in cartilage, subchondral bone, synovium, ligaments, menisci and capsule and calls OA "a disease of the joint as an organ". Kraus 2015 (25865392) was read but its abstract does not give the definition, so it is not used. | Established | Loeser 2012 (22392533; no abstract in PubMed, full text read in PMC) |
