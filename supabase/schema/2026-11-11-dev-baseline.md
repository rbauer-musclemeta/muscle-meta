# Dev baseline: full migration history replayed (2026-11-11)

Development project `ikjadymjalaelkpivveh` now carries the same schema and
reference data as production `bxpferfuwoiulnqnfqhf`, built only from the
files in `supabase/migrations/`. Production was read, never written.

## What was done

1. Production's `supabase_migrations.schema_migrations` records the SQL of
   every migration it ran. The ten that pre-date this folder were recovered
   into files under their original version numbers:
   - Nine match production's stored SQL byte for byte (md5 checked).
   - `20250425191103_violet_bush.sql` was stored with literal `\n` sequences
     and a plpgsql body split at its inner semicolons. Only its formatting
     was repaired; see the file header.
2. All 18 migrations were applied to dev in order. Because the real history
   is replayed, the Endurance/Strength id swap in `20260928120000` runs
   against the same pre-swap state it ran against in production.
3. Dev's `schema_migrations.version` values were set to the repo filenames.

## Verification

Same read-only fingerprint query on both projects:

| Area | Result |
|---|---|
| Columns (517), constraints (243), indexes (110) | identical |
| RLS policies (91), RLS flags (54), triggers (19) | identical |
| Functions (15), table grants (483), function grants (22), enums (16) | identical |
| Reference data, 26 tables (pillars, categories, assessments, items, norms, studies, products, metrics, FLR v1 definition, ...) | identical row by row |
| Extensions | production also has `pgjwt` and `pg_stat_statements` 1.10 (platform image, not a migration) |

- `supabase/tests/rls_program1.sql` on dev: `RLS_TESTS_PASSED checks=29`.
- Security advisors on dev: one warning, `admin_members()` callable by
  `authenticated`. Intended: the function raises unless `private.is_staff()`.
  Production shows the same, plus Postgres 15.8 patches outstanding and
  leaked-password protection off (dev runs Postgres 17).

## Production needs a one-time history repair before these files deploy

Production recorded the eight post-folder migrations under different version
numbers from the repo files. Until that is repaired, `supabase db push` would
try to re-run them. Run once, with Randy's approval, against production:

```
# mark the repo versions as applied (the SQL already ran under other numbers)
supabase migration repair --status applied 20260928120000 20260928121000 \
  20260928122000 20260928123000 20260928124000 20261003170000 20261003200000 \
  20261003210000
# forget the old numbers
supabase migration repair --status reverted 20260928151111 20260928151244 \
  20260928152015 20260928152042 20260928152250 20261003170450 20261003195716 \
  20261003195835
```

The ten recovered files already carry production's own version numbers, so
they need no repair.
