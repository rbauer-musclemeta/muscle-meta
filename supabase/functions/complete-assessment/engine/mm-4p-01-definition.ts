/* MM_4P_01 — Muscle-Meta Matrix™ full assessment, instrument version 1.

   Source of truth: docs/plans/mm-4p-assessment-spec-v1.md (approved
   2026-10-08; FI3/BA2 option scores and section 6 flags confirmed by Randy
   2026-11-11). Pure data, no imports beyond the framework: runs in Node, the
   browser and Deno. A change to any scored item, option score, weight or flag
   rule is a change to the algorithm and needs a new algorithm version.

   Field codes are stable keys in the database and the engine. Categories use
   the canonical P#-C# keys: Strength = P1-C4, Endurance = P1-C5. */

import type { CategoryKey } from './framework.ts';

export const MM4P_CODE = 'MM_4P_01';
export const MM4P_LEGACY_CODE = '4P_MMA';
export const MM4P_VERSION_LABEL = '1.0.0';
export const MM4P_ALGORITHM_VERSION = 'mm-4p-alg-1.0.0';

export type ItemType = 'scale5' | 'single' | 'multi' | 'text' | 'number';
export type Direction = 'HB' | 'LB';
export type Part = 'profile' | 'pillar' | 'preferences';

export type Option = { code: string; label: string; score?: number; exclusive?: boolean; withText?: boolean };

export type Item = {
  id: string;                 // spec row id, e.g. JH1
  field: string;              // stable field code
  part: Part;
  category?: CategoryKey;     // pillar items only
  prompt: string;
  type: ItemType;
  scored: boolean;            // counts toward the category score
  direction?: Direction;      // scale5 only
  anchors?: Record<number, string>;   // scale5 anchor labels
  options?: Option[];         // single / multi
  max?: number;               // multi: maximum selections
  min?: number;               // number: inclusive range
  maxValue?: number;
  countScore?: 'difficulties' | 'tasks';  // multi scored by count (W-4)
  visibleIf?: { field: string; op: '>=' | '<='; value: number };
};

/* ── safety question: asked as the first screen of 4P (Randy, 2026-11-09) ──
   Same wording and codes as Program 1's orientation safety question, so one
   answer means the same thing everywhere. It routes; it never scores. */
export const MM4P_SAFETY = {
  field: 'safety_review_status',
  title: 'Do new symptoms or medical instructions make physical activity feel unsafe for you right now?',
  options: [
    { code: 'no', label: 'No' },
    { code: 'yes', label: 'Yes' },
    { code: 'not_sure', label: 'Not sure' }
  ]
} as const;
export type SafetyStatus = 'no' | 'yes' | 'not_sure';

const freq5 = { 1: 'Never', 2: 'Rarely', 3: '1–2 times a week', 4: '3–4 times a week', 5: '5 or more times a week' };

export const MM4P_ITEMS: Item[] = [
  /* ── Part 1: profile (not scored). Name and email live on the account. ── */
  { id: 'PR1', field: 'pr_age', part: 'profile', prompt: 'Age', type: 'number', scored: false, min: 18, maxValue: 110 },
  { id: 'PR2', field: 'pr_sex', part: 'profile', prompt: 'Gender', type: 'single', scored: false, options: [
    { code: 'female', label: 'Female' }, { code: 'male', label: 'Male' }, { code: 'prefer_not_to_say', label: 'Prefer not to say' }] },
  { id: 'PR3', field: 'pr_occupation_status', part: 'profile', prompt: 'Occupation', type: 'single', scored: false, options: [
    { code: 'employed', label: 'Employed' }, { code: 'unemployed', label: 'Unemployed' }, { code: 'retired', label: 'Retired' }] },
  { id: 'PR4', field: 'pr_primary_goals', part: 'profile', prompt: 'Primary health goals (select up to 3)', type: 'multi', scored: false, max: 3, options: [
    { code: 'increase_energy', label: 'Increase energy' },
    { code: 'mobility_pain', label: 'Improve mobility and reduce pain' },
    { code: 'metabolic_health', label: 'Improve metabolic health' },
    { code: 'strength_muscle', label: 'Build strength and muscle' },
    { code: 'stress_recovery', label: 'Manage stress and improve recovery' },
    { code: 'brain_cognition', label: 'Support brain health and memory' },
    { code: 'balance_falls', label: 'Improve balance and prevent falls' },
    { code: 'functional_independence', label: 'Stay independent' },
    { code: 'sports_performance', label: 'Sports performance', withText: true },
    { code: 'specific_condition', label: 'A specific condition', withText: true }] },
  { id: 'PR5', field: 'pr_health_conditions', part: 'profile', prompt: 'Current health conditions (check all that apply)', type: 'multi', scored: false, options: [
    { code: 'cardiovascular', label: 'Heart or circulation condition' },
    { code: 'metabolic', label: 'Metabolic condition (for example diabetes)' },
    { code: 'joint_pain_arthritis', label: 'Joint pain or arthritis' },
    { code: 'back_neck', label: 'Back or neck problems' },
    { code: 'autoimmune', label: 'Autoimmune condition' },
    { code: 'chronic_fatigue', label: 'Chronic fatigue' },
    { code: 'anxiety_depression', label: 'Anxiety or depression' },
    { code: 'sleep_disorder', label: 'Sleep disorder' },
    { code: 'digestive', label: 'Digestive condition' },
    { code: 'fall_last_year', label: 'A fall in the last year' },
    { code: 'recent_hospitalization', label: 'A recent hospital stay' },
    { code: 'other', label: 'Other', withText: true },
    { code: 'none', label: 'None of these', exclusive: true }] },
  { id: 'PR6', field: 'pr_activity_level', part: 'profile', prompt: 'Current activity level', type: 'single', scored: false, options: [
    { code: 'sedentary', label: 'Sedentary' }, { code: 'light', label: 'Lightly active' }, { code: 'moderate', label: 'Moderately active' },
    { code: 'very', label: 'Very active' }, { code: 'highly', label: 'Highly active' }] },
  { id: 'PR7', field: 'pr_time_available', part: 'profile', prompt: 'Time availability for health activities (daily)', type: 'single', scored: false, options: [
    { code: 'minimal', label: '0–15 minutes' }, { code: 'limited', label: '15–30 minutes' },
    { code: 'moderate', label: '30–60 minutes' }, { code: 'substantial', label: '60 minutes or more' }] },

  /* ── Pillar 1: Exercise & Mobility ── */
  { id: 'JH1', field: 'jh_pain_frequency', part: 'pillar', category: 'P1-C1', prompt: 'Do you experience joint pain during daily activities?', type: 'scale5', scored: true, direction: 'LB', anchors: { 1: 'Never', 5: 'Frequently' } },
  { id: 'JH1a', field: 'jh_pain_joints', part: 'pillar', category: 'P1-C1', prompt: 'Which joints are affected?', type: 'text', scored: false, visibleIf: { field: 'jh_pain_frequency', op: '>=', value: 2 } },
  { id: 'JH2', field: 'jh_stiffness', part: 'pillar', category: 'P1-C1', prompt: 'How would you rate your joint stiffness, especially in the morning or after periods of inactivity?', type: 'scale5', scored: true, direction: 'LB', anchors: { 1: 'No stiffness', 5: 'Severe stiffness' } },
  { id: 'JH3', field: 'jh_conditions', part: 'pillar', category: 'P1-C1', prompt: 'Have you been diagnosed with any joint-related conditions?', type: 'multi', scored: false, options: [
    { code: 'osteoarthritis', label: 'Osteoarthritis' }, { code: 'rheumatoid_arthritis', label: 'Rheumatoid arthritis' },
    { code: 'joint_replacement', label: 'Joint replacement' }, { code: 'tendonitis_bursitis', label: 'Tendonitis or bursitis' },
    { code: 'other', label: 'Other', withText: true }, { code: 'none', label: 'None', exclusive: true }] },
  { id: 'JH4', field: 'jh_confidence', part: 'pillar', category: 'P1-C1', prompt: "How confident are you in your joints' ability to support you during physical activities?", type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Not confident', 5: 'Very confident' } },

  { id: 'FI1', field: 'fi_daily_activity_ease', part: 'pillar', category: 'P1-C2', prompt: 'How easily can you perform daily activities like getting dressed, cooking, or cleaning?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very difficult', 5: 'Very easy' } },
  { id: 'FI1a', field: 'fi_challenging_activities', part: 'pillar', category: 'P1-C2', prompt: 'Any specific activities that are challenging?', type: 'text', scored: false, visibleIf: { field: 'fi_daily_activity_ease', op: '<=', value: 4 } },
  { id: 'FI2', field: 'fi_floor_rise_no_hands', part: 'pillar', category: 'P1-C2', prompt: 'Can you get up from the floor without using your hands for support?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Cannot do', 5: 'Easily' } },
  { id: 'FI3', field: 'fi_aid_use', part: 'pillar', category: 'P1-C2', prompt: 'Do you use any aids (canes, walkers, railings) to maintain balance and independence?', type: 'single', scored: true, options: [
    { code: 'yes_frequently', label: 'Yes, frequently', score: 1 }, { code: 'sometimes', label: 'Sometimes', score: 3 }, { code: 'no', label: 'No', score: 5 }] },
  { id: 'FI4', field: 'fi_independence_confidence', part: 'pillar', category: 'P1-C2', prompt: 'How confident are you in your ability to maintain independence as you age?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Not confident', 5: 'Very confident' } },

  { id: 'MO1', field: 'mo_flexibility', part: 'pillar', category: 'P1-C3', prompt: 'How would you rate your overall flexibility?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very inflexible', 5: 'Very flexible' } },
  { id: 'MO2', field: 'mo_reach_overhead_behind', part: 'pillar', category: 'P1-C3', prompt: 'Can you comfortably reach overhead or behind your back?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very difficult', 5: 'Very easy' } },
  { id: 'MO3', field: 'mo_movement_difficulties', part: 'pillar', category: 'P1-C3', prompt: 'Do you have difficulty with any of the following movements?', type: 'multi', scored: true, countScore: 'difficulties', options: [
    { code: 'bending_forward', label: 'Bending forward' }, { code: 'rotating_torso', label: 'Rotating your torso' },
    { code: 'squatting', label: 'Squatting' }, { code: 'reaching_overhead', label: 'Reaching overhead' },
    { code: 'looking_over_shoulder', label: 'Looking over your shoulder' }, { code: 'none', label: 'None of these', exclusive: true }] },
  { id: 'MO4', field: 'mo_rom_decline', part: 'pillar', category: 'P1-C3', prompt: 'Have you noticed a decline in your range of motion over the past year?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Significant decline', 5: 'No decline' } },

  { id: 'ST1', field: 'st_vs_peers', part: 'pillar', category: 'P1-C4', prompt: 'How would you rate your overall strength compared to others your age and gender?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Much weaker', 5: 'Much stronger' } },
  { id: 'ST2', field: 'st_carry_groceries', part: 'pillar', category: 'P1-C4', prompt: 'Can you carry heavy groceries from your car to your home without difficulty?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very difficult', 5: 'Very easy' } },
  { id: 'ST3', field: 'st_training_frequency', part: 'pillar', category: 'P1-C4', prompt: 'How often do you engage in strength training activities?', type: 'scale5', scored: true, direction: 'HB', anchors: freq5 },
  { id: 'ST4', field: 'st_tasks_performable', part: 'pillar', category: 'P1-C4', prompt: 'Which of these can you perform?', type: 'multi', scored: true, countScore: 'tasks', options: [
    { code: 'squats_10', label: '10 squats' }, { code: 'pushups_5', label: '5 push-ups' }, { code: 'plank_30s', label: 'A 30-second plank' },
    { code: 'chair_stands_5_no_hands', label: '5 chair stands without using your hands' }, { code: 'none', label: 'None of these', exclusive: true }] },

  { id: 'EN1', field: 'en_continuous_activity', part: 'pillar', category: 'P1-C5', prompt: 'How long can you engage in continuous physical activity before needing to rest?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Less than 5 minutes', 2: '5–15 minutes', 3: '15–30 minutes', 4: '30–60 minutes', 5: '60 minutes or more' } },
  { id: 'EN2', field: 'en_dyspnea_everyday', part: 'pillar', category: 'P1-C5', prompt: 'Do you experience shortness of breath during everyday activities like climbing stairs?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Always', 5: 'Never' } },
  { id: 'EN3', field: 'en_energy_level', part: 'pillar', category: 'P1-C5', prompt: 'How would you rate your energy levels throughout the day?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very low', 5: 'Very high' } },
  { id: 'EN3a', field: 'en_lowest_energy_time', part: 'pillar', category: 'P1-C5', prompt: 'When is your energy lowest?', type: 'text', scored: false },
  { id: 'EN4', field: 'en_aerobic_frequency', part: 'pillar', category: 'P1-C5', prompt: 'How frequently do you engage in cardio or aerobic activity?', type: 'scale5', scored: true, direction: 'HB', anchors: freq5 },

  /* ── Pillar 2: Nutrition & Metabolism ── */
  { id: 'NU1', field: 'nu_produce_servings', part: 'pillar', category: 'P2-C6', prompt: 'How many servings of vegetables and fruits do you consume daily?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: '0–1', 2: '2–3', 3: '4–5', 4: '6–7', 5: '8 or more' } },
  { id: 'NU2', field: 'nu_protein_each_meal', part: 'pillar', category: 'P2-C6', prompt: 'How would you describe your protein intake at each meal?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Minimal or inconsistent', 5: 'Adequate and consistent' } },
  { id: 'NU3', field: 'nu_water_cups', part: 'pillar', category: 'P2-C6', prompt: 'How many cups of water do you drink daily?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: '0–2', 2: '3–4', 3: '5–6', 4: '7–8', 5: '9 or more' } },
  { id: 'NU4', field: 'nu_dietary_pattern', part: 'pillar', category: 'P2-C6', prompt: 'Do you have any specific dietary approaches or restrictions?', type: 'multi', scored: false, options: [
    { code: 'omnivore', label: 'Omnivore' }, { code: 'vegetarian', label: 'Vegetarian' }, { code: 'vegan', label: 'Vegan' },
    { code: 'keto_low_carb', label: 'Keto or low carb' }, { code: 'paleo', label: 'Paleo' }, { code: 'gluten_free', label: 'Gluten free' },
    { code: 'dairy_free', label: 'Dairy free' }, { code: 'other', label: 'Other', withText: true }] },
  { id: 'NU5', field: 'nu_processed_frequency', part: 'pillar', category: 'P2-C6', prompt: 'How often do you consume processed foods or sugary drinks?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Multiple times daily', 5: 'Rarely or never' } },

  { id: 'MF1', field: 'mf_energy_crashes', part: 'pillar', category: 'P2-C7', prompt: 'Do you experience energy crashes between meals?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Frequently', 5: 'Never' } },
  { id: 'MF2', field: 'mf_meal_gap_tolerance', part: 'pillar', category: 'P2-C7', prompt: 'How long can you comfortably go between meals without feeling irritable or fatigued?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Less than 2 hours', 2: '2–3 hours', 3: '3–4 hours', 4: '4–5 hours', 5: '5 hours or more' } },
  { id: 'MF3', field: 'mf_diagnoses', part: 'pillar', category: 'P2-C7', prompt: 'Have you been diagnosed with any of the following conditions?', type: 'multi', scored: false, options: [
    { code: 'type2_diabetes', label: 'Type 2 diabetes' }, { code: 'prediabetes_insulin_resistance', label: 'Prediabetes or insulin resistance' },
    { code: 'metabolic_syndrome', label: 'Metabolic syndrome' }, { code: 'pcos', label: 'PCOS' }, { code: 'none', label: 'None', exclusive: true }] },
  { id: 'MF4', field: 'mf_carb_cravings', part: 'pillar', category: 'P2-C7', prompt: 'Do you experience strong cravings for carbohydrates or sugar?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Frequently', 5: 'Rarely or never' } },

  /* ── Pillar 3: Recovery & Stress ── */
  { id: 'RE1', field: 're_sleep_quality', part: 'pillar', category: 'P3-C8', prompt: 'How would you rate your sleep quality?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very poor', 5: 'Excellent' } },
  { id: 'RE2', field: 're_sleep_hours', part: 'pillar', category: 'P3-C8', prompt: 'How many hours of sleep do you typically get each night?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Less than 5', 2: '5–6', 3: '6–7', 4: '7–8', 5: '8 or more' } },
  { id: 'RE3', field: 're_exertion_recovery', part: 'pillar', category: 'P3-C8', prompt: 'How long does it take you to recover from physical exertion?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Several days', 5: 'Quickly, the same day' } },
  { id: 'RE4', field: 're_practices', part: 'pillar', category: 'P3-C8', prompt: 'Do you incorporate specific recovery practices in your routine?', type: 'multi', scored: false, options: [
    { code: 'stretching_mobility', label: 'Stretching or mobility work' }, { code: 'massage_foam_rolling', label: 'Massage or foam rolling' },
    { code: 'hot_cold', label: 'Heat or cold' }, { code: 'meditation_breathwork', label: 'Meditation or breathwork' },
    { code: 'rest_days', label: 'Planned rest days' }, { code: 'none', label: 'None', exclusive: true }] },

  { id: 'LI1', field: 'li_sitting_hours', part: 'pillar', category: 'P3-C9', prompt: 'How many hours do you spend sitting each day?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: '10 or more', 2: '8–10', 3: '6–8', 4: '4–6', 5: 'Less than 4' } },
  { id: 'LI2', field: 'li_routine_consistency', part: 'pillar', category: 'P3-C9', prompt: 'How consistent is your daily routine (sleep schedule, meal timing, etc.)?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very inconsistent', 5: 'Very consistent' } },
  { id: 'LI3', field: 'li_movement_breaks', part: 'pillar', category: 'P3-C9', prompt: 'How often do you engage in movement throughout your day?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Rarely, long periods of sitting', 5: 'Frequent movement breaks' } },
  { id: 'LI4', field: 'li_habit_disruptors', part: 'pillar', category: 'P3-C9', prompt: 'Do any of these affect your health habits?', type: 'multi', scored: false, options: [
    { code: 'long_commute', label: 'Long commute' }, { code: 'desk_job', label: 'Desk job' }, { code: 'irregular_hours', label: 'Irregular hours' },
    { code: 'frequent_travel', label: 'Frequent travel' }, { code: 'caregiving', label: 'Caregiving' }, { code: 'none', label: 'None', exclusive: true }] },

  { id: 'SM1', field: 'sm_stress_level', part: 'pillar', category: 'P3-C10', prompt: 'How would you rate your overall stress level?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very high', 5: 'Very low' } },
  { id: 'SM2', field: 'sm_coping', part: 'pillar', category: 'P3-C10', prompt: 'How well do you feel you manage stress?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Poorly', 5: 'Very well' } },
  { id: 'SM3', field: 'sm_practices', part: 'pillar', category: 'P3-C10', prompt: 'Do you practice stress-reduction techniques?', type: 'multi', scored: false, options: [
    { code: 'meditation', label: 'Meditation' }, { code: 'deep_breathing', label: 'Deep breathing' }, { code: 'yoga_tai_chi', label: 'Yoga or tai chi' },
    { code: 'nature', label: 'Time in nature' }, { code: 'hobbies', label: 'Hobbies' }, { code: 'none', label: 'None', exclusive: true }] },
  { id: 'SM4', field: 'sm_overwhelm_frequency', part: 'pillar', category: 'P3-C10', prompt: 'How often do you feel overwhelmed by responsibilities or tasks?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Daily', 5: 'Rarely or never' } },

  /* ── Pillar 4: Balance & Brain Health (scored and shown in full) ── */
  { id: 'BA1', field: 'ba_confidence', part: 'pillar', category: 'P4-C11', prompt: 'How confident are you in your balance during daily activities?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Not confident', 5: 'Very confident' } },
  { id: 'BA2', field: 'ba_falls_past_year', part: 'pillar', category: 'P4-C11', prompt: 'Have you experienced any falls in the past year?', type: 'single', scored: true, options: [
    { code: 'yes_multiple', label: 'Yes, more than once', score: 1 }, { code: 'yes_once', label: 'Yes, once', score: 3 }, { code: 'no', label: 'No', score: 5 }] },
  { id: 'BA3', field: 'ba_single_leg_10s', part: 'pillar', category: 'P4-C11', prompt: 'Can you stand on one foot for 10 seconds without support?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Cannot do', 5: 'Easily' } },
  { id: 'BA4', field: 'ba_uneven_dim_steadiness', part: 'pillar', category: 'P4-C11', prompt: 'Do you feel unsteady when walking on uneven surfaces or in dim lighting?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very unsteady', 5: 'Very steady' } },

  { id: 'BH1', field: 'bh_memory_vs_5y', part: 'pillar', category: 'P4-C12', prompt: 'How would you rate your memory compared to 5 years ago?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Significantly worse', 5: 'Same or better' } },
  { id: 'BH2', field: 'bh_focus', part: 'pillar', category: 'P4-C12', prompt: 'How easily can you focus and concentrate on tasks?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Very difficult', 5: 'Very easy' } },
  { id: 'BH3', field: 'bh_challenge_activities', part: 'pillar', category: 'P4-C12', prompt: 'Do you engage in activities that challenge your brain?', type: 'multi', scored: false, options: [
    { code: 'learning_skills', label: 'Learning new skills' }, { code: 'puzzles_games', label: 'Puzzles or games' }, { code: 'reading', label: 'Reading' },
    { code: 'social', label: 'Social activities' }, { code: 'creative', label: 'Creative activities' }, { code: 'none', label: 'None', exclusive: true }] },
  { id: 'BH4', field: 'bh_mood_wellbeing', part: 'pillar', category: 'P4-C12', prompt: 'How would you rate your mood and emotional well-being?', type: 'scale5', scored: true, direction: 'HB', anchors: { 1: 'Poor', 5: 'Excellent' } },

  /* ── Part 3: preferences (not scored; move to the profile after first completion, D-4) ── */
  { id: 'PF1', field: 'pf_change_approach', part: 'preferences', prompt: 'Which approach to health improvement do you prefer?', type: 'single', scored: false, options: [
    { code: 'gradual', label: 'Gradual' }, { code: 'moderate', label: 'Moderate' }, { code: 'rapid', label: 'Rapid' }] },
  { id: 'PF2', field: 'pf_tracking', part: 'preferences', prompt: 'How do you prefer to track progress?', type: 'multi', scored: false, options: [
    { code: 'mobile_app', label: 'Mobile app' }, { code: 'journal', label: 'Journal' }, { code: 'wearable', label: 'Wearable device' },
    { code: 'assessments', label: 'Regular assessments' }, { code: 'coach', label: 'With a coach' }] },
  { id: 'PF3', field: 'pf_enjoyed_activities', part: 'preferences', prompt: 'What types of activities do you enjoy?', type: 'multi', scored: false, options: [
    { code: 'walking_hiking', label: 'Walking or hiking' }, { code: 'running', label: 'Running' }, { code: 'cycling', label: 'Cycling' },
    { code: 'swimming', label: 'Swimming' }, { code: 'strength_training', label: 'Strength training' }, { code: 'group_fitness', label: 'Group fitness' },
    { code: 'mind_body', label: 'Mind-body practices' }, { code: 'sport_pickleball', label: 'Pickleball' }, { code: 'sport_tennis', label: 'Tennis' },
    { code: 'sport_golf', label: 'Golf' }, { code: 'sport_surfing', label: 'Surfing' }, { code: 'sport_skiing', label: 'Skiing' },
    { code: 'dancing', label: 'Dancing' }, { code: 'home_workouts', label: 'Home workouts' }, { code: 'other', label: 'Other', withText: true }] },
  { id: 'PF4', field: 'pf_consistency_factors', part: 'preferences', prompt: 'What factors would most help you stay consistent? (up to 3)', type: 'multi', scored: false, max: 3, options: [
    { code: 'step_by_step', label: 'Clear step-by-step guidance' }, { code: 'check_ins', label: 'Regular check-ins' },
    { code: 'measurable_progress', label: 'Measurable progress' }, { code: 'community', label: 'Community support' },
    { code: 'time_efficiency', label: 'Time-efficient routines' }, { code: 'enjoyable', label: 'Enjoyable activities' },
    { code: 'meaningful_goals', label: 'Meaningful goals' }, { code: 'other', label: 'Other' }] },
  { id: 'PF5', field: 'pf_barriers', part: 'preferences', prompt: 'What barriers might impact your success?', type: 'multi', scored: false, options: [
    { code: 'time', label: 'Time' }, { code: 'energy', label: 'Energy' }, { code: 'physical_limitations', label: 'Physical limitations' },
    { code: 'motivation', label: 'Motivation' }, { code: 'stress', label: 'Stress' }, { code: 'social_support', label: 'Social support' },
    { code: 'access', label: 'Access to facilities or equipment' }, { code: 'knowledge_confidence', label: 'Knowledge or confidence' },
    { code: 'other', label: 'Other' }] }
];

/* Category weights inside each pillar (Option B, W-2, W-3; decided 2026-10-08).
   Written in hundredths so the engine can stay in integers. Each pillar sums
   to 100. Frozen into this algorithm version. */
export const MM4P_WEIGHTS: Record<CategoryKey, number> = {
  'P1-C1': 20, 'P1-C2': 20, 'P1-C3': 20, 'P1-C4': 20, 'P1-C5': 20,
  'P2-C6': 56, 'P2-C7': 44,
  'P3-C8': 38, 'P3-C9': 30, 'P3-C10': 32,
  'P4-C11': 54, 'P4-C12': 46
};

/* Tier bands of the MM™ Health Score (spec 5.3; site/assets/mm.js TIER_DEFS).
   Applied to the total, each pillar and each category after rounding to one
   decimal. Higher is better. */
export const MM4P_TIERS = [
  { min: 85, label: 'Optimized' },
  { min: 70, label: 'Functional' },
  { min: 55, label: 'Declining' },
  { min: 40, label: 'At risk' },
  { min: 0, label: 'Critical' }
] as const;
export type TierLabel = (typeof MM4P_TIERS)[number]['label'];

/* Member goals (PR4) mapped to the categories they point at, used only to
   break near-ties when choosing the core focus (spec 5.4 step 1). Goals with
   no single category (sports_performance, specific_condition) map to none. */
export const MM4P_GOAL_CATEGORIES: Record<string, CategoryKey[]> = {
  increase_energy: ['P1-C5', 'P2-C7'],
  mobility_pain: ['P1-C1', 'P1-C3'],
  metabolic_health: ['P2-C7', 'P2-C6'],
  strength_muscle: ['P1-C4'],
  stress_recovery: ['P3-C8', 'P3-C10'],
  brain_cognition: ['P4-C12'],
  balance_falls: ['P4-C11'],
  functional_independence: ['P1-C2'],
  sports_performance: [],
  specific_condition: []
};

/* Categories whose next actions are physical activity. Withheld while the
   safety answer is yes or not sure (SAFETY_GATE), as in Program 1. */
export const MM4P_PHYSICAL_CATEGORIES: CategoryKey[] = ['P1-C1', 'P1-C2', 'P1-C3', 'P1-C4', 'P1-C5', 'P4-C11'];

/* Flags (spec section 6; wording approved 2026-11-11). User-facing, bounded,
   non-diagnostic. A flag never changes a score. */
export type FlagCode =
  | 'SAFETY_GATE' | 'CARDIO_CLEARANCE' | 'RECENT_HOSPITALIZATION' | 'FALL_HISTORY' | 'FALL_HISTORY_MULTIPLE'
  | 'ASSISTIVE_DEVICE' | 'JOINT_REPLACEMENT' | 'METABOLIC_DIAGNOSIS' | 'MEMORY_CONCERN' | 'LOW_MOOD';

export const MM4P_FLAG_COPY: Record<FlagCode, string> = {
  SAFETY_GATE:
    'You told us new symptoms or medical instructions make physical activity feel unsafe right now. Your results and the education below are yours to read, but we are not suggesting any new physical activity until you have checked with your doctor or physical therapist.',
  CARDIO_CLEARANCE:
    'Check with your doctor before starting vigorous activity.',
  RECENT_HOSPITALIZATION:
    'A recent hospital stay changes where it is safe to start. The Catabolic Crisis Screen is a good next step.',
  FALL_HISTORY:
    'Because you have had a fall in the past year, balance is one of your core focus areas.',
  FALL_HISTORY_MULTIPLE:
    'Because you have had more than one fall in the past year, balance is one of your core focus areas. Consider a fall-risk assessment with a physical therapist or physician.',
  ASSISTIVE_DEVICE:
    'Standing and floor exercises will start with supported versions, using a chair, counter or wall.',
  JOINT_REPLACEMENT:
    'If you have had a joint replaced, follow any movement precautions your surgeon or physical therapist gave you. Strength and mobility content will note where they apply.',
  METABOLIC_DIAGNOSIS:
    'Coordinate any change to how you eat with your care team, especially if you take medication for blood sugar.',
  MEMORY_CONCERN:
    'Changes in memory are worth discussing with your doctor.',
  LOW_MOOD:
    'How you feel matters as much as any score here. If low mood or worry is weighing on you, talking with your doctor or a counselor can help. If you are in crisis or thinking about harming yourself, call or text 988 (Suicide and Crisis Lifeline, US) or your local emergency number now.'
};

export const MM4P_REASSESS_DAYS = 90;   // D-7
