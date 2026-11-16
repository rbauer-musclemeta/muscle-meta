-- Course access tests for The Muscle-Metabolic Health Matrix: lessons,
-- worksheets and lesson progress for anonymous, entitled, other-course and
-- not-entitled members, and staff.
--
-- Same pattern as rls_program1.sql: one DO block that ALWAYS rolls back by
-- raising its result. Run after applying 20261116120000 and after any schema
-- change. Expected message: RLS_TESTS_PASSED checks=<n>

do $$
declare
  a uuid := gen_random_uuid();   -- owns the course
  b uuid := gen_random_uuid();   -- owns the course (another member)
  c uuid := gen_random_uuid();   -- signed in, owns only the Four-Lens program
  s uuid := gen_random_uuid();   -- admin
  prog uuid; mod1 uuid; les uuid; asset_path text := 'metabolic-health-matrix/worksheets/rls-test.pdf';
  n int; ok boolean; checks int := 0; failures text[] := '{}';
begin
  select id into prog from public.programs where slug = 'metabolic-health-matrix';
  select m.id into mod1 from public.modules m join public.courses x on x.id = m.course_id
   where x.slug = 'metabolic-health-matrix' and m.slug = 'module-1';
  if prog is null or mod1 is null then raise exception 'RLS_TESTS_FAILED course rows missing: apply 20261116120000 first'; end if;

  insert into auth.users (id, email, aud, role, raw_user_meta_data, created_at, updated_at)
  values (a, 'rls-ca@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (b, 'rls-cb@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (c, 'rls-cc@test.invalid', 'authenticated', 'authenticated', '{}', now(), now()),
         (s, 'rls-cs@test.invalid', 'authenticated', 'authenticated', '{}', now(), now());
  insert into public.user_roles (user_id, role) values (s, 'admin');
  insert into public.entitlements (user_id, feature_key, source) values
    (a, 'course:metabolic-health', 'manual'), (b, 'course:metabolic-health', 'manual'), (c, 'program:four-lens', 'manual');

  ---------------------------------------------------------------------- staff
  perform set_config('request.jwt.claims', json_build_object('sub', s, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', s::text, true);
  execute 'set local role authenticated';

  checks := checks + 1; ok := true;
  begin
    insert into public.lessons (module_id, slug, title, position, body_md, content, est_minutes, content_version)
    values (mod1, 'rls-test-lesson', 'RLS test lesson', 99, 'Paid text', '{"kind":"lesson"}', 5, 'test')
    returning id into les;
  exception when others then ok := false; end;
  if not ok then failures := failures || 'staff could not import a lesson'; end if;

  insert into storage.objects (bucket_id, name, owner) values ('program-assets', asset_path, s);
  insert into public.assets (title, kind, program_id, module_id, lesson_id, access_key, storage_path)
  values ('RLS worksheet', 'worksheet', prog, mod1, les, 'course:metabolic-health', asset_path);
  execute 'reset role';

  ------------------------------------------------------------------ member A
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', a::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.lessons where id = les and body_md is not null;
  if n <> 1 then failures := failures || 'entitled member cannot read the lesson'; end if;

  checks := checks + 1;
  select count(*) into n from storage.objects where bucket_id = 'program-assets' and name = asset_path;
  if n <> 1 then failures := failures || 'entitled member cannot open the worksheet'; end if;

  checks := checks + 1; ok := true;
  begin insert into public.lesson_progress (user_id, lesson_id, track, completed_at) values (a, les, 'builder', now());
  exception when others then ok := false; end;
  if not ok then failures := failures || 'member could not save progress'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.lesson_progress (user_id, lesson_id) values (b, les);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member wrote progress for another member'; end if;

  checks := checks + 1;
  begin update public.lessons set body_md = 'edited by member' where id = les; exception when others then null; end;
  if exists (select 1 from public.lessons where id = les and body_md = 'edited by member') then
    failures := failures || 'member edited lesson content'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.lesson_progress (user_id, lesson_id, track) values (a, les, 'elite')
    on conflict (user_id, lesson_id) do update set track = excluded.track;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'unknown track accepted'; end if;
  execute 'reset role';

  ------------------------------------------------------------------ member B
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', b::text, true);
  execute 'set local role authenticated';
  checks := checks + 1;
  select count(*) into n from public.lesson_progress where user_id = a;
  if n <> 0 then failures := failures || 'member read another member''s progress'; end if;
  execute 'reset role';

  ------------------------------------------- member C (other program only)
  perform set_config('request.jwt.claims', json_build_object('sub', c, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', c::text, true);
  execute 'set local role authenticated';

  checks := checks + 1;
  select count(*) into n from public.lessons where id = les;
  if n <> 0 then failures := failures || 'member without the course read a lesson'; end if;

  checks := checks + 1;
  select count(*) into n from storage.objects where bucket_id = 'program-assets' and name = asset_path;
  if n <> 0 then failures := failures || 'member without the course opened the worksheet'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.lesson_progress (user_id, lesson_id) values (c, les);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member saved progress on a lesson they cannot read'; end if;

  checks := checks + 1; ok := false;
  begin insert into public.lessons (module_id, slug, title, position) values (mod1, 'rls-evil', 'Evil', 98);
  exception when others then ok := true; end;
  if not ok then failures := failures || 'member inserted a lesson'; end if;
  execute 'reset role';

  ---------------------------------------------------------------- anonymous
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('request.jwt.claim.sub', '', true);
  execute 'set local role anon';
  checks := checks + 1; ok := false;
  begin select count(*) into n from public.lessons; if n = 0 then ok := true; end if;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'anonymous visitor read lessons'; end if;
  checks := checks + 1; ok := false;
  begin select count(*) into n from public.lesson_progress;
  exception when others then ok := true; end;
  if not ok then failures := failures || 'anonymous visitor could query lesson progress'; end if;
  execute 'reset role';

  if cardinality(failures) = 0 then
    raise exception 'RLS_TESTS_PASSED checks=%', checks;
  else
    raise exception 'RLS_TESTS_FAILED checks=% failures=%', checks, array_to_string(failures, ' | ');
  end if;
end $$;
-- Not yet run: apply the migration first, then record the result here.
