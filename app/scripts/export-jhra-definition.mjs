/* Prints the JHRA_01 version 1.0.0 definition exactly as it is published
   into assessment_versions.definition. The publishing migration embeds this
   output, and tests/jhra-01-publish.test.ts fails if the two ever differ.

   The seven safety questions come first (role "safety") so the database
   trigger that checks response codes accepts them; they route and never
   score. */
import {
  JHRA_CODE, JHRA_VERSION_LABEL, JHRA_ALGORITHM_VERSION, JHRA_SCORE_FAMILY, JHRA_SAFETY, JHRA_QUESTIONS,
  JHRA_DOMAINS, JHRA_TIERS, JHRA_PRIORITY_MIN, JHRA_INJURY_TYPES, JHRA_INJURY_JOINTS, JHRA_INJURY_SIDES,
  JHRA_INJURY_TREATMENTS, JHRA_MAX_INJURIES, JHRA_INJURY_CAP, JHRA_MODIFIER_ONGOING, JHRA_MODIFIER_REHAB,
  JHRA_BMI_BANDS, JHRA_CHAIR_NORMS, JHRA_CHAIR_POINTS, JHRA_GLP1_CREDIT, JHRA_FLAG_COPY, JHRA_SAFETY_COPY,
  JHRA_REASSESS_DAYS
} from '../src/engine/jhra-01-definition.ts';

const q = i => Object.fromEntries(Object.entries({
  field: i.field, id: i.id, domain: i.domain, prompt: i.prompt, type: i.type, role: i.role,
  options: i.options, min: i.min, max_value: i.maxValue, optional: i.optional, help: i.help
}).filter(([, v]) => v !== undefined));

export const definition = {
  code: JHRA_CODE,
  version_label: JHRA_VERSION_LABEL,
  algorithm_version: JHRA_ALGORITHM_VERSION,
  title: 'Joint health risk assessment',
  score_family: JHRA_SCORE_FAMILY,
  questions: [...JHRA_SAFETY.map(q), ...JHRA_QUESTIONS.map(q)],
  domains: JHRA_DOMAINS,
  tiers: JHRA_TIERS,
  priority_min: JHRA_PRIORITY_MIN,
  injuries: {
    max_entries: JHRA_MAX_INJURIES, cap: JHRA_INJURY_CAP,
    types: JHRA_INJURY_TYPES, joints: JHRA_INJURY_JOINTS, sides: JHRA_INJURY_SIDES, treatments: JHRA_INJURY_TREATMENTS,
    modifiers: { ongoing: JHRA_MODIFIER_ONGOING, rehab_incomplete: JHRA_MODIFIER_REHAB }
  },
  bmi_bands: JHRA_BMI_BANDS,
  chair_stand: { norms: JHRA_CHAIR_NORMS, points: JHRA_CHAIR_POINTS },
  glp1_credit: JHRA_GLP1_CREDIT,
  flag_copy: JHRA_FLAG_COPY,
  safety_copy: JHRA_SAFETY_COPY,
  reassess_days: JHRA_REASSESS_DAYS,
  notes: 'Pilot self-report instrument, not validated. Higher is worse. Educational, not diagnostic. Any safety yes stops before scoring; flags never change a score.'
};

if (process.argv[1] && process.argv[1].endsWith('export-jhra-definition.mjs')) {
  process.stdout.write(JSON.stringify(definition));
}
