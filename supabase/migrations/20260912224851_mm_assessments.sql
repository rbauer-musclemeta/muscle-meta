-- ============================================================
-- MM™ ASSESSMENTS — instrument definitions, items, norms, scoring
-- ============================================================
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null, short_title text, description text,
  instrument_kind text not null check (instrument_kind in ('field_test','questionnaire','composite')),
  audience text not null default 'user' check (audience in ('user','clinician')),
  tier_system text references public.tier_systems(code),
  pillar_id smallint references public.pillars(id),
  category_id smallint references public.categories(id),
  scores_axes boolean not null default false,
  access_key text not null default 'free',
  est_minutes smallint,
  version smallint not null default 1,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  safety_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lessons
  add constraint lessons_assessment_fk foreign key (assessment_id)
  references public.assessments(id) on delete set null;

create table public.assessment_items (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  position smallint not null,
  prompt text not null, help_text text,
  input_type text not null check (input_type in ('boolean','single_select','multi_select','number','scale','distance','duration','count')),
  unit text,
  options jsonb,
  construct_id integer references public.constructs(id),
  category_id smallint references public.categories(id),
  axis_id smallint references public.gmmbb_axes(id),
  weight numeric(6,3) not null default 1,
  reverse_scored boolean not null default false,
  is_safety_flag boolean not null default false,
  required boolean not null default true,
  unique (assessment_id, position)
);

create table public.norm_tables (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments(id) on delete cascade,
  metric text not null,
  sex text check (sex in ('female','male','all')),
  age_min smallint not null, age_max smallint not null,
  band_label text not null,
  value_min numeric, value_max numeric,
  source text,
  study_id uuid references public.studies(id)
);

create table public.scoring_rules (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  rule_kind text not null check (rule_kind in ('formula','lookup','sum','weighted_sum','flag')),
  target_scope text not null check (target_scope in ('construct','category','pillar','axis','total')),
  target_ref text,
  config jsonb not null,
  position smallint not null default 0
);

insert into public.assessments (code,title,short_title,instrument_kind,audience,tier_system,pillar_id,category_id,est_minutes,status,safety_note) values
  ('VO2_6MWT','Six-minute walk test','6MWT','field_test','user','mm_health_score',1,4,8,'published','Stop for chest pain, dizziness, or unusual shortness of breath.'),
  ('VO2_COOPER','Cooper twelve-minute test','Cooper','field_test','user','mm_health_score',1,4,15,'published','Best suited to those already exercising regularly.'),
  ('STS30','30-second sit-to-stand','STS-30','field_test','user','mm_health_score',1,5,3,'published','Use a standard-height chair against a wall. Stop if you feel unsteady.'),
  ('CARDIO_SCREEN','Cardiorespiratory self-screen','Self-screen','questionnaire','user','mm_health_score',1,4,4,'published','Educational reflection tool, not a diagnosis.'),
  ('MMM','Muscle-Meta Matrix assessment','MMM','composite','user','mmm',null,null,25,'draft',null),
  ('CCRAF','Clinical compound risk profile','CCRAF','composite','clinician','ccraf',null,null,20,'draft','Clinician-facing only. Never expose evidence basis or citations in a user view.');

update public.assessments set scores_axes = true where code in ('MMM','CCRAF');

insert into public.scoring_rules (assessment_id,rule_kind,target_scope,target_ref,config)
select id,'formula','construct','aerobic-capacity',
  '{"expression":"(distance_m - 504.9) / 44.73","output":"vo2max_ml_kg_min","units_in":"m","note":"Cooper 12-minute distance equation"}'::jsonb
from public.assessments where code = 'VO2_COOPER';

insert into public.scoring_rules (assessment_id,rule_kind,target_scope,target_ref,config)
select id,'formula','construct','aerobic-capacity',
  '{"expression":"(0.1 * (distance_m / 6)) + 3.5","output":"vo2_at_pace_ml_kg_min","units_in":"m","note":"ACSM walking equation — oxygen cost of the pace walked, not VO2max"}'::jsonb
from public.assessments where code = 'VO2_6MWT';

insert into public.assessment_items (assessment_id,position,prompt,input_type,category_id,is_safety_flag)
select a.id, v.position, v.prompt, 'boolean', 4, v.flag
from public.assessments a,
(values
  (1::smallint,'Walking briskly for five minutes leaves me unable to speak in full sentences.',false),
  (2,'Stairs, chores, or carrying groceries have become noticeably harder over the past year.',false),
  (3,'I rarely get twenty or more continuous minutes of intentional aerobic activity in a week.',false),
  (4,'I snore loudly, wake up choking, or feel unrefreshed despite seven or more hours in bed.',false),
  (5,'Light activity is followed by flu-like fatigue, brain fog, or body aches lasting 24 to 48 hours.',true),
  (6,'My natural walking speed has visibly slowed compared with a few years ago.',false),
  (7,'I hit a mid-afternoon energy crash that caffeine does not resolve.',false),
  (8,'My heart pounds or races during simple tasks like vacuuming or carrying laundry.',false),
  (9,'I routinely need to sit down to catch my breath while cooking or cleaning.',false),
  (10,'I have given up an activity I enjoyed because my body could not keep up.',false)
) as v(position, prompt, flag)
where a.code = 'CARDIO_SCREEN';

insert into public.assessment_items (assessment_id,position,prompt,help_text,input_type,unit,construct_id)
select a.id, 1, 'Distance covered', 'Walk as far as you comfortably and safely can in six minutes.', 'distance', 'm',
  (select id from public.constructs where slug = 'aerobic-capacity')
from public.assessments a where a.code = 'VO2_6MWT';

insert into public.assessment_items (assessment_id,position,prompt,help_text,input_type,unit,construct_id)
select a.id, 1, 'Distance covered', 'Cover as much ground as you can in twelve minutes.', 'distance', 'm',
  (select id from public.constructs where slug = 'aerobic-capacity')
from public.assessments a where a.code = 'VO2_COOPER';

insert into public.assessment_items (assessment_id,position,prompt,help_text,input_type,unit,construct_id)
select a.id, 1, 'Full stands completed in 30 seconds', 'Arms crossed over the chest, standard-height chair.', 'count', 'reps',
  (select id from public.constructs where slug = 'lower-limb-power')
from public.assessments a where a.code = 'STS30';

create index on public.assessment_items (assessment_id);
create index on public.norm_tables (assessment_id, metric);
create index on public.scoring_rules (assessment_id);

alter table public.assessments enable row level security;
alter table public.assessment_items enable row level security;
alter table public.norm_tables enable row level security;
alter table public.scoring_rules enable row level security;

create policy "published user assessments readable" on public.assessments
  for select using (status = 'published' and audience = 'user');
create policy "items of published user assessments" on public.assessment_items
  for select using (exists (select 1 from public.assessments a
    where a.id = assessment_items.assessment_id and a.status = 'published' and a.audience = 'user'));
create policy "norms of published user assessments" on public.norm_tables
  for select using (assessment_id is null or exists (select 1 from public.assessments a
    where a.id = norm_tables.assessment_id and a.status = 'published' and a.audience = 'user'));
-- scoring_rules: RLS enabled with no select policy — service role only.
