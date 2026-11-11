/* Prints the MM_4P_01 version 1.0.0 definition exactly as it is published
   into assessment_versions.definition. The publishing migration embeds this
   output, and tests/mm-4p-01-publish.test.ts fails if the two ever differ,
   so the database snapshot and the engine cannot drift.

   The safety question is listed first in `questions` (role "safety") so the
   database trigger that checks response codes accepts it; it routes and never
   scores. */
import {
  MM4P_CODE, MM4P_LEGACY_CODE, MM4P_VERSION_LABEL, MM4P_ALGORITHM_VERSION, MM4P_ITEMS, MM4P_SAFETY,
  MM4P_WEIGHTS, MM4P_TIERS, MM4P_FLAG_COPY, MM4P_REASSESS_DAYS, MM4P_GOAL_CATEGORIES
} from '../src/engine/mm-4p-01-definition.ts';

const item = i => Object.fromEntries(Object.entries({
  field: i.field, id: i.id, part: i.part, category: i.category, prompt: i.prompt, type: i.type,
  role: i.scored ? 'score' : 'context', direction: i.direction, anchors: i.anchors, options: i.options,
  max: i.max, min: i.min, max_value: i.maxValue, count_score: i.countScore, visible_if: i.visibleIf
}).filter(([, v]) => v !== undefined));

export const definition = {
  code: MM4P_CODE,
  legacy_code: MM4P_LEGACY_CODE,
  version_label: MM4P_VERSION_LABEL,
  algorithm_version: MM4P_ALGORITHM_VERSION,
  title: 'Muscle-Meta Matrix™ full assessment',
  score_family: 'mm_health_score',
  questions: [
    { field: MM4P_SAFETY.field, id: 'SAFETY', part: 'safety', prompt: MM4P_SAFETY.title, type: 'single', role: 'safety', options: MM4P_SAFETY.options },
    ...MM4P_ITEMS.map(item)
  ],
  category_weights_pct: MM4P_WEIGHTS,
  pillar_weights_pct: { 1: 25, 2: 25, 3: 25, 4: 25 },
  tiers: MM4P_TIERS,
  goal_categories: MM4P_GOAL_CATEGORIES,
  flag_copy: MM4P_FLAG_COPY,
  reassess_days: MM4P_REASSESS_DAYS,
  notes: 'Pilot self-report instrument, not validated. Educational, not diagnostic. The safety answer changes the route only; flags never change a score.'
};

if (process.argv[1] && process.argv[1].endsWith('export-mm4p-definition.mjs')) {
  process.stdout.write(JSON.stringify(definition));
}
