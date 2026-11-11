-- Assessment foundation: one answer store, one result store and one scores
-- table that every instrument shares (plan v3 §8 Q2/Q3, approved 2026-11-09).
--
-- 1. Category weights: the approved Pillar 3 and Pillar 4 splits (W-2, W-3,
--    decided 2026-10-08) replace the placeholder equal splits.
-- 2. assessment_responses.value (jsonb) holds any answer shape (1-5 rating,
--    choice code, checklist, number, text). raw_value keeps its 0-3 rule for
--    the Four-Lens check; a row carries exactly one of the two.
-- 3. assessment_results stays the one result row per session. The
--    Four-Lens-only columns become nullable, but a row written by a
--    Four-Lens algorithm must still fill every one of them. New: score_family
--    (which scale the result is on) and detail (the engine's full output).
-- 4. result_scores: total / pillar / category scores for any instrument,
--    each naming its scale (tier_systems). Write-once.
-- 5. result_flags: flags with an audience. A member sees only audience
--    'user'; clinician flags are staff and coach only. Write-once.
-- 6. assessments.legacy_code keeps the old instrument codes traceable.
--
-- Written only by the complete-assessment edge function (service role).
-- Members can never write a score, a flag or a result.

-- 1 ── approved category weights -----------------------------------------
update public.categories set weight_in_pillar = 0.3800 where key = 'P3-C8';
update public.categories set weight_in_pillar = 0.3000 where key = 'P3-C9';
update public.categories set weight_in_pillar = 0.3200 where key = 'P3-C10';
update public.categories set weight_in_pillar = 0.5400 where key = 'P4-C11';
update public.categories set weight_in_pillar = 0.4600 where key = 'P4-C12';
select public.assert_taxonomy_integrity();

-- 2 ── general answer value ------------------------------------------------
alter table public.assessment_responses add column if not exists value jsonb;
alter table public.assessment_responses drop constraint if exists assessment_responses_one_value_check;
alter table public.assessment_responses add constraint assessment_responses_one_value_check
  check (num_nonnulls(raw_value, value) = 1);

-- 3 ── one result row for every instrument ---------------------------------
alter table public.assessment_results
  alter column readiness_index      drop not null,
  alter column readiness_base_route drop not null,
  alter column readiness_route      drop not null,
  alter column lens_structure_need  drop not null,
  alter column lens_capacity_need   drop not null,
  alter column lens_function_need   drop not null,
  alter column lens_experience_need drop not null,
  alter column lens_profile         drop not null,
  alter column pillar1_priorities   drop not null,
  alter column baseline_metrics     drop not null;

alter table public.assessment_results drop constraint if exists assessment_results_flr_complete_check;
alter table public.assessment_results add constraint assessment_results_flr_complete_check check (
  algorithm_version not like 'flr-readiness-%' or (
        readiness_index is not null and readiness_base_route is not null and readiness_route is not null
    and lens_structure_need is not null and lens_capacity_need is not null
    and lens_function_need is not null and lens_experience_need is not null
    and lens_profile is not null and pillar1_priorities is not null and baseline_metrics is not null));

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
drop trigger if exists result_scores_immutable on public.result_scores;
create trigger result_scores_immutable before update on public.result_scores
  for each row execute function private.forbid_change();

drop policy if exists "own scores read" on public.result_scores;
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
drop trigger if exists result_flags_immutable on public.result_flags;
create trigger result_flags_immutable before update on public.result_flags
  for each row execute function private.forbid_change();

-- A member sees only flags written for them. Clinician flags (CCRAF) are
-- never shown to the member they describe.
drop policy if exists "own user flags read" on public.result_flags;
create policy "own user flags read" on public.result_flags
  for select to authenticated using (
    (user_id = (select auth.uid()) and audience = 'user') or private.is_staff() or private.coaches(user_id));

-- 6 ── legacy instrument codes ----------------------------------------------
alter table public.assessments add column if not exists legacy_code text unique;

revoke all on public.result_scores, public.result_flags from anon;

-- 7 ── one transaction for a result, its scores and its flags ---------------
-- Called only by complete-assessment with the service role. Write-once: if
-- the session already has a result, that result is returned unchanged and
-- nothing else is written, so a retry can never produce a second set of
-- scores or flags. Scores and flags always carry the result's own user_id.
create or replace function public.record_assessment_result(p_result jsonb, p_scores jsonb, p_flags jsonb)
returns public.assessment_results
language plpgsql security definer set search_path = ''
as $$
declare r public.assessment_results;
begin
  insert into public.assessment_results
  select * from jsonb_populate_record(null::public.assessment_results,
    p_result || jsonb_build_object('id', gen_random_uuid(), 'derived_at', now()))
  on conflict (session_id) do nothing
  returning * into r;

  if r.id is null then
    select * into r from public.assessment_results where session_id = (p_result ->> 'session_id')::uuid;
    return r;
  end if;

  insert into public.result_scores (result_id, user_id, scope, ref, score, tier_label, score_family)
  select r.id, r.user_id, s ->> 'scope', s ->> 'ref', (s ->> 'score')::numeric, s ->> 'tier_label', s ->> 'score_family'
  from jsonb_array_elements(coalesce(p_scores, '[]'::jsonb)) s;

  insert into public.result_flags (result_id, user_id, code, audience, message, reasons)
  select r.id, r.user_id, f ->> 'code', f ->> 'audience', f ->> 'message', coalesce(f -> 'reasons', '[]'::jsonb)
  from jsonb_array_elements(coalesce(p_flags, '[]'::jsonb)) f;

  update public.assessment_sessions set status = 'completed', completed_at = now()
  where id = r.session_id and status = 'in_progress';
  return r;
end $$;
revoke all on function public.record_assessment_result(jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.record_assessment_result(jsonb, jsonb, jsonb) to service_role;
