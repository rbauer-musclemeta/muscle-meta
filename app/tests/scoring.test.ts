/* Fixture tests for FLR_READINESS_01 / flr-readiness-alg-1.0.0.
   Every expected number below was worked by hand from the handoff formulas
   (docs/program-1/05-scoring-routing-spec.md). These are the cases Randy
   approves at Gate 2; a change to any of them is a change to the algorithm
   and needs a new algorithm version. */

import { describe, it, expect } from 'vitest';
import { scoreReadiness, answerFingerprint, type Answers, type CompleteResult } from '../src/engine/scoring.ts';

const FIELDS = [
  'recent_health_change', 'structure_change', 'joint_limitation', 'strength_task_limit',
  'rapid_force_limit', 'endurance_limit', 'mobility_limit', 'independence_limit',
  'balance_confidence_limit', 'recovery_participation_limit'
] as const;

/* Build answers from a sparse map of question number -> raw value (default 0). */
function A(map: Partial<Record<number, number>> = {}): Answers {
  return Object.fromEntries(FIELDS.map((f, i) => [f, map[i + 1] ?? 0])) as Answers;
}
function score(map: Partial<Record<number, number>> = {}, safety: 'no' | 'yes' | 'not_sure' = 'no', goal = 'general_baseline') {
  const r = scoreReadiness({ answers: A(map), safety, goal });
  if (r.status !== 'complete') throw new Error('expected complete, got ' + JSON.stringify(r));
  return r as CompleteResult;
}

describe('transforms and bands', () => {
  it('no limitation anywhere: performance, standard start, balanced profile', () => {
    const r = score({});
    expect(r.ability).toMatchObject({ score: 100, calculatedLevel: 'performance', level: 'performance', reasons: [] });
    expect(r.readiness).toMatchObject({ index: 100, baseRoute: 'standard_start', route: 'standard_start' });
    expect(r.lenses).toMatchObject({ profile: 'balanced', primary: null, secondary: null });
    expect(r.safetyRoute).toBe('clear');
  });

  it('significant limitation everywhere: foundation, professional review, all lenses 100', () => {
    const r = score({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3 });
    expect(r.ability.score).toBe(0);
    expect(r.ability.level).toBe('foundation');
    expect(r.ability.reasons).toEqual(['ABILITY_FOUNDATION_Q8_SIGNIFICANT', 'ABILITY_FOUNDATION_THREE_MODERATE_OR_MORE']);
    expect(r.readiness.index).toBe(0);
    expect(r.readiness.route).toBe('professional_review');
    expect(r.readiness.reasons).toEqual([
      'READINESS_INDEX_BELOW_50', 'Q2_SIGNIFICANT_STRUCTURE_CHANGE', 'Q9_SIGNIFICANT_BALANCE_CONFIDENCE',
      'Q1_SIGNIFICANT_WITH_Q8_INDEPENDENCE', 'Q1_SIGNIFICANT_WITH_Q10_RECOVERY', 'TWO_SIGNIFICANT_OF_Q3_Q6_Q8_Q10'
    ]);
    expect(r.lenses.needs).toEqual({ structure: 100, capacity: 100, function: 100, experience: 100 });
    // tie broken by the fixed lens order
    expect(r.lenses.primary).toBe('structure');
    expect(r.lenses.secondary).toBe('capacity');
  });

  it('ability exactly 80 is performance (Q8 = 2)', () => {
    const r = score({ 8: 2 });
    expect(r.ability.score).toBe(80);
    expect(r.ability.level).toBe('performance');
    expect(r.readiness.index).toBe(86.7);
    expect(r.readiness.route).toBe('standard_start');
  });

  it('ability 78.3 is building (Q4 = 1, Q5 = 2, Q6 = 1)', () => {
    const r = score({ 4: 1, 5: 2, 6: 1 });
    expect(r.ability.score).toBe(78.3);
    expect(r.ability.level).toBe('building');
    expect(r.ability.reasons).toEqual([]);
  });

  it('ability 33.3 is foundation by score (Q4-Q8 all 2)', () => {
    const r = score({ 4: 2, 5: 2, 6: 2, 7: 2, 8: 2 });
    expect(r.ability.score).toBe(33.3);
    expect(r.ability.calculatedLevel).toBe('foundation');
    expect(r.ability.level).toBe('foundation');
  });
});

describe('ability overrides', () => {
  it('Q8 = 3 forces foundation', () => {
    const r = score({ 8: 3 });
    expect(r.ability.score).toBe(70);
    expect(r.ability.calculatedLevel).toBe('building');
    expect(r.ability.level).toBe('foundation');
    expect(r.ability.reasons).toEqual(['ABILITY_FOUNDATION_Q8_SIGNIFICANT']);
  });

  it('three of Q4-Q8 at 2 or more forces foundation', () => {
    const r = score({ 4: 2, 5: 2, 6: 2 });
    expect(r.ability.score).toBe(66.7);
    expect(r.ability.calculatedLevel).toBe('building');
    expect(r.ability.level).toBe('foundation');
    expect(r.ability.reasons).toEqual(['ABILITY_FOUNDATION_THREE_MODERATE_OR_MORE']);
  });

  it('any Q4-Q8 at 3 caps a performance score at building', () => {
    const r = score({ 5: 3 });
    expect(r.ability.score).toBe(85);
    expect(r.ability.calculatedLevel).toBe('performance');
    expect(r.ability.level).toBe('building');
    expect(r.ability.reasons).toEqual(['ABILITY_CAPPED_BUILDING_SIGNIFICANT_ITEM']);
  });
});

describe('readiness bands', () => {
  it('index exactly 75 is standard start', () => {
    const r = score({ 1: 1, 2: 1, 3: 1, 6: 1, 8: 1 });
    expect(r.readiness.index).toBe(75);
    expect(r.readiness).toMatchObject({ baseRoute: 'standard_start', route: 'standard_start', reasons: ['READINESS_INDEX_75_PLUS'] });
  });

  it('index 73.3 is modified start', () => {
    const r = score({ 1: 1, 3: 1, 6: 1, 8: 1, 9: 1 });
    expect(r.readiness.index).toBe(73.3);
    expect(r.readiness).toMatchObject({ baseRoute: 'modified_start', route: 'modified_start', reasons: ['READINESS_INDEX_50_TO_74'] });
  });

  it('index below 50 is professional review with no item at 3', () => {
    const r = score({ 1: 2, 2: 2, 3: 2, 6: 2, 8: 2, 9: 2, 10: 2 });
    expect(r.readiness.index).toBe(33.3);
    expect(r.readiness.route).toBe('professional_review');
    expect(r.readiness.reasons[0]).toBe('READINESS_INDEX_BELOW_50');
  });
});

describe('professional-review overrides', () => {
  const cases: [string, Partial<Record<number, number>>, 'no' | 'yes' | 'not_sure', string][] = [
    ['safety gate yes', {}, 'yes', 'SAFETY_GATE_YES'],
    ['safety gate not sure', {}, 'not_sure', 'SAFETY_GATE_NOT_SURE'],
    ['Q2 = 3', { 2: 3 }, 'no', 'Q2_SIGNIFICANT_STRUCTURE_CHANGE'],
    ['Q9 = 3', { 9: 3 }, 'no', 'Q9_SIGNIFICANT_BALANCE_CONFIDENCE'],
    ['Q1 = 3 and Q8 = 2', { 1: 3, 8: 2 }, 'no', 'Q1_SIGNIFICANT_WITH_Q8_INDEPENDENCE'],
    ['Q1 = 3 and Q10 = 2', { 1: 3, 10: 2 }, 'no', 'Q1_SIGNIFICANT_WITH_Q10_RECOVERY'],
    ['Q3 = 3 and Q6 = 3', { 3: 3, 6: 3 }, 'no', 'TWO_SIGNIFICANT_OF_Q3_Q6_Q8_Q10'],
    ['Q8 = 3 and Q10 = 3', { 8: 3, 10: 3 }, 'no', 'TWO_SIGNIFICANT_OF_Q3_Q6_Q8_Q10']
  ];
  for (const [name, map, safety, code] of cases) {
    it(name, () => {
      const r = score(map, safety);
      expect(r.readiness.route).toBe('professional_review');
      expect(r.readiness.reasons).toContain(code);
    });
  }

  it('a strong index does not override a safety-gate review', () => {
    const r = score({}, 'yes');
    expect(r.readiness.index).toBe(100);
    expect(r.readiness.baseRoute).toBe('standard_start');
    expect(r.readiness.route).toBe('professional_review');
    expect(r.safetyRoute).toBe('professional_review');
  });
});

describe('modified-start overrides', () => {
  it('two readiness items at 2 or more', () => {
    const r = score({ 3: 2, 10: 2 });
    expect(r.readiness.index).toBe(83.3);
    expect(r.readiness.baseRoute).toBe('standard_start');
    expect(r.readiness.route).toBe('modified_start');
    expect(r.readiness.reasons).toContain('MODIFIED_TWO_MODERATE_READINESS_ITEMS');
  });

  it('one non-override readiness item at 3 (Q1 alone)', () => {
    const r = score({ 1: 3 });
    expect(r.readiness.route).toBe('modified_start');
    expect(r.readiness.reasons).toEqual(['READINESS_INDEX_75_PLUS', 'MODIFIED_ONE_SIGNIFICANT_READINESS_ITEM']);
  });

  it('a non-readiness item at 3 (Q7) does not trigger it', () => {
    const r = score({ 7: 3 });
    expect(r.readiness.route).toBe('standard_start');
  });

  it('never softens a professional-review base route', () => {
    const r = score({ 1: 2, 2: 2, 3: 2, 6: 2, 8: 2, 9: 2, 10: 2 });
    expect(r.readiness.route).toBe('professional_review');
  });
});

describe('Four Lenses', () => {
  it('primary with no secondary when the gap is wide and the runner-up is low', () => {
    const r = score({ 10: 3 });
    expect(r.lenses.needs).toEqual({ structure: 0, capacity: 0, function: 0, experience: 40 });
    expect(r.lenses.primary).toBe('experience');
    expect(r.lenses.secondary).toBeNull();
  });

  it('secondary because the runner-up is 40 or more', () => {
    const r = score({ 2: 3, 4: 2, 5: 1, 6: 1 });
    expect(r.lenses.needs.structure).toBe(100);
    expect(r.lenses.needs.capacity).toBe(46.7);
    expect(r.lenses.primary).toBe('structure');
    expect(r.lenses.secondary).toBe('capacity');
  });

  it('secondary because the runner-up is within 15 points', () => {
    const r = score({ 2: 1, 4: 1, 5: 1, 6: 1 });
    expect(r.lenses.needs.structure).toBe(33.3);
    expect(r.lenses.needs.capacity).toBe(33.3);
    expect(r.lenses.primary).toBe('structure');
    expect(r.lenses.secondary).toBe('capacity');
  });

  it('balanced profile when every lens is under 25, even with small needs', () => {
    const r = score({ 1: 1, 7: 1 });
    expect(r.lenses.needs.experience).toBe(6.7);
    expect(r.lenses.needs.function).toBe(6.7);
    expect(r.lenses).toMatchObject({ profile: 'balanced', primary: null, secondary: null });
  });

  it('function weights sum correctly (Q8 = 3 alone gives 35)', () => {
    expect(score({ 8: 3 }).lenses.needs.function).toBe(35);
  });
});

describe('Pillar 1 priority profile', () => {
  it('ranks by need with canonical keys; strength blends Q4 and Q5', () => {
    const r = score({ 3: 1, 4: 3, 5: 0, 6: 2, 7: 0, 8: 0 });
    expect(r.pillar1.ranked).toEqual([
      { key: 'P1-C5', name: 'Endurance', need: 66.7 },
      { key: 'P1-C4', name: 'Strength', need: 60 },
      { key: 'P1-C1', name: 'Joint Health', need: 33.3 },
      { key: 'P1-C2', name: 'Functional Independence', need: 0 },
      { key: 'P1-C3', name: 'Mobility', need: 0 }
    ]);
    expect(r.pillar1.powerNeed).toBe(0);
  });

  it('Strength is P1-C4 and Endurance is P1-C5', () => {
    const keys = Object.fromEntries(score({}).pillar1.ranked.map(p => [p.name, p.key]));
    expect(keys.Strength).toBe('P1-C4');
    expect(keys.Endurance).toBe('P1-C5');
  });
});

describe('goal-matched baseline metrics', () => {
  it('uses the goal package', () => {
    expect(score({}, 'no', 'walking_stairs').baselineMetrics).toEqual(['walking_distance', 'stair_confidence', 'recovery_rating']);
  });
  it('adds the primary lens default when the package does not cover it', () => {
    const r = score({ 2: 2 }, 'no', 'strength');
    expect(r.lenses.primary).toBe('structure');
    expect(r.baselineMetrics).toEqual(['grip_strength', 'chair_rise_30s', 'recovery_rating', 'waist_circumference']);
  });
  it('falls back to one measure per lens without a goal', () => {
    const r = scoreReadiness({ answers: A({}), safety: 'no', goal: null });
    expect(r.status === 'complete' && r.baselineMetrics).toEqual(['waist_circumference', 'grip_strength', 'chair_rise_30s', 'participation_rating']);
  });
});

describe('missing and invalid answers', () => {
  it('a skipped item returns insufficient information, not a guess', () => {
    const answers = A({});
    delete answers.rapid_force_limit;
    expect(scoreReadiness({ answers, safety: 'no', goal: null })).toEqual({
      status: 'insufficient_information', algorithmVersion: 'flr-readiness-alg-1.0.0', missing: ['rapid_force_limit']
    });
  });
  it('out-of-range and null values count as missing', () => {
    const r = scoreReadiness({ answers: { ...A({}), joint_limitation: 4, endurance_limit: null }, safety: 'no', goal: null });
    expect(r.status).toBe('insufficient_information');
    expect(r.status === 'insufficient_information' && r.missing).toEqual(['joint_limitation', 'endurance_limit']);
  });
  it('an unanswered safety gate blocks a result', () => {
    const r = scoreReadiness({ answers: A({}), safety: undefined, goal: null });
    expect(r.status === 'insufficient_information' && r.missing).toEqual(['safety_review_status']);
  });
});

describe('separation rules', () => {
  it('orientation goal never changes scores, only the baseline package', () => {
    const a = score({ 3: 2, 6: 1, 9: 1 }, 'no', 'balance');
    const b = score({ 3: 2, 6: 1, 9: 1 }, 'no', 'strength');
    expect(a.ability).toEqual(b.ability);
    expect(a.readiness).toEqual(b.readiness);
    expect(a.lenses).toEqual(b.lenses);
    expect(a.pillar1).toEqual(b.pillar1);
  });
  it('the safety gate changes the route, never the scores', () => {
    const a = score({ 4: 1 }, 'no');
    const b = score({ 4: 1 }, 'yes');
    expect(a.readiness.index).toBe(b.readiness.index);
    expect(a.ability).toEqual(b.ability);
    expect(a.lenses).toEqual(b.lenses);
    expect(a.raw).toEqual(b.raw);
    expect(a.readiness.route).not.toBe(b.readiness.route);
  });
  it('is deterministic and fingerprints identically', () => {
    const input = { answers: A({ 2: 1, 5: 2 }), safety: 'no' as const, goal: 'mobility' };
    expect(scoreReadiness(input)).toEqual(scoreReadiness(input));
    expect(answerFingerprint(input)).toBe(answerFingerprint({ ...input, goal: 'balance' }));
  });
});
