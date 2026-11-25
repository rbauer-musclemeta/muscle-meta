/* The browser copy of the engine must be current and must score the same
   as the TypeScript engine. Regenerate with: node scripts/build-jhra-browser.mjs */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { OUTPUT, browserBundle } from '../scripts/build-jhra-browser.mjs';
import { scoreJHRA } from '../src/engine/jhra-01.ts';
import { JHRA_SAFETY } from '../src/engine/jhra-01-definition.ts';

describe('JHRA_01 browser engine', () => {
  const file = readFileSync(OUTPUT, 'utf8');
  it('matches the build output byte for byte', () => expect(file).toBe(browserBundle()));

  it('scores the worked example exactly like the TypeScript engine', () => {
    const sandbox: { window: Record<string, any> } = { window: {} };
    vm.runInNewContext(file, sandbox);
    const answers = {
      ...Object.fromEntries(JHRA_SAFETY.map(q => [q.field, 'no'])),
      jh_age: 58, jh_sex: 'female', jh_postmenopausal: 'yes',
      jh_injuries: [{ type: 'acl_meniscus', joint: 'knee', side: 'left', years_ago: 34, treatment: 'surgery_pt', ongoing: true, rehab_incomplete: false }],
      jh_height_cm: 165, jh_weight_kg: 84.4, jh_waist: 'yes', jh_glucose: 'prediabetes', jh_bp: 'no', jh_lipids: 'no', jh_gout: 'no',
      jh_strength_days: '0', jh_chair_arms: 'no', jh_grip: 'not_measured', jh_thigh_deficit: 'yes',
      jh_chair_stand: 11, jh_single_leg: 'one', jh_stairs: 'rail', jh_activity_min: '60_149', jh_walk10: 'yes',
      jh_gain_since25: 'yes', jh_weight_12m: 'lost10_without_strength',
      jh_steroid_oral: 'none', jh_injections: '1_2', jh_fluoroquinolone: 'no', jh_aromatase: 'no', jh_dpp4: 'no', jh_diuretic: 'no', jh_glp1: 'yes',
      jh_pain_days: '3_5', jh_stiffness: 'under30', jh_swelling: 'yes', jh_giving_way: 'no'
    };
    const browser = sandbox.window.JHRA.scoreJHRA({ answers });
    expect(JSON.parse(JSON.stringify(browser))).toEqual(JSON.parse(JSON.stringify(scoreJHRA({ answers }))));
    expect(browser.total).toEqual({ score: 55, tier: 'Rebuild' });
  });
});
