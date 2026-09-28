# Supabase schema inventory — 2026-09-28 (M0)

Project `bxpferfuwoiulnqnfqhf`. Taken before the Program 1 migrations, then
updated with what M0-M2 changed. The ten migrations applied before this folder
existed (2025-04-25 to 2026-09-13: `archive_legacy_schema`, `mm_taxonomy`,
`mm_content_courses_and_programs`, `mm_assessments`, `mm_user_data_and_results`,
`mm_commerce_and_entitlements`, `security_hardening`,
`vo2_rockport_and_norm_bands`, two unnamed) are recorded in
`supabase_migrations.schema_migrations` on the project; their SQL is not in
this repo. Everything from 2026-09-28 on is in `supabase/migrations/`.

## Found on 2026-09-28

34 public tables, RLS on all. Seeded: pillars 4, categories 12, constructs 12,
gmmbb_axes 5, tier_systems 3, risk_tiers 10, population_overlays 6,
assessments 7, assessment_items 15, norm_tables 60, scoring_rules 3,
modality_swaps 4, studies 9, products 2. No member data (profiles 0).
Legacy tables live in schema `legacy`.

## Defects found and fixed in M0

| Finding | Fix (migration) |
| --- | --- |
| `categories` numbered Endurance 4 and Strength 5 (reverse of canon) | ids swapped, every reference remapped, canon CHECK added, `key` column (`P1-C4`) added (`20260928120000`) |
| `pillars.is_gated` = true for Balance & Brain Health | column dropped (`20260928120000`) |
| Product "Founding Member" sold access to a pillar | retired (`20260928120000`) |
| `handle_new_user`, `has_entitlement`, `can_access` SECURITY DEFINER and callable by anonymous visitors | trigger function revoked from API roles; entitlement checks switched to SECURITY INVOKER (`20260928121000`) |
| `clinical_profiles`, `payment_events`, `scoring_rules`: RLS with no policy | explicit staff-read policies (`20260928121000`) |
| Every member table granted to `anon` | revoked (`20260928121000`, `20260928122000`) |
| GraphQL endpoint exposing every table name | `pg_graphql` dropped (`20260928124000`) |

## Still open (dashboard settings, owner)

- Email OTP expiry is over one hour: set to 3600 seconds or less.
- Postgres 15.8.1.111 has security patches available: upgrade.
- `admin_members()` is a SECURITY DEFINER function callable by signed-in users
  by design; it refuses anyone who is not staff (tested).
