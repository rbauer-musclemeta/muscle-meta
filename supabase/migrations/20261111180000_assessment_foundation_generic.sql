-- Assessment foundation, part A (additive only): one answer store and one
-- scores and flags store shared by every instrument (plan v3 §8 Q2/Q3,
-- approved 2026-11-09). Part B (20261111180500) relaxes the Four-Lens-only
-- result columns, revokes anonymous access and adds the result writer.
--
-- 1. Category weights: the approved Pillar 3 and Pillar 4 splits (W-2, W-3,
--    decided 2026-10-08) replace the placeholder equal splits.
-- 2. assessment_responses.value (jsonb) holds any answer shape (1-5 rating,
--    choice code, checklist, number, text). raw_value keeps its 0-3 rule for
--    the Four-Lens check; a row carries exactly one of the two.
-- 3. assessment_results gains score_family (which scale the result is on)
--    and detail (the engine's full output).
-- 4. result_scores: total / pillar / category scores for any instrument,
--    each naming its scale (tier_systems). Write-once.
-- 5. result_flags: flags with an audience. A member sees only audience
--    'user'; clinician flags are staff and coach only. Write-once.
-- 6. assessments.legacy_code keeps the old instrument codes traceable.
--
-- Members can never write a score, a flag or a result: these tables have
-- read policies only; the complete-assessment edge function writes them.

-- 1 ── approved category weights -----------------------------------------
update public.categories set weight_in_pillar = 0.3800 where key = 'P3-C8';
update public.categories set weight_in_pillar = 0.3000 where key = 'P3-C9';
update public.categories set weight_in_pillar = 0.3200 where key = 'P3-C10';
update public.categories set weight_in_pillar = 0.5400 where key = 'P4-C11';
update public.categories set weight_in_pillar = 0.4600 where key = 'P4-C12';
select public.assert_taxonomy_integrity();

-- 2 ── general answer value ------------------------------------------------
alter table public.assessment_responses add column if not exists value jsonb;
alter table public.assessment_responses add constraint assessment_responses_one_value_check
  check (num_nonnulls(raw_value, value) = 1);

-- 3 ── result columns shared by every instrument ----------------------------
alter table public.assessment_results add column if not exists score_family text references public.tier_systems (code);
alter table public.assessment_results add column if not exists detail jsonb not null default '{}'::jsonb;

-- 4 ── scores -------------------------------------------------------------
create table if not exists public.result_scores (
  id           uuid primary key default gen_random_uuid(),
  result_id    uuid not null references public.assessment_results (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  scope        text not null check (scope in ('total', 'pillar', 'category')),
  ref          text not null,          -- 'total', pillar code E/N/R/B, or category key P#-C#
  score        numeric(5,1) not null,
  tier_label   text,
  score_family text not null references public.tier_systems (code),
  created_at   timestamptz not null default now(),
  unique (result_id, scope, ref),
  check ((scope = 'total' and ref = 'total')
      or (scope = 'pillar' and ref in ('E', 'N', 'R', 'B'))
      or (scope = 'category' and ref ~ '^P[1-4]-C([1-9]|1[0-2])$'))
);
alter table public.result_scores enable row level security;
create index if not exists result_scores_user_idx on public.result_scores (user_id, scope, ref);
create trigger result_scores_immutable before update on public.result_scores
  for each row execute function private.forbid_change();

create policy "own scores read" on public.result_scores
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
-- no insert/update/delete policies: only the service role (edge function) writes

-- 5 ── flags --------------------------------------------------------------
create table if not exists public.result_flags (
  id         uuid primary key default gen_random_uuid(),
  result_id  uuid not null references public.assessment_results (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  code       text not null,
  audience   text not null check (audience in ('user', 'clinician')),
  message    text,
  reasons    jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (result_id, code)
);
alter table public.result_flags enable row level security;
create index if not exists result_flags_user_idx on public.result_flags (user_id, code);
create trigger result_flags_immutable before update on public.result_flags
  for each row execute function private.forbid_change();

-- A member sees only flags written for them. Clinician flags (CCRAF) are
-- never shown to the member they describe.
create policy "own user flags read" on public.result_flags
  for select to authenticated using (
    (user_id = (select auth.uid()) and audience = 'user') or private.is_staff() or private.coaches(user_id));

-- 6 ── legacy instrument codes ----------------------------------------------
alter table public.assessments add column if not exists legacy_code text unique;
