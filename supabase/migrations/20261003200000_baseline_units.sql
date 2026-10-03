-- Baseline measure units (Randy, 2026-10-03).
-- Six-minute walk is stored in meters (members enter meters, or yards that
-- the app converts). No walk distances were recorded before this change.
-- The chair rise instructions now give the seat height, 18 to 20 inches.
-- Body weight and grip strength stay stored in pounds; kilograms are
-- converted by the app (app/src/lib/units.ts).
update public.metric_definitions
   set unit = 'm', max_value = 1600
 where code = 'walking_distance';

update public.metric_definitions
   set method = 'Firm chair with a seat 18 to 20 inches high, arms crossed, count full stands in 30 seconds. Stop if unsafe.'
 where code = 'chair_rise_30s';
