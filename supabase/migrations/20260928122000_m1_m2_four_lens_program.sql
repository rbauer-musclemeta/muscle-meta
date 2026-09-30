-- M1 + M2 · Program 1 (30-Day Four-Lens Program) on reusable engines.
--
-- Reuses: programs, products, prices, entitlements, program_enrollments,
-- assessments, courses/modules/lessons, profiles.
-- Adds: assessment_versions (immutable published definitions),
-- orientation_sessions, assessment_sessions, assessment_responses,
-- assessment_results (immutable, written only by the complete-assessment
-- edge function), result_overrides (append-only), metric_definitions,
-- progress_cycles, progress_measurements, assets + a private storage bucket,
-- and admin_members() for the admin console.
--
-- Separation rules enforced here, not just in the UI:
--   * orientation is stored apart from scoring and never read by it except
--     the safety answer, which routes and never scores;
--   * raw responses, derived results and human overrides are separate rows;
--   * a published definition or a derived result cannot be edited;
--   * members can never write a result or grant themselves access.

-- ── Program 1 records ────────────────────────────────────────────────────
insert into public.courses (slug, title, subtitle, pillar_id, access_key, status, position)
values ('four-lens-30', '30-Day Four-Lens Program', 'Where to start, what to measure, what changed, what next', 1, 'program:four-lens', 'draft', 1)
on conflict (slug) do nothing;

alter table public.programs add column if not exists course_id uuid references public.courses (id) on delete set null;

insert into public.programs (slug, title, subtitle, description, pillar_id, goal, duration_weeks, access_key, status, course_id)
select 'four-lens-30', '30-Day Four-Lens Program',
       'Where should I start, what should I measure, what changed, what next?',
       'Program 1. Orientation, a ten-question readiness and ability check, goal-matched baseline measures, a four-week course and a Day 30 reassessment.',
       1, 'Establish a measured baseline across the Four Lenses and route to the right starting point.',
       4, 'program:four-lens', 'published', c.id
from public.courses c where c.slug = 'four-lens-30'
on conflict (slug) do nothing;

insert into public.modules (course_id, slug, title, summary, position)
select c.id, m.slug, m.title, m.summary, m.position
from public.courses c,
  (values
    ('week-1', 'Week 1: know what you are measuring', 'The Four Lenses, matching measures to your goal, your baseline, why one number can mislead.', 1),
    ('week-2', 'Week 2: build capacity', 'Strength, power and endurance.', 2),
    ('week-3', 'Week 3: turn capacity into function', 'Stairs, chair rise, walking, carrying, floor transfer and recreation.', 3),
    ('week-4', 'Week 4: reassess and progress', 'Repeat measures, interpret change and choose your next route.', 4)
  ) as m(slug, title, summary, position)
where c.slug = 'four-lens-30'
on conflict (course_id, slug) do nothing;

insert into public.products (slug, name, description, feature_key, is_subscription, status)
values
  ('four-lens-self-guided', '30-Day Four-Lens Program: self-guided',
   'Monthly. Program access, saved results and progress tracking.', 'program:four-lens', true, 'draft'),
  ('four-lens-one-to-one', '30-Day Four-Lens Program: one-to-one',
   'Monthly. Program access plus one-to-one coaching with Randy Bauer, PT.', 'coaching:four-lens-1to1', true, 'draft')
on conflict (slug) do nothing;

insert into public.prices (product_id, currency, unit_amount, interval, is_default, active)
select p.id, 'usd', 4700, 'month', true, true from public.products p
where p.slug = 'four-lens-self-guided'
  and not exists (select 1 from public.prices x where x.product_id = p.id);
-- One-to-one price: not set yet (Randy to decide). No price row until then.

insert into public.assessments (code, title, short_title, description, instrument_kind, audience, pillar_id,
                                access_key, est_minutes, version, status, safety_note)
values ('FLR_READINESS_01', 'Four-Lens readiness and ability check', 'Readiness check',
        'Ten items, each rated 0 (little or no limitation) to 3 (significant limitation). Produces readiness, ability, a Four-Lens profile and a Pillar 1 priority profile. Not the Muscle-Meta Health Score.',
        'questionnaire', 'user', 1, 'program:four-lens', 4, 1, 'published',
        'Pilot routing thresholds, not validated clinical cut points. Safety answers change the route, never a score.')
on conflict (code) do nothing;

-- ── assessment versions: definitions are immutable once published ────────
create table if not exists public.assessment_versions (
  id                uuid primary key default gen_random_uuid(),
  assessment_id     uuid not null references public.assessments (id) on delete restrict,
  version_label     text not null,
  algorithm_version text not null,
  status            text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  definition        jsonb not null,
  approval_note     text,
  approved_by       uuid references auth.users (id) on delete set null,
  approved_at       timestamptz,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (assessment_id, version_label)
);
alter table public.assessment_versions enable row level security;

create or replace function private.freeze_published_version()
returns trigger language plpgsql set search_path = ''
as $$
begin
  if old.status = 'published' and (
       new.definition is distinct from old.definition
    or new.algorithm_version is distinct from old.algorithm_version
    or new.version_label is distinct from old.version_label
    or new.assessment_id is distinct from old.assessment_id
    or new.status not in ('published', 'retired')) then
    raise exception 'Published assessment version % is immutable; publish a new version instead', old.version_label;
  end if;
  if old.status = 'retired' and new.status <> 'retired' then
    raise exception 'A retired assessment version cannot be reactivated';
  end if;
  return new;
end $$;
drop trigger if exists freeze_published_version on public.assessment_versions;
create trigger freeze_published_version before update on public.assessment_versions
  for each row execute function private.freeze_published_version();

drop policy if exists "published versions readable by access" on public.assessment_versions;
create policy "published versions readable by access" on public.assessment_versions
  for select to authenticated using (
    private.is_staff() or (
      status = 'published' and exists (
        select 1 from public.assessments a
        where a.id = assessment_versions.assessment_id and public.can_access(a.access_key)))
  );
drop policy if exists "staff manage versions" on public.assessment_versions;
create policy "staff manage versions" on public.assessment_versions
  for insert to authenticated with check (private.is_staff());
drop policy if exists "staff update versions" on public.assessment_versions;
create policy "staff update versions" on public.assessment_versions
  for update to authenticated using (private.is_staff()) with check (private.is_staff());

-- ── orientation (non-scored) ─────────────────────────────────────────────
create table if not exists public.orientation_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id              uuid not null references public.programs (id),
  orientation_version     text not null default 'FLR_ORIENTATION_01',
  orientation_reason      text[] not null default '{}',
  valued_function_goal    text,
  assessment_support_need text[] not null default '{}',
  preferred_pace          text,
  safety_review_status    text check (safety_review_status in ('no', 'yes', 'not_sure')),
  completed_at            timestamptz,
  safety_answered_at      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  check (cardinality(orientation_reason) <= 2)
);
alter table public.orientation_sessions enable row level security;
create index if not exists orientation_sessions_user_idx on public.orientation_sessions (user_id, program_id, created_at desc);
drop trigger if exists touch_orientation on public.orientation_sessions;
create trigger touch_orientation before update on public.orientation_sessions
  for each row execute function public.touch_updated_at();

drop policy if exists "own orientation" on public.orientation_sessions;
create policy "own orientation" on public.orientation_sessions
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
drop policy if exists "own orientation insert" on public.orientation_sessions;
create policy "own orientation insert" on public.orientation_sessions
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.programs p where p.id = program_id and public.can_access(p.access_key)));
drop policy if exists "own orientation update" on public.orientation_sessions;
create policy "own orientation update" on public.orientation_sessions
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ── assessment sessions: pinned to one published version at start ────────
create table if not exists public.assessment_sessions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null default auth.uid() references auth.users (id) on delete cascade,
  assessment_version_id  uuid not null references public.assessment_versions (id),
  orientation_session_id uuid references public.orientation_sessions (id) on delete set null,
  program_id             uuid references public.programs (id),
  status                 text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at             timestamptz not null default now(),
  completed_at           timestamptz
);
alter table public.assessment_sessions enable row level security;
create index if not exists assessment_sessions_user_idx on public.assessment_sessions (user_id, started_at desc);
-- one open session per member per version
create unique index if not exists assessment_sessions_one_open
  on public.assessment_sessions (user_id, assessment_version_id) where status = 'in_progress';

drop policy if exists "own sessions read" on public.assessment_sessions;
create policy "own sessions read" on public.assessment_sessions
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
drop policy if exists "own sessions start" on public.assessment_sessions;
create policy "own sessions start" on public.assessment_sessions
  for insert to authenticated with check (
    user_id = (select auth.uid()) and status = 'in_progress' and completed_at is null and exists (
      select 1 from public.assessment_versions v join public.assessments a on a.id = v.assessment_id
      where v.id = assessment_version_id and v.status = 'published' and public.can_access(a.access_key)));
-- members may abandon their own open session; completion is server-only
drop policy if exists "own sessions abandon" on public.assessment_sessions;
create policy "own sessions abandon" on public.assessment_sessions
  for update to authenticated
  using (user_id = (select auth.uid()) and status = 'in_progress')
  with check (user_id = (select auth.uid()) and status in ('in_progress', 'abandoned') and completed_at is null);

-- ── raw responses ────────────────────────────────────────────────────────
create table if not exists public.assessment_responses (
  session_id    uuid not null references public.assessment_sessions (id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_code text not null,
  raw_value     smallint check (raw_value between 0 and 3),
  answered_at   timestamptz not null default now(),
  primary key (session_id, question_code)
);
alter table public.assessment_responses enable row level security;

-- A response must name a question that exists in the session's pinned version.
create or replace function private.check_response_question()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare def jsonb;
begin
  select v.definition into def
  from public.assessment_sessions s join public.assessment_versions v on v.id = s.assessment_version_id
  where s.id = new.session_id;
  if def is null or not exists (
    select 1 from jsonb_array_elements(def -> 'questions') q where q ->> 'field' = new.question_code) then
    raise exception 'Question % is not part of this assessment version', new.question_code;
  end if;
  new.answered_at := now();
  return new;
end $$;
drop trigger if exists check_response_question on public.assessment_responses;
create trigger check_response_question before insert or update on public.assessment_responses
  for each row execute function private.check_response_question();

drop policy if exists "own responses read" on public.assessment_responses;
create policy "own responses read" on public.assessment_responses
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
drop policy if exists "own responses write" on public.assessment_responses;
create policy "own responses write" on public.assessment_responses
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.assessment_sessions s
      where s.id = session_id and s.user_id = (select auth.uid()) and s.status = 'in_progress'));
drop policy if exists "own responses change" on public.assessment_responses;
create policy "own responses change" on public.assessment_responses
  for update to authenticated
  using (user_id = (select auth.uid()) and exists (
      select 1 from public.assessment_sessions s
      where s.id = session_id and s.user_id = (select auth.uid()) and s.status = 'in_progress'))
  with check (user_id = (select auth.uid()));

-- ── derived results: written once by the edge function, never edited ─────
create table if not exists public.assessment_results (
  id                       uuid primary key default gen_random_uuid(),
  session_id               uuid not null unique references public.assessment_sessions (id) on delete cascade,
  user_id                  uuid not null references auth.users (id) on delete cascade,
  assessment_version_id    uuid not null references public.assessment_versions (id),
  algorithm_version        text not null,
  answer_fingerprint       text not null,
  safety_review_status     text not null check (safety_review_status in ('no', 'yes', 'not_sure')),
  safety_route             text not null check (safety_route in ('clear', 'professional_review')),
  readiness_index          numeric(5,1) not null,
  readiness_base_route     text not null check (readiness_base_route in ('standard_start', 'modified_start', 'professional_review')),
  readiness_route          text not null check (readiness_route in ('standard_start', 'modified_start', 'professional_review')),
  ability_score            numeric(5,1) not null,
  ability_level_calculated text not null check (ability_level_calculated in ('foundation', 'building', 'performance')),
  ability_level            text not null check (ability_level in ('foundation', 'building', 'performance')),
  lens_structure_need      numeric(5,1) not null,
  lens_capacity_need       numeric(5,1) not null,
  lens_function_need       numeric(5,1) not null,
  lens_experience_need     numeric(5,1) not null,
  lens_profile             text not null check (lens_profile in ('focused', 'balanced')),
  primary_lens             text check (primary_lens in ('structure', 'capacity', 'function', 'experience')),
  secondary_lens           text check (secondary_lens in ('structure', 'capacity', 'function', 'experience')),
  pillar1_priorities       jsonb not null,
  baseline_metrics         text[] not null,
  reason_codes             jsonb not null,
  derived_at               timestamptz not null default now()
);
alter table public.assessment_results enable row level security;
create index if not exists assessment_results_user_idx on public.assessment_results (user_id, derived_at desc);

create or replace function private.forbid_change()
returns trigger language plpgsql set search_path = ''
as $$
begin
  raise exception '% rows are immutable; append a new record instead', tg_table_name;
end $$;
drop trigger if exists results_immutable on public.assessment_results;
create trigger results_immutable before update on public.assessment_results
  for each row execute function private.forbid_change();

drop policy if exists "own results read" on public.assessment_results;
create policy "own results read" on public.assessment_results
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
-- no insert/update/delete policies: only the service role (edge function) writes

-- ── human overrides: appended, never replacing the instrument result ─────
create table if not exists public.result_overrides (
  id          uuid primary key default gen_random_uuid(),
  result_id   uuid not null references public.assessment_results (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  actor_id    uuid not null default auth.uid() references auth.users (id),
  field       text not null check (field in ('readiness_route', 'ability_level', 'primary_lens', 'baseline_metrics')),
  from_value  text,
  to_value    text not null,
  reason      text not null check (length(trim(reason)) >= 10),
  created_at  timestamptz not null default now()
);
alter table public.result_overrides enable row level security;
drop trigger if exists overrides_append_only on public.result_overrides;
create trigger overrides_append_only before update or delete on public.result_overrides
  for each row execute function private.forbid_change();
drop policy if exists "overrides readable" on public.result_overrides;
create policy "overrides readable" on public.result_overrides
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
drop policy if exists "clinicians append overrides" on public.result_overrides;
create policy "clinicians append overrides" on public.result_overrides
  for insert to authenticated with check (
    actor_id = (select auth.uid()) and (private.is_staff() or private.coaches(user_id))
    and exists (select 1 from public.assessment_results r where r.id = result_id and r.user_id = result_overrides.user_id));

-- ── metric registry ──────────────────────────────────────────────────────
create table if not exists public.metric_definitions (
  code             text primary key,
  title            text not null,
  unit             text not null,
  lens             text not null check (lens in ('structure', 'capacity', 'function', 'experience')),
  category_key     text not null references public.categories (key),
  method           text not null,
  directionality   text not null check (directionality in ('higher_better', 'lower_better', 'context_only')),
  threshold_status text not null default 'none_attached' check (threshold_status in ('none_attached', 'validated_attached')),
  min_value        numeric not null,
  max_value        numeric not null,
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
alter table public.metric_definitions enable row level security;
drop policy if exists "metrics readable" on public.metric_definitions;
create policy "metrics readable" on public.metric_definitions for select to authenticated using (true);
drop policy if exists "staff manage metrics" on public.metric_definitions;
create policy "staff manage metrics" on public.metric_definitions
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

insert into public.metric_definitions (code, title, unit, lens, category_key, method, directionality, min_value, max_value) values
  ('body_weight', 'Body weight', 'lb', 'structure', 'P2-C6', 'Morning, after using the bathroom, before eating, same scale each time.', 'context_only', 60, 700),
  ('waist_circumference', 'Waist circumference', 'in', 'structure', 'P2-C7', 'Tape level at the top of the hip bones, relaxed, after a normal breath out.', 'lower_better', 15, 80),
  ('chair_rise_30s', '30-second chair rise', 'reps', 'function', 'P1-C2', 'Standard-height chair, arms crossed, count full stands in 30 seconds. Stop if unsafe.', 'higher_better', 0, 60),
  ('walking_distance', 'Six-minute walk distance', 'ft', 'capacity', 'P1-C5', 'Flat measured route, your own steady pace for six minutes, rests allowed.', 'higher_better', 0, 5000),
  ('grip_strength', 'Grip strength', 'lb', 'capacity', 'P1-C4', 'Hand dynamometer, best of three squeezes with your stronger hand.', 'higher_better', 0, 250),
  ('stair_confidence', 'Stair confidence', '0-10', 'experience', 'P1-C2', '0 = not at all confident on one flight of stairs, 10 = completely confident.', 'higher_better', 0, 10),
  ('floor_transfer', 'Floor transfer time', 'sec', 'function', 'P1-C3', 'From standing, get down to the floor and back up, any safe method, support allowed. Skip if unsafe.', 'lower_better', 0, 600),
  ('pain_rating', 'Pain during daily activity', '0-10', 'experience', 'P1-C1', 'Average over the past week. 0 = no pain, 10 = worst imaginable.', 'lower_better', 0, 10),
  ('fatigue_rating', 'Fatigue', '0-10', 'experience', 'P3-C8', 'Average over the past week. 0 = no fatigue, 10 = exhausted.', 'lower_better', 0, 10),
  ('recovery_rating', 'Recovery after activity', '0-10', 'experience', 'P3-C8', 'Next-day feeling after your usual activity. 0 = not recovered, 10 = fully recovered.', 'higher_better', 0, 10),
  ('participation_rating', 'Doing what matters to you', '0-10', 'experience', 'P3-C9', 'How fully you took part in the activities you value this past week. 0 = not at all, 10 = fully.', 'higher_better', 0, 10)
on conflict (code) do nothing;

-- ── progress: baseline and later cycles, raw values only ─────────────────
create table if not exists public.progress_cycles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references auth.users (id) on delete cascade,
  program_id           uuid not null references public.programs (id),
  kind                 text not null check (kind in ('baseline', 'day_30', 'follow_up')),
  assessment_result_id uuid references public.assessment_results (id) on delete set null,
  selected_metrics     text[] not null default '{}',
  started_at           timestamptz not null default now(),
  closed_at            timestamptz,
  unique (user_id, program_id, kind)
);
alter table public.progress_cycles enable row level security;
drop policy if exists "own cycles read" on public.progress_cycles;
create policy "own cycles read" on public.progress_cycles
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
drop policy if exists "own cycles write" on public.progress_cycles;
create policy "own cycles write" on public.progress_cycles
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.programs p where p.id = program_id and public.can_access(p.access_key)));
drop policy if exists "own cycles update" on public.progress_cycles;
create policy "own cycles update" on public.progress_cycles
  for update to authenticated using (user_id = (select auth.uid()) and closed_at is null)
  with check (user_id = (select auth.uid()));

create table if not exists public.progress_measurements (
  id          uuid primary key default gen_random_uuid(),
  cycle_id    uuid not null references public.progress_cycles (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  metric_code text not null references public.metric_definitions (code),
  value       numeric not null,
  unit        text not null,
  method_note text,
  measured_at timestamptz not null default now(),
  source      text not null default 'self_reported' check (source in ('self_reported', 'coach_observed', 'clinician_measured')),
  created_at  timestamptz not null default now(),
  unique (cycle_id, metric_code)
);
alter table public.progress_measurements enable row level security;

create or replace function private.check_measurement()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare m public.metric_definitions;
begin
  select * into m from public.metric_definitions where code = new.metric_code and active;
  if m.code is null then raise exception 'Unknown or inactive metric %', new.metric_code; end if;
  if new.value < m.min_value or new.value > m.max_value then
    raise exception '% must be between % and % %', m.title, m.min_value, m.max_value, m.unit;
  end if;
  if new.unit <> m.unit then raise exception '% is recorded in %', m.title, m.unit; end if;
  return new;
end $$;
drop trigger if exists check_measurement on public.progress_measurements;
create trigger check_measurement before insert or update on public.progress_measurements
  for each row execute function private.check_measurement();

drop policy if exists "own measurements read" on public.progress_measurements;
create policy "own measurements read" on public.progress_measurements
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff() or private.coaches(user_id));
drop policy if exists "own measurements write" on public.progress_measurements;
create policy "own measurements write" on public.progress_measurements
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.progress_cycles c
      where c.id = cycle_id and c.user_id = (select auth.uid()) and c.closed_at is null));
drop policy if exists "own measurements change" on public.progress_measurements;
create policy "own measurements change" on public.progress_measurements
  for update to authenticated
  using (user_id = (select auth.uid()) and exists (
      select 1 from public.progress_cycles c
      where c.id = cycle_id and c.user_id = (select auth.uid()) and c.closed_at is null))
  with check (user_id = (select auth.uid()));

-- ── enrollment requires access to the program ────────────────────────────
drop policy if exists "own enrollments write" on public.program_enrollments;
create policy "own enrollments write" on public.program_enrollments
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (
      select 1 from public.programs p where p.id = program_id and public.can_access(p.access_key)));

-- ── protected assets ─────────────────────────────────────────────────────
create table if not exists public.assets (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  kind         text not null default 'download' check (kind in ('download', 'handout', 'worksheet', 'audio', 'video', 'image')),
  program_id   uuid references public.programs (id) on delete set null,
  module_id    uuid references public.modules (id) on delete set null,
  lesson_id    uuid references public.lessons (id) on delete set null,
  access_key   text not null,
  storage_path text not null unique,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  check (access_key <> 'free' or program_id is null)
);
alter table public.assets enable row level security;
drop policy if exists "assets readable by access" on public.assets;
create policy "assets readable by access" on public.assets
  for select to authenticated using (private.is_staff() or public.can_access(access_key));
drop policy if exists "staff manage assets" on public.assets;
create policy "staff manage assets" on public.assets
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

insert into storage.buckets (id, name, public, file_size_limit)
values ('program-assets', 'program-assets', false, 52428800)
on conflict (id) do nothing;

drop policy if exists "program assets: entitled read" on storage.objects;
create policy "program assets: entitled read" on storage.objects
  for select to authenticated using (
    bucket_id = 'program-assets' and (
      private.is_staff() or exists (
        select 1 from public.assets a
        where a.storage_path = storage.objects.name and public.can_access(a.access_key))));
drop policy if exists "program assets: staff upload" on storage.objects;
create policy "program assets: staff upload" on storage.objects
  for insert to authenticated with check (bucket_id = 'program-assets' and private.is_staff());
drop policy if exists "program assets: staff change" on storage.objects;
create policy "program assets: staff change" on storage.objects
  for update to authenticated using (bucket_id = 'program-assets' and private.is_staff())
  with check (bucket_id = 'program-assets' and private.is_staff());
drop policy if exists "program assets: staff delete" on storage.objects;
create policy "program assets: staff delete" on storage.objects
  for delete to authenticated using (bucket_id = 'program-assets' and private.is_staff());

-- ── audit: access and role changes are recorded automatically ────────────
create or replace function private.audit_row()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (auth.uid(), lower(tg_op), tg_table_name,
          coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id',
                   (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'user_id'),
          jsonb_build_object('new', case when tg_op = 'DELETE' then null else to_jsonb(new) end,
                             'old', case when tg_op = 'INSERT' then null else to_jsonb(old) end));
  return coalesce(new, old);
end $$;
drop trigger if exists audit_entitlements on public.entitlements;
create trigger audit_entitlements after insert or update or delete on public.entitlements
  for each row execute function private.audit_row();
drop trigger if exists audit_user_roles on public.user_roles;
create trigger audit_user_roles after insert or update or delete on public.user_roles
  for each row execute function private.audit_row();
drop trigger if exists audit_overrides on public.result_overrides;
create trigger audit_overrides after insert on public.result_overrides
  for each row execute function private.audit_row();
drop trigger if exists audit_assets on public.assets;
create trigger audit_assets after insert or update or delete on public.assets
  for each row execute function private.audit_row();
drop trigger if exists audit_versions on public.assessment_versions;
create trigger audit_versions after insert or update on public.assessment_versions
  for each row execute function private.audit_row();

-- ── admin console: member list with Program 1 status ─────────────────────
create or replace function public.admin_members()
returns table (
  user_id uuid, email text, display_name text, joined_at timestamptz, last_sign_in_at timestamptz,
  roles text[], four_lens_access boolean, coaching_access boolean,
  orientation_completed_at timestamptz, safety_review_status text,
  latest_result_at timestamptz, readiness_route text, ability_level text, primary_lens text,
  baseline_measures integer
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_staff() then
    raise exception 'admin_members: staff only' using errcode = '42501';
  end if;
  return query
  select u.id, u.email::text, p.display_name, u.created_at, u.last_sign_in_at,
    coalesce((select array_agg(r.role::text order by r.role) from public.user_roles r where r.user_id = u.id), '{}'),
    exists (select 1 from public.entitlements e where e.user_id = u.id and e.feature_key = 'program:four-lens'
            and e.revoked_at is null and (e.expires_at is null or e.expires_at > now())),
    exists (select 1 from public.entitlements e where e.user_id = u.id and e.feature_key = 'coaching:four-lens-1to1'
            and e.revoked_at is null and (e.expires_at is null or e.expires_at > now())),
    (select max(o.completed_at) from public.orientation_sessions o where o.user_id = u.id),
    (select o.safety_review_status from public.orientation_sessions o where o.user_id = u.id order by o.created_at desc limit 1),
    lr.derived_at, lr.readiness_route, lr.ability_level, lr.primary_lens,
    (select count(*)::int from public.progress_measurements m where m.user_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join lateral (
    select r.derived_at, r.readiness_route, r.ability_level, r.primary_lens
    from public.assessment_results r where r.user_id = u.id order by r.derived_at desc limit 1
  ) lr on true
  order by u.created_at desc;
end $$;
revoke all on function public.admin_members() from public, anon;
grant execute on function public.admin_members() to authenticated;

revoke all on public.assessment_versions, public.orientation_sessions, public.assessment_sessions,
  public.assessment_responses, public.assessment_results, public.result_overrides,
  public.progress_cycles, public.progress_measurements, public.assets, public.metric_definitions
  from anon;
