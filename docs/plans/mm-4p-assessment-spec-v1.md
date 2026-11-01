# Muscle-Meta Matrix™ full assessment (4P) — instrument spec, version 1 (DRAFT)

> **Archive note (added 2026-11-01).** Saved from the planning session so later sessions can build from it.
> - **Where the decisions live.** The decision log below is authoritative. Where a table further down still shows only a recommendation, the log records what was decided.
> - **Where it gets built.** Development target is Supabase project `ikjadymjalaelkpivveh`, not `bxpferfuwoiulnqnfqhf`.

**Status: SPEC APPROVED (2026-10-08) — PLAN ONLY. Nothing seeded, coded or published. All decisions closed.**

### Decision log
| Date | Decision | By |
|---|---|---|
| 2026-09-27 | C-1: Strength = P1-C4, Endurance = P1-C5 | Randy |
| 2026-10-08 | W-1: **Option B** (canonical hierarchy with framework category weights) | Randy |
| 2026-10-08 | W-2: Pillar 3 split **Recovery 0.38 / Lifestyle 0.30 / Stress Management 0.32** | Randy |
| 2026-10-08 | W-3: Pillar 4 split **Balance 0.54 / Brain Health 0.46** | Randy |
| 2026-10-08 | C-2 to C-9 **accepted** (confirmed) | Randy |
| 2026-10-08 | W-4 checklists: MO3 and ST4 scored by count; JH3 and MF3 flags only; RE4, LI4, SM3, BH3, NU4 context only | Randy |
| 2026-10-08 | W-5 "more is better" anchors kept as written for version 1; review in version 2 | Randy |
| 2026-10-08 | W-6 pillars weighted equally, 25 % each, into the 0–100 MM™ Health Score | Randy |
| 2026-10-08 | W-7 items within a category weighted equally | Randy |
| 2026-10-08 | D-2 display name "Muscle-Meta Matrix™ full assessment" | Randy |
| 2026-10-08 | D-3 free; all 4 pillars and 12 categories scored and shown | Randy |
| 2026-10-08 | D-4 Part 3 preferences move to the member profile after the first completion | Randy |
| 2026-10-08 | D-5 one shared level ladder across the platform: **Foundation / Building / Performance** (replaces the source's Foundation / Building / Optimization / Mastery) | Randy |
| 2026-10-08 | D-6 one goal registry and one pace field shared by every instrument | Randy |
| 2026-10-08 | D-7 suggested reassessment interval 90 days | Randy |
| 2026-10-08 | D-8 QMMA becomes the free quick screen feeding this assessment | Randy |

| Field | Value |
|---|---|
| Instrument code | `MM_4P_01` (legacy alias `4P_MMA`, kept for traceability) |
| Source | Google Doc "Muscle-Meta Matrix Personalized Assessment System" (created 2025-04-12, edited 2026-07-06; PDF copy 2025-08-31). Asset inventory MMM-009. |
| Instrument kind | `questionnaire` (self-report) |
| Score family | `mm_health_score`: 0–100, **higher is better**, user-facing (CLAUDE.md §1) |
| Items | **63** in total: 2 account fields, 7 profile items, **49 pillar items** (of which **42 are scored** under the recommended mapping), 5 preference items |
| Estimated time | 12–15 minutes; save and resume; one question per screen |
| Evidence status | Pilot self-report instrument, **not validated**. Scores are educational, not diagnostic. The five tier bands are the MM™ operating bands, not clinical cut-offs. |

**Why version 1 can still correct the source.** No result has ever been produced with this instrument; the old app declared the type but never built it. The corrections in §3 are therefore made *before* version 1 is published, not as a silent change to history. Every correction is listed so you can accept or reject it.

---

## 1. Conventions used in the item tables

- **Field code**: stable key in the database and the scoring engine. Format `<category abbreviation>_<construct>`.
- **Category key**: canonical `P#-C#` from CLAUDE.md. **Strength = P1-C4, Endurance = P1-C5.** The source document has these two the other way round; this spec fixes that.
- **Type**
  - `scale5`: 1–5 rating
  - `single`: single choice
  - `multi`: check all that apply
  - `text`: free text
  - `number`: numeric
- **Direction** (for `scale5`)
  - `HB`: higher is better (5 = best)
  - `LB`: lower is better (1 = best), which reverse-scores to the higher-is-better health scale
- **Role**
  - `score`: counts toward the category score
  - `context`: stored for personalisation only
  - `flag`: can raise a flag (§6)
  - Combinations are allowed (`score+flag`).
- **Normalisation of a scored item to 0–100 (higher is better)**
  - `HB`: `s = (raw − 1) / 4 × 100`
  - `LB`: `s = (5 − raw) / 4 × 100`
  - Non-scale items use the mapping shown in the row, converted the same way.

---

## 2. Item bank

### Part 1 — Profile (not scored)

| # | Field code | Prompt (source wording) | Type | Options / codes | Role | Stored where |
|---|---|---|---|---|---|---|
| A1 | *(account)* | Name | text | — | — | `profiles.display_name`. **Never sent to any AI model.** |
| A2 | *(account)* | Email | text | — | — | Auth account |
| PR1 | `pr_age` | Age | number | 18–110 | context | `profiles.birth_year` (age derived) |
| PR2 | `pr_sex` | Gender | single | `female`, `male`, `prefer_not_to_say` (matches the existing `profiles.sex` check) | context | `profiles.sex` |
| PR3 | `pr_occupation_status` | Occupation | single | `employed`, `unemployed`, `retired` | context | answers |
| PR4 | `pr_primary_goals` | Primary health goals (select up to 3) | multi, max 3 | `increase_energy`, `mobility_pain`, `metabolic_health`, `strength_muscle`, `stress_recovery`, `brain_cognition`, `balance_falls`, `functional_independence`, `sports_performance` (+ text: sports), `specific_condition` (+ text) | context | answers → priority tie-break (§5.4) |
| PR5 | `pr_health_conditions` | Current health conditions (check all that apply) | multi | `cardiovascular`, `metabolic`, `joint_pain_arthritis`, `back_neck`, `autoimmune`, `chronic_fatigue`, `anxiety_depression`, `sleep_disorder`, `digestive`, `fall_last_year`, `recent_hospitalization`, `other` (+ text), `none` (exclusive; **added**) | context+flag | answers → flags (§6) |
| PR6 | `pr_activity_level` | Current activity level | single | `sedentary`, `light`, `moderate`, `very`, `highly` | context | answers |
| PR7 | `pr_time_available` | Time availability for health activities (daily) | single | `minimal` (0–15 min), `limited` (15–30), `moderate` (30–60), `substantial` (60+) | context | answers → plan sizing |

### Part 2 — Pillar 1: Exercise & Mobility

**P1-C1 Joint Health**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| JH1 | `jh_pain_frequency` | Do you experience joint pain during daily activities? | scale5 | 1 Never … 5 Frequently | **LB** | score |
| JH1a | `jh_pain_joints` | Which joints are affected? | text | shown if JH1 ≥ 2 | — | context |
| JH2 | `jh_stiffness` | How would you rate your joint stiffness, especially in the morning or after periods of inactivity? | scale5 | 1 No stiffness … 5 Severe stiffness | **LB** | score |
| JH3 | `jh_conditions` | Have you been diagnosed with any joint-related conditions? | multi | `osteoarthritis`, `rheumatoid_arthritis`, `joint_replacement`, `tendonitis_bursitis`, `other` (+ text), `none` (exclusive) | — | context+flag |
| JH4 | `jh_confidence` | How confident are you in your joints' ability to support you during physical activities? | scale5 | 1 Not confident … 5 Very confident | HB | score |

**P1-C2 Functional Independence**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| FI1 | `fi_daily_activity_ease` | How easily can you perform daily activities like getting dressed, cooking, or cleaning? | scale5 | 1 Very difficult … 5 Very easy | HB | score |
| FI1a | `fi_challenging_activities` | Any specific activities that are challenging? | text | shown if FI1 ≤ 4 | — | context |
| FI2 | `fi_floor_rise_no_hands` | Can you get up from the floor without using your hands for support? | scale5 | 1 Cannot do … 5 Easily | HB | score |
| FI3 | `fi_aid_use` | Do you use any aids (canes, walkers, railings) to maintain balance and independence? | single | `yes_frequently` → 1 · `sometimes` → 3 · `no` → 5 **(proposed mapping)** | HB | score+flag |
| FI4 | `fi_independence_confidence` | How confident are you in your ability to maintain independence as you age? | scale5 | 1 Not confident … 5 Very confident | HB | score |

**P1-C3 Mobility**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| MO1 | `mo_flexibility` | How would you rate your overall flexibility? | scale5 | 1 Very inflexible … 5 Very flexible | HB | score |
| MO2 | `mo_reach_overhead_behind` | Can you comfortably reach overhead or behind your back? | scale5 | 1 Very difficult … 5 Very easy | HB | score |
| MO3 | `mo_movement_difficulties` | Do you have difficulty with any of the following movements? | multi | `bending_forward`, `rotating_torso`, `squatting`, `reaching_overhead`, `looking_over_shoulder`, `none` (exclusive). **Proposed score:** count of difficulties n → 0 = 5, 1 = 4, 2 = 3, 3 = 2, 4–5 = 1 | HB | score |
| MO4 | `mo_rom_decline` | Have you noticed a decline in your range of motion over the past year? | scale5 | 1 Significant decline … 5 No decline | HB | score |

**P1-C4 Strength** *(source: "Category 5")*

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| ST1 | `st_vs_peers` | How would you rate your overall strength compared to others your age and gender? | scale5 | 1 Much weaker … 5 Much stronger | HB | score |
| ST2 | `st_carry_groceries` | Can you carry heavy groceries from your car to your home without difficulty? | scale5 | 1 Very difficult … 5 Very easy | HB | score |
| ST3 | `st_training_frequency` | How often do you engage in strength training activities? | scale5 | 1 Never · 2 Rarely · 3 1–2×/wk · 4 3–4×/wk · 5 5+×/wk | HB | score (see decision W-5) |
| ST4 | `st_tasks_performable` | Which of these can you perform? | multi | `squats_10`, `pushups_5`, `plank_30s`, `chair_stands_5_no_hands`, `none` (exclusive). **Proposed score:** count c → 1 + c (0 = 1 … 4 = 5) | HB | score |

**P1-C5 Endurance** *(source: "Category 4")*

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| EN1 | `en_continuous_activity` | How long can you engage in continuous physical activity before needing to rest? | scale5 | 1 <5 min · 2 5–15 · 3 15–30 · 4 30–60 · 5 60+ min | HB | score |
| EN2 | `en_dyspnea_everyday` | Do you experience shortness of breath during everyday activities like climbing stairs? | scale5 | 1 Always … 5 Never | HB | score+flag |
| EN3 | `en_energy_level` | How would you rate your energy levels throughout the day? | scale5 | 1 Very low … 5 Very high | HB | score |
| EN3a | `en_lowest_energy_time` | When is your energy lowest? | text | — | — | context |
| EN4 | `en_aerobic_frequency` | How frequently do you engage in cardio or aerobic activity? | scale5 | 1 Never · 2 Rarely · 3 1–2×/wk · 4 3–4×/wk · 5 5+×/wk | HB | score |

### Part 2 — Pillar 2: Nutrition & Metabolism

**P2-C6 Nutrition**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| NU1 | `nu_produce_servings` | How many servings of vegetables and fruits do you consume daily? | scale5 | 1 0–1 · 2 2–3 · 3 4–5 · 4 6–7 · 5 8+ | HB | score |
| NU2 | `nu_protein_each_meal` | How would you describe your protein intake at each meal? | scale5 | 1 Minimal/inconsistent … 5 Adequate/consistent | HB | score |
| NU3 | `nu_water_cups` | How many cups of water do you drink daily? | scale5 | 1 0–2 · 2 3–4 · 3 5–6 · 4 7–8 · 5 9+ | HB | score (see W-5) |
| NU4 | `nu_dietary_pattern` | Do you have any specific dietary approaches or restrictions? | multi | `omnivore`, `vegetarian`, `vegan`, `keto_low_carb`, `paleo`, `gluten_free`, `dairy_free`, `other` (+ text) | — | context |
| NU5 | `nu_processed_frequency` | How often do you consume processed foods or sugary drinks? | scale5 | 1 Multiple times daily … 5 Rarely/never | HB | score |

**P2-C7 Metabolic Flexibility**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| MF1 | `mf_energy_crashes` | Do you experience energy crashes between meals? | scale5 | 1 Frequently … 5 Never | HB | score |
| MF2 | `mf_meal_gap_tolerance` | How long can you comfortably go between meals without feeling irritable or fatigued? | scale5 | 1 <2 h · 2 2–3 h · 3 3–4 h · 4 4–5 h · 5 5+ h | HB | score |
| MF3 | `mf_diagnoses` | Have you been diagnosed with any of the following conditions? | multi | `type2_diabetes`, `prediabetes_insulin_resistance`, `metabolic_syndrome`, `pcos`, `none` (exclusive) | — | context+flag |
| MF4 | `mf_carb_cravings` | Do you experience strong cravings for carbohydrates or sugar? | scale5 | 1 Frequently … 5 Rarely/never | HB | score |

### Part 2 — Pillar 3: Recovery & Stress

**P3-C8 Recovery**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| RE1 | `re_sleep_quality` | How would you rate your sleep quality? | scale5 | 1 Very poor … 5 Excellent | HB | score |
| RE2 | `re_sleep_hours` | How many hours of sleep do you typically get each night? | scale5 | 1 <5 · 2 5–6 · 3 6–7 · 4 7–8 · 5 8+ | HB | score (see W-5) |
| RE3 | `re_exertion_recovery` | How long does it take you to recover from physical exertion? | scale5 | 1 Several days … 5 Quickly/same day | HB | score |
| RE4 | `re_practices` | Do you incorporate specific recovery practices in your routine? | multi | `stretching_mobility`, `massage_foam_rolling`, `hot_cold`, `meditation_breathwork`, `rest_days`, `none` (exclusive) | — | context |

**P3-C9 Lifestyle**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| LI1 | `li_sitting_hours` | How many hours do you spend sitting each day? | scale5 | 1 10+ · 2 8–10 · 3 6–8 · 4 4–6 · 5 <4 | HB | score |
| LI2 | `li_routine_consistency` | How consistent is your daily routine (sleep schedule, meal timing, etc.)? | scale5 | 1 Very inconsistent … 5 Very consistent | HB | score |
| LI3 | `li_movement_breaks` | How often do you engage in movement throughout your day? | scale5 | 1 Rarely/long periods of sitting … 5 Frequent movement breaks | HB | score |
| LI4 | `li_habit_disruptors` | Do any of these affect your health habits? | multi | `long_commute`, `desk_job`, `irregular_hours`, `frequent_travel`, `caregiving`, `none` (exclusive) | — | context |

**P3-C10 Stress Management**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| SM1 | `sm_stress_level` | How would you rate your overall stress level? | scale5 | 1 Very high … 5 Very low | HB | score |
| SM2 | `sm_coping` | How well do you feel you manage stress? | scale5 | 1 Poorly … 5 Very well | HB | score |
| SM3 | `sm_practices` | Do you practice stress-reduction techniques? | multi | `meditation`, `deep_breathing`, `yoga_tai_chi`, `nature`, `hobbies`, `none` (exclusive) | — | context |
| SM4 | `sm_overwhelm_frequency` | How often do you feel overwhelmed by responsibilities or tasks? | scale5 | 1 Daily … 5 Rarely/never | HB | score |

### Part 2 — Pillar 4: Balance & Brain Health (scored and shown in full; no gating)

**P4-C11 Balance**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| BA1 | `ba_confidence` | How confident are you in your balance during daily activities? | scale5 | 1 Not confident … 5 Very confident | HB | score |
| BA2 | `ba_falls_past_year` | Have you experienced any falls in the past year? | single | `yes_multiple` → 1 · `yes_once` → 3 · `no` → 5 **(proposed mapping)** | HB | score+flag |
| BA3 | `ba_single_leg_10s` | Can you stand on one foot for 10 seconds without support? | scale5 | 1 Cannot do … 5 Easily | HB | score |
| BA4 | `ba_uneven_dim_steadiness` | Do you feel unsteady when walking on uneven surfaces or in dim lighting? | scale5 | 1 Very unsteady … 5 Very steady | HB | score |

**P4-C12 Brain Health**

| # | Field code | Prompt | Type | Anchors / options | Dir | Role |
|---|---|---|---|---|---|---|
| BH1 | `bh_memory_vs_5y` | How would you rate your memory compared to 5 years ago? | scale5 | 1 Significantly worse … 5 Same or better | HB | score+flag |
| BH2 | `bh_focus` | How easily can you focus and concentrate on tasks? | scale5 | 1 Very difficult … 5 Very easy | HB | score |
| BH3 | `bh_challenge_activities` | Do you engage in activities that challenge your brain? | multi | `learning_skills`, `puzzles_games`, `reading`, `social`, `creative`, `none` (exclusive) | — | context |
| BH4 | `bh_mood_wellbeing` | How would you rate your mood and emotional well-being? | scale5 | 1 Poor … 5 Excellent | HB | score+flag |

### Part 3 — Implementation preferences (not scored)

| # | Field code | Prompt | Type | Options | Role |
|---|---|---|---|---|---|
| PF1 | `pf_change_approach` | Which approach to health improvement do you prefer? | single | `gradual`, `moderate`, `rapid` | context (maps to the orientation `preferred_pace`; see D-6) |
| PF2 | `pf_tracking` | How do you prefer to track progress? | multi | `mobile_app`, `journal`, `wearable`, `assessments`, `coach` | context |
| PF3 | `pf_enjoyed_activities` | What types of activities do you enjoy? | multi | `walking_hiking`, `running`, `cycling`, `swimming`, `strength_training`, `group_fitness`, `mind_body`, `sport_pickleball`, `sport_tennis`, `sport_golf`, `sport_surfing`, `sport_skiing`, `dancing`, `home_workouts`, `other` (+ text) | context → activity-matched content |
| PF4 | `pf_consistency_factors` | What factors would most help you stay consistent? (up to 3) | multi, max 3 | `step_by_step`, `check_ins`, `measurable_progress`, `community`, `time_efficiency`, `enjoyable`, `meaningful_goals`, `other` | context |
| PF5 | `pf_barriers` | What barriers might impact your success? | multi | `time`, `energy`, `physical_limitations`, `motivation`, `stress`, `social_support`, `access`, `knowledge_confidence`, `other` | context |

**Scored items per category (recommended mapping):**
- JH 3
- FI 4
- MO 4
- ST 4
- EN 4
- NU 4
- MF 3
- RE 3
- LI 3
- SM 3
- BA 4
- BH 3

**Total: 42 scored items. Every category has at least 3.**

---

## 3. Corrections to the source (accept or reject each)

| # | Source | Correction | Reason |
|---|---|---|---|
| C-1 | Endurance = Category 4, Strength = Category 5 | Strength **P1-C4**, Endurance **P1-C5** — **CONFIRMED by Randy 2026-09-27** | CLAUDE.md category numbering (settled 2026-09-16) |
| C-2 | Mixed 1–5 directions with no reversal rule | Explicit `HB`/`LB` per item; everything normalised to higher-is-better | The source's /20 sums would add pain (1 = best) to confidence (5 = best). Two items (JH1, JH2) are reversed. |
| C-3 | Checkbox items listed but not scored; category max "/20" implies 4 scored items each | Checklists are scored by count (MO3, ST4) or kept as context (JH3, NU4, MF3, RE4, LI4, SM3, BH3) | See W-4 |
| C-4 | Health conditions and falls just feed a GPT prompt | Converted into **flags** with fixed, bounded, non-diagnostic messages (§6) | CLAUDE.md evidence rules; safety screens stay in |
| C-5 | Plan generated by a GPT prompt that includes name, age and conditions | Rule-based next actions (§5.4). If AI drafting is added later: server-side, no name or email in the prompt, output saved as a draft for review | Privacy; no unreviewed clinical content |
| C-6 | Source "Recent Hospitalization" and "History of Fall" appear only as profile checkboxes | Also trigger routing to the CRA / Catabolic Crisis Screen | Existing instruments already cover this better |
| C-7 | No `none` option on health conditions | Add `none` (exclusive) | Otherwise "no conditions" can't be told apart from "skipped" |
| C-8 | Old app labelled 4P_MMA a "paid upgrade" | **Free**: all 4 pillars and 12 categories scored and explained to everyone. Paid products are what's built on top (plan, programs, reassessment history, clinician report) | CLAUDE.md "Gating is REMOVED" |
| C-9 | Legacy "<12 of 20 = higher risk" | Replaced by the canonical 5-tier bands (§5.3). For reference: 12/20 across 4 items equals about 50 on the 0–100 scale, which falls in "At risk" | One tier system |

---

## 4. Scoring pipeline (all options share this)

1. **Completeness gate.** All 42 scored items and the safety gate must be answered before a final result. Anything less is saved as a draft. No imputation, no zero-filling (your earlier rule).
2. **Item score** `s` (0–100) per §1.
3. **Category score** `C` = mean of its scored items' `s` (0–100). Items within a category are weighted equally in version 1.
4. **Pillar score** `P` = weighted combination of its category scores (0–100) → **W-1 to W-3 below**.
5. **MM™ Health Score** = combination of the 4 pillar scores (0–100) → **W-6**.
6. **Tier labels** applied to total, pillars and categories (§5.3).
7. **Flags and next actions** (§5.4, §6).
8. Stored write-once with `instrument_version = 1` and `algorithm_version = 1.0.0`, plus all scores in `attempt_scores` (`score_family = mm_health_score`, scopes category / pillar / total).

---

## 5. Weighting options — choose one

### Option A — Source-faithful raw sums (not recommended)
Category = raw sum (4 items × 5 = /20; Nutrition 5 items = /25); pillar = sum of its categories; total /245.
- **Effective pillar weights:** P1 41 %, P2 18 %, P3 24 %, P4 16 %. Pillars are weighted by how many categories they contain, not by design.
- Conflicts with CLAUDE.md: "category weights are not equal"; "aggregate construct → category → pillar → total"; "never divide by twelve".
- Only merit: matches the document literally.

### Option B — Canonical hierarchy with category weights from the framework (**SELECTED 2026-10-08**)
`P = Σ C × weight_in_pillar`, using the existing `categories.weight_in_pillar` column (checked by `assert_taxonomy_integrity()` to sum to 1 per pillar). Pillars are then combined per W-6.

| Category | Proposed weight in pillar | Source of the number |
|---|---|---|
| P1-C1 Joint Health | 0.20 | CLAUDE.md "a Pillar 1 category ~20" |
| P1-C2 Functional Independence | 0.20 | ″ |
| P1-C3 Mobility | 0.20 | ″ |
| P1-C4 Strength | 0.20 | ″ |
| P1-C5 Endurance | 0.20 | ″ |
| P2-C6 Nutrition | **0.56** | CLAUDE.md "56/44" |
| P2-C7 Metabolic Flexibility | **0.44** | ″ |
| P3-C8 Recovery | **0.38 — confirmed** | Derived from QMMA weights 1.4 / 1.1 / 1.2; confirmed by Randy 2026-10-08 |
| P3-C9 Lifestyle | **0.30 — confirmed** | ″ |
| P3-C10 Stress Management | **0.32 — confirmed** | ″ |
| P4-C11 Balance | **0.54 — confirmed** | Derived from QMMA weights 1.4 / 1.2; confirmed by Randy 2026-10-08 |
| P4-C12 Brain Health | **0.46 — confirmed** | ″ |

**Variant B′:** Pillar 1 also uses the QMMA-derived weights instead of flat 0.20 (0.20 / 0.21 / 0.18 / 0.21 / 0.20 — nearly identical). Recommendation: keep flat 0.20 for simplicity.

### Option C — QMMA-style 0–400
Same maths as B, but the total is reported as the **sum** of four 0–100 pillars (0–400), matching QMMA and your Notion "Risk Assessment Tools" page.
**Caution:** the Notion 0–400 bands (0–24 Minimal … 250–400 Critical) treat **higher as worse**, the opposite of the MM™ Health Score. Using Option C would need a separate score family and would reintroduce exactly the opposite-direction confusion CLAUDE.md warns about. Recommendation: store 0–100 and, if you like, *display* "× 4" only as a secondary number. Better: don't.

### Weighting decisions

| # | Decision | Recommendation |
|---|---|---|
| W-1 | Option A, B or C | **Decided: B** |
| W-2 | Pillar 3 split (38/30/32) | **Decided: 38/30/32** |
| W-3 | Pillar 4 split (54/46) | **Decided: 54/46** |
| W-4 | Checklist scoring: MO3 and ST4 scored by count; JH3/MF3 flags only; RE4/LI4/SM3/BH3/NU4 context only | Confirm. *Alternative:* score RE4/SM3/BH3 by count as "protective behaviours" — not recommended, because the number of practices is not a measure of quality |
| W-5 | "More is better" anchors that aren't clinically monotonic: sleep 8+ h (RE2), water 9+ cups (NU3), strength training 5+×/wk (ST3), aerobic 5+×/wk (EN4) | **Option (i), keep as written** for version 1 (they're the top bands, not extremes); **option (ii) optimal-band scoring**: e.g. sleep 7–8 h = 5, 8+ h = 4. Recommend (i) for version 1 and review in version 2 |
| W-6 | Pillar → Health Score | **Equal 25 % per pillar.** CLAUDE.md defines no pillar weights; GMMBB's 25/25/20/15/15 is an axis model, *not* pillar weights, and must not be borrowed |
| W-7 | Within-category item weights | Equal in version 1 |

### 5.3 Tier bands (canonical, from `site/assets/mm.js` `TIER_DEFS`)
| Score | Label |
|---|---|
| ≥ 85 | Optimized |
| 70–84.9 | Functional |
| 55–69.9 | Declining |
| 40–54.9 | At risk |
| < 40 | Critical |

Applied to the total, each pillar and each category. Scores are rounded to 1 decimal before banding.

Copy note: "Critical" is the canonical label, but every result screen should add the bounded-reassurance line ("This is an educational self-assessment, not a diagnosis").

### 5.4 Priority and next actions (replaces the GPT plan)
1. **Core focus** = the 2 lowest-scoring categories. When two categories score within 5 points, prefer the one matching the member's `pr_primary_goals`.
2. **Secondary support** = the next 1–2 lowest.
3. **Strengths** = categories scored "Optimized" or "Functional" (shown, never hidden).
4. **Starting level:** Foundation / Building / Performance, the platform-wide ladder (D-5, decided 2026-10-08). *How a 4P result maps onto the ladder (for example, Program 1's bands ≥ 80 / 55–79.9 / < 55 applied per category) is a proposal for the build plan, not yet decided.*
5. Each next action links to a content item or program by data (the `next_actions` codes in the result contract), never hard-coded copy.

---

## 6. Flags (user-facing, non-diagnostic, fixed wording to be approved)

| Flag code | Trigger | Effect |
|---|---|---|
| `SAFETY_GATE` | Shared orientation safety question = `yes` / `not_sure` | Show results and education, but no new physical-activity recommendation; professional-review route (same rule as Program 1) |
| `CARDIO_CLEARANCE` | PR5 `cardiovascular`, or EN2 ≤ 2 | "Check with your doctor before starting vigorous activity" line on endurance actions |
| `RECENT_HOSPITALIZATION` | PR5 `recent_hospitalization` | Suggest the Catabolic Crisis Screen / CRA next |
| `FALL_HISTORY` | BA2 `yes_once` or PR5 `fall_last_year` | Balance promoted into core focus |
| `FALL_HISTORY_MULTIPLE` | BA2 `yes_multiple` | As above + "consider a fall-risk assessment with a physical therapist or physician" |
| `ASSISTIVE_DEVICE` | FI3 `yes_frequently` | Standing and floor-based exercises default to supported variants |
| `JOINT_REPLACEMENT` | JH3 `joint_replacement` | Joint-specific precautions note on strength and mobility content |
| `METABOLIC_DIAGNOSIS` | MF3 any except `none`, or PR5 `metabolic` | Nutrition content carries "coordinate with your care team" line |
| `MEMORY_CONCERN` | BH1 = 1 | "Changes in memory are worth discussing with your doctor" (no interpretation) |
| `LOW_MOOD` | BH4 = 1, or PR5 `anxiety_depression` | Supportive-resources line, including a crisis line (wording to approve) |

Flags never change a score. They are stored in `result_flags` with `audience = user`.

---

## 7. Test vectors (to become automated tests when approved)

| Case | Input | Expected (Option B, W-6 equal) |
|---|---|---|
| T1 all best | every HB item = 5, LB items = 1, MO3 `none`, ST4 all four, FI3/BA2 `no` | every category 100 → Health Score 100, Optimized |
| T2 all worst | HB = 1, LB = 5, MO3 all five, ST4 `none`, FI3 `yes_frequently`, BA2 `yes_multiple` | 0 everywhere, Critical; flags `ASSISTIVE_DEVICE`, `FALL_HISTORY_MULTIPLE`, `CARDIO_CLEARANCE` (EN2 = 1) |
| T3 midpoint | every scale item = 3, MO3 two items, ST4 two items, FI3/BA2 `sometimes`/`yes_once` | every category 50 → 50, At risk |
| T4 reversal | only JH1 changed from 1 to 5 | JH drops by 33.3 points (one of three items from 100 to 0) |
| T5 weights | Nutrition 100, Metabolic Flexibility 0 | P2 = 56.0 (proves 56/44) |
| T6 incomplete | any one scored item missing | no result; draft saved |
| T7 safety | T1 + gate `not_sure` | score 100 still shown; physical-activity actions withheld |
| T8 Option A parity | same answers as the source's /20 examples | reproduces the raw sums, for traceability only |

---

## 8. Other decisions

| # | Question | Recommendation |
|---|---|---|
| D-1 | Accept corrections C-1 to C-9 | **Decided: all accepted** |
| D-2 | Display name | "Muscle-Meta Matrix™ full assessment" (sentence case; ™ name capitalised per CLAUDE.md) |
| D-3 | Free, with results for all 12 categories | Yes (C-8) |
| D-4 | Keep Part 3 (preferences) in the instrument, or move it to the member profile so it isn't re-asked on reassessment | Move to profile after the first completion |
| D-5 | Level names (§5.4 step 4) | **Decided: Foundation / Building / Performance** |
| D-6 | PR4 goals vs Program 1's orientation goal list (10 codes), and PF1 vs orientation `preferred_pace` | Merge into **one goal registry and one pace field**, used by every instrument |
| D-7 | Reassessment interval | Suggested 90 days (the source doesn't say) |
| D-8 | Relationship to QMMA (15-item quick version) | QMMA becomes the free quick screen that feeds into this full assessment, rescored on this spec's scales |

---

## 9. How it lands in the platform (plan v3 model, nothing applied)

- `assessments`: `MM_4P_01`, `legacy_code = '4P_MMA'`, `instrument_kind = questionnaire`, `tier_system = mm_health_score`, `access_key = 'free'`.
- `assessment_versions` version 1; `assessment_items`: 63 rows with `field_code`, `section_code`, `category_id`, `input_type`, `options` (with `score_value` per option where scored), `visible_if` for JH1a/FI1a.
- `packages/scoring-engine/mm-4p-01`: steps 1–7, versioned; weights read from the approved values and frozen into `algorithm_version`.
- Results: `assessment_results` + `attempt_scores` (12 category, 4 pillar, 1 total) + `result_flags`.
- Member dashboard: the E/N/R/B diamond from the four pillar scores; all 12 categories listed and explained.
