-- Preserve the 2025 VILPA-era tables (all 0 rows) out of the way of the
-- canonical MM™ schema. Nothing is dropped — they move to a `legacy` schema
-- and can be restored with a single ALTER ... SET SCHEMA public.
create schema if not exists legacy;

alter table public.activity_logs  set schema legacy;
alter table public.goals          set schema legacy;
alter table public.course_access  set schema legacy;
alter table public.assessments    set schema legacy;
alter table public.courses        set schema legacy;
alter table public.profiles       set schema legacy;

comment on schema legacy is 'Pre-2026 VILPA-era tables, archived empty during the canonical MM schema build. Safe to drop once confirmed unused.';
