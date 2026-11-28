/* Fixture tests for JHRA_01 / jhra-alg-1.0.0.
   W1 is the worked example in the JHRA v1.0 draft, Part 5, worked by hand:
   A43 B48 C57 D53 E78 F9 G53, subtotal 50.0, context +5, total 55, Rebuild,
   priorities E, C, D, G, flag F-G1. A change to any expected number is a
   change to the algorithm and needs a new version. */

import { describe, it, expect } from 'vitest';
import { scoreJHRA, jhraFingerprint, chairStandRange, type JhraAnswers, type JhraComplete, type Injury } from '../src/engine/jhra-01.ts';
import { JHRA_SAFETY, JHRA_DOMAINS } from '../src/engine/jhra-01-definition.ts';

const SAFE = Object.fromEntries(JHRA_SAFETY.map(q => [q.field, 'no']));

/* Lowest-risk answers: every domain raw 0, age 45 male. */
function low(extra: JhraAnswers = {}): JhraAnswers {
  return {
    ...SAFE,
    jh_age: 45, jh_sex: 'male',
    jh_injuries: [],
    jh_height_cm: 180, jh_weight_kg: 70, jh_waist: 'no', jh_glucose: 'neither', jh_bp: 'no', jh_lipids: 'no', jh_gout: 'no',
    jh_strength_days: '2plus', jh_chair_arms: 'no', jh_grip: 'not_below', jh_thigh_deficit: 'no',
    jh_chair_stand: 25, jh_single_leg: 'both', jh_stairs: 'easy', jh_activity_min: '150plus', jh_walk10: 'yes',
    jh_gain_since25: 'no', jh_weight_12m: 'stable',
    jh_steroid_oral: 'none', jh_injections: 'none', jh_fluoroquinolone: 'no', jh_aromatase: 'no', jh_dpp4: 'no',
    jh_diuretic: 'no', jh_glp1: 'no', jh_other_meds: ['none'],
    jh_pain_days: '0', jh_stiffness: 'none', jh_swelling: 'no', jh_giving_way: 'no',
    ...extra
  };
}
const inj = (type: string, o: Partial<Injury> = {}): Injury =>
  ({ type, joint: 'knee', side: 'left', ongoing: false, rehab_incomplete: false, ...o });

function score(a: JhraAnswers): JhraComplete {
  const r = scoreJHRA({ answers: a });
  if (r.status !== 'complete') throw new Error('expected complete, got ' + JSON.stringify(r));
  return r;
}
const dom = (r: JhraComplete) => Object.fromEntries(Object.entries(r.domains).map(([k, d]) => [k, d.score]));
const flagCodes = (r: JhraComplete) => r.flags.map(f => f.code);

/* W1: 58-year-old postmenopausal woman (draft Part 5). */
const W1 = low({
  jh_age: 58, jh_sex: 'female', jh_postmenopausal: 'yes',
  jh_injuries: [inj('acl_meniscus', { years_ago: 34, treatment: 'surgery_pt', ongoing: true })],
  jh_height_cm: 165, jh_weight_kg: 84.4, jh_waist: 'yes', jh_glucose: 'prediabetes',
  jh_strength_days: '0', jh_thigh_deficit: 'yes',
  jh_chair_stand: 11, jh_single_leg: 'one', jh_stairs: 'rail', jh_activity_min: '60_149',
  jh_gain_since25: 'yes', jh_weight_12m: 'lost10_without_strength', jh_glp1: 'yes',
  jh_injections: '1_2',
  jh_pain_days: '3_5', jh_stiffness: 'under30', jh_swelling: 'yes'
});

describe('JHRA_01 worked example (W1)', () => {
  const r = score(W1);
  it('domain scores', () => expect(dom(r)).toEqual({ A: 43, B: 48, C: 57, D: 53, E: 78, F: 9, G: 53 }));
  it('raw points', () => expect(Object.fromEntries(Object.entries(r.domains).map(([k, d]) => [k, d.raw])))
    .toEqual({ A: 13, B: 13, C: 13, D: 16, E: 7, F: 2, G: 8 }));
  it('subtotal 50.0, context +5, total 55, Rebuild', () => {
    expect(r.weightedSubtotal).toBe(50);
    expect(r.context.points).toBe(5);
    expect(r.total).toEqual({ score: 55, tier: 'Rebuild' });
  });
  it('priorities E, C, D, G', () => expect(r.priorities).toEqual(['E', 'C', 'D', 'G']));
  it('flags F-G1 only', () => expect(flagCodes(r)).toEqual(['F-G1']));
  it('BMI 31.0 and chair stand below range', () => {
    expect(r.bmi).toBe(31);
    expect(r.chairStand).toEqual({ result: 'below', range: [12, 17] });
  });
  it('weights sum to 100', () => expect(Object.values(JHRA_DOMAINS).reduce((s, d) => s + d.weight, 0)).toBe(100));
  it('adding strength training 2 days a week lowers the score (draft interpretation)', () => {
    const better = score({ ...W1, jh_strength_days: '2plus', jh_weight_12m: 'lost_with_strength' });
    expect(better.total.score).toBeLessThan(55);
    expect(better.domains.F.raw).toBe(-1);   // 2 injections, GLP-1 credit -3
    expect(better.domains.F.score).toBe(0);  // floored
    expect(flagCodes(better)).not.toContain('F-G1');
  });
});

describe('JHRA_01 tiers and bounds', () => {
  it('all-low answers score 0, Maintain, no priorities', () => {
    const r = score(low());
    expect(r.total).toEqual({ score: 0, tier: 'Maintain' });
    expect(r.priorities).toEqual([]);
    expect(r.flags).toEqual([]);
  });
  it('tier boundaries 19/20, 39/40, 59/60 via context and domains', () => {
    // G raw 15 -> 100 x .10 = 10; age 70 +7 -> 17; female +2 -> 19
    const g = { jh_pain_days: 'daily', jh_stiffness: '30plus', jh_swelling: 'yes', jh_giving_way: 'yes' };
    expect(score(low({ ...g, jh_age: 70, jh_sex: 'female' })).total).toEqual({ score: 19, tier: 'Maintain' });
    // + E raw 1? E has no 1-point answer; use B BMI 25 (3/27 = 11 -> 1.98) -> 20.98 -> 21
    expect(score(low({ ...g, jh_age: 70, jh_sex: 'female', jh_weight_kg: 81 })).total.tier).toBe('Build');
    // A 30 (cap) -> 22; G 10; age 70 +7 -> 39
    const a30 = { jh_injuries: [inj('acl_meniscus', { ongoing: true, rehab_incomplete: true }), inj('acl_meniscus', { side: 'right', ongoing: true, rehab_incomplete: true })] };
    expect(score(low({ ...g, ...a30, jh_age: 70 })).total).toEqual({ score: 39, tier: 'Build' });
    expect(score(low({ ...g, ...a30, jh_age: 70, jh_sex: 'female' })).total).toEqual({ score: 41, tier: 'Rebuild' });
    // + C 23 (18) -> 57 male 70; + E 4 (44 x .1 = 4.4) -> 61.4 -> 61 Guided
    const c = { jh_strength_days: '0', jh_chair_arms: 'yes', jh_grip: 'below', jh_thigh_deficit: 'yes' };
    expect(score(low({ ...g, ...a30, ...c, jh_age: 70 })).total).toEqual({ score: 57, tier: 'Rebuild' });
    expect(score(low({ ...g, ...a30, ...c, jh_age: 70, jh_gain_since25: 'yes' })).total).toEqual({ score: 61, tier: 'Guided' });
  });
  it('injury points are capped at 30', () => {
    const many = Array.from({ length: 5 }, () => inj('acl_meniscus', { ongoing: true, rehab_incomplete: true }));
    const r = score(low({ jh_injuries: many }));
    expect(r.injuryPoints).toEqual([15, 15, 15, 15, 15]);
    expect(r.domains.A).toMatchObject({ raw: 30, score: 100 });
  });
  it('more than 5 injuries is invalid', () => {
    const r = scoreJHRA({ answers: low({ jh_injuries: Array.from({ length: 6 }, () => inj('acl')) }) });
    expect(r).toMatchObject({ status: 'insufficient_information', invalid: ['jh_injuries'] });
  });
  it('credits floor E and F at 0', () => {
    const r = score(low({ jh_weight_12m: 'lost_with_strength', jh_glp1: 'yes', jh_weight_kg: 100 }));
    expect(r.domains.E).toMatchObject({ raw: -2, score: 0 });
    expect(r.domains.F).toMatchObject({ raw: -3, score: 0 });
  });
  it('GLP-1 credit needs BMI 30 or more and strength training', () => {
    expect(score(low({ jh_glp1: 'yes', jh_weight_kg: 100 })).domains.F.raw).toBe(-3);            // BMI 30.9
    expect(score(low({ jh_glp1: 'yes', jh_weight_kg: 90 })).domains.F.raw).toBe(0);              // BMI 27.8
    expect(score(low({ jh_glp1: 'yes', jh_weight_kg: 100, jh_strength_days: '1' })).domains.F.raw).toBe(0);
  });
  it('total is capped at 100', () => {
    const worst = low({
      jh_age: 80, jh_sex: 'female',
      jh_injuries: [inj('acl_meniscus', { ongoing: true, rehab_incomplete: true }), inj('acl_meniscus', { ongoing: true, rehab_incomplete: true })],
      jh_weight_kg: 140, jh_waist: 'yes', jh_glucose: 'type2', jh_bp: 'yes', jh_lipids: 'yes', jh_gout: 'yes',
      jh_strength_days: '0', jh_chair_arms: 'yes', jh_grip: 'below', jh_thigh_deficit: 'yes',
      jh_chair_stand: 'unable', jh_single_leg: 'neither', jh_stairs: 'difficult', jh_activity_min: 'under60', jh_walk10: 'no',
      jh_gain_since25: 'yes', jh_weight_12m: 'unintentional',
      jh_steroid_oral: 'long_term', jh_injections: '3plus', jh_fluoroquinolone: 'yes', jh_aromatase: 'yes', jh_dpp4: 'yes_with_pain', jh_diuretic: 'yes',
      jh_pain_days: 'daily', jh_stiffness: '30plus', jh_swelling: 'yes', jh_giving_way: 'yes'
    });
    const r = score(worst);
    expect(Object.values(dom(r))).toEqual([100, 100, 100, 100, 100, 100, 100]);
    expect(r.total).toEqual({ score: 100, tier: 'Guided' });
  });
});

describe('JHRA_01 chair stand norms', () => {
  it('uses the 40-64 row under 65 and the 90-94 row at 95+', () => {
    expect(chairStandRange(45, 'male')).toEqual([14, 19]);
    expect(chairStandRange(64, 'female')).toEqual([12, 17]);
    expect(chairStandRange(65, 'female')).toEqual([11, 16]);
    expect(chairStandRange(97, 'male')).toEqual([7, 12]);
    expect(chairStandRange(70, 'prefer_not_to_say')).toEqual([10, 15]);
  });
  it('above / within / below / unable', () => {
    const d = (cs: number | string) => score(low({ jh_chair_stand: cs })).chairStand.result;
    expect([d(20), d(19), d(14), d(13), d('unable')]).toEqual(['above', 'within', 'within', 'below', 'unable']);
    expect(score(low({ jh_chair_stand: 'unable' })).domains.D.raw).toBe(10);
  });
});

describe('JHRA_01 context adjustment', () => {
  const ctx = (age: number, sex: string, pm?: string) => score(low({ jh_age: age, jh_sex: sex, jh_postmenopausal: pm })).context.points;
  it('age bands', () => expect([ctx(49, 'male'), ctx(50, 'male'), ctx(60, 'male'), ctx(70, 'male')]).toEqual([0, 3, 5, 7]));
  it('female 50+ or postmenopausal', () => {
    expect(ctx(50, 'female')).toBe(5);
    expect(ctx(47, 'female', 'yes')).toBe(2);
    expect(ctx(47, 'female', 'no')).toBe(0);
    expect(ctx(55, 'prefer_not_to_say')).toBe(3);
  });
});

describe('JHRA_01 flags', () => {
  it('each flag fires on its own trigger', () => {
    expect(flagCodes(score(low({ jh_weight_12m: 'unintentional' })))).toEqual(['F-W1']);
    expect(flagCodes(score(low({ jh_steroid_oral: 'long_term' })))).toEqual(['F-M1']);
    expect(flagCodes(score(low({ jh_injections: '3plus' })))).toEqual(['F-M2']);
    expect(flagCodes(score(low({ jh_fluoroquinolone: 'yes', jh_age: 60 })))).toEqual(['F-M3']);
    expect(flagCodes(score(low({ jh_fluoroquinolone: 'yes', jh_age: 59 })))).toEqual([]);
    expect(flagCodes(score(low({ jh_stiffness: '30plus', jh_swelling: 'yes' })))).toEqual(['F-S1']);
    expect(flagCodes(score(low({ jh_stiffness: '30plus' })))).toEqual([]);
    expect(flagCodes(score(low({ jh_glp1: 'yes', jh_weight_12m: 'lost10_without_strength' })))).toEqual(['F-G1']);
    expect(flagCodes(score(low({ jh_injuries: [inj('joint_replacement', { joint: 'hip' })] })))).toEqual(['F-R1']);
  });
  it('flags never change a score', () => {
    const r = score(low({ jh_injuries: [inj('joint_replacement', { ongoing: true, rehab_incomplete: true })] }));
    expect(r.domains.A.raw).toBe(0);
    expect(r.flags.every(f => f.audience === 'user' && f.message.length > 0)).toBe(true);
  });
});

describe('JHRA_01 safety gate and completeness', () => {
  it('any yes stops before scoring, even with other answers missing', () => {
    expect(scoreJHRA({ answers: { ...SAFE, jh_s4: 'yes' } })).toEqual({ status: 'safety_stop', algorithmVersion: 'jhra-alg-1.0.0', triggered: ['jh_s4'] });
  });
  it('an unanswered safety question is missing, not clear', () => {
    const { jh_s7: _, ...rest } = low();
    expect(scoreJHRA({ answers: rest })).toMatchObject({ status: 'insufficient_information', missing: ['jh_s7'] });
  });
  it('no imputation: missing and invalid answers are reported', () => {
    const r = scoreJHRA({ answers: low({ jh_bp: undefined, jh_stairs: 'escalator', jh_age: 12 }) });
    expect(r).toMatchObject({ status: 'insufficient_information', missing: ['jh_bp'], invalid: ['jh_age', 'jh_stairs'] });
  });
  it('postmenopausal and other meds are optional', () => {
    const { jh_other_meds: _, ...rest } = low();
    expect(scoreJHRA({ answers: rest }).status).toBe('complete');
  });
  it('rejects a malformed injury entry', () => {
    const r = scoreJHRA({ answers: low({ jh_injuries: [{ type: 'acl', joint: 'knee', side: 'left' } as unknown as Injury] }) });
    expect(r).toMatchObject({ status: 'insufficient_information', invalid: ['jh_injuries'] });
  });
});

describe('JHRA_01 fingerprint', () => {
  it('is stable and changes with any answer', () => {
    expect(jhraFingerprint({ answers: W1 })).toBe(jhraFingerprint({ answers: { ...W1 } }));
    expect(jhraFingerprint({ answers: W1 })).not.toBe(jhraFingerprint({ answers: { ...W1, jh_bp: 'yes' } }));
    expect(jhraFingerprint({ answers: W1 })).toContain('alg=jhra-alg-1.0.0');
  });
});
