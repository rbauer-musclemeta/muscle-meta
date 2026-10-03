/* Program 1 definitions: orientation, the FLR_READINESS_01 instrument and the
   baseline metric registry.

   These objects are the source that is published into Supabase as an
   immutable `assessment_versions.definition` snapshot (see
   supabase/migrations/*_m2_four_lens.sql). Changing wording or options means
   a NEW version; a published version is never edited in place.

   STATUS: question wording and metric mappings are DRAFTS written from the
   Program 1 coding handoff. They need Randy's clinical approval before real
   members take the check (docs/program-1/00-PROGRAM-1-HANDOFF.md, "Open
   approvals"). Thresholds are pilot routing values, not validated clinical
   cut points, and the UI says so. */

import type { CategoryKey, LensKey } from './framework.ts';

/* ── Orientation: non-scored personalisation metadata ─────────────────── */

export type Option = { value: string; label: string };

export const ORIENTATION = {
  code: 'FLR_ORIENTATION_01',
  questions: [
    {
      field: 'orientation_reason',
      type: 'multi',
      max: 2,
      title: 'What brings you to Muscle-Meta now?',
      hint: 'Choose up to two. This shapes how we explain things. It never changes a score.',
      options: [
        { value: 'injury_surgery', label: 'Recovering from injury or surgery' },
        { value: 'illness_inactivity', label: 'Rebuilding after illness or inactivity' },
        { value: 'reduced_function', label: 'Noticing reduced strength, balance, mobility or endurance' },
        { value: 'weight_glp1', label: 'Losing weight or using a GLP-1 medication' },
        { value: 'healthy_aging', label: 'Preparing for healthy aging' },
        { value: 'return_activity', label: 'Returning to work, recreation or sport' },
        { value: 'baseline', label: 'Seeking a baseline' },
        { value: 'not_sure', label: 'Not sure yet' }
      ]
    },
    {
      field: 'valued_function_goal',
      type: 'single',
      title: 'Which ability matters most for you to protect, regain or improve?',
      hint: 'Your results and your first baseline measures are anchored to this goal.',
      options: [
        { value: 'independence', label: 'Everyday independence' },
        { value: 'strength', label: 'Strength for lifting and carrying' },
        { value: 'walking_stairs', label: 'Walking and stairs' },
        { value: 'mobility', label: 'Moving freely: bending, reaching, turning' },
        { value: 'balance', label: 'Balance and fall confidence' },
        { value: 'endurance', label: 'Energy and endurance' },
        { value: 'recovery', label: 'Recovery after a health downturn' },
        { value: 'return_activity', label: 'Return to recreation, sport or work' },
        { value: 'body_composition', label: 'Body composition' },
        { value: 'general_baseline', label: 'Understanding where I stand overall' }
      ]
    },
    {
      field: 'assessment_support_need',
      type: 'multi',
      max: 4,
      title: 'Is there anything that would make the check-in feel easier or more comfortable?',
      hint: 'Optional. Choose any that apply.',
      options: [
        { value: 'larger_text', label: 'Larger text' },
        { value: 'take_breaks', label: 'Taking breaks between sections' },
        { value: 'someone_with_me', label: 'Having someone with me' },
        { value: 'read_aloud', label: 'Having questions read aloud' },
        { value: 'plain_language', label: 'Plain-language explanations' },
        { value: 'nothing_needed', label: 'Nothing needed' }
      ]
    },
    {
      field: 'preferred_pace',
      type: 'single',
      title: 'Which starting style feels most comfortable for you right now?',
      hint: 'Sets tone and suggested progression. It does not set exercise intensity or override a safety check.',
      options: [
        { value: 'gentle', label: 'Gentle and reassuring' },
        { value: 'steady', label: 'Steady and structured' },
        { value: 'challenging', label: 'Challenging but safe' },
        { value: 'help_deciding', label: 'I want help deciding' }
      ]
    }
  ]
} as const;

export const SAFETY_GATE = {
  field: 'safety_review_status',
  title: 'Do new symptoms or medical instructions make physical activity feel unsafe for you right now?',
  options: [
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' },
    { value: 'not_sure', label: 'Not sure' }
  ]
} as const;
export type SafetyStatus = 'no' | 'yes' | 'not_sure';

/* ── FLR_READINESS_01: ten items, raw 0-3, higher = greater current need ── */

export const RAW_SCALE: readonly Option[] = [
  { value: '0', label: 'Little or no limitation' },
  { value: '1', label: 'Mild limitation' },
  { value: '2', label: 'Moderate limitation' },
  { value: '3', label: 'Significant limitation' }
];

export const READINESS_V1 = {
  assessmentCode: 'FLR_READINESS_01',
  versionLabel: '1.0.0-pilot',
  algorithmVersion: 'flr-readiness-alg-1.0.0',
  title: 'Four-Lens readiness and ability check',
  questions: [
    { q: 1, field: 'recent_health_change', construct: 'Recent health downturn or recovery',
      prompt: 'In the past three months, how much has an illness, injury, surgery or hospital stay changed your usual activity?' },
    { q: 2, field: 'structure_change', construct: 'Weight, muscle or body-composition change',
      prompt: 'How much unplanned change have you noticed in your weight, muscle or body shape over the past six months?' },
    { q: 3, field: 'joint_limitation', construct: 'Pain or stiffness limiting activity',
      prompt: 'How much does joint pain or stiffness limit what you do?' },
    { q: 4, field: 'strength_task_limit', construct: 'Lifting, carrying and chair-rise capacity',
      prompt: 'How hard is it to lift or carry everyday loads, or to stand up from a chair without using your hands?' },
    { q: 5, field: 'rapid_force_limit', construct: 'Power and rapid-force tasks',
      prompt: 'How hard is it to move quickly when you need to, such as hurrying across a street or stepping to catch your balance?' },
    { q: 6, field: 'endurance_limit', construct: 'Sustained activity tolerance',
      prompt: 'How much does getting tired or out of breath limit how long you can stay active?' },
    { q: 7, field: 'mobility_limit', construct: 'Movement access and mobility',
      prompt: 'How much does limited movement, such as bending, reaching or turning, get in the way of daily tasks?' },
    { q: 8, field: 'independence_limit', construct: 'Functional independence',
      prompt: 'How much help or extra effort do you need for everyday tasks such as housework, shopping or getting dressed?' },
    { q: 9, field: 'balance_confidence_limit', construct: 'Balance and fall confidence',
      prompt: 'How much does worry about your balance or about falling limit what you do?' },
    { q: 10, field: 'recovery_participation_limit', construct: 'Recovery and participation',
      prompt: 'How much do slow recovery or low energy after activity keep you from things you want to do?' }
  ]
} as const;
export type QuestionField = (typeof READINESS_V1.questions)[number]['field'];

/* ── Baseline metric registry ────────────────────────────────────────── */

export type Directionality = 'higher_better' | 'lower_better' | 'context_only';
export type MetricDef = {
  code: string;
  title: string;
  unit: string;
  lens: LensKey;
  category: CategoryKey;
  method: string;
  directionality: Directionality;
  /* 'none_attached' means no validated change threshold is linked, so the UI
     must never call a change "clinically meaningful" for this metric. */
  thresholdStatus: 'none_attached' | 'validated_attached';
  min: number;
  max: number;
};

export const METRICS: readonly MetricDef[] = [
  { code: 'body_weight', title: 'Body weight', unit: 'lb', lens: 'structure', category: 'P2-C6',
    method: 'Morning, after using the bathroom, before eating, same scale each time.',
    directionality: 'context_only', thresholdStatus: 'none_attached', min: 60, max: 700 },
  { code: 'waist_circumference', title: 'Waist circumference', unit: 'in', lens: 'structure', category: 'P2-C7',
    method: 'Tape level at the top of the hip bones, relaxed, after a normal breath out.',
    directionality: 'lower_better', thresholdStatus: 'none_attached', min: 15, max: 80 },
  { code: 'chair_rise_30s', title: '30-second chair rise', unit: 'reps', lens: 'function', category: 'P1-C2',
    method: 'Firm chair with a seat 18 to 20 inches high, arms crossed, count full stands in 30 seconds. Stop if unsafe.',
    directionality: 'higher_better', thresholdStatus: 'none_attached', min: 0, max: 60 },
  { code: 'walking_distance', title: 'Six-minute walk distance', unit: 'm', lens: 'capacity', category: 'P1-C5',
    method: 'Flat measured route, your own steady pace for six minutes, rests allowed.',
    directionality: 'higher_better', thresholdStatus: 'none_attached', min: 0, max: 1600 },
  { code: 'grip_strength', title: 'Grip strength', unit: 'lb', lens: 'capacity', category: 'P1-C4',
    method: 'Hand dynamometer, best of three squeezes with your stronger hand.',
    directionality: 'higher_better', thresholdStatus: 'none_attached', min: 0, max: 250 },
  { code: 'stair_confidence', title: 'Stair confidence', unit: '0-10', lens: 'experience', category: 'P1-C2',
    method: '0 = not at all confident on one flight of stairs, 10 = completely confident.',
    directionality: 'higher_better', thresholdStatus: 'none_attached', min: 0, max: 10 },
  { code: 'floor_transfer', title: 'Floor transfer time', unit: 'sec', lens: 'function', category: 'P1-C3',
    method: 'From standing, get down to the floor and back up, any safe method, support allowed. Skip if unsafe.',
    directionality: 'lower_better', thresholdStatus: 'none_attached', min: 0, max: 600 },
  { code: 'pain_rating', title: 'Pain during daily activity', unit: '0-10', lens: 'experience', category: 'P1-C1',
    method: 'Average over the past week. 0 = no pain, 10 = worst imaginable.',
    directionality: 'lower_better', thresholdStatus: 'none_attached', min: 0, max: 10 },
  { code: 'fatigue_rating', title: 'Fatigue', unit: '0-10', lens: 'experience', category: 'P3-C8',
    method: 'Average over the past week. 0 = no fatigue, 10 = exhausted.',
    directionality: 'lower_better', thresholdStatus: 'none_attached', min: 0, max: 10 },
  { code: 'recovery_rating', title: 'Recovery after activity', unit: '0-10', lens: 'experience', category: 'P3-C8',
    method: 'Next-day feeling after your usual activity. 0 = not recovered, 10 = fully recovered.',
    directionality: 'higher_better', thresholdStatus: 'none_attached', min: 0, max: 10 },
  { code: 'participation_rating', title: 'Doing what matters to you', unit: '0-10', lens: 'experience', category: 'P3-C9',
    method: 'How fully you took part in the activities you value this past week. 0 = not at all, 10 = fully.',
    directionality: 'higher_better', thresholdStatus: 'none_attached', min: 0, max: 10 }
];

/* Goal-to-metric routing (handoff section 13). The primary lens, when the
   package does not already cover it, adds its default metric (see scoring). */
export const GOAL_METRICS: Record<string, readonly string[]> = {
  independence: ['chair_rise_30s', 'walking_distance', 'floor_transfer', 'stair_confidence'],
  strength: ['grip_strength', 'chair_rise_30s', 'recovery_rating'],
  walking_stairs: ['walking_distance', 'stair_confidence', 'recovery_rating'],
  mobility: ['floor_transfer', 'chair_rise_30s', 'pain_rating'],
  /* No balance performance measure is in the Program 1 registry yet; this
     package uses confidence and participation until one is approved. */
  balance: ['stair_confidence', 'participation_rating', 'floor_transfer'],
  endurance: ['walking_distance', 'fatigue_rating', 'recovery_rating'],
  recovery: ['grip_strength', 'chair_rise_30s', 'recovery_rating', 'participation_rating'],
  return_activity: ['grip_strength', 'chair_rise_30s', 'walking_distance', 'participation_rating'],
  body_composition: ['body_weight', 'waist_circumference', 'grip_strength', 'chair_rise_30s'],
  general_baseline: ['waist_circumference', 'grip_strength', 'chair_rise_30s', 'participation_rating']
};

export const LENS_DEFAULT_METRIC: Record<LensKey, string> = {
  structure: 'waist_circumference',
  capacity: 'grip_strength',
  function: 'chair_rise_30s',
  experience: 'participation_rating'
};
