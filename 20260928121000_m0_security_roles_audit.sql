-- M0 security fixes + M1 roles and audit foundation.
--
-- Closes the advisor findings recorded on 2026-09-27:
--   * handle_new_user / has_entitlement / can_access were SECURITY DEFINER
--     functions callable by anonymous visitors through /rest/v1/rpc.
--   * clinical_profiles, payment_events and scoring_rules had RLS on but no
--     policy, so their intended audience was undocumented.
--   * every member-data table was granted to the anon role.
-- Adds roles (member, coach, admin, owner, agent_service), a staff check,
-- an append-only audit log and coach assignments (schema only; UI later).

-- ── private schema: helpers that policies can call but the REST API cannot ──
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- ── roles ────────────────────────────────────────────────────────────────
do $$ begin
  create type public.app_role as enum ('member', 'coach', 'admin', 'owner', 'agent_service');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.app_role not null,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;

-- Roles to grant automatically when a known email signs up. Owner access for
-- the account holder without anyone typing SQL after launch.
create table if not exists private.role_bootstrap (
  email text primary key,
  role  public.app_role not null
);
insert into private.role_bootstrap (email, role)
values ('rbauer@bauerpt.com', 'owner')
on conflict (email) do nothing;

create or replace function private.has_role(r public.app_role)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role = r
  );
$$;

create or replace function private.is_staff()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role in ('admin', 'owner')
  );
$$;

revoke all on function private.has_role(public.app_role) from public;
revoke all on function private.is_staff() from public;
grant execute on function private.has_role(public.app_role) to anon, authenticated, service_role;
grant execute on function private.is_staff() to anon, authenticated, service_role;

drop policy if exists "own roles readable" on public.user_roles;
create policy "own roles readable" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff());

-- Only an owner may grant or remove roles; nobody can grant themselves one.
drop policy if exists "owner manages roles" on public.user_roles;
create policy "owner manages roles" on public.user_roles
  for insert to authenticated
  with check (private.has_role('owner') and user_id <> (select auth.uid()));
drop policy if exists "owner removes roles" on public.user_roles;
create policy "owner removes roles" on public.user_roles
  for delete to authenticated
  using (private.has_role('owner') and user_id <> (select auth.uid()));

-- ── new-user trigger: profile + bootstrap roles; no longer callable via RPC ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  select new.id, rb.role from private.role_bootstrap rb
  where lower(rb.email) = lower(new.email)
  on conflict do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ── entitlement checks run as the caller; RLS already limits them to own rows ──
alter function public.has_entitlement(text) security invoker;
alter function public.can_access(text) security invoker;

-- ── staff access, written down explicitly ────────────────────────────────
drop policy if exists "staff read profiles" on public.profiles;
create policy "staff read profiles" on public.profiles
  for select to authenticated using (private.is_staff());

drop policy if exists "staff read entitlements" on public.entitlements;
create policy "staff read entitlements" on public.entitlements
  for select to authenticated using (private.is_staff());
drop policy if exists "staff grant entitlements" on public.entitlements;
create policy "staff grant entitlements" on public.entitlements
  for insert to authenticated with check (private.is_staff() and source in ('manual', 'trial'));
drop policy if exists "staff revoke entitlements" on public.entitlements;
create policy "staff revoke entitlements" on public.entitlements
  for update to authenticated using (private.is_staff()) with check (private.is_staff());

drop policy if exists "staff read enrollments" on public.program_enrollments;
create policy "staff read enrollments" on public.program_enrollments
  for select to authenticated using (private.is_staff());

-- Clinician-only data: never readable by the member it describes (CCRAF rule).
drop policy if exists "staff read clinical profiles" on public.clinical_profiles;
create policy "staff read clinical profiles" on public.clinical_profiles
  for select to authenticated using (private.is_staff());

-- Payment events are written by server code with the service role only.
drop policy if exists "staff read payment events" on public.payment_events;
create policy "staff read payment events" on public.payment_events
  for select to authenticated using (private.is_staff());

drop policy if exists "staff read scoring rules" on public.scoring_rules;
create policy "staff read scoring rules" on public.scoring_rules
  for select to authenticated using (private.is_staff());

-- ── audit log: append-only ───────────────────────────────────────────────
create table if not exists public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  text,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
drop policy if exists "staff read audit" on public.audit_log;
create policy "staff read audit" on public.audit_log
  for select to authenticated using (private.is_staff());
drop policy if exists "staff append audit" on public.audit_log;
create policy "staff append audit" on public.audit_log
  for insert to authenticated with check (private.is_staff() and actor_id = (select auth.uid()));
-- no update or delete policy: the log cannot be edited through the API

-- ── coach assignments (schema now, coach UI in M5) ────────────────────────
create table if not exists public.coach_assignments (
  coach_id    uuid not null references auth.users (id) on delete cascade,
  member_id   uuid not null references auth.users (id) on delete cascade,
  program_id  uuid references public.programs (id) on delete set null,
  assigned_at timestamptz not null default now(),
  ended_at    timestamptz,
  primary key (coach_id, member_id)
);
alter table public.coach_assignments enable row level security;
drop policy if exists "coach sees own assignments" on public.coach_assignments;
create policy "coach sees own assignments" on public.coach_assignments
  for select to authenticated using (coach_id = (select auth.uid()) or private.is_staff());
drop policy if exists "staff manage assignments" on public.coach_assignments;
create policy "staff manage assignments" on public.coach_assignments
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

create or replace function private.coaches(member uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.coach_assignments ca
    where ca.coach_id = (select auth.uid()) and ca.member_id = member and ca.ended_at is null
  );
$$;
revoke all on function private.coaches(uuid) from public;
grant execute on function private.coaches(uuid) to authenticated, service_role;

-- ── anonymous visitors get nothing from member data ──────────────────────
revoke all on public.profiles, public.assessment_attempts, public.attempt_scores,
  public.field_test_results, public.program_enrollments, public.session_logs,
  public.weekly_audits, public.lesson_progress, public.clinical_profiles,
  public.entitlements, public.payment_events, public.user_roles,
  public.audit_log, public.coach_assignments, public.scoring_rules
  from anon;
