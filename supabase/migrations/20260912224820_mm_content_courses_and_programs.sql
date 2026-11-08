-- ============================================================
-- MM™ CONTENT — courses, lessons, training programs, evidence
-- ============================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  description text,
  pillar_id smallint references public.pillars(id),
  category_id smallint references public.categories(id),
  access_key text not null default 'free',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  hero_image_url text,
  position smallint not null default 0,
  kajabi_offer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  slug text not null, title text not null, summary text, position smallint not null,
  created_at timestamptz not null default now(),
  unique (course_id, slug), unique (course_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null, title text not null, body_md text, video_url text, audio_url text,
  duration_min smallint, position smallint not null,
  is_preview boolean not null default false,
  assessment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug), unique (module_id, position)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null, subtitle text, description text,
  pillar_id smallint references public.pillars(id),
  category_id smallint references public.categories(id),
  goal text,
  duration_weeks smallint not null,
  sessions_per_week smallint,
  level text check (level in ('foundation','build','advance')),
  access_key text not null default 'free',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  source_file text, source_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  week_number smallint not null check (week_number > 0),
  title text, focus text, is_deload boolean not null default false, notes text,
  unique (program_id, week_number)
);

create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.program_weeks(id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 7),
  title text not null,
  session_type text check (session_type in ('zone2','intervals','tempo','recovery','strength','mobility','test','rest')),
  target_minutes smallint, modality text,
  rpe_low smallint check (rpe_low between 1 and 10),
  rpe_high smallint check (rpe_high between 1 and 10),
  hr_zone_low smallint check (hr_zone_low between 1 and 5),
  hr_zone_high smallint check (hr_zone_high between 1 and 5),
  coaching_note text,
  unique (week_id, day_number)
);

create table public.session_blocks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.program_sessions(id) on delete cascade,
  position smallint not null,
  block_type text not null check (block_type in ('warmup','work','recovery','cooldown')),
  repeats smallint not null default 1,
  duration_sec integer,
  hr_zone smallint check (hr_zone between 1 and 5),
  rpe smallint check (rpe between 1 and 10),
  talk_test text, instruction text,
  unique (session_id, position)
);

create table public.modality_swaps (
  id smallserial primary key,
  limitation text not null unique, label text not null, badge text not null,
  equipment text not null, rules text[] not null,
  created_at timestamptz not null default now()
);
insert into public.modality_swaps (limitation,label,badge,equipment,rules) values
  ('knees','Knees / osteoarthritis','No patellar impact','Recumbent stationary bike, or an arm ergometer',
    array['Set the seat so the knee keeps a slight bend at full pedal reach — avoid deep flexion under load.',
          'Favor a smooth, higher cadence around 70 to 80 rpm with lighter resistance to keep joint contact pressure low.',
          'Set aside road running and high-impact step classes while symptoms are active.']),
  ('back','Low back / disc irritation','Spine-friendly','Incline treadmill walking at a 5 to 8% grade, or an elliptical',
    array['Walking uphill tends to be better tolerated than flat-ground running for many people with lumbar symptoms.',
          'Avoid slumped, reaching postures — rowing machines and forward-reach bike setups often aggravate.',
          'Keep the ribcage stacked over the pelvis and breathe into the diaphragm rather than bracing.']),
  ('shoulder','Shoulder / rotator cuff','No shoulder load','Upright cycle with hands free, or gentle incline walking',
    array['Keep hands off the handlebars if reaching upward provokes symptoms; sit tall with arms resting.',
          'Set aside rowing, cross-country ski machines, and arm ergometers while the shoulder is irritable.',
          'Drive the stimulus through large leg muscles — the aerobic benefit does not require the arms.']),
  ('non-weightbearing','Post-surgical / non-weightbearing','Fully non-weightbearing','Tabletop arm crank ergometer',
    array['Arm cranking delivers a genuine central cardiovascular stimulus with no load through the lower limb.',
          'Work in shorter bouts of roughly fifteen to twenty minutes, split into intervals, to avoid forearm fatigue.',
          'Keeping the aerobic system active through immobilization limits how much ground there is to make up later.']);

create table public.studies (
  id uuid primary key default gen_random_uuid(),
  pmid text unique, doi text,
  title text not null, authors text, journal text, year smallint,
  key_finding text,
  evidence_grade text not null check (evidence_grade in ('established','promising','unproven-bridge')),
  pillar_id smallint references public.pillars(id),
  category_id smallint references public.categories(id),
  url text,
  created_at timestamptz not null default now()
);

insert into public.studies (pmid, title, authors, journal, year, key_finding, evidence_grade, pillar_id, category_id) values
  ('19454641','Cardiorespiratory fitness as a quantitative predictor of all-cause mortality and cardiovascular events in healthy men and women: a meta-analysis','Kodama S, et al.','JAMA',2009,'Each 1-MET increase linked to 13% lower all-cause mortality and 15% lower CHD/CVD risk; 7.9 METs identified as a key threshold','established',1,4),
  ('30646252','Association of cardiorespiratory fitness with long-term mortality among adults undergoing exercise treadmill testing','Mandsager K, et al.','JAMA Network Open',2018,'122,007 adults; low fitness carried roughly five times the mortality risk of elite fitness','established',1,4),
  ('11560849','A 30-year follow-up of the Dallas Bed Rest and Training Study','McGuire DK, et al.','Circulation',2001,'Three weeks of bed rest produced a steeper fall in aerobic capacity than the following thirty years of aging','established',1,4),
  ('16043637','Accelerated longitudinal decline of aerobic capacity in healthy older adults','Fleg JL, et al.','Circulation',2005,'Rate of decline in peak VO2 accelerates with each successive decade','established',1,4),
  ('17414804','Aerobic high-intensity intervals improve VO2max more than moderate training','Helgerud J, et al.','Med Sci Sports Exerc',2007,'4x4 protocol produced a 7.2% VO2max improvement over eight weeks','established',1,4),
  ('33028588','Effect of exercise training for five years on all-cause mortality in older adults — the Generation 100 study','Stensvold D, et al.','BMJ',2020,'Adults 70-77; structured training linked to lower mortality than the general-population comparison group','established',1,4),
  ('11153730','Age-predicted maximal heart rate revisited','Tanaka H, Monahan KD, Seals DR','J Am Coll Cardiol',2001,'HRmax = 208 - (0.7 x age); more accurate than 220 - age for older adults','established',1,4),
  ('35247352','Daily steps and all-cause mortality: a meta-analysis of 15 international cohorts','Paluch AE, et al.','Lancet Public Health',2022,'For adults 60+, mortality risk leveled off around 6,000-8,000 steps a day','established',1,4);

create table public.claims (
  id uuid primary key default gen_random_uuid(),
  claim_text text not null,
  evidence_grade text not null check (evidence_grade in ('established','promising','unproven-bridge')),
  study_id uuid references public.studies(id),
  asset_ref text,
  created_at timestamptz not null default now()
);

create index on public.modules (course_id);
create index on public.lessons (module_id);
create index on public.program_weeks (program_id);
create index on public.program_sessions (week_id);
create index on public.session_blocks (session_id);
create index on public.studies (category_id);

alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.programs enable row level security;
alter table public.program_weeks enable row level security;
alter table public.program_sessions enable row level security;
alter table public.session_blocks enable row level security;
alter table public.modality_swaps enable row level security;
alter table public.studies enable row level security;
alter table public.claims enable row level security;

create policy "published courses readable" on public.courses for select using (status = 'published');
create policy "published programs readable" on public.programs for select using (status = 'published');
create policy "modules of published courses" on public.modules for select
  using (exists (select 1 from public.courses c where c.id = modules.course_id and c.status = 'published'));
create policy "lessons of published courses" on public.lessons for select
  using (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id
                 where m.id = lessons.module_id and c.status = 'published'));
create policy "weeks of published programs" on public.program_weeks for select
  using (exists (select 1 from public.programs p where p.id = program_weeks.program_id and p.status = 'published'));
create policy "sessions of published programs" on public.program_sessions for select
  using (exists (select 1 from public.program_weeks w join public.programs p on p.id = w.program_id
                 where w.id = program_sessions.week_id and p.status = 'published'));
create policy "blocks of published programs" on public.session_blocks for select
  using (exists (select 1 from public.program_sessions s join public.program_weeks w on w.id = s.week_id
                 join public.programs p on p.id = w.program_id
                 where s.id = session_blocks.session_id and p.status = 'published'));
create policy "modality swaps readable" on public.modality_swaps for select using (true);
create policy "studies readable" on public.studies for select using (true);
create policy "claims readable" on public.claims for select using (true);
