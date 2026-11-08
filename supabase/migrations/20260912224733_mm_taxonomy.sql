-- ============================================================
-- MM™ TAXONOMY — canonical framework reference data
-- 4 pillars × 12 categories (5-2-3-2) · GMMBB 5-axis (25/25/20/15/15)
-- ============================================================
create extension if not exists "pgcrypto";

create table public.pillars (
  id smallint primary key,
  code char(1) not null unique,
  slug text not null unique,
  name text not null,
  color_token text not null,
  color_hex text not null,
  icon_kind text not null,
  radar_angle smallint not null,
  category_count smallint not null,
  is_gated boolean not null default false,
  created_at timestamptz not null default now()
);
insert into public.pillars values
  (1,'E','exercise-mobility','Exercise & Mobility','--teal','#009090','force',-90,5,false,now()),
  (2,'N','nutrition-metabolism','Nutrition & Metabolism','--gold','#D4AF37','cellular',0,2,false,now()),
  (3,'R','recovery-stress','Recovery & Stress','--purple','#7c3aed','wave',90,3,false,now()),
  (4,'B','balance-brain-health','Balance & Brain Health','--green','#16a34a','neural',180,2,true,now());

create table public.categories (
  id smallint primary key,
  pillar_id smallint not null references public.pillars(id),
  slug text not null unique,
  name text not null,
  position smallint not null,
  weight_in_pillar numeric(5,4) not null check (weight_in_pillar > 0 and weight_in_pillar <= 1),
  created_at timestamptz not null default now(),
  unique (pillar_id, position)
);
insert into public.categories (id,pillar_id,slug,name,position,weight_in_pillar) values
  (1,1,'joint-health','Joint Health',1,0.2000),
  (2,1,'functional-independence','Functional Independence',2,0.2000),
  (3,1,'mobility','Mobility',3,0.2000),
  (4,1,'endurance','Endurance',4,0.2000),
  (5,1,'strength','Strength',5,0.2000),
  (6,2,'nutrition','Nutrition',1,0.5600),
  (7,2,'metabolic-flexibility','Metabolic Flexibility',2,0.4400),
  (8,3,'recovery','Recovery',1,0.3334),
  (9,3,'lifestyle','Lifestyle',2,0.3333),
  (10,3,'stress-management','Stress Management',3,0.3333),
  (11,4,'balance','Balance',1,0.5000),
  (12,4,'brain-health','Brain Health',2,0.5000);

create or replace function public.assert_taxonomy_integrity() returns void language plpgsql
set search_path = public as $$
declare bad record;
begin
  for bad in
    select p.id pid, p.category_count expected, count(c.id) actual, round(sum(c.weight_in_pillar),4) wsum
    from public.pillars p left join public.categories c on c.pillar_id = p.id
    group by p.id, p.category_count
    having count(c.id) <> p.category_count or round(sum(c.weight_in_pillar),4) not between 0.9990 and 1.0010
  loop
    raise exception 'Taxonomy violation on pillar %: % categories (expected %), weights sum %', bad.pid, bad.actual, bad.expected, bad.wsum;
  end loop;
end $$;
select public.assert_taxonomy_integrity();

create table public.constructs (
  id smallserial primary key,
  category_id smallint not null references public.categories(id),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
insert into public.constructs (category_id,slug,name) values
  (4,'aerobic-capacity','Aerobic Capacity'),
  (4,'endurance-reserve','Endurance Reserve'),
  (5,'lower-limb-power','Lower-Limb Power'),
  (5,'grip-strength','Grip Strength'),
  (6,'nutrient-density','Nutrient Density'),
  (6,'gut-microbiome','Gut Microbiome'),
  (8,'sleep-quality','Sleep Quality'),
  (8,'hrv-baseline','HRV Baseline'),
  (10,'cortisol-regulation','Cortisol Regulation'),
  (11,'dual-task-processing','Dual-Task Processing'),
  (11,'bone-density','Bone Density'),
  (12,'cognitive-reserve','Cognitive Reserve');

create table public.gmmbb_axes (
  id smallint primary key,
  code text not null unique,
  name text not null,
  weight numeric(4,3) not null,
  angle smallint not null,
  position smallint not null unique,
  markers text[] not null,
  created_at timestamptz not null default now()
);
insert into public.gmmbb_axes (id,code,name,weight,angle,position,markers) values
  (1,'G','Gut Health',0.250,-90,1,array['Microbiome diversity','GI inflammation','Absorption efficiency']),
  (2,'M1','Muscle Integrity',0.250,-18,2,array['Lean mass retention','Fiber-type composition','Anabolic sensitivity']),
  (3,'M2','Metabolic Function',0.200,54,3,array['Insulin sensitivity','Mitochondrial output','Metabolic flexibility']),
  (4,'B1','Bone-Balance',0.150,126,4,array['Bone mineral density','Trabecular integrity','Force absorption']),
  (5,'B2','Brain Health',0.150,198,5,array['Cognitive reserve','Neuroplasticity markers','Dual-task processing']);

create table public.tier_systems (
  code text primary key,
  name text not null,
  direction text not null check (direction in ('higher_is_better','higher_is_worse')),
  audience text not null check (audience in ('user','clinician')),
  score_min numeric not null,
  score_max numeric not null,
  notes text
);
insert into public.tier_systems values
  ('mm_health_score','MM™ Health Score','higher_is_better','user',0,100,'Consumer-facing 0-100 stratification. Never share a label with the clinician instrument.'),
  ('mmm','MMM Assessment','higher_is_worse','user',0,400,'Absolute points across 4 pillars. Thresholds are absolute, never a percentage of maxScore.'),
  ('ccraf','CCRAF Clinical Risk','higher_is_worse','clinician',0,400,'Provider-facing. Never display a raw CCRAF number, evidence basis, or citations in a user view.');

create table public.risk_tiers (
  id smallserial primary key,
  system_code text not null references public.tier_systems(code),
  rank smallint not null,
  label text not null,
  color_hex text not null,
  muted_hex text not null,
  band_min numeric not null,
  band_max numeric not null,
  clinical_copy text,
  unique (system_code, rank)
);
insert into public.risk_tiers (system_code,rank,label,color_hex,muted_hex,band_min,band_max,clinical_copy) values
  ('mm_health_score',1,'Optimized','#009090','#e6f5f5',85,100,'Top-decile profile. Maintenance protocols only.'),
  ('mm_health_score',2,'Functional','#3b82f6','#eff6ff',70,84,'Strong foundation. Targeted optimization wins available.'),
  ('mm_health_score',3,'Declining','#f59e0b','#fef3c7',55,69,'Measurable signals of age-related drift. Highest-leverage intervention window.'),
  ('mm_health_score',4,'At Risk','#f97316','#ffedd5',40,54,'Multiple systems under strain. Clinical protocol indicated.'),
  ('mm_health_score',5,'Critical','#dc2626','#fee2e2',0,39,'Immediate clinical consultation recommended.'),
  ('mmm',1,'MINIMAL','#009090','#e6f5f5',0,24,null),
  ('mmm',2,'LOW','#3b82f6','#eff6ff',25,74,null),
  ('mmm',3,'MODERATE','#f59e0b','#fef3c7',75,149,null),
  ('mmm',4,'HIGH','#f97316','#ffedd5',150,249,null),
  ('mmm',5,'CRITICAL','#dc2626','#fee2e2',250,400,null);

create table public.population_overlays (
  id smallserial primary key,
  slug text not null unique,
  name text not null,
  elevates text[] not null,
  notes text
);
insert into public.population_overlays (slug,name,elevates,notes) values
  ('pickleball','Pickleball',array['joint-health','balance'],'Dual-task balance and force absorption'),
  ('osteoporosis','Osteoporosis',array['balance','functional-independence'],'Bone reserve and fall risk'),
  ('glp1','GLP-1',array['metabolic-flexibility','nutrition'],'Lean mass preservation'),
  ('post-hospital','Post-Hospital',array['functional-independence','recovery','stress-management'],null),
  ('perimenopause','Perimenopause',array['balance','strength','recovery','metabolic-flexibility','brain-health'],'Whole-system re-weighting; bone and muscle decline together'),
  ('postmenopause','Postmenopause',array['balance','strength','metabolic-flexibility'],'Chronic altered baseline; loss rate decelerates, cumulative risk climbs');

alter table public.pillars enable row level security;
alter table public.categories enable row level security;
alter table public.constructs enable row level security;
alter table public.gmmbb_axes enable row level security;
alter table public.tier_systems enable row level security;
alter table public.risk_tiers enable row level security;
alter table public.population_overlays enable row level security;

create policy "taxonomy readable" on public.pillars for select using (true);
create policy "taxonomy readable" on public.categories for select using (true);
create policy "taxonomy readable" on public.constructs for select using (true);
create policy "taxonomy readable" on public.gmmbb_axes for select using (true);
create policy "taxonomy readable" on public.population_overlays for select using (true);
create policy "user tier systems readable" on public.tier_systems for select using (audience = 'user');
create policy "user tier bands readable" on public.risk_tiers for select using (exists (
  select 1 from public.tier_systems ts where ts.code = risk_tiers.system_code and ts.audience = 'user'));
