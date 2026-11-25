-- JHRA_01 · Joint Health Risk Score (jhra_risk) scale, tiers, and results
-- that carry no starting level. Additive: one tier system, four tier rows,
-- and three result columns relaxed from NOT NULL behind a check that keeps
-- them required for every other instrument.
--
-- 1. tier_systems / risk_tiers: 0-100, higher is worse. Bands from the JHRA
--    v1.0 draft, Part 4 step 4. Colours are the site's --tier-1..4 tokens
--    (site/assets/mm.css); hex lives only in the database, never on a page.
-- 2. assessment_results.ability_*: JHRA produces a risk tier, not a
--    foundation/building/performance starting level. The columns become
--    nullable, and assessment_results_ability_required_check keeps them
--    required for Program 1 and the 4P assessment exactly as before.

insert into public.tier_systems (code, name, direction, audience, score_min, score_max, notes) values
  ('jhra_risk', 'Joint Health Risk Score', 'higher_is_worse', 'user', 0, 100,
   'JHRA_01 composite: seven weighted domain scores (0-100, higher is more risk) plus an age and sex adjustment, capped at 100. Educational weighting, not a validated prediction model. Flags always display and override the tier''s next step.')
on conflict (code) do nothing;

insert into public.risk_tiers (system_code, rank, label, color_hex, muted_hex, band_min, band_max, clinical_copy) values
  ('jhra_risk', 1, 'Maintain', '#009090', '#e6f5f5', 0, 19,  'Few risk factors present. Continue current habits; retest every 12 months.'),
  ('jhra_risk', 2, 'Build',    '#3b82f6', '#eff6ff', 20, 39, 'Several modifiable factors. Target the highest one or two domains for 12 weeks; retest at 90 days.'),
  ('jhra_risk', 3, 'Rebuild',  '#f59e0b', '#fef3c7', 40, 59, 'Multiple interacting factors. Structured program with a physical therapist or qualified coach; retest at 30, 60 and 90 days.'),
  ('jhra_risk', 4, 'Guided',   '#f97316', '#ffedd5', 60, 100, 'High combined burden. Clinician-guided assessment and plan before progressing load.')
on conflict (system_code, rank) do nothing;

alter table public.assessment_results
  alter column ability_score            drop not null,
  alter column ability_level_calculated drop not null,
  alter column ability_level            drop not null;

alter table public.assessment_results add constraint assessment_results_ability_required_check check (
  algorithm_version like 'jhra-%' or (
    ability_score is not null and ability_level_calculated is not null and ability_level is not null));
