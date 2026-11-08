-- Rockport joins the field-test set, and the normative bands the calculator
-- rates against move into the database so every asset reads one source.

insert into public.assessments (code,title,short_title,instrument_kind,audience,tier_system,pillar_id,category_id,est_minutes,status,safety_note)
values ('VO2_ROCKPORT','Rockport one-mile walk test','Rockport','field_test','user','mm_health_score',1,4,20,'published',
        'Walk briskly without running. Take your pulse immediately at the finish. Stop for chest pain or dizziness.')
on conflict (code) do nothing;

insert into public.assessment_items (assessment_id, position, prompt, help_text, input_type, unit, construct_id)
select a.id, v.pos, v.prompt, v.help, v.kind, v.unit, (select id from public.constructs where slug = 'aerobic-capacity')
from public.assessments a,
(values
  (1::smallint,'Walk time','Minutes and seconds to complete one measured mile.','duration','min','x'),
  (2,'Finish heart rate','Measured immediately on stopping.','number','bpm','x')
) as v(pos, prompt, help, kind, unit, tag)
where a.code = 'VO2_ROCKPORT'
  and not exists (select 1 from public.assessment_items i where i.assessment_id = a.id);

insert into public.scoring_rules (assessment_id, rule_kind, target_scope, target_ref, config)
select id,'formula','construct','aerobic-capacity',
  '{"expression":"132.853 - (0.0769 * weight_lbs) - (0.3877 * age) + (6.315 * male) - (3.2649 * time_min) - (0.1565 * finish_hr)","output":"vo2max_ml_kg_min","source":"Kline et al. 1987","r":"0.92-0.93","se_ml_kg_min":5,"validated_ages":"30-69"}'::jsonb
from public.assessments where code = 'VO2_ROCKPORT';

-- Normative VO2max bands (Cooper Institute / ACSM classifications), by sex and age band.
insert into public.norm_tables (metric, sex, age_min, age_max, band_label, value_min, value_max, source)
values
  ('vo2max','male',20,29,'poor',0,24,'Cooper Institute / ACSM'),
  ('vo2max','male',20,29,'fair',25,33,'Cooper Institute / ACSM'),
  ('vo2max','male',20,29,'good',34,42,'Cooper Institute / ACSM'),
  ('vo2max','male',20,29,'excellent',43,52,'Cooper Institute / ACSM'),
  ('vo2max','male',20,29,'superior',53,null,'Cooper Institute / ACSM'),
  ('vo2max','male',30,39,'poor',0,22,'Cooper Institute / ACSM'),
  ('vo2max','male',30,39,'fair',23,30,'Cooper Institute / ACSM'),
  ('vo2max','male',30,39,'good',31,38,'Cooper Institute / ACSM'),
  ('vo2max','male',30,39,'excellent',39,48,'Cooper Institute / ACSM'),
  ('vo2max','male',30,39,'superior',49,null,'Cooper Institute / ACSM'),
  ('vo2max','male',40,49,'poor',0,19,'Cooper Institute / ACSM'),
  ('vo2max','male',40,49,'fair',20,26,'Cooper Institute / ACSM'),
  ('vo2max','male',40,49,'good',27,35,'Cooper Institute / ACSM'),
  ('vo2max','male',40,49,'excellent',36,44,'Cooper Institute / ACSM'),
  ('vo2max','male',40,49,'superior',45,null,'Cooper Institute / ACSM'),
  ('vo2max','male',50,59,'poor',0,17,'Cooper Institute / ACSM'),
  ('vo2max','male',50,59,'fair',18,24,'Cooper Institute / ACSM'),
  ('vo2max','male',50,59,'good',25,33,'Cooper Institute / ACSM'),
  ('vo2max','male',50,59,'excellent',34,42,'Cooper Institute / ACSM'),
  ('vo2max','male',50,59,'superior',43,null,'Cooper Institute / ACSM'),
  ('vo2max','male',60,69,'poor',0,15,'Cooper Institute / ACSM'),
  ('vo2max','male',60,69,'fair',16,22,'Cooper Institute / ACSM'),
  ('vo2max','male',60,69,'good',23,30,'Cooper Institute / ACSM'),
  ('vo2max','male',60,69,'excellent',31,40,'Cooper Institute / ACSM'),
  ('vo2max','male',60,69,'superior',41,null,'Cooper Institute / ACSM'),
  ('vo2max','male',70,120,'poor',0,13,'Cooper Institute / ACSM'),
  ('vo2max','male',70,120,'fair',14,20,'Cooper Institute / ACSM'),
  ('vo2max','male',70,120,'good',21,27,'Cooper Institute / ACSM'),
  ('vo2max','male',70,120,'excellent',28,36,'Cooper Institute / ACSM'),
  ('vo2max','male',70,120,'superior',37,null,'Cooper Institute / ACSM'),
  ('vo2max','female',20,29,'poor',0,23,'Cooper Institute / ACSM'),
  ('vo2max','female',20,29,'fair',24,30,'Cooper Institute / ACSM'),
  ('vo2max','female',20,29,'good',31,37,'Cooper Institute / ACSM'),
  ('vo2max','female',20,29,'excellent',38,48,'Cooper Institute / ACSM'),
  ('vo2max','female',20,29,'superior',49,null,'Cooper Institute / ACSM'),
  ('vo2max','female',30,39,'poor',0,19,'Cooper Institute / ACSM'),
  ('vo2max','female',30,39,'fair',20,27,'Cooper Institute / ACSM'),
  ('vo2max','female',30,39,'good',28,33,'Cooper Institute / ACSM'),
  ('vo2max','female',30,39,'excellent',34,44,'Cooper Institute / ACSM'),
  ('vo2max','female',30,39,'superior',45,null,'Cooper Institute / ACSM'),
  ('vo2max','female',40,49,'poor',0,16,'Cooper Institute / ACSM'),
  ('vo2max','female',40,49,'fair',17,23,'Cooper Institute / ACSM'),
  ('vo2max','female',40,49,'good',24,30,'Cooper Institute / ACSM'),
  ('vo2max','female',40,49,'excellent',31,41,'Cooper Institute / ACSM'),
  ('vo2max','female',40,49,'superior',42,null,'Cooper Institute / ACSM'),
  ('vo2max','female',50,59,'poor',0,14,'Cooper Institute / ACSM'),
  ('vo2max','female',50,59,'fair',15,20,'Cooper Institute / ACSM'),
  ('vo2max','female',50,59,'good',21,27,'Cooper Institute / ACSM'),
  ('vo2max','female',50,59,'excellent',28,37,'Cooper Institute / ACSM'),
  ('vo2max','female',50,59,'superior',38,null,'Cooper Institute / ACSM'),
  ('vo2max','female',60,69,'poor',0,12,'Cooper Institute / ACSM'),
  ('vo2max','female',60,69,'fair',13,17,'Cooper Institute / ACSM'),
  ('vo2max','female',60,69,'good',18,23,'Cooper Institute / ACSM'),
  ('vo2max','female',60,69,'excellent',24,34,'Cooper Institute / ACSM'),
  ('vo2max','female',60,69,'superior',35,null,'Cooper Institute / ACSM'),
  ('vo2max','female',70,120,'poor',0,10,'Cooper Institute / ACSM'),
  ('vo2max','female',70,120,'fair',11,15,'Cooper Institute / ACSM'),
  ('vo2max','female',70,120,'good',16,20,'Cooper Institute / ACSM'),
  ('vo2max','female',70,120,'excellent',21,30,'Cooper Institute / ACSM'),
  ('vo2max','female',70,120,'superior',31,null,'Cooper Institute / ACSM');

-- The Burr 6MWT equation, recorded with its provenance
insert into public.studies (pmid, title, authors, journal, year, key_finding, evidence_grade, pillar_id, category_id)
values ('21673494','Predicting VO2max from a 6-minute walk test in healthy adults','Burr JF, et al.','The Physician and Sportsmedicine',2011,
        'Non-exercise style regression estimating VO2max from 6MWT distance, weight, sex, resting HR and age; R2 = 0.72 in 44 healthy working-aged adults','promising',1,4)
on conflict (pmid) do nothing;
