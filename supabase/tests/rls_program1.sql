-- Program 1 access tests: allowed and denied operations for anonymous,
-- member (entitled / not entitled), another member, and staff.
--
-- Runs as one DO block against the live project and ALWAYS rolls back: it
-- ends by raising an exception whose message is the result. Nothing it
-- creates survives. Run it after any schema change:
--   Supabase SQL editor, or the Supabase MCP execute_sql tool.
-- Expected message: RLS_TESTS_PASSED checks=<n>

do $$
declare
  a uuid := gen_random_uuid();   -- entitled member
  b uuid := gen_random_uuid();   -- another entitled member
  c uuid := gen_random_uuid();   -- signed-in, not entitled
  s uuid := gen_random_uuid();   -- admin
  prog uuid; ver uuid; sess_a uuid; orient_a uuid; cyc_a uuid; res_a uuid;
  n int; ok boolean; checks int := 0; failures text[] := '{}';
begin
  select id into prog from public.programs where slug = 'four-lens-30';
  select v.id into ver from public.assessment_versions v join public.assessments x on x.id = v.assessment_id
   where x.code = 'FLR_READINESS_01' and v.status = 'published' order by v.published_at desc limit 1;

  insert into auth.users (id, email, aud, role, raw_user_meta_data, created_at, updated_at)
  values (a, 'rls-a@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (b, 'rls-b@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (c, 'rls-c@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (s, 'rls-s@test.invalid', 'authenticated', 'authenticated', '{}', now(), now());
  insert into public.user_roles (user_id, role) values (s, 'admin');
  insert into public.entitlements (user_id, feature_key, source) values
    (a, 'program:four-lens', 'manual'), (b, 'program:four-lens', 'manual');

  checks := checks + 1;
  if (select count(*) from public.user_roles where user_id = a and role = 'member') <> 1 then
    failures := failures || 'new user did not get the member role'; end if;

  ------------------------------------------------------------------ member A
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.assessment_versions where id = ver;
  if n <> 1 then failures := failures || 'A cannot read the published version'; end if;

  insert into public.orientation_sessions (program_id, orientation_reason, valued_function_goal, preferred_pace, safety_review_status, completed_at)
  values (prog, '{healthy_aging}', 'walking_stairs', 'steady', 'no', now()) returning id into orient_a;

  insert into public.assessment_sessions (assessment_version_id, orientation_session_id, program_id)
  values (ver, orient_a, prog) returning id into sess_a;
  insert into public.assessment_responses (session_id, question_code, raw_value)
  values (sess_a, 'recent_health_change', 1), (sess_a, 'structure_change', 0);

  checks := checks + 1; ok := false;
  begin insert into public.assessment_responses (session_id, question_code, raw_value) values (sess_a, 'not_a_question', 1);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'unknown question code accepted'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.assessment_responses (session_id, question_code, raw_value) values (sess_a, 'joint_limitation', 4);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'raw value 4 accepted'; end if;

  checks := checks + 1; ok := false;
  begin
    insert into public.assessment_results (session_id, user_id, assessment_version_id, algorithm_version, answer_fingerprint,
      safety_review_status, safety_route, readiness_index, readiness_base_route, readiness_route, ability_score,
      ability_level_calculated, ability_level, lens_structure_need, lens_capacity_need, lens_function_need,
      lens_experience_need, lens_profile, pillar1_priorities, baseline_metrics, reason_codes)
    values (sess_a, a, ver, 'forged', 'x', 'no', 'clear', 100, 'standard_start', 'standard_start', 100,
      'performance', 'performance', 0, 0, 0, 0, 'balanced', '[]', '{}', '{}');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member could write their own result'; end if;

  checks := checks + 1;
  -- the update is either filtered or rejected; it must not complete the session
  begin update public.assessment_sessions set status = 'completed', completed_at = now() where id = sess_a;
  exception when others then null; end;
  if exists (select 1 from public.assessment_sessions where id = sess_a and status = 'completed') then
    failures := failures || 'member marked their own session completed'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.entitlements (user_id, feature_key, source) values (a, 'coaching:four-lens-1to1', 'manual');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member granted themselves an entitlement'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.user_roles (user_id, role) values (a, 'admin');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member granted themselves a role'; end if;

  checks := checks + 1; ok := false;
  begin perform * from public.admin_members();
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member could list members'; end if;

  insert into public.progress_cycles (program_id, kind, selected_metrics)
  values (prog, 'baseline', '{chair_rise_30s,walking_distance}') returning id into cyc_a;
  insert into public.progress_measurements (cycle_id, metric_code, value, unit) values (cyc_a, 'chair_rise_30s', 12, 'reps');

  checks := checks + 1; ok := false;
  begin insert into public.progress_measurements (cycle_id, metric_code, value, unit) values (cyc_a, 'walking_distance', 99999, 'ft');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'out-of-range measurement accepted'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.progress_measurements (cycle_id, metric_code, value, unit) values (cyc_a, 'grip_strength', 50, 'kg');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'wrong unit accepted'; end if;

  execute 'reset role';

  ------------------------------------------------------------------ member B
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', b::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select (select count(*) from public.orientation_sessions where user_id = a)
       + (select count(*) from public.assessment_sessions where user_id = a)
       + (select count(*) from public.assessment_responses where user_id = a)
       + (select count(*) from public.progress_cycles where user_id = a)
       + (select count(*) from public.progress_measurements where user_id = a)
       + (select count(*) from public.profiles where id = a)
       + (select count(*) from public.entitlements where user_id = a)
    into n;
  if n <> 0 then failures := failures || format('member B read %s of member A''s rows', n); end if;

  checks := checks + 1; ok := false;
  begin insert into public.assessment_responses (session_id, question_code, raw_value) values (sess_a, 'joint_limitation', 1);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member B wrote into member A''s session'; end if;

  execute 'reset role';

  --------------------------------------------------------- member C, no access
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', c::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.assessment_versions where id = ver;
  if n <> 0 then failures := failures || 'non-entitled member read the assessment definition'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.orientation_sessions (program_id) values (prog);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'non-entitled member started orientation'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.assessment_sessions (assessment_version_id, program_id) values (ver, prog);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'non-entitled member started the assessment'; end if;

  execute 'reset role';

  ------------------------------------------------------------------ anonymous
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'set local role anon';

  checks := checks + 1; ok := false;
  begin perform count(*) from public.profiles;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'anonymous visitor could query profiles'; end if;

  checks := checks + 1; ok := false;
  begin perform count(*) from public.assessment_results;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'anonymous visitor could query results'; end if;

  execute 'reset role';

  ---------------------------------------------- server writes result; immutable
  insert into public.assessment_results (session_id, user_id, assessment_version_id, algorithm_version, answer_fingerprint,
      safety_review_status, safety_route, readiness_index, readiness_base_route, readiness_route, ability_score,
      ability_level_calculated, ability_level, lens_structure_need, lens_capacity_need, lens_function_need,
      lens_experience_need, lens_profile, pillar1_priorities, baseline_metrics, reason_codes)
  values (sess_a, a, ver, 'flr-readiness-alg-1.0.0', 'test', 'no', 'clear', 90, 'standard_start', 'standard_start', 90,
      'performance', 'performance', 0, 10, 10, 5, 'balanced', '[]', '{}', '{}') returning id into res_a;

  checks := checks + 1; ok := false;
  begin update public.assessment_results set readiness_route = 'modified_start' where id = res_a;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'a stored result could be edited'; end if;

  checks := checks + 1; ok := false;
  begin update public.assessment_versions set definition = '{}'::jsonb where id = ver;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'a published definition could be edited'; end if;

  ---------------------------------------------------------------------- staff
  insert into storage.objects (bucket_id, name, owner) values ('program-assets', 'rls-test/handout.pdf', s);
  insert into public.assets (title, kind, program_id, access_key, storage_path)
  values ('RLS test handout', 'handout', prog, 'program:four-lens', 'rls-test/handout.pdf');

  perform set_config('request.jwt.claims', json_build_object('sub', s, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', s::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.admin_members() where user_id in (a, b, c);
  if n <> 3 then failures := failures || 'admin could not list members'; end if;

  checks := checks + 1;
  select count(*) into n from public.assessment_results where user_id = a;
  if n <> 1 then failures := failures || 'admin could not read a member result'; end if;

  checks := checks + 1;
  insert into public.result_overrides (result_id, user_id, field, from_value, to_value, reason)
  values (res_a, a, 'readiness_route', 'standard_start', 'modified_start', 'Observed hesitation on stairs during intake call.');
  select count(*) into n from public.result_overrides where result_id = res_a;
  if n <> 1 then failures := failures || 'admin override not recorded'; end if;

  -- 2026-10-03: staff open every program without an entitlement (can_access).
  checks := checks + 1;
  select count(*) into n from public.programs where id = prog;
  if n <> 1 then failures := failures || 'admin without entitlement could not read the program'; end if;

  checks := checks + 1; ok := true;
  begin insert into public.orientation_sessions (program_id) values (prog);
  exception when others then ok := false; end;
  if not ok then failures := failures || 'admin without entitlement could not start orientation'; end if;

  execute 'reset role';

  -------------------------------------------------------- protected file access
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  execute 'set local role authenticated';
  checks := checks + 1;
  select count(*) into n from storage.objects where bucket_id = 'program-assets' and name = 'rls-test/handout.pdf';
  if n <> 1 then failures := failures || 'entitled member could not read the protected file'; end if;
  execute 'reset role';

  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', c::text, true);
  execute 'set local role authenticated';
  checks := checks + 1;
  select count(*) into n from storage.objects where bucket_id = 'program-assets' and name = 'rls-test/handout.pdf';
  if n <> 0 then failures := failures || 'non-entitled member could read the protected file'; end if;
  checks := checks + 1; ok := false;
  begin insert into storage.objects (bucket_id, name, owner) values ('program-assets', 'rls-test/evil.pdf', c);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member uploaded into the protected bucket'; end if;
  execute 'reset role';

  checks := checks + 1;
  select count(*) into n from public.audit_log where entity in ('entitlements', 'result_overrides', 'assets')
    and created_at > now() - interval '1 minute';
  if n < 3 then failures := failures || 'audit log missed access changes'; end if;

  if cardinality(failures) = 0 then
    raise exception 'RLS_TESTS_PASSED checks=%', checks;
  else
    raise exception 'RLS_TESTS_FAILED checks=% failures=%', checks, array_to_string(failures, ' | ');
  end if;
end $$;
-- Last run 2026-10-03 against bxpferfuwoiulnqnfqhf: RLS_TESTS_PASSED checks=29
