-- ============================================================
-- Hardening pass against the Supabase security advisors
-- ============================================================

-- 1. The archived legacy schema should not be reachable from the API at all.
revoke all on all tables in schema legacy from anon, authenticated;
revoke usage on schema legacy from anon, authenticated;

-- 2. Trigger functions must not be callable as RPC endpoints.
revoke execute on function public.handle_new_user() from anon, authenticated;

-- 3. Entitlement helpers: signed-in users may ask about their OWN access
--    (the functions read auth.uid() internally, so there is nothing to spoof),
--    but anonymous callers have no business probing them.
revoke execute on function public.has_entitlement(text) from anon;
revoke execute on function public.can_access(text) from anon;

-- 4. Legacy functions carried in by the restore: pin search_path or drop.
drop function if exists public.get_activity_summary(uuid, interval);
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'update_updated_at_column') then
    execute 'alter function public.update_updated_at_column() set search_path = public';
  end if;
end $$;

-- 5. Keep updated_at honest on the tables that carry it.
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;
revoke execute on function public.touch_updated_at() from anon, authenticated;

create trigger touch_profiles  before update on public.profiles  for each row execute function public.touch_updated_at();
create trigger touch_courses   before update on public.courses   for each row execute function public.touch_updated_at();
create trigger touch_lessons   before update on public.lessons   for each row execute function public.touch_updated_at();
create trigger touch_programs  before update on public.programs  for each row execute function public.touch_updated_at();
create trigger touch_assessments before update on public.assessments for each row execute function public.touch_updated_at();
