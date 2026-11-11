/* MM_4P_01 scoring — algorithm mm-4p-alg-1.0.0 (spec sections 4 to 6).

   Pure and deterministic: same answers in, same result out, in Node, the
   browser and Deno. Implements, in order:
     1. completeness gate: all 42 scored items and the safety question, or no
        result (no imputation, no zero-filling);
     2. item score 0-100, higher is better (HB / LB / option scores / counts);
     3. category = mean of its scored items (equal weights, W-7);
     4. pillar = sum of category x weight_in_pillar (Option B, W-1 to W-3);
     5. MM™ Health Score = mean of the four pillars (25 % each, W-6);
     6. tier label on the total, each pillar and each category;
     7. flags and rule-based next actions.

   Precision. Every item score is a multiple of 25, every category a mean of
   3 or 4 items, every weight a whole hundredth. The engine therefore works in
   integers: a category in units of 1/12 point, a pillar in 1/1200, the total
   in 1/4800. Values are rounded half-up to one decimal only at the end, and
   tiers are applied to the rounded value, so no boundary case depends on
   floating-point noise.

   Educational self-assessment, not a diagnosis. Flags never change a score.

   Starting level (Randy, 2026-11-11: "self-assessed ability: high =
   performance, low = foundation, building = medium (recovery, post injury)").
   Pilot rule, not a validated cut point: the Pillar 1 (Exercise & Mobility)
   score is the self-assessed ability; >= 80 Performance, 55-79.9 Building,
   < 55 Foundation (Program 1's bands). A recovery signal (recent hospital
   stay, or the safety answer yes / not sure) caps the level at Building. */

import { CATEGORIES, PILLARS, type CategoryKey } from './framework.ts';
import {
  MM4P_ITEMS, MM4P_WEIGHTS, MM4P_TIERS, MM4P_GOAL_CATEGORIES, MM4P_PHYSICAL_CATEGORIES,
  MM4P_ALGORITHM_VERSION, MM4P_FLAG_COPY,
  type Item, type SafetyStatus, type TierLabel, type FlagCode
} from './mm-4p-01-definition.ts';

export { MM4P_ALGORITHM_VERSION };

export type AnswerValue = number | string | string[] | null | undefined;
export type MM4PAnswers = Record<string, AnswerValue>;

export type MM4PInput = { answers: MM4PAnswers; safety: SafetyStatus | null | undefined };

export type Scored = { score: number; tier: TierLabel };
export type Flag = { code: FlagCode; audience: 'user'; message: string; reasons: string[] };
export type NextAction = { category: CategoryKey; role: 'core' | 'secondary'; reasons: string[] };
export type Level = 'foundation' | 'building' | 'performance';
export type StartingLevel = { abilityScore: number; calculated: Level; level: Level; reasons: string[] };

export type MM4PComplete = {
  status: 'complete';
  algorithmVersion: string;
  scoreFamily: 'mm_health_score';
  total: Scored;
  pillars: Record<1 | 2 | 3 | 4, Scored>;
  categories: Record<CategoryKey, Scored>;
  itemScores: Record<string, number>;      // field -> 0..100, scored items only
  flags: Flag[];
  safetyRoute: 'clear' | 'professional_review';
  physicalActivityWithheld: boolean;
  coreFocus: CategoryKey[];
  secondary: CategoryKey[];
  strengths: CategoryKey[];
  nextActions: NextAction[];
  startingLevel: StartingLevel;
};

export type MM4PInsufficient = {
  status: 'insufficient_information';
  algorithmVersion: string;
  missing: string[];   // field codes that are absent
  invalid: string[];   // field codes present but not a valid answer
};

export type MM4PResult = MM4PComplete | MM4PInsufficient;

const CATEGORY_ORDER = Object.keys(CATEGORIES) as CategoryKey[];
const SCORED = MM4P_ITEMS.filter(i => i.scored);
const BY_FIELD = Object.fromEntries(MM4P_ITEMS.map(i => [i.field, i])) as Record<string, Item>;

/* ── answer validation ─────────────────────────────────────────────────── */

type Check = { ok: true } | { ok: false; why: 'missing' | 'invalid' };

function checkAnswer(item: Item, v: AnswerValue): Check {
  if (v === null || v === undefined || v === '') return { ok: false, why: 'missing' };
  switch (item.type) {
    case 'scale5':
      return Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 5 ? { ok: true } : { ok: false, why: 'invalid' };
    case 'number':
      return typeof v === 'number' && Number.isFinite(v)
        && (item.min === undefined || v >= item.min) && (item.maxValue === undefined || v <= item.maxValue)
        ? { ok: true } : { ok: false, why: 'invalid' };
    case 'text':
      return typeof v === 'string' ? { ok: true } : { ok: false, why: 'invalid' };
    case 'single':
      return typeof v === 'string' && item.options!.some(o => o.code === v) ? { ok: true } : { ok: false, why: 'invalid' };
    case 'multi': {
      if (!Array.isArray(v) || v.length === 0) return { ok: false, why: Array.isArray(v) ? 'missing' : 'invalid' };
      const codes = new Set(item.options!.map(o => o.code));
      if (new Set(v).size !== v.length || !v.every(c => codes.has(c))) return { ok: false, why: 'invalid' };
      const exclusive = item.options!.filter(o => o.exclusive).map(o => o.code);
      if (v.length > 1 && v.some(c => exclusive.includes(c))) return { ok: false, why: 'invalid' };
      if (item.max !== undefined && v.length > item.max) return { ok: false, why: 'invalid' };
      return { ok: true };
    }
  }
}

/* ── item points: 0..4, i.e. the 0-100 item score divided by 25 ────────── */

function itemPoints(item: Item, v: AnswerValue): number {
  if (item.type === 'scale5') {
    const raw = v as number;
    return item.direction === 'LB' ? 5 - raw : raw - 1;
  }
  if (item.type === 'single') {
    const opt = item.options!.find(o => o.code === v)!;
    return opt.score! - 1;
  }
  // multi scored by count (W-4)
  const picked = (v as string[]).filter(c => c !== 'none').length;
  if (item.countScore === 'tasks') return picked;   // 0..4 tasks -> option 1..5 -> 0..4 points
  return Math.max(0, 4 - picked);                     // 0 difficulties = 5, 1 = 4, 2 = 3, 3 = 2, 4-5 = 1
}

/* ── rounding and tiers ────────────────────────────────────────────────── */

/* value = n / d points; round half up to one decimal, exactly. */
function round1(n: number, d: number): number {
  const tenths = Math.floor((2 * 10 * n + d) / (2 * d));
  return tenths / 10;
}
function tierOf(score: number): TierLabel {
  return MM4P_TIERS.find(t => score >= t.min)!.label;
}
const scored = (n: number, d: number): Scored => {
  const score = round1(n, d);
  return { score, tier: tierOf(score) };
};

/* ── scoring ───────────────────────────────────────────────────────────── */

export function scoreMM4P(input: MM4PInput): MM4PResult {
  const answers = input.answers ?? {};
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const item of SCORED) {
    const c = checkAnswer(item, answers[item.field]);
    if (!c.ok) (c.why === 'missing' ? missing : invalid).push(item.field);
  }
  // Unscored answers that are present must still be valid; absent is fine.
  for (const item of MM4P_ITEMS.filter(i => !i.scored)) {
    const v = answers[item.field];
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) continue;
    const c = checkAnswer(item, v);
    if (!c.ok) invalid.push(item.field);
  }
  const safety = input.safety;
  if (safety !== 'no' && safety !== 'yes' && safety !== 'not_sure') missing.push('safety_review_status');
  if (missing.length || invalid.length) {
    return { status: 'insufficient_information', algorithmVersion: MM4P_ALGORITHM_VERSION, missing, invalid };
  }

  /* items -> categories (units of 1/12 point) */
  const itemScores: Record<string, number> = {};
  const catSum: Partial<Record<CategoryKey, number>> = {};
  const catN: Partial<Record<CategoryKey, number>> = {};
  for (const item of SCORED) {
    const p = itemPoints(item, answers[item.field]);
    itemScores[item.field] = p * 25;
    catSum[item.category!] = (catSum[item.category!] ?? 0) + p;
    catN[item.category!] = (catN[item.category!] ?? 0) + 1;
  }
  const cat12 = {} as Record<CategoryKey, number>;   // category score x 12
  for (const k of CATEGORY_ORDER) cat12[k] = (catSum[k]! * 25 * 12) / catN[k]!;  // exact: n is 3 or 4

  /* categories -> pillars (units of 1/1200) -> total (units of 1/4800) */
  const pil1200 = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<1 | 2 | 3 | 4, number>;
  for (const k of CATEGORY_ORDER) pil1200[CATEGORIES[k].pillar as 1 | 2 | 3 | 4] += cat12[k] * MM4P_WEIGHTS[k];
  const total4800 = pil1200[1] + pil1200[2] + pil1200[3] + pil1200[4];

  const categories = Object.fromEntries(CATEGORY_ORDER.map(k => [k, scored(cat12[k], 12)])) as Record<CategoryKey, Scored>;
  const pillars = Object.fromEntries(PILLARS.map(p => [p.id, scored(pil1200[p.id], 1200)])) as Record<1 | 2 | 3 | 4, Scored>;
  const total = scored(total4800, 4800);

  /* ── flags (spec section 6) ── */
  const has = (field: string, code: string) => {
    const v = answers[field];
    return Array.isArray(v) ? v.includes(code) : v === code;
  };
  const flags: Flag[] = [];
  const flag = (code: FlagCode, reasons: string[]) => {
    if (reasons.length) flags.push({ code, audience: 'user', message: MM4P_FLAG_COPY[code], reasons });
  };
  flag('SAFETY_GATE', safety === 'yes' ? ['SAFETY_YES'] : safety === 'not_sure' ? ['SAFETY_NOT_SURE'] : []);
  flag('CARDIO_CLEARANCE', [
    ...(has('pr_health_conditions', 'cardiovascular') ? ['PR5_CARDIOVASCULAR'] : []),
    ...((answers.en_dyspnea_everyday as number) <= 2 ? ['EN2_LE_2'] : [])
  ]);
  flag('RECENT_HOSPITALIZATION', has('pr_health_conditions', 'recent_hospitalization') ? ['PR5_RECENT_HOSPITALIZATION'] : []);
  const fallMultiple = has('ba_falls_past_year', 'yes_multiple');
  flag('FALL_HISTORY', [
    ...(has('ba_falls_past_year', 'yes_once') ? ['BA2_YES_ONCE'] : []),
    ...(has('pr_health_conditions', 'fall_last_year') && !fallMultiple ? ['PR5_FALL_LAST_YEAR'] : [])
  ]);
  flag('FALL_HISTORY_MULTIPLE', fallMultiple ? ['BA2_YES_MULTIPLE'] : []);
  flag('ASSISTIVE_DEVICE', has('fi_aid_use', 'yes_frequently') ? ['FI3_YES_FREQUENTLY'] : []);
  flag('JOINT_REPLACEMENT', has('jh_conditions', 'joint_replacement') ? ['JH3_JOINT_REPLACEMENT'] : []);
  flag('METABOLIC_DIAGNOSIS', [
    ...(Array.isArray(answers.mf_diagnoses) && answers.mf_diagnoses.some(c => c !== 'none') ? ['MF3_DIAGNOSIS'] : []),
    ...(has('pr_health_conditions', 'metabolic') ? ['PR5_METABOLIC'] : [])
  ]);
  flag('MEMORY_CONCERN', answers.bh_memory_vs_5y === 1 ? ['BH1_EQ_1'] : []);
  flag('LOW_MOOD', [
    ...(answers.bh_mood_wellbeing === 1 ? ['BH4_EQ_1'] : []),
    ...(has('pr_health_conditions', 'anxiety_depression') ? ['PR5_ANXIETY_DEPRESSION'] : [])
  ]);
  const flagged = (c: FlagCode) => flags.some(f => f.code === c);

  /* ── priorities (spec 5.4). Scores compared in exact 1/12 units. ── */
  const goals = Array.isArray(answers.pr_primary_goals) ? answers.pr_primary_goals as string[] : [];
  const goalCats = new Set(goals.flatMap(g => MM4P_GOAL_CATEGORIES[g] ?? []));
  const FIVE = 5 * 12;
  const pickOrder: { key: CategoryKey; reasons: string[] }[] = [];
  const remaining = [...CATEGORY_ORDER].sort((a, b) => cat12[a] - cat12[b] || CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
  while (remaining.length) {
    const lowest = remaining[0];
    const near = remaining.filter(k => cat12[k] - cat12[lowest] <= FIVE);
    const goalPick = near.find(k => goalCats.has(k));
    const pick = goalPick && goalPick !== lowest ? goalPick : lowest;
    pickOrder.push({ key: pick, reasons: pick !== lowest ? ['GOAL_TIE_BREAK_WITHIN_5'] : ['LOWEST_SCORE'] });
    remaining.splice(remaining.indexOf(pick), 1);
  }

  let core = pickOrder.slice(0, 2);
  if ((flagged('FALL_HISTORY') || flagged('FALL_HISTORY_MULTIPLE')) && !core.some(c => c.key === 'P4-C11')) {
    const bal = pickOrder.find(c => c.key === 'P4-C11')!;
    core = [{ key: 'P4-C11', reasons: [...bal.reasons, 'FALL_HISTORY_PROMOTES_BALANCE'] }, core[0]];
  }
  const coreKeys = core.map(c => c.key);
  const strengths = CATEGORY_ORDER.filter(k => categories[k].score >= 70);
  const secondary = pickOrder
    .filter(c => !coreKeys.includes(c.key) && categories[c.key].score < 70)
    .slice(0, 2);

  const withheld = safety !== 'no';

  /* ── starting level from self-assessed ability (Pillar 1), exact units ── */
  const p1 = pil1200[1];                               // Pillar 1 score x 1200
  const calculated: Level = p1 >= 80 * 1200 ? 'performance' : p1 >= 55 * 1200 ? 'building' : 'foundation';
  const levelReasons: string[] = [
    calculated === 'performance' ? 'ABILITY_80_PLUS' : calculated === 'building' ? 'ABILITY_55_TO_79' : 'ABILITY_BELOW_55'
  ];
  const recovery = [
    ...(flagged('RECENT_HOSPITALIZATION') ? ['RECOVERY_RECENT_HOSPITALIZATION'] : []),
    ...(withheld ? ['RECOVERY_SAFETY_ANSWER'] : [])
  ];
  let level: Level = calculated;
  if (recovery.length && calculated === 'performance') {
    level = 'building';
    levelReasons.push('CAPPED_BUILDING_RECOVERY', ...recovery);
  }
  const nextActions: NextAction[] = [
    ...core.map(c => ({ category: c.key, role: 'core' as const, reasons: c.reasons })),
    ...secondary.map(c => ({ category: c.key, role: 'secondary' as const, reasons: c.reasons }))
  ].map(a => withheld && MM4P_PHYSICAL_CATEGORIES.includes(a.category)
    ? { ...a, reasons: [...a.reasons, 'PHYSICAL_ACTIVITY_WITHHELD_SAFETY'] } : a);

  return {
    status: 'complete',
    algorithmVersion: MM4P_ALGORITHM_VERSION,
    scoreFamily: 'mm_health_score',
    total, pillars, categories, itemScores, flags,
    safetyRoute: withheld ? 'professional_review' : 'clear',
    physicalActivityWithheld: withheld,
    coreFocus: coreKeys,
    secondary: secondary.map(c => c.key),
    strengths,
    nextActions,
    startingLevel: { abilityScore: pillars[1].score, calculated, level, reasons: levelReasons }
  };
}

/* Deterministic fingerprint of everything that can change the result, stored
   with it so a retried completion with identical answers returns the same
   record. Keys are sorted; multi-select codes are sorted. */
export function mm4pFingerprint(input: MM4PInput): string {
  const parts = Object.keys(BY_FIELD).sort().map(f => {
    const v = input.answers?.[f];
    return `${f}=${Array.isArray(v) ? [...v].sort().join(',') : v ?? ''}`;
  });
  parts.push(`safety=${input.safety ?? ''}`, `alg=${MM4P_ALGORITHM_VERSION}`);
  return parts.join('|');
}
