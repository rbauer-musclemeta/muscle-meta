-- ============================================================
-- MM™ USER DATA — profiles, attempts, scores, logs
-- Every table is owner-scoped through auth.uid(). Clinician-facing
-- output lives in its own table and never joins into a user view.
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birth_year smallint check (birth_year between 1900 and 2100),
  sex text check (sex in ('female','male','prefer_not_to_say')),
  height_cm numeric(5,1),
  resting_hr smallint,
  waist_cm numeric(5,1),
  unit_preference text not null default 'imperial' check (unit_preference in ('metric','imperial')),
  overlays text[] not null default '{}',          -- population overlays, stackable
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever an auth user is created (OAuth included)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Assessment attempts ----------
create table public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  total_score numeric,
  tier_system text references public.tier_systems(code),
  tier_label text,
  safety_flag boolean not null default false,
  created_at timestamptz not null default now()
);

-- One flexible scores table instead of five parallel ones. `scope` says what
-- `ref_slug` points at, so construct/category/pillar/axis/total all coexist.
create table public.attempt_scores (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.assessment_attempts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null check (scope in ('construct','category','pillar','axis','total')),
  ref_slug text,
  score numeric not null,
  max_score numeric,
  tier_label text,
  recorded_at timestamptz not null default now()
);

-- ---------- Field test results (the Oxygen Engine calculators write here) ----------
create table public.field_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assessment_code text not null,                  -- VO2_6MWT | VO2_COOPER | STS30
  performed_at timestamptz not null default now(),
  raw_value numeric not null,
  raw_unit text not null,                         -- m | yd | reps
  value_si numeric not null,                      -- normalized: meters or reps
  derived_metric text,                            -- vo2max_ml_kg_min | vo2_at_pace | sts_reps
  derived_value numeric,
  mets numeric,
  interpretation text,
  notes text
);

-- ---------- Program enrollment and session logging ----------
create table public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.programs(id),
  started_on date not null default current_date,
  current_week smallint not null default 1,
  status text not null default 'active' check (status in ('active','paused','completed','abandoned')),
  created_at timestamptz not null default now(),
  unique (user_id, program_id, started_on)
);

create table public.session_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  enrollment_id uuid references public.program_enrollments(id) on delete cascade,
  session_id uuid references public.program_sessions(id),
  performed_at timestamptz not null default now(),
  completed boolean not null default true,
  actual_minutes smallint,
  avg_hr smallint,
  peak_hr smallint,
  rpe smallint check (rpe between 1 and 10),
  modality text,
  notes text
);

-- ---------- Weekly recovery audit (Module 6) ----------
create table public.weekly_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_of date not null default current_date,
  resting_hr smallint,
  rhr_trend text check (rhr_trend in ('stable','elevated')),
  energy smallint check (energy between 1 and 10),
  joint_response text check (joint_response in ('settled','lingered')),
  easy_day_discipline text check (easy_day_discipline in ('held','drifted')),
  flags_count smallint not null default 0,
  prescription text,                              -- progress | hold | pull_back
  created_at timestamptz not null default now(),
  unique (user_id, week_of)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  seconds_watched integer not null default 0,
  unique (user_id, lesson_id)
);

-- ---------- Clinician-facing output, walled off ----------
create table public.clinical_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid references public.assessment_attempts(id) on delete cascade,
  ccraf_score numeric,
  compound_risk_flags jsonb,
  evidence_basis jsonb,                           -- never rendered in a user view
  clinician_notes text,
  created_at timestamptz not null default now()
);

create index on public.assessment_attempts (user_id, assessment_id);
create index on public.attempt_scores (user_id, scope);
create index on public.field_test_results (user_id, assessment_code, performed_at desc);
create index on public.session_logs (user_id, performed_at desc);
create index on public.weekly_audits (user_id, week_of desc);

-- ---------- RLS: owner-only across the board ----------
alter table public.profiles              enable row level security;
alter table public.assessment_attempts   enable row level security;
alter table public.attempt_scores        enable row level security;
alter table public.field_test_results    enable row level security;
alter table public.program_enrollments   enable row level security;
alter table public.session_logs          enable row level security;
alter table public.weekly_audits         enable row level security;
alter table public.lesson_progress       enable row level security;
alter table public.clinical_profiles     enable row level security;

create policy "own profile read"   on public.profiles for select using ((select auth.uid()) = id);
create policy "own profile write"  on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert with check ((select auth.uid()) = id);

create policy "own attempts read"   on public.assessment_attempts for select using ((select auth.uid()) = user_id);
create policy "own attempts insert" on public.assessment_attempts for insert with check ((select auth.uid()) = user_id);
create policy "own attempts update" on public.assessment_attempts for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own scores read"   on public.attempt_scores for select using ((select auth.uid()) = user_id);
create policy "own scores insert" on public.attempt_scores for insert with check ((select auth.uid()) = user_id);

create policy "own field tests read"   on public.field_test_results for select using ((select auth.uid()) = user_id);
create policy "own field tests insert" on public.field_test_results for insert with check ((select auth.uid()) = user_id);
create policy "own field tests update" on public.field_test_results for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own field tests delete" on public.field_test_results for delete using ((select auth.uid()) = user_id);

create policy "own enrollments read"   on public.program_enrollments for select using ((select auth.uid()) = user_id);
create policy "own enrollments write"  on public.program_enrollments for insert with check ((select auth.uid()) = user_id);
create policy "own enrollments update" on public.program_enrollments for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own session logs read"   on public.session_logs for select using ((select auth.uid()) = user_id);
create policy "own session logs insert" on public.session_logs for insert with check ((select auth.uid()) = user_id);
create policy "own session logs update" on public.session_logs for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own audits read"   on public.weekly_audits for select using ((select auth.uid()) = user_id);
create policy "own audits insert" on public.weekly_audits for insert with check ((select auth.uid()) = user_id);
create policy "own audits update" on public.weekly_audits for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "own progress read"   on public.lesson_progress for select using ((select auth.uid()) = user_id);
create policy "own progress write"  on public.lesson_progress for insert with check ((select auth.uid()) = user_id);
create policy "own progress update" on public.lesson_progress for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- clinical_profiles: RLS on, NO client policy. Service role / clinician backend only.
