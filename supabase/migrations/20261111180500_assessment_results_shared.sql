-- Assessment foundation, part B: the changes that remove or narrow something.
--
-- 1. assessment_results stays the one result row per session. The
--    Four-Lens-only columns become nullable, but a row written by a
--    Four-Lens algorithm must still fill every one of them (check below;
--    production's existing Four-Lens results all satisfy it).
-- 2. Anonymous visitors get nothing from result_scores or result_flags.
-- 3. record_assessment_result writes a result, its scores and its flags in
--    one transaction. It is created and locked down in the same migration:
--    a new function is executable by everyone until revoked, and a member
--    must never be able to call it.

-- 1 ── one result row for every instrument ---------------------------------
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

alter table public.assessment_results add constraint assessment_results_flr_complete_check check (
  algorithm_version not like 'flr-readiness-%' or (
        readiness_index is not null and readiness_base_route is not null and readiness_route is not null
    and lens_structure_need is not null and lens_capacity_need is not null
    and lens_function_need is not null and lens_experience_need is not null
    and lens_profile is not null and pillar1_priorities is not null and baseline_metrics is not null));

-- 2 ── no anonymous access to scores or flags ------------------------------
revoke all on public.result_scores, public.result_flags from anon;

-- 3 ── one transaction for a result, its scores and its flags ---------------
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
  -- jsonb_populate_record does not apply column defaults: supply them here.
  select * from jsonb_populate_record(null::public.assessment_results,
    jsonb_build_object('detail', '{}'::jsonb) || p_result
      || jsonb_build_object('id', gen_random_uuid(), 'derived_at', now()))
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
