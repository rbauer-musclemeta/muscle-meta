-- Course: The Muscle-Metabolic Health Matrix
-- (The impact of muscle and metabolic health on aging and longevity.)
--
-- Assessment-led, self-directed four-module course with an optional one-to-one
-- Personal Session. Served at muscle-meta.com/app/metabolic-health/.
--
-- What this migration adds:
--   * the course, its program row and its five modules (Start here + 4);
--   * the lesson columns the course reader uses (slug, body_md, content,
--     est_minutes, content_version) if the baseline schema does not have them;
--   * read access to lessons, modules and courses for entitled members, and
--     write access for staff only;
--   * lesson_progress (own rows only) for completion and chosen track;
--   * draft products for the course and the Personal Session (no prices yet).
--
-- What it deliberately does NOT add: lesson text or worksheets. They are paid
-- content and this repository is public (CLAUDE.md §2, "Paid content cannot be
-- a file"). Staff import the content bundle at /app/admin/course-content and
-- upload the worksheets to the private program-assets bucket. See
-- docs/courses/metabolic-health-matrix.md.

-- ── lesson storage ────────────────────────────────────────────────────────
alter table public.lessons add column if not exists slug            text;
alter table public.lessons add column if not exists body_md         text;
alter table public.lessons add column if not exists content         jsonb;
alter table public.lessons add column if not exists est_minutes     integer;
alter table public.lessons add column if not exists content_version text;
alter table public.lessons add column if not exists updated_at      timestamptz not null default now();
create unique index if not exists lessons_module_slug_key on public.lessons (module_id, slug);

-- The importer writes module_id, slug, title, position, body_md, content,
-- est_minutes and content_version. Stop here, with a clear message, if the
-- baseline lessons table requires anything else (its SQL predates this folder).
do $$
declare missing text;
begin
  select string_agg(column_name, ', ' order by column_name) into missing
  from information_schema.columns
  where table_schema = 'public' and table_name = 'lessons'
    and is_nullable = 'NO' and column_default is null
    and column_name not in ('id', 'module_id', 'slug', 'title', 'position', 'body_md', 'content',
                            'est_minutes', 'content_version', 'updated_at');
  if missing is not null then
    raise exception 'lessons has required columns the course importer does not set: %. Add defaults or extend the importer before applying.', missing;
  end if;
end $$;

-- ── course, program, modules ──────────────────────────────────────────────
insert into public.courses (slug, title, subtitle, pillar_id, access_key, status, position)
values ('metabolic-health-matrix', 'The Muscle-Metabolic Health Matrix',
        'The impact of muscle and metabolic health on aging and longevity', 1, 'course:metabolic-health', 'draft', 2)
on conflict (slug) do nothing;

insert into public.programs (slug, title, subtitle, description, pillar_id, goal, duration_weeks, access_key, status, course_id)
select 'metabolic-health-matrix', 'The Muscle-Metabolic Health Matrix',
       'The impact of muscle and metabolic health on aging and longevity',
       'Assessment-led, self-directed course. Four modules and twelve lessons over four weeks: mitochondria and metabolic flexibility, Zone 2, intervals, and a personal plan. Each lesson has a Foundation, Builder and Performer plan, safety guidance and a printable worksheet.',
       1, 'Build aerobic capacity, metabolic flexibility and muscle with a plan matched to your Readiness Check.',
       4, 'course:metabolic-health', 'published', c.id
from public.courses c where c.slug = 'metabolic-health-matrix'
on conflict (slug) do nothing;

insert into public.modules (course_id, slug, title, summary, position)
select c.id, m.slug, m.title, m.summary, m.position
from public.courses c,
  (values
    ('start',    'Start here', 'How the Readiness Check sets your track and safety level.', 0),
    ('module-1', 'Module 1: Foundations of mitochondrial and metabolic health', 'Mitochondria, metabolic flexibility and muscle as a metabolic organ.', 1),
    ('module-2', 'Module 2: Zone 2 training, building your aerobic foundation', 'Heart-rate zones, Zone 2 benefits and your four-week Zone 2 plan.', 2),
    ('module-3', 'Module 3: Interval training for mitochondrial quality', 'Interval science, protocols and how to do them safely.', 3),
    ('module-4', 'Module 4: Your personal metabolic plan', 'Periodization, recovery and nutrition, and measuring progress.', 4)
  ) as m(slug, title, summary, position)
where c.slug = 'metabolic-health-matrix'
on conflict (course_id, slug) do nothing;

-- ── products (Stripe M4). Prices are Randy's decision: no price rows yet. ──
insert into public.products (slug, name, description, feature_key, is_subscription, status)
values
  ('metabolic-health-course', 'The Muscle-Metabolic Health Matrix: self-directed course',
   'One-time. Lifetime access to the course, its worksheets and saved progress.', 'course:metabolic-health', false, 'draft'),
  ('metabolic-health-personal-session', 'The Muscle-Metabolic Health Matrix: Personal Session',
   'A 20-minute one-to-one video session with Randy Bauer, PT.', 'coaching:metabolic-health-1to1', false, 'draft')
on conflict (slug) do nothing;

-- ── access: entitled members read, staff write ────────────────────────────
alter table public.lessons enable row level security;
alter table public.modules enable row level security;
alter table public.courses enable row level security;

drop policy if exists "lessons readable by course access" on public.lessons;
create policy "lessons readable by course access" on public.lessons
  for select to authenticated using (
    private.is_staff() or exists (
      select 1 from public.modules m join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and public.can_access(c.access_key)));

drop policy if exists "staff manage lessons" on public.lessons;
create policy "staff manage lessons" on public.lessons
  for all to authenticated using (private.is_staff()) with check (private.is_staff());

drop policy if exists "modules readable by course access" on public.modules;
create policy "modules readable by course access" on public.modules
  for select to authenticated using (
    private.is_staff() or exists (
      select 1 from public.courses c where c.id = modules.course_id and public.can_access(c.access_key)));

drop policy if exists "courses readable by access" on public.courses;
create policy "courses readable by access" on public.courses
  for select to authenticated using (private.is_staff() or public.can_access(access_key));

revoke all on public.lessons from anon;
grant select, insert, update, delete on public.lessons to authenticated;

-- ── lesson progress ───────────────────────────────────────────────────────
create table if not exists public.lesson_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  track        text check (track in ('foundation', 'builder', 'performer')),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.lesson_progress enable row level security;

-- A member keeps progress only for lessons they can read (the lessons
-- subquery runs under the member's own RLS).
drop policy if exists "own lesson progress read" on public.lesson_progress;
create policy "own lesson progress read" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()) or private.is_staff());
drop policy if exists "own lesson progress insert" on public.lesson_progress;
create policy "own lesson progress insert" on public.lesson_progress
  for insert to authenticated with check (
    user_id = (select auth.uid()) and exists (select 1 from public.lessons l where l.id = lesson_id));
drop policy if exists "own lesson progress update" on public.lesson_progress;
create policy "own lesson progress update" on public.lesson_progress
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.lessons l where l.id = lesson_id));

revoke all on public.lesson_progress from anon;
grant select, insert, update on public.lesson_progress to authenticated;

-- Content imports are audited like asset changes.
drop trigger if exists audit_lessons on public.lessons;
create trigger audit_lessons after insert or update or delete on public.lessons
  for each row execute function private.audit_row();
