-- Shared assessment store access tests: MM_4P_01 sessions and answers,
-- result_scores, result_flags and record_assessment_result.
--
-- Runs as one DO block and ALWAYS rolls back: it ends by raising an
-- exception whose message is the result. Nothing it creates survives.
-- Run after any schema change, alongside rls_program1.sql:
--   Supabase SQL editor, or the Supabase MCP execute_sql tool.
-- Expected message: RLS_ASSESSMENTS_PASSED checks=<n>

do $$
declare
  a uuid := gen_random_uuid();   -- member taking the 4P
  b uuid := gen_random_uuid();   -- another member
  s uuid := gen_random_uuid();   -- admin
  ver uuid; sess_a uuid; res_a uuid; res_again uuid;
  n int; ok boolean; checks int := 0; failures text[] := '{}';
begin
  select v.id into ver from public.assessment_versions v join public.assessments x on x.id = v.assessment_id
   where x.code = 'MM_4P_01' and v.status = 'published' order by v.published_at desc limit 1;

  insert into auth.users (id, email, aud, role, raw_user_meta_data, created_at, updated_at)
  values (a, 'rls4p-a@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (b, 'rls4p-b@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (s, 'rls4p-s@test.invalid', 'authenticated', 'authenticated', '{}', now(), now());
  insert into public.user_roles (user_id, role) values (s, 'admin');

  ------------------------------------------------------------------ anonymous
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'set local role anon';

  checks := checks + 1;
  begin select count(*) into n from public.assessment_versions where id = ver;
  exception when others then n := 0; end;
  if n <> 0 then failures := failures || 'anonymous visitor read the 4P definition (sign-in required)'; end if;

  checks := checks + 1; ok := false;
  begin perform count(*) from public.result_scores;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'anonymous visitor could query result_scores'; end if;

  checks := checks + 1; ok := false;
  begin perform count(*) from public.result_flags;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'anonymous visitor could query result_flags'; end if;

  execute 'reset role';

  ------------------------------------------------------------------ member A
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.assessment_versions where id = ver;
  if n <> 1 then failures := failures || 'signed-in member cannot read the free 4P definition'; end if;

  -- free assessment, no program and no entitlement needed
  insert into public.assessment_sessions (assessment_version_id) values (ver) returning id into sess_a;
  insert into public.assessment_responses (session_id, question_code, value) values
    (sess_a, 'safety_review_status', '"no"'), (sess_a, 'jh_pain_frequency', '2'),
    (sess_a, 'mo_movement_difficulties', '["squatting"]');

  checks := checks + 1; ok := false;
  begin insert into public.assessment_responses (session_id, question_code, value) values (sess_a, 'not_a_question', '1');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'unknown 4P question code accepted'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.assessment_responses (session_id, question_code, raw_value, value) values (sess_a, 'jh_stiffness', 1, '1');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'a response with both raw_value and value accepted'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.assessment_responses (session_id, question_code) values (sess_a, 'jh_confidence');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'a response with no value accepted'; end if;

  checks := checks + 1; ok := false;
  begin perform public.record_assessment_result(
    jsonb_build_object('session_id', sess_a, 'user_id', a, 'assessment_version_id', ver, 'algorithm_version', 'mm-4p-alg-1.0.0',
      'answer_fingerprint', 'forged', 'safety_review_status', 'no', 'safety_route', 'clear', 'ability_score', 100,
      'ability_level_calculated', 'performance', 'ability_level', 'performance', 'reason_codes', '{}'::jsonb),
    '[]'::jsonb, '[]'::jsonb);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member could call record_assessment_result'; end if;

  checks := checks + 1; ok := false;
  begin
    insert into public.assessment_results (session_id, user_id, assessment_version_id, algorithm_version, answer_fingerprint,
      safety_review_status, safety_route, ability_score, ability_level_calculated, ability_level, reason_codes)
    values (sess_a, a, ver, 'mm-4p-alg-1.0.0', 'forged', 'no', 'clear', 100, 'performance', 'performance', '{}');
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member wrote their own 4P result'; end if;

  execute 'reset role';

  ------------------------------------------- server writes the result (service)
  select (public.record_assessment_result(
    jsonb_build_object('session_id', sess_a, 'user_id', a, 'assessment_version_id', ver, 'algorithm_version', 'mm-4p-alg-1.0.0',
      'answer_fingerprint', 'test', 'safety_review_status', 'no', 'safety_route', 'clear', 'ability_score', 80,
      'ability_level_calculated', 'performance', 'ability_level', 'performance', 'reason_codes', '{"level":["ABILITY_80_PLUS"]}'::jsonb,
      'score_family', 'mm_health_score'),
    '[{"scope":"total","ref":"total","score":72.5,"tier_label":"Functional","score_family":"mm_health_score"},
      {"scope":"pillar","ref":"E","score":80,"tier_label":"Functional","score_family":"mm_health_score"},
      {"scope":"category","ref":"P1-C4","score":75,"tier_label":"Functional","score_family":"mm_health_score"}]'::jsonb,
    '[{"code":"LOW_MOOD","audience":"user","message":"test","reasons":["BH4_EQ_1"]},
      {"code":"CLINICIAN_TEST","audience":"clinician","message":"clinician only","reasons":[]}]'::jsonb)).id into res_a;

  checks := checks + 1;
  if not exists (select 1 from public.assessment_sessions where id = sess_a and status = 'completed') then
    failures := failures || 'session not completed by the result writer'; end if;

  checks := checks + 1;
  select (public.record_assessment_result(
    jsonb_build_object('session_id', sess_a, 'user_id', a, 'assessment_version_id', ver, 'algorithm_version', 'mm-4p-alg-1.0.0',
      'answer_fingerprint', 'retry', 'safety_review_status', 'no', 'safety_route', 'clear', 'ability_score', 0,
      'ability_level_calculated', 'foundation', 'ability_level', 'foundation', 'reason_codes', '{}'::jsonb),
    '[{"scope":"total","ref":"total","score":1,"tier_label":"Critical","score_family":"mm_health_score"}]'::jsonb, '[]'::jsonb)).id into res_again;
  select count(*) into n from public.result_scores where result_id = res_a;
  if res_again <> res_a or n <> 3 then failures := failures || 'a retry wrote a second result or extra scores'; end if;

  checks := checks + 1; ok := false;
  begin update public.result_scores set score = 99 where result_id = res_a;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'a stored score could be edited'; end if;

  checks := checks + 1; ok := false;
  begin update public.result_flags set message = 'edited' where result_id = res_a;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'a stored flag could be edited'; end if;

  -- A real open session, so only the Four-Lens completeness rule can reject it.
  checks := checks + 1; ok := false;
  declare sess_x uuid; begin
    insert into public.assessment_sessions (user_id, assessment_version_id) values (a, ver) returning id into sess_x;
    begin
      insert into public.assessment_results (session_id, user_id, assessment_version_id, algorithm_version, answer_fingerprint,
        safety_review_status, safety_route, ability_score, ability_level_calculated, ability_level, reason_codes)
      values (sess_x, a, ver, 'flr-readiness-alg-1.0.0', 't', 'no', 'clear', 50, 'building', 'building', '{}');
    exception when check_violation then ok := true; end;
  end;
  if not ok then failures := failures || 'a Four-Lens result without its readiness and lens values was accepted'; end if;

  ------------------------------------------------------------------ member A reads
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.result_scores where result_id = res_a;
  if n <> 3 then failures := failures || format('member read %s of their 3 scores', n); end if;

  checks := checks + 1;
  select count(*) into n from public.result_flags where result_id = res_a;
  if n <> 1 then failures := failures || format('member saw %s flags; expected only the 1 user flag', n); end if;

  checks := checks + 1;
  select count(*) into n from public.result_flags where result_id = res_a and audience = 'clinician';
  if n <> 0 then failures := failures || 'member saw a clinician flag'; end if;

  execute 'reset role';

  ------------------------------------------------------------------ member B
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', b::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select (select count(*) from public.result_scores where user_id = a)
       + (select count(*) from public.result_flags where user_id = a)
       + (select count(*) from public.assessment_results where user_id = a)
       + (select count(*) from public.assessment_responses where user_id = a)
    into n;
  if n <> 0 then failures := failures || format('member B read %s of member A''s rows', n); end if;

  execute 'reset role';

  ---------------------------------------------------------------------- staff
  perform set_config('request.jwt.claims', json_build_object('sub', s, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', s::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.result_flags where result_id = res_a;
  if n <> 2 then failures := failures || 'admin could not read both flags'; end if;

  checks := checks + 1;
  select count(*) into n from public.result_scores where result_id = res_a;
  if n <> 3 then failures := failures || 'admin could not read the scores'; end if;

  execute 'reset role';

  if cardinality(failures) = 0 then
    raise exception 'RLS_ASSESSMENTS_PASSED checks=%', checks;
  else
    raise exception 'RLS_ASSESSMENTS_FAILED checks=% failures=%', checks, array_to_string(failures, ' | ');
  end if;
end $$;
