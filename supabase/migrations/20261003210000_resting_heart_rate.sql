-- Resting heart rate as a baseline measure (Randy, 2026-10-03): beats per
-- minute, seated and resting, in the morning. Capacity lens, P1-C5
-- Endurance. Context only: no change threshold is attached, and medication
-- or conditioning can move it either way, so the app never calls a change
-- better or worse.
insert into public.metric_definitions (code, title, unit, lens, category_key, method, directionality, min_value, max_value)
values ('resting_heart_rate', 'Resting heart rate', 'beats/min', 'capacity', 'P1-C5',
        'In the morning, seated and resting quietly for 5 minutes. Count your pulse for 60 seconds, or read a reliable monitor.',
        'context_only', 30, 200)
on conflict (code) do update set title = excluded.title, unit = excluded.unit, lens = excluded.lens,
  category_key = excluded.category_key, method = excluded.method, directionality = excluded.directionality,
  min_value = excluded.min_value, max_value = excluded.max_value;
