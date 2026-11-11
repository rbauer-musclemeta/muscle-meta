/* Fixture tests for MM_4P_01 / mm-4p-alg-1.0.0.
   T1-T7 are the test vectors in docs/plans/mm-4p-assessment-spec-v1.md
   section 7; every expected number was worked by hand from the spec. A change
   to any of them is a change to the algorithm and needs a new version.
   T8 (parity with the source's raw /20 sums) is not built: Option A was
   rejected on 2026-10-08, so there is nothing to keep parity with. */

import { describe, it, expect } from 'vitest';
import { scoreMM4P, mm4pFingerprint, type MM4PAnswers, type MM4PComplete } from '../src/engine/mm-4p-01.ts';
import { MM4P_ITEMS, MM4P_WEIGHTS } from '../src/engine/mm-4p-01-definition.ts';
import { CATEGORIES, type CategoryKey } from '../src/engine/framework.ts';

const SCORED = MM4P_ITEMS.filter(i => i.scored);
const CATS = Object.keys(CATEGORIES) as CategoryKey[];

/* Every scored item at one level. 'best' / 'worst' / 'mid' set scales,
   options and checklists to the matching end of the scale. */
function answers(level: 'best' | 'worst' | 'mid', extra: MM4PAnswers = {}): MM4PAnswers {
  const a: MM4PAnswers = {};
  for (const i of SCORED) {
    if (i.type === 'scale5') {
      const hb = level === 'best' ? 5 : level === 'worst' ? 1 : 3;
      a[i.field] = i.direction === 'LB' ? 6 - hb : hb;
    }
  }
  a.fi_aid_use = level === 'best' ? 'no' : level === 'worst' ? 'yes_frequently' : 'sometimes';
  a.ba_falls_past_year = level === 'best' ? 'no' : level === 'worst' ? 'yes_multiple' : 'yes_once';
  a.mo_movement_difficulties = level === 'best' ? ['none']
    : level === 'worst' ? ['bending_forward', 'rotating_torso', 'squatting', 'reaching_overhead', 'looking_over_shoulder']
    : ['squatting', 'reaching_overhead'];
  a.st_tasks_performable = level === 'best' ? ['squats_10', 'pushups_5', 'plank_30s', 'chair_stands_5_no_hands']
    : level === 'worst' ? ['none'] : ['squats_10', 'plank_30s'];
  return { ...a, ...extra };
}
function score(a: MM4PAnswers, safety: 'no' | 'yes' | 'not_sure' = 'no'): MM4PComplete {
  const r = scoreMM4P({ answers: a, safety });
  if (r.status !== 'complete') throw new Error('expected complete, got ' + JSON.stringify(r));
  return r;
}
const codes = (r: MM4PComplete) => r.flags.map(f => f.code);

describe('definition', () => {
  it('has 42 scored items, at least 3 per category, in the spec counts', () => {
    expect(SCORED).toHaveLength(42);
    const per = Object.fromEntries(CATS.map(k => [k, SCORED.filter(i => i.category === k).length]));
    expect(per).toEqual({
      'P1-C1': 3, 'P1-C2': 4, 'P1-C3': 4, 'P1-C4': 4, 'P1-C5': 4, 'P2-C6': 4,
      'P2-C7': 3, 'P3-C8': 3, 'P3-C9': 3, 'P3-C10': 3, 'P4-C11': 4, 'P4-C12': 3
    });
  });
  it('field codes are unique', () => {
    const f = MM4P_ITEMS.map(i => i.field);
    expect(new Set(f).size).toBe(f.length);
  });
  it('category weights sum to 100 inside every pillar, with the approved splits', () => {
    for (const p of [1, 2, 3, 4]) {
      const sum = CATS.filter(k => CATEGORIES[k].pillar === p).reduce((s, k) => s + MM4P_WEIGHTS[k], 0);
      expect(sum).toBe(100);
    }
    expect([MM4P_WEIGHTS['P2-C6'], MM4P_WEIGHTS['P2-C7']]).toEqual([56, 44]);
    expect([MM4P_WEIGHTS['P3-C8'], MM4P_WEIGHTS['P3-C9'], MM4P_WEIGHTS['P3-C10']]).toEqual([38, 30, 32]);
    expect([MM4P_WEIGHTS['P4-C11'], MM4P_WEIGHTS['P4-C12']]).toEqual([54, 46]);
  });
  it('Strength is P1-C4 and Endurance is P1-C5', () => {
    expect(MM4P_ITEMS.find(i => i.id === 'ST1')!.category).toBe('P1-C4');
    expect(MM4P_ITEMS.find(i => i.id === 'EN1')!.category).toBe('P1-C5');
  });
});

describe('spec test vectors', () => {
  it('T1 all best: every category 100, Health Score 100, Optimized, no flags', () => {
    const r = score(answers('best'));
    for (const k of CATS) expect(r.categories[k]).toEqual({ score: 100, tier: 'Optimized' });
    expect(r.total).toEqual({ score: 100, tier: 'Optimized' });
    expect(r.flags).toEqual([]);
    expect(r.strengths).toEqual(CATS);
    expect(r.secondary).toEqual([]);
    expect(r.startingLevel).toMatchObject({ abilityScore: 100, calculated: 'performance', level: 'performance' });
  });

  it('T2 all worst: 0 everywhere, Critical, with the matching flags', () => {
    const r = score(answers('worst'));
    for (const k of CATS) expect(r.categories[k]).toEqual({ score: 0, tier: 'Critical' });
    for (const p of [1, 2, 3, 4] as const) expect(r.pillars[p].score).toBe(0);
    expect(r.total).toEqual({ score: 0, tier: 'Critical' });
    // The spec lists the first three; BH1 = 1 and BH4 = 1 also meet the
    // section 6 triggers for MEMORY_CONCERN and LOW_MOOD.
    expect(codes(r)).toEqual(['CARDIO_CLEARANCE', 'FALL_HISTORY_MULTIPLE', 'ASSISTIVE_DEVICE', 'MEMORY_CONCERN', 'LOW_MOOD']);
    // multiple falls promote Balance into the core focus
    expect(r.coreFocus).toEqual(['P4-C11', 'P1-C1']);
    expect(r.startingLevel.level).toBe('foundation');
  });

  it('T3 midpoint: every category 50, Health Score 50, At risk', () => {
    const r = score(answers('mid'));
    for (const k of CATS) expect(r.categories[k]).toEqual({ score: 50, tier: 'At risk' });
    expect(r.total).toEqual({ score: 50, tier: 'At risk' });
    expect(codes(r)).toEqual(['FALL_HISTORY']);
    expect(r.startingLevel).toMatchObject({ abilityScore: 50, level: 'foundation' });
  });

  it('T4 reversal: JH1 from 1 to 5 drops Joint Health by 33.3 points', () => {
    const r = score(answers('best', { jh_pain_frequency: 5 }));
    expect(r.itemScores.jh_pain_frequency).toBe(0);
    expect(r.categories['P1-C1']).toEqual({ score: 66.7, tier: 'Declining' });
    expect(r.pillars[1].score).toBe(93.3);
    expect(r.total.score).toBe(98.3);
  });

  it('T5 weights: Nutrition 100 and Metabolic Flexibility 0 give Pillar 2 = 56.0', () => {
    const r = score(answers('best', { mf_energy_crashes: 1, mf_meal_gap_tolerance: 1, mf_carb_cravings: 1 }));
    expect(r.categories['P2-C6'].score).toBe(100);
    expect(r.categories['P2-C7'].score).toBe(0);
    expect(r.pillars[2]).toEqual({ score: 56, tier: 'Declining' });
    expect(r.total.score).toBe(89);
  });

  it('T6 incomplete: any one scored item missing gives no result', () => {
    for (const item of SCORED) {
      const a = answers('best');
      delete a[item.field];
      const r = scoreMM4P({ answers: a, safety: 'no' });
      expect(r).toEqual({ status: 'insufficient_information', algorithmVersion: 'mm-4p-alg-1.0.0', missing: [item.field], invalid: [] });
    }
  });

  it('T6 incomplete: the safety answer is required', () => {
    const r = scoreMM4P({ answers: answers('best'), safety: undefined });
    expect(r).toMatchObject({ status: 'insufficient_information', missing: ['safety_review_status'] });
  });

  it('T7 safety: score still 100, physical-activity actions withheld, level capped', () => {
    const r = score(answers('best'), 'not_sure');
    expect(r.total.score).toBe(100);
    expect(r.physicalActivityWithheld).toBe(true);
    expect(r.safetyRoute).toBe('professional_review');
    expect(codes(r)).toEqual(['SAFETY_GATE']);
    expect(r.nextActions.every(a => a.reasons.includes('PHYSICAL_ACTIVITY_WITHHELD_SAFETY'))).toBe(true);
    expect(r.startingLevel).toEqual({
      abilityScore: 100, calculated: 'performance', level: 'building',
      reasons: ['ABILITY_80_PLUS', 'CAPPED_BUILDING_RECOVERY', 'RECOVERY_SAFETY_ANSWER']
    });
  });
});

describe('answer validation (no imputation, nothing silently coerced)', () => {
  it.each([
    ['scale out of range', { re_sleep_quality: 6 }, 're_sleep_quality'],
    ['scale not an integer', { re_sleep_quality: 2.5 }, 're_sleep_quality'],
    ['unknown option', { fi_aid_use: 'often' }, 'fi_aid_use'],
    ['none with another code', { mo_movement_difficulties: ['none', 'squatting'] }, 'mo_movement_difficulties'],
    ['duplicate codes', { st_tasks_performable: ['squats_10', 'squats_10'] }, 'st_tasks_performable'],
    ['more than 3 goals', { pr_primary_goals: ['increase_energy', 'mobility_pain', 'metabolic_health', 'strength_muscle'] }, 'pr_primary_goals'],
    ['age out of range', { pr_age: 12 }, 'pr_age']
  ])('%s is reported as invalid', (_name, extra, field) => {
    const r = scoreMM4P({ answers: answers('best', extra as MM4PAnswers), safety: 'no' });
    expect(r).toMatchObject({ status: 'insufficient_information', invalid: [field] });
  });

  it('an empty checklist is missing, not "none"', () => {
    const r = scoreMM4P({ answers: answers('best', { mo_movement_difficulties: [] }), safety: 'no' });
    expect(r).toMatchObject({ status: 'insufficient_information', missing: ['mo_movement_difficulties'] });
  });

  it('checklist counts map as specified (MO3 difficulties, ST4 tasks)', () => {
    const mo = (n: number) => score(answers('best', {
      mo_movement_difficulties: n === 0 ? ['none'] : ['bending_forward', 'rotating_torso', 'squatting', 'reaching_overhead', 'looking_over_shoulder'].slice(0, n)
    })).itemScores.mo_movement_difficulties;
    expect([0, 1, 2, 3, 4, 5].map(mo)).toEqual([100, 75, 50, 25, 0, 0]);
    const st = (n: number) => score(answers('best', {
      st_tasks_performable: n === 0 ? ['none'] : ['squats_10', 'pushups_5', 'plank_30s', 'chair_stands_5_no_hands'].slice(0, n)
    })).itemScores.st_tasks_performable;
    expect([0, 1, 2, 3, 4].map(st)).toEqual([0, 25, 50, 75, 100]);
  });
});

describe('flags', () => {
  it('fire from profile answers and never change a score', () => {
    const base = score(answers('best'));
    const r = score(answers('best', {
      pr_health_conditions: ['cardiovascular', 'recent_hospitalization', 'fall_last_year', 'metabolic', 'anxiety_depression'],
      jh_conditions: ['joint_replacement'], mf_diagnoses: ['prediabetes_insulin_resistance']
    }));
    expect(codes(r)).toEqual(['CARDIO_CLEARANCE', 'RECENT_HOSPITALIZATION', 'FALL_HISTORY', 'JOINT_REPLACEMENT', 'METABOLIC_DIAGNOSIS', 'LOW_MOOD']);
    expect(r.total).toEqual(base.total);
    expect(r.categories).toEqual(base.categories);
    expect(r.flags.every(f => f.audience === 'user' && f.message.length > 0)).toBe(true);
  });

  it('EN2 of 2 raises CARDIO_CLEARANCE; 3 does not', () => {
    expect(codes(score(answers('best', { en_dyspnea_everyday: 2 })))).toEqual(['CARDIO_CLEARANCE']);
    expect(codes(score(answers('best', { en_dyspnea_everyday: 3 })))).toEqual([]);
  });

  it('the LOW_MOOD message carries the crisis line', () => {
    const f = score(answers('best', { bh_mood_wellbeing: 1 })).flags.find(x => x.code === 'LOW_MOOD')!;
    expect(f.message).toContain('988');
  });
});

describe('priorities and starting level', () => {
  it('core focus is the two lowest categories', () => {
    const r = score(answers('best', { re_sleep_quality: 1, re_sleep_hours: 1, li_sitting_hours: 2 }));
    expect(r.coreFocus).toEqual(['P3-C8', 'P3-C9']);
  });

  it('a goal breaks a near-tie (within 5 points) toward its category', () => {
    const r = score(answers('best', { pr_primary_goals: ['balance_falls'] }));
    expect(r.coreFocus).toEqual(['P4-C11', 'P1-C1']);
    expect(r.nextActions[0].reasons).toEqual(['GOAL_TIE_BREAK_WITHIN_5']);
  });

  it('a goal does not override a gap of more than 5 points', () => {
    const r = score(answers('best', { re_sleep_quality: 1, pr_primary_goals: ['balance_falls'] }));
    expect(r.coreFocus[0]).toBe('P3-C8');
  });

  it('ability bands: Pillar 1 of 80.0 is Performance, 75.0 is Building', () => {
    // Pillar 1 = mean of five categories at 0.20 each. Lower Mobility only.
    const p1 = (mob: MM4PAnswers) => score(answers('best', mob)).startingLevel;
    // Mobility 0 -> Pillar 1 = 80.0
    expect(p1({ mo_flexibility: 1, mo_reach_overhead_behind: 1, mo_rom_decline: 1,
      mo_movement_difficulties: ['bending_forward', 'rotating_torso', 'squatting', 'reaching_overhead'] }))
      .toMatchObject({ abilityScore: 80, calculated: 'performance' });
    // Mobility 0 and Strength 75 -> Pillar 1 = 75.0
    expect(p1({ mo_flexibility: 1, mo_reach_overhead_behind: 1, mo_rom_decline: 1,
      mo_movement_difficulties: ['bending_forward', 'rotating_torso', 'squatting', 'reaching_overhead'],
      st_vs_peers: 1 })).toMatchObject({ abilityScore: 75, calculated: 'building' });
  });

  it('a recent hospital stay caps Performance at Building', () => {
    const r = score(answers('best', { pr_health_conditions: ['recent_hospitalization'] }));
    expect(r.startingLevel).toEqual({
      abilityScore: 100, calculated: 'performance', level: 'building',
      reasons: ['ABILITY_80_PLUS', 'CAPPED_BUILDING_RECOVERY', 'RECOVERY_RECENT_HOSPITALIZATION']
    });
  });
});

describe('fingerprint', () => {
  it('ignores checklist order and changes with any answer or the safety answer', () => {
    const a = answers('mid');
    const b = answers('mid', { mo_movement_difficulties: ['reaching_overhead', 'squatting'] });
    expect(mm4pFingerprint({ answers: a, safety: 'no' })).toBe(mm4pFingerprint({ answers: b, safety: 'no' }));
    expect(mm4pFingerprint({ answers: a, safety: 'no' })).not.toBe(mm4pFingerprint({ answers: a, safety: 'yes' }));
    expect(mm4pFingerprint({ answers: a, safety: 'no' }))
      .not.toBe(mm4pFingerprint({ answers: answers('mid', { re_sleep_quality: 4 }), safety: 'no' }));
  });
});
