/* Prints the FLR_READINESS_01 v1 definition exactly as it is published into
   assessment_versions.definition. Used to write the publishing migration and
   by the parity test, so the database snapshot and the engine never differ. */
import { READINESS_V1, RAW_SCALE, ORIENTATION, SAFETY_GATE } from '../src/engine/definitions.ts';

export const definition = {
  code: READINESS_V1.assessmentCode,
  version_label: READINESS_V1.versionLabel,
  algorithm_version: READINESS_V1.algorithmVersion,
  title: READINESS_V1.title,
  scale: RAW_SCALE,
  questions: READINESS_V1.questions,
  orientation_code: ORIENTATION.code,
  safety_gate: SAFETY_GATE,
  notes: 'Pilot routing thresholds, not validated clinical cut points. Orientation never changes a score; the safety answer changes the route only.'
};
if (process.argv[1] && process.argv[1].endsWith('export-definition.mjs')) {
  process.stdout.write(JSON.stringify(definition));
}
