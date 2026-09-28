-- M0 · Framework integrity (CLAUDE.md is the authority)
--
-- 1. Category numbering. The live table numbered Endurance 4 and Strength 5,
--    the reverse of the settled canon (P1-C4 Strength, P1-C5 Endurance).
--    Every referencing row was internally consistent, so the fix swaps the
--    two ids and remaps every reference; no data changes meaning.
-- 2. Gating. pillars.is_gated (Balance & Brain Health was TRUE) and the
--    "Founding Member" product that sold access to a pillar both contradict
--    "Gating is REMOVED". The column is dropped and the product retired.
-- 3. Adds categories.key ('P1-C4' …) as the stable key CLAUDE.md requires.


-- 1 ── swap category ids 4 <-> 5 through a temporary row ------------------
insert into public.categories (id, pillar_id, slug, name, position, weight_in_pillar)
select 99, pillar_id, 'tmp-endurance', 'tmp', 99, weight_in_pillar
from public.categories where id = 4;

update public.constructs       set category_id = 99 where category_id = 4;
update public.assessments      set category_id = 99 where category_id = 4;
update public.assessment_items set category_id = 99 where category_id = 4;
update public.courses          set category_id = 99 where category_id = 4;
update public.programs         set category_id = 99 where category_id = 4;
update public.studies          set category_id = 99 where category_id = 4;

update public.categories set slug = 'tmp-4', name = 'tmp' where id = 4;
update public.categories set slug = 'tmp-5', name = 'tmp' where id = 5;

update public.constructs       set category_id = 4 where category_id = 5;
update public.assessments      set category_id = 4 where category_id = 5;
update public.assessment_items set category_id = 4 where category_id = 5;
update public.courses          set category_id = 4 where category_id = 5;
update public.programs         set category_id = 4 where category_id = 5;
update public.studies          set category_id = 4 where category_id = 5;
update public.categories set slug = 'strength', name = 'Strength' where id = 4;

update public.constructs       set category_id = 5 where category_id = 99;
update public.assessments      set category_id = 5 where category_id = 99;
update public.assessment_items set category_id = 5 where category_id = 99;
update public.courses          set category_id = 5 where category_id = 99;
update public.programs         set category_id = 5 where category_id = 99;
update public.studies          set category_id = 5 where category_id = 99;
update public.categories set slug = 'endurance', name = 'Endurance' where id = 5;

delete from public.categories where id = 99;

-- 3 ── stable P#-C# key ----------------------------------------------------
alter table public.categories
  add column if not exists key text generated always as ('P' || pillar_id || '-C' || id) stored;
create unique index if not exists categories_key_idx on public.categories (key);

-- Canon guard: the two names that were swapped can never drift back.
alter table public.categories drop constraint if exists categories_canon_p1_check;
alter table public.categories add constraint categories_canon_p1_check check (
  (id <> 4 or slug = 'strength') and (id <> 5 or slug = 'endurance')
);

-- 2 ── no gate on any region of the framework -------------------------------
alter table public.pillars drop column if exists is_gated;

update public.products
   set status = 'retired',
       description = coalesce(description, '') ||
         ' [Retired 2026-09-28: sold access to a pillar; gating was removed from the framework.]'
 where slug = 'mm-founding-member';

select public.assert_taxonomy_integrity();

