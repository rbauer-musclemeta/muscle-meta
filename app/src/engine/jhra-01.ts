/* JHRA_01 scoring — algorithm jhra-alg-1.0.0 (JHRA v1.0 draft, Parts 2 to 5).

   Pure and deterministic: same answers in, same result out, in Node, the
   browser and Deno. In order:
     1. safety gate: any yes on S1-S7 stops; no score is produced;
     2. completeness gate: every scored and context answer, or no result
        (no imputation, no zero-filling);
     3. raw points per domain (A capped at 30; E and F may go below 0 with
        credits and are floored at 0);
     4. domain score = round(clamp(raw, 0, max) / max x 100), half up;
     5. Joint Risk Score = min(100, round(sum(domain x weight) + context));
     6. tier, priority domains (>= 50, highest first) and flags.

   Integers throughout: weights are whole hundredths, so the weighted sum is
   an integer number of hundredths and rounding is exact.

   Higher is worse. Educational, not diagnostic. Flags never change a score;
   they always display and override the tier's suggested next step. */

import {
  JHRA_QUESTIONS, JHRA_SAFETY, JHRA_DOMAINS, JHRA_DOMAIN_ORDER, JHRA_TIERS, JHRA_PRIORITY_MIN,
  JHRA_ALGORITHM_VERSION, JHRA_SCORE_FAMILY, JHRA_INJURY_TYPES, JHRA_INJURY_JOINTS, JHRA_INJURY_SIDES,
  JHRA_INJURY_TREATMENTS, JHRA_MAX_INJURIES, JHRA_INJURY_CAP, JHRA_MODIFIER_ONGOING, JHRA_MODIFIER_REHAB,
  JHRA_BMI_BANDS, JHRA_CHAIR_NORMS, JHRA_CHAIR_POINTS, JHRA_GLP1_CREDIT, JHRA_FLAG_COPY,
  type DomainKey, type JhraTier, type JhraFlagCode, type Question
} from './jhra-01-definition.ts';

export { JHRA_ALGORITHM_VERSION };

export type Injury = {
  type: string;
  joint: string;
  side: string;
  years_ago?: number | null;
  treatment?: string | null;
  ongoing: boolean;            // ongoing swelling, giving way or catching
  rehab_incomplete: boolean;   // no rehabilitation, or not completed
};
export type JhraValue = number | string | string[] | Injury[] | null | undefined;
export type JhraAnswers = Record<string, JhraValue>;
export type JhraInput = { answers: JhraAnswers };

export type JhraFlag = { code: JhraFlagCode; audience: 'user'; message: string; reasons: string[] };
export type DomainResult = { raw: number; max: number; score: number; weight: number };

export type JhraComplete = {
  status: 'complete';
  algorithmVersion: string;
  scoreFamily: typeof JHRA_SCORE_FAMILY;
  total: { score: number; tier: JhraTier };
  weightedSubtotal: number;          // sum(domain x weight), one decimal
  context: { age: number; points: number; reasons: string[] };
  domains: Record<DomainKey, DomainResult>;
  priorities: DomainKey[];           // domains >= 50, highest first, ties in A-G order
  flags: JhraFlag[];
  bmi: number;                       // one decimal
  chairStand: { result: 'above' | 'within' | 'below' | 'unable'; range: [number, number] };
  injuryPoints: number[];            // per injury, before the cap
};
export type JhraSafetyStop = { status: 'safety_stop'; algorithmVersion: string; triggered: string[] };
export type JhraInsufficient = { status: 'insufficient_information'; algorithmVersion: string; missing: string[]; invalid: string[] };
export type JhraResult = JhraComplete | JhraSafetyStop | JhraInsufficient;

const BY_FIELD: Record<string, Question> = Object.fromEntries(JHRA_QUESTIONS.map(q => [q.field, q]));
const codes = (opts: { code: string }[]) => new Set(opts.map(o => o.code));
const INJURY_TYPES = codes(JHRA_INJURY_TYPES);
const JOINTS = codes(JHRA_INJURY_JOINTS);
const SIDES = codes(JHRA_INJURY_SIDES);
const TREATMENTS = codes(JHRA_INJURY_TREATMENTS);

/* ── validation ─────────────────────────────────────────────────────────── */

function validInjury(x: unknown): boolean {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const i = x as Record<string, unknown>;
  if (typeof i.type !== 'string' || !INJURY_TYPES.has(i.type)) return false;
  if (typeof i.joint !== 'string' || !JOINTS.has(i.joint)) return false;
  if (typeof i.side !== 'string' || !SIDES.has(i.side)) return false;
  if (typeof i.ongoing !== 'boolean' || typeof i.rehab_incomplete !== 'boolean') return false;
  if (i.years_ago !== undefined && i.years_ago !== null
      && !(typeof i.years_ago === 'number' && Number.isInteger(i.years_ago) && i.years_ago >= 0 && i.years_ago <= 100)) return false;
  if (i.treatment !== undefined && i.treatment !== null && !(typeof i.treatment === 'string' && TREATMENTS.has(i.treatment))) return false;
  return true;
}

function check(q: Question, v: JhraValue): 'ok' | 'missing' | 'invalid' {
  if (v === null || v === undefined || v === '') return 'missing';
  switch (q.type) {
    case 'single':
      return typeof v === 'string' && q.options!.some(o => o.code === v) ? 'ok' : 'invalid';
    case 'number':
      return typeof v === 'number' && Number.isFinite(v) && v >= q.min! && v <= q.maxValue! ? 'ok' : 'invalid';
    case 'chair_stand':
      return v === 'unable' || (typeof v === 'number' && Number.isInteger(v) && v >= q.min! && v <= q.maxValue!) ? 'ok' : 'invalid';
    case 'multi': {
      if (!Array.isArray(v)) return 'invalid';
      const allowed = codes(q.options!);
      const arr = v as unknown[];
      if (!arr.every(c => typeof c === 'string' && allowed.has(c)) || new Set(arr).size !== arr.length) return 'invalid';
      return arr.length > 1 && arr.includes('none') ? 'invalid' : 'ok';
    }
    case 'injuries':
      return Array.isArray(v) && v.length <= JHRA_MAX_INJURIES && (v as unknown[]).every(validInjury) ? 'ok' : 'invalid';
  }
}

const pts = (field: string, v: JhraValue): number => BY_FIELD[field].options!.find(o => o.code === v)!.points ?? 0;

/* round(n / d) half up, for n >= 0, d > 0 */
const roundDiv = (n: number, d: number) => Math.floor((2 * n + d) / (2 * d));

export function chairStandRange(age: number, sex: string): [number, number] {
  const row = JHRA_CHAIR_NORMS.find(r => age >= r.minAge)!;
  const r = sex === 'male' ? row.male : row.female;
  return [r[0], r[1]];
}

export function contextPoints(age: number, sex: string, postmenopausal: string | null | undefined) {
  const reasons: string[] = [];
  let points = age >= 70 ? 7 : age >= 60 ? 5 : age >= 50 ? 3 : 0;
  if (points) reasons.push(`age_${age >= 70 ? '70_plus' : age >= 60 ? '60_69' : '50_59'}`);
  if (sex === 'female' && (age >= 50 || postmenopausal === 'yes')) { points += 2; reasons.push('female_50_or_postmenopausal'); }
  return { points, reasons };
}

export function injuryPoints(i: Injury): number {
  if (i.type === 'joint_replacement') return 0;
  const base = JHRA_INJURY_TYPES.find(t => t.code === i.type)!.points!;
  return base + (i.ongoing ? JHRA_MODIFIER_ONGOING : 0) + (i.rehab_incomplete ? JHRA_MODIFIER_REHAB : 0);
}

/* ── scoring ────────────────────────────────────────────────────────────── */

export function scoreJHRA(input: JhraInput): JhraResult {
  const a = input.answers ?? {};
  const base = { algorithmVersion: JHRA_ALGORITHM_VERSION };

  // 1. safety gate first; it routes only
  const missing: string[] = [];
  const invalid: string[] = [];
  for (const q of JHRA_SAFETY) {
    const c = check(q, a[q.field]);
    if (c !== 'ok') (c === 'missing' ? missing : invalid).push(q.field);
  }
  const triggered = JHRA_SAFETY.filter(q => a[q.field] === 'yes').map(q => q.field);
  if (triggered.length) return { status: 'safety_stop', ...base, triggered };

  // 2. completeness
  for (const q of JHRA_QUESTIONS) {
    if (q.optional && (a[q.field] === undefined || a[q.field] === null)) continue;
    const c = check(q, a[q.field]);
    if (c !== 'ok') (c === 'missing' ? missing : invalid).push(q.field);
  }
  if (missing.length || invalid.length) return { status: 'insufficient_information', ...base, missing, invalid };

  const age = a.jh_age as number;
  const sex = a.jh_sex as string;
  const injuries = a.jh_injuries as Injury[];
  const flags: JhraFlag[] = [];
  const flag = (code: JhraFlagCode, reasons: string[]) => flags.push({ code, audience: 'user', message: JHRA_FLAG_COPY[code], reasons });

  // 3. raw points
  const perInjury = injuries.map(injuryPoints);
  const rawA = Math.min(JHRA_INJURY_CAP, perInjury.reduce((s, p) => s + p, 0));

  // BMI to one decimal, computed from integer tenths to avoid float noise at band edges
  const h = (a.jh_height_cm as number) / 100;
  const bmi = Math.round(((a.jh_weight_kg as number) / (h * h)) * 10) / 10;
  const rawB = JHRA_BMI_BANDS.find(b => bmi >= b.min)!.points
    + pts('jh_waist', a.jh_waist) + pts('jh_glucose', a.jh_glucose) + pts('jh_bp', a.jh_bp)
    + pts('jh_lipids', a.jh_lipids) + pts('jh_gout', a.jh_gout);

  const rawC = pts('jh_strength_days', a.jh_strength_days) + pts('jh_chair_arms', a.jh_chair_arms)
    + pts('jh_grip', a.jh_grip) + pts('jh_thigh_deficit', a.jh_thigh_deficit);

  const range = chairStandRange(age, sex);
  const cs = a.jh_chair_stand;
  const chair: JhraComplete['chairStand']['result'] =
    cs === 'unable' ? 'unable' : (cs as number) > range[1] ? 'above' : (cs as number) >= range[0] ? 'within' : 'below';
  const rawD = JHRA_CHAIR_POINTS[chair] + pts('jh_single_leg', a.jh_single_leg) + pts('jh_stairs', a.jh_stairs)
    + pts('jh_activity_min', a.jh_activity_min) + pts('jh_walk10', a.jh_walk10);

  const rawE = pts('jh_gain_since25', a.jh_gain_since25) + pts('jh_weight_12m', a.jh_weight_12m);

  const strength2 = a.jh_strength_days === '2plus';
  const glp1 = a.jh_glp1 === 'yes';
  const rawF = pts('jh_steroid_oral', a.jh_steroid_oral) + pts('jh_injections', a.jh_injections)
    + pts('jh_fluoroquinolone', a.jh_fluoroquinolone) + pts('jh_aromatase', a.jh_aromatase)
    + pts('jh_dpp4', a.jh_dpp4) + pts('jh_diuretic', a.jh_diuretic)
    + (glp1 && bmi >= 30 && strength2 ? JHRA_GLP1_CREDIT : 0);

  const rawG = pts('jh_pain_days', a.jh_pain_days) + pts('jh_stiffness', a.jh_stiffness)
    + pts('jh_swelling', a.jh_swelling) + pts('jh_giving_way', a.jh_giving_way);

  const raws: Record<DomainKey, number> = { A: rawA, B: rawB, C: rawC, D: rawD, E: rawE, F: rawF, G: rawG };

  // 4. domain scores; 5. total
  const domains = {} as Record<DomainKey, DomainResult>;
  let hundredths = 0;
  for (const k of JHRA_DOMAIN_ORDER) {
    const { max, weight } = JHRA_DOMAINS[k];
    const raw = Math.min(max, Math.max(0, raws[k]));
    const score = roundDiv(100 * raw, max);
    domains[k] = { raw: raws[k], max, score, weight };
    hundredths += score * weight;
  }
  const context = contextPoints(age, sex, a.jh_postmenopausal as string | null | undefined);
  const total = Math.min(100, roundDiv(hundredths + 100 * context.points, 100));
  const tier = JHRA_TIERS.find(t => total >= t.min)!.label;

  // 6. priorities and flags
  const priorities = JHRA_DOMAIN_ORDER
    .filter(k => domains[k].score >= JHRA_PRIORITY_MIN)
    .sort((x, y) => domains[y].score - domains[x].score || JHRA_DOMAIN_ORDER.indexOf(x) - JHRA_DOMAIN_ORDER.indexOf(y));

  if (a.jh_weight_12m === 'unintentional') flag('F-W1', ['jh_weight_12m=unintentional']);
  if (a.jh_steroid_oral === 'long_term') flag('F-M1', ['jh_steroid_oral=long_term']);
  if (a.jh_injections === '3plus') flag('F-M2', ['jh_injections=3plus']);
  if (a.jh_fluoroquinolone === 'yes' && age >= 60) flag('F-M3', ['jh_fluoroquinolone=yes', 'age_60_plus']);
  if (a.jh_stiffness === '30plus' && a.jh_swelling === 'yes') flag('F-S1', ['jh_stiffness=30plus', 'jh_swelling=yes']);
  if (glp1 && a.jh_weight_12m === 'lost10_without_strength') flag('F-G1', ['jh_glp1=yes', 'jh_weight_12m=lost10_without_strength']);
  if (injuries.some(i => i.type === 'joint_replacement')) flag('F-R1', ['jh_injuries:joint_replacement']);

  return {
    status: 'complete', ...base, scoreFamily: JHRA_SCORE_FAMILY,
    total: { score: total, tier },
    weightedSubtotal: Math.round(hundredths / 10) / 10,
    context: { age, ...context },
    domains, priorities, flags, bmi,
    chairStand: { result: chair, range },
    injuryPoints: perInjury
  };
}

/* Stable text of every answer that can change the result, for the
   write-once result row. */
export function jhraFingerprint(input: JhraInput): string {
  const a = input.answers ?? {};
  const fields = [...JHRA_SAFETY, ...JHRA_QUESTIONS].map(q => q.field).sort();
  const parts = fields.map(f => {
    const v = a[f];
    if (f === 'jh_injuries' && Array.isArray(v)) {
      return `${f}=${(v as Injury[]).map(i => [i.type, i.joint, i.side, i.years_ago ?? '', i.treatment ?? '', i.ongoing, i.rehab_incomplete].join(':')).join(';')}`;
    }
    return `${f}=${Array.isArray(v) ? [...(v as string[])].sort().join(',') : v ?? ''}`;
  });
  parts.push(`alg=${JHRA_ALGORITHM_VERSION}`);
  return parts.join('|');
}
