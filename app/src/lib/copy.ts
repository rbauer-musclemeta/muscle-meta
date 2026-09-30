/* Member-facing language for results. Educational, never diagnostic, and
   explicit that routing thresholds are pilot values (CLAUDE.md evidence
   rules; Outcomes framework "insufficient information" and human-override
   requirements). One place for every label so wording changes are reviewed
   once. */

export const ROUTE_COPY = {
  standard_start: {
    label: 'Standard start',
    body: 'Your answers suggest you can begin the program at its standard starting point, progressing at the pace you chose.'
  },
  modified_start: {
    label: 'Modified start',
    body: 'Your answers suggest starting with gentler versions and smaller steps, then building up as your body responds.'
  },
  professional_review: {
    label: 'Professional review first',
    body: 'Some of your answers suggest that a conversation with a healthcare professional would help you begin safely. You can keep using the education in this program, but please hold off on new physical-activity recommendations until you have had that review. If symptoms are severe or getting worse quickly, seek urgent care.'
  }
} as const;

export const ABILITY_COPY = {
  foundation: { label: 'Foundation', body: 'Build a steady base first: everyday strength, movement and stamina, with extra attention to safety and recovery.' },
  building: { label: 'Building', body: 'You have a working base. The focus is on building capacity and turning it into the tasks that matter to you.' },
  performance: { label: 'Performance', body: 'You report few limits in everyday tasks. The focus is on protecting what you have and progressing with purpose.' }
} as const;

export const LENS_COPY: Record<string, { name: string; body: string }> = {
  structure: { name: 'Structure', body: 'A signal about changes in weight, muscle or body shape. It is not a body-composition measurement.' },
  capacity: { name: 'Capacity', body: 'How much force, speed and stamina you can produce for lifting, moving quickly and staying active.' },
  function: { name: 'Function', body: 'How well your capacity turns into real tasks: moving freely, getting around and doing things independently.' },
  experience: { name: 'Experience', body: 'How pain, confidence, energy and recovery shape what you do and how it feels.' }
};

export const REASON_COPY: Record<string, string> = {
  READINESS_INDEX_75_PLUS: 'Your readiness answers were in the standard-start range.',
  READINESS_INDEX_50_TO_74: 'Your readiness answers were in the modified-start range.',
  READINESS_INDEX_BELOW_50: 'Your readiness answers were in the range where a professional review comes first.',
  SAFETY_GATE_YES: 'You told us new symptoms or medical instructions make activity feel unsafe right now.',
  SAFETY_GATE_NOT_SURE: 'You were not sure whether activity feels safe right now.',
  Q2_SIGNIFICANT_STRUCTURE_CHANGE: 'You reported a significant unplanned change in weight, muscle or body shape.',
  Q9_SIGNIFICANT_BALANCE_CONFIDENCE: 'You reported that worry about balance or falling significantly limits you.',
  Q1_SIGNIFICANT_WITH_Q8_INDEPENDENCE: 'A recent health change combined with needing help for everyday tasks.',
  Q1_SIGNIFICANT_WITH_Q10_RECOVERY: 'A recent health change combined with slow recovery or low energy.',
  TWO_SIGNIFICANT_OF_Q3_Q6_Q8_Q10: 'Two or more areas (pain, stamina, independence, recovery) were significant limitations.',
  MODIFIED_TWO_MODERATE_READINESS_ITEMS: 'Two or more readiness areas were moderate or significant limitations.',
  MODIFIED_ONE_SIGNIFICANT_READINESS_ITEM: 'One readiness area was a significant limitation.',
  ABILITY_FOUNDATION_Q8_SIGNIFICANT: 'Everyday tasks currently need significant help or effort, so we start at Foundation.',
  ABILITY_FOUNDATION_THREE_MODERATE_OR_MORE: 'Three or more ability areas were moderate or significant limitations, so we start at Foundation.',
  ABILITY_CAPPED_BUILDING_SIGNIFICANT_ITEM: 'One ability area was a significant limitation, so we start no higher than Building.'
};

export const GOAL_LABEL: Record<string, string> = {
  independence: 'Everyday independence',
  strength: 'Strength for lifting and carrying',
  walking_stairs: 'Walking and stairs',
  mobility: 'Moving freely',
  balance: 'Balance and fall confidence',
  endurance: 'Energy and endurance',
  recovery: 'Recovery after a health downturn',
  return_activity: 'Return to recreation, sport or work',
  body_composition: 'Body composition',
  general_baseline: 'Understanding where I stand overall'
};

export const PILOT_NOTE =
  'These routes use pilot thresholds chosen for this program. They are a starting point, not a medical assessment, and they do not diagnose anything. A clinician can review and adjust your route.';

/* Performance tests are left out of the baseline when a professional review
   comes first; self-ratings stay available. */
export const PHYSICAL_TESTS = new Set(['chair_rise_30s', 'walking_distance', 'grip_strength', 'floor_transfer']);
