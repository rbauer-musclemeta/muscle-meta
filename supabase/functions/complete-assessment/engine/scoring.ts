/* FLR_READINESS_01 scoring and routing — algorithm flr-readiness-alg-1.0.0.

   Implements sections 7-13 of the Program 1 coding handoff exactly. Pure and
   deterministic: same answers in, same result out, in Node, the browser and
   Deno. Every rule that changes a route records a stable reason code, so a
   member, a coach and an auditor can see why a result came out as it did.

   Precision: every weight in the handoff is a multiple of 0.05 and every item
   value is raw/3, so each score is an exact multiple of 5/3. The engine works
   in integers scaled by 3 ("v3" values) and compares bands exactly; floats are
   produced only for display, rounded to one decimal. That removes any chance
   of a boundary case (79.99 vs 80) depending on floating-point noise.

   These are PILOT OPERATIONAL routing thresholds, not validated clinical cut
   points. Nothing here diagnoses, and the Four Lenses are never combined into
   one score or fed into the Muscle-Meta Health Score. */

import { LENSES, type LensKey, type CategoryKey, CATEGORIES } from './framework.ts';
import {
  READINESS_V1, GOAL_METRICS, LENS_DEFAULT_METRIC, METRICS,
  type QuestionField, type SafetyStatus
} from './definitions.ts';

export const ALGORITHM_VERSION = READINESS_V1.algorithmVersion;

export type Raw = 0 | 1 | 2 | 3;
export type Answers = Partial<Record<QuestionField, number | null | undefined>>;

export type AbilityLevel = 'foundation' | 'building' | 'performance';
export type ReadinessRoute = 'standard_start' | 'modified_start' | 'professional_review';

export type ScoreInput = {
  answers: Answers;
  safety: SafetyStatus | null | undefined;
  goal: string | null | undefined;
};

export type LensResult = {
  needs: Record<LensKey, number>;
  profile: 'focused' | 'balanced';
  primary: LensKey | null;
  secondary: LensKey | null;
};

export type PriorityItem = { key: CategoryKey; name: string; need: number };

export type CompleteResult = {
  status: 'complete';
  algorithmVersion: string;
  raw: Record<QuestionField, Raw>;
  ability: { score: number; calculatedLevel: AbilityLevel; level: AbilityLevel; reasons: string[] };
  readiness: { index: number; baseRoute: ReadinessRoute; route: ReadinessRoute; reasons: string[] };
  safetyRoute: 'clear' | 'professional_review';
  lenses: LensResult;
  pillar1: { ranked: PriorityItem[]; powerNeed: number };
  baselineMetrics: string[];
};

export type InsufficientResult = {
  status: 'insufficient_information';
  algorithmVersion: string;
  missing: string[];
};

export type ScoreResult = CompleteResult | InsufficientResult;

const FIELDS = READINESS_V1.questions.map(q => q.field) as QuestionField[];
const FIELD_BY_Q = Object.fromEntries(READINESS_V1.questions.map(q => [q.q, q.field])) as Record<number, QuestionField>;

const isRaw = (v: unknown): v is Raw => v === 0 || v === 1 || v === 2 || v === 3;
const display = (v3: number) => Math.round((v3 / 3) * 10) / 10;

/* Weighted "ability" (3 - raw) sum. Weights are given in twentieths so they
   are integers; result is v3 = sum(w20 * (3 - raw)) * 5. */
function abilityV3(raw: Record<number, Raw>, weights20: Record<number, number>): number {
  let s = 0;
  for (const [q, w] of Object.entries(weights20)) s += w * (3 - raw[Number(q)]);
  return s * 5;
}
/* Weighted "need" (raw) sum, same scaling. */
function needV3(raw: Record<number, Raw>, weights20: Record<number, number>): number {
  let s = 0;
  for (const [q, w] of Object.entries(weights20)) s += w * raw[Number(q)];
  return s * 5;
}

/* Handoff weights expressed in twentieths (0.20 -> 4, 0.15 -> 3, 0.35 -> 7). */
const W = {
  ability: { 4: 4, 5: 3, 6: 3, 7: 4, 8: 6 },                 // 0.20 0.15 0.15 0.20 0.30
  readiness: { 1: 3, 2: 2, 3: 3, 6: 3, 8: 4, 9: 3, 10: 2 },    // 0.15 0.10 0.15 0.15 0.20 0.15 0.10
  structure: { 2: 20 },                                       // Q2 need
  capacity: { 4: 8, 5: 6, 6: 6 },                             // 0.40 0.30 0.30
  function: { 3: 2, 4: 2, 5: 2, 7: 4, 8: 7, 9: 3 },           // 0.10 0.10 0.10 0.20 0.35 0.15
  experience: { 1: 4, 3: 5, 9: 3, 10: 8 },                    // 0.20 0.25 0.15 0.40
  strength: { 4: 12, 5: 8 }                                   // 0.60 0.40
} as const;

/* v3 thresholds: value * 3 */
const T = { v80: 240, v75: 225, v55: 165, v50: 150, v40: 120, v25: 75, v15: 45 };

const ROUTE_SEVERITY: Record<ReadinessRoute, number> = { standard_start: 0, modified_start: 1, professional_review: 2 };

export function scoreReadiness(input: ScoreInput): ScoreResult {
  /* ── validate: a result is only final with every item and the safety gate ── */
  const missing: string[] = [];
  const raw: Record<number, Raw> = {};
  for (const q of READINESS_V1.questions) {
    const v = input.answers[q.field];
    if (isRaw(v)) raw[q.q] = v;
    else missing.push(q.field);
  }
  const safety = input.safety;
  if (safety !== 'no' && safety !== 'yes' && safety !== 'not_sure') missing.push('safety_review_status');
  if (missing.length) {
    return { status: 'insufficient_information', algorithmVersion: ALGORITHM_VERSION, missing };
  }

  /* ── ability level (Q4-Q8) ── */
  const abilityScoreV3 = abilityV3(raw, W.ability);
  const calculatedLevel: AbilityLevel =
    abilityScoreV3 >= T.v80 ? 'performance' : abilityScoreV3 >= T.v55 ? 'building' : 'foundation';
  const abilityReasons: string[] = [];
  const q48 = [4, 5, 6, 7, 8].map(q => raw[q]);
  let level = calculatedLevel;
  const forceQ8 = raw[8] === 3;
  const forceThree = q48.filter(v => v >= 2).length >= 3;
  if (forceQ8) abilityReasons.push('ABILITY_FOUNDATION_Q8_SIGNIFICANT');
  if (forceThree) abilityReasons.push('ABILITY_FOUNDATION_THREE_MODERATE_OR_MORE');
  if (forceQ8 || forceThree) {
    level = 'foundation';
  } else if (q48.some(v => v === 3) && level === 'performance') {
    level = 'building';
    abilityReasons.push('ABILITY_CAPPED_BUILDING_SIGNIFICANT_ITEM');
  }

  /* ── readiness index and route ── */
  const readinessV3 = abilityV3(raw, W.readiness);
  const baseRoute: ReadinessRoute =
    readinessV3 >= T.v75 ? 'standard_start' : readinessV3 >= T.v50 ? 'modified_start' : 'professional_review';
  const readinessReasons: string[] = [
    baseRoute === 'standard_start' ? 'READINESS_INDEX_75_PLUS'
      : baseRoute === 'modified_start' ? 'READINESS_INDEX_50_TO_74' : 'READINESS_INDEX_BELOW_50'
  ];

  const pr: string[] = [];
  if (safety === 'yes') pr.push('SAFETY_GATE_YES');
  if (safety === 'not_sure') pr.push('SAFETY_GATE_NOT_SURE');
  if (raw[2] === 3) pr.push('Q2_SIGNIFICANT_STRUCTURE_CHANGE');
  if (raw[9] === 3) pr.push('Q9_SIGNIFICANT_BALANCE_CONFIDENCE');
  if (raw[1] === 3 && raw[8] >= 2) pr.push('Q1_SIGNIFICANT_WITH_Q8_INDEPENDENCE');
  if (raw[1] === 3 && raw[10] >= 2) pr.push('Q1_SIGNIFICANT_WITH_Q10_RECOVERY');
  if ([3, 6, 8, 10].filter(q => raw[q] === 3).length >= 2) pr.push('TWO_SIGNIFICANT_OF_Q3_Q6_Q8_Q10');

  let route: ReadinessRoute = baseRoute;
  if (pr.length) {
    route = 'professional_review';
    readinessReasons.push(...pr);
  } else {
    const readinessItems = [1, 2, 3, 6, 8, 9, 10];
    const nonOverrideItems = [1, 3, 6, 8, 10]; // Q2 = 3 and Q9 = 3 already route to review
    const mod: string[] = [];
    if (readinessItems.filter(q => raw[q] >= 2).length >= 2) mod.push('MODIFIED_TWO_MODERATE_READINESS_ITEMS');
    if (nonOverrideItems.some(q => raw[q] === 3)) mod.push('MODIFIED_ONE_SIGNIFICANT_READINESS_ITEM');
    if (mod.length) {
      readinessReasons.push(...mod);
      if (ROUTE_SEVERITY[route] < ROUTE_SEVERITY.modified_start) route = 'modified_start';
    }
  }

  /* ── Four Lenses: needs, primary, secondary ── */
  const lensV3: Record<LensKey, number> = {
    structure: needV3(raw, W.structure),
    capacity: needV3(raw, W.capacity),
    function: needV3(raw, W.function),
    experience: needV3(raw, W.experience)
  };
  const order = LENSES.map(l => l.key); // fixed tie-break order
  const sorted = [...order].sort((a, b) => lensV3[b] - lensV3[a] || order.indexOf(a) - order.indexOf(b));
  const balanced = order.every(k => lensV3[k] < T.v25);
  let primary: LensKey | null = null;
  let secondary: LensKey | null = null;
  if (!balanced) {
    primary = sorted[0];
    const second = sorted[1];
    if (lensV3[primary] - lensV3[second] <= T.v15 || lensV3[second] >= T.v40) secondary = second;
  }

  /* ── Pillar 1 priority profile (signals, not the Pillar 1 Health Score) ── */
  const p1V3: Record<CategoryKey, number> = {
    'P1-C1': raw[3] * 100, 'P1-C2': raw[8] * 100, 'P1-C3': raw[7] * 100,
    'P1-C4': needV3(raw, W.strength), 'P1-C5': raw[6] * 100
  } as Record<CategoryKey, number>;
  const p1Order: CategoryKey[] = ['P1-C1', 'P1-C2', 'P1-C3', 'P1-C4', 'P1-C5'];
  const ranked = [...p1Order]
    .sort((a, b) => p1V3[b] - p1V3[a] || p1Order.indexOf(a) - p1Order.indexOf(b))
    .map(key => ({ key, name: CATEGORIES[key].name, need: display(p1V3[key]) }));

  /* ── goal-matched baseline package ── */
  const goal = input.goal && GOAL_METRICS[input.goal] ? input.goal : 'general_baseline';
  const metrics = [...GOAL_METRICS[goal]];
  if (primary) {
    const covered = metrics.some(code => METRICS.find(m => m.code === code)?.lens === primary);
    if (!covered) metrics.push(LENS_DEFAULT_METRIC[primary]);
  }

  return {
    status: 'complete',
    algorithmVersion: ALGORITHM_VERSION,
    raw: Object.fromEntries(FIELDS.map((f, i) => [f, raw[i + 1]])) as Record<QuestionField, Raw>,
    ability: { score: display(abilityScoreV3), calculatedLevel, level, reasons: abilityReasons },
    readiness: { index: display(readinessV3), baseRoute, route, reasons: readinessReasons },
    safetyRoute: safety === 'no' ? 'clear' : 'professional_review',
    lenses: {
      needs: {
        structure: display(lensV3.structure), capacity: display(lensV3.capacity),
        function: display(lensV3.function), experience: display(lensV3.experience)
      },
      profile: balanced ? 'balanced' : 'focused',
      primary, secondary
    },
    pillar1: { ranked, powerNeed: display(raw[5] * 100) },
    baselineMetrics: [...new Set(metrics)]
  };
}

/* Deterministic fingerprint of the scored inputs, stored with the result so a
   retried completion with identical answers returns the same record. */
export function answerFingerprint(input: ScoreInput): string {
  const parts = READINESS_V1.questions.map(q => `${q.field}=${input.answers[q.field] ?? ''}`);
  parts.push(`safety=${input.safety ?? ''}`, `alg=${ALGORITHM_VERSION}`);
  return parts.join('|');
}

export { FIELD_BY_Q };
