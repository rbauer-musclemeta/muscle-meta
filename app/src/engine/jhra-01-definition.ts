/* JHRA_01 · Muscle-Meta Joint Health Risk Assessment, version 1.0.0
   (algorithm jhra-alg-1.0.0). Source of truth: the JHRA v1.0 clinical draft
   (Randy Bauer, PT), Parts 2 to 5. This file holds the questions, the points
   for every answer, the domain maxima and weights, the tiers and the flag copy.
   jhra-01.ts scores against it; the publishing migration embeds it.

   Higher is worse: a domain score is how much risk is present in that area.
   The point values are educational weightings informed by research, not a
   validated prediction model. Educational, not diagnostic.

   Three rules the draft left open, settled here so the engine is total:
   - E2 "lost 5-9.9 % on purpose without strength training" scores 0 (the
     draft scores only the 10 %+ case).
   - "Not sure" on waist (B2) and lipids (B5) scores 0, as the draft does
     for lipids.
   - "Prefer not to say" for sex uses the women's chair-stand range (the
     lower range, so a missing answer never adds points) and no sex
     adjustment. */

export const JHRA_CODE = 'JHRA_01';
export const JHRA_VERSION_LABEL = '1.0.0';
export const JHRA_ALGORITHM_VERSION = 'jhra-alg-1.0.0';
export const JHRA_SCORE_FAMILY = 'jhra_risk';
export const JHRA_MAX_INJURIES = 5;
export const JHRA_INJURY_CAP = 30;

export type DomainKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export const JHRA_DOMAIN_ORDER: DomainKey[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/* weight in whole hundredths, so the total is exact integer arithmetic */
export const JHRA_DOMAINS: Record<DomainKey, { name: string; max: number; weight: number }> = {
  A: { name: 'Injury and trauma history', max: 30, weight: 22 },
  B: { name: 'Metabolic-joint health', max: 27, weight: 18 },
  C: { name: 'Muscle-joint health', max: 23, weight: 18 },
  D: { name: 'Fitness and function', max: 30, weight: 15 },
  E: { name: 'Weight change', max: 9, weight: 10 },
  F: { name: 'Medications and treatments', max: 23, weight: 7 },
  G: { name: 'Current joint status', max: 15, weight: 10 }
};

export const JHRA_TIERS = [
  { min: 60, label: 'Guided', next: 'Clinician-guided assessment and plan before you add load.', retestDays: 30 },
  { min: 40, label: 'Rebuild', next: 'A structured program with a physical therapist or qualified coach. Retest at 30, 60 and 90 days.', retestDays: 30 },
  { min: 20, label: 'Build', next: 'Work on your highest one or two areas for 12 weeks. Retest at 90 days.', retestDays: 90 },
  { min: 0, label: 'Maintain', next: 'Keep your current habits. Retest every 12 months.', retestDays: 365 }
] as const;
export type JhraTier = (typeof JHRA_TIERS)[number]['label'];
export const JHRA_PRIORITY_MIN = 50;

export type Option = { code: string; label: string; points?: number };
export type Question = {
  field: string;
  id: string;
  domain: DomainKey | 'safety' | 'context';
  prompt: string;
  type: 'single' | 'number' | 'multi' | 'injuries' | 'chair_stand';
  role: 'safety' | 'score' | 'context' | 'record';
  options?: Option[];
  min?: number;
  maxValue?: number;
  optional?: boolean;
  help?: string;
};

const YN = (yes = 0, no = 0): Option[] => [{ code: 'yes', label: 'Yes', points: yes }, { code: 'no', label: 'No', points: no }];

/* Safety gate (Part 2). Not scored. Any yes stops the assessment. */
export const JHRA_SAFETY: Question[] = [
  ['jh_s1', 'S1', 'A joint that is hot, red and swollen, especially with fever or feeling unwell?'],
  ['jh_s2', 'S2', 'A joint injury after which you could not bear weight, or the joint looked deformed?'],
  ['jh_s3', 'S3', 'Joint pain that wakes you at night and does not ease when you change position?'],
  ['jh_s4', 'S4', 'A knee that locks and cannot be straightened?'],
  ['jh_s5', 'S5', 'New numbness, tingling or weakness spreading into an arm or leg?'],
  ['jh_s6', 'S6', 'Unexplained weight loss, fever or night sweats together with joint pain?'],
  ['jh_s7', 'S7', 'Sudden, severe pain in a joint replacement, or redness or drainage near the incision?']
].map(([field, id, prompt]) => ({ field, id, domain: 'safety' as const, prompt: `In the past 2 weeks, have you had ${prompt.charAt(0).toLowerCase()}${prompt.slice(1)}`, type: 'single' as const, role: 'safety' as const, options: YN() }));

export const JHRA_INJURY_TYPES: Option[] = [
  { code: 'acl_meniscus', label: 'Combined ACL and meniscus injury', points: 10 },
  { code: 'acl', label: 'ACL tear or reconstruction', points: 8 },
  { code: 'meniscus', label: 'Meniscus tear or meniscectomy (partial or full)', points: 8 },
  { code: 'fracture_joint', label: 'Fracture into or next to a joint', points: 8 },
  { code: 'shoulder_dislocation_recurrent', label: 'Shoulder dislocation, 2 or more times', points: 7 },
  { code: 'shoulder_dislocation_single', label: 'Shoulder dislocation, once', points: 5 },
  { code: 'ankle_instability', label: 'Ankle sprains 3 or more times, or an ankle that gives way', points: 5 },
  { code: 'rotator_cuff', label: 'Rotator cuff tear (diagnosed)', points: 4 },
  { code: 'other_structural', label: 'Other ligament, cartilage or labral injury', points: 4 },
  { code: 'resolved_sprain', label: 'Sprain or strain that fully resolved', points: 1 },
  { code: 'joint_replacement', label: 'Joint replacement', points: 0 }
];
export const JHRA_INJURY_JOINTS: Option[] = ['Knee', 'Hip', 'Ankle', 'Foot', 'Shoulder', 'Elbow', 'Wrist', 'Hand', 'Spine', 'Other']
  .map(l => ({ code: l.toLowerCase(), label: l }));
export const JHRA_INJURY_SIDES: Option[] = [{ code: 'left', label: 'Left' }, { code: 'right', label: 'Right' }, { code: 'both', label: 'Both' }, { code: 'na', label: 'Not applicable' }];
export const JHRA_INJURY_TREATMENTS: Option[] = [
  { code: 'none', label: 'No treatment' }, { code: 'pt', label: 'Physical therapy' },
  { code: 'surgery', label: 'Surgery' }, { code: 'surgery_pt', label: 'Surgery and physical therapy' }
];
export const JHRA_MODIFIER_ONGOING = 3;   // ongoing swelling, giving way or catching
export const JHRA_MODIFIER_REHAB = 2;     // no rehabilitation, or not completed

export const JHRA_QUESTIONS: Question[] = [
  { field: 'jh_age', id: 'P1', domain: 'context', prompt: 'Your age', type: 'number', role: 'context', min: 18, maxValue: 110 },
  { field: 'jh_sex', id: 'P2', domain: 'context', prompt: 'Sex', type: 'single', role: 'context', options: [
    { code: 'female', label: 'Female' }, { code: 'male', label: 'Male' }, { code: 'prefer_not_to_say', label: 'Prefer not to say' }] },
  { field: 'jh_postmenopausal', id: 'P3', domain: 'context', prompt: 'Have you gone through menopause?', type: 'single', role: 'context', optional: true,
    help: 'Asked only if you chose female and are under 50.', options: [{ code: 'yes', label: 'Yes' }, { code: 'no', label: 'No' }, { code: 'not_sure', label: 'Not sure' }] },

  { field: 'jh_injuries', id: 'A1', domain: 'A', prompt: 'Past joint injuries (up to 5)', type: 'injuries', role: 'score',
    help: 'An empty list means no past joint injury. Each entry: joint, side, injury type, years ago, treatment, and two follow-up questions.' },

  { field: 'jh_height_cm', id: 'B1a', domain: 'B', prompt: 'Height (cm)', type: 'number', role: 'score', min: 120, maxValue: 230 },
  { field: 'jh_weight_kg', id: 'B1b', domain: 'B', prompt: 'Weight (kg)', type: 'number', role: 'score', min: 30, maxValue: 300 },
  { field: 'jh_waist', id: 'B2', domain: 'B', prompt: 'Is your waist above 40 inches (102 cm) for men or 35 inches (88 cm) for women?', type: 'single', role: 'score',
    options: [{ code: 'yes', label: 'Yes', points: 4 }, { code: 'no', label: 'No', points: 0 }, { code: 'not_sure', label: 'Not sure', points: 0 }] },
  { field: 'jh_glucose', id: 'B3', domain: 'B', prompt: 'Have you been told you have diabetes or prediabetes?', type: 'single', role: 'score',
    options: [{ code: 'neither', label: 'Neither', points: 0 }, { code: 'prediabetes', label: 'Prediabetes', points: 3 }, { code: 'type2', label: 'Type 2 diabetes', points: 5 }] },
  { field: 'jh_bp', id: 'B4', domain: 'B', prompt: 'Have you been diagnosed with or treated for high blood pressure?', type: 'single', role: 'score', options: YN(2, 0) },
  { field: 'jh_lipids', id: 'B5', domain: 'B', prompt: 'Have you been told your HDL ("good") cholesterol is low or your triglycerides are high?', type: 'single', role: 'score',
    options: [{ code: 'yes', label: 'Yes', points: 2 }, { code: 'no', label: 'No', points: 0 }, { code: 'not_sure', label: 'Not sure', points: 0 }] },
  { field: 'jh_gout', id: 'B6', domain: 'B', prompt: 'Have you had gout, or been told your uric acid is high?', type: 'single', role: 'score', options: YN(4, 0) },

  { field: 'jh_strength_days', id: 'C1', domain: 'C', prompt: 'On how many days a week do you do muscle-strengthening exercise (weights, bands or body weight)?', type: 'single', role: 'score',
    options: [{ code: '2plus', label: '2 or more days', points: 0 }, { code: '1', label: '1 day', points: 4 }, { code: '0', label: 'None', points: 8 }] },
  { field: 'jh_chair_arms', id: 'C2', domain: 'C', prompt: 'Do you need your arms to push up from a standard chair?', type: 'single', role: 'score', options: YN(5, 0) },
  { field: 'jh_grip', id: 'C3', domain: 'C', prompt: 'If it has been measured, is your grip strength below 27 kg (men) or 16 kg (women)?', type: 'single', role: 'score',
    options: [{ code: 'below', label: 'Yes, below', points: 5 }, { code: 'not_below', label: 'No', points: 0 }, { code: 'not_measured', label: 'Not measured', points: 0 }] },
  { field: 'jh_thigh_deficit', id: 'C4', domain: 'C', prompt: 'Since a past leg injury or surgery, is one thigh visibly smaller, or do you struggle to fully straighten or tighten that knee?', type: 'single', role: 'score',
    options: [{ code: 'yes', label: 'Yes', points: 5 }, { code: 'no', label: 'No', points: 0 }, { code: 'no_leg_injury', label: 'No leg injury or surgery', points: 0 }] },

  { field: 'jh_chair_stand', id: 'D1', domain: 'D', prompt: '30-second chair stand: how many full stands, arms crossed?', type: 'chair_stand', role: 'score', min: 0, maxValue: 60,
    help: 'A whole number of stands, or "unable" if you cannot stand up without using your arms.' },
  { field: 'jh_single_leg', id: 'D2', domain: 'D', prompt: 'Can you stand on each leg for 10 seconds without support?', type: 'single', role: 'score',
    options: [{ code: 'both', label: 'Yes, both sides', points: 0 }, { code: 'one', label: 'One side only', points: 3 }, { code: 'neither', label: 'Neither side', points: 6 }] },
  { field: 'jh_stairs', id: 'D3', domain: 'D', prompt: 'How do you manage one flight of stairs?', type: 'single', role: 'score',
    options: [{ code: 'easy', label: 'Easily, no rail', points: 0 }, { code: 'rail', label: 'I need the rail', points: 2 }, { code: 'difficult', label: 'Difficult, or I avoid stairs', points: 4 }] },
  { field: 'jh_activity_min', id: 'D4', domain: 'D', prompt: 'Weekly minutes of moderate activity (brisk walking, cycling, swimming)', type: 'single', role: 'score',
    options: [{ code: '150plus', label: '150 minutes or more', points: 0 }, { code: '60_149', label: '60 to 149 minutes', points: 3 }, { code: 'under60', label: 'Under 60 minutes', points: 6 }] },
  { field: 'jh_walk10', id: 'D5', domain: 'D', prompt: 'Can you walk for 10 minutes without stopping because of joint pain?', type: 'single', role: 'score', options: YN(0, 4) },

  { field: 'jh_gain_since25', id: 'E1', domain: 'E', prompt: 'Compared with your weight at about age 25, have you gained 22 lb (10 kg) or more?', type: 'single', role: 'score', options: YN(4, 0) },
  { field: 'jh_weight_12m', id: 'E2', domain: 'E', prompt: 'Over the past 12 months, which best describes your weight?', type: 'single', role: 'score', options: [
    { code: 'stable', label: 'Stable (within 5 %)', points: 0 },
    { code: 'gained', label: 'Gained 5 % or more', points: 3 },
    { code: 'lost_with_strength', label: 'Lost 5 % or more on purpose, with strength training 2 or more days a week', points: -2 },
    { code: 'lost_under10_without_strength', label: 'Lost 5 to 9 % on purpose, without regular strength training', points: 0 },
    { code: 'lost10_without_strength', label: 'Lost 10 % or more on purpose, without regular strength training', points: 3 },
    { code: 'unintentional', label: 'Lost 5 % or more without trying', points: 5 }] },

  { field: 'jh_steroid_oral', id: 'F1a', domain: 'F', prompt: 'Oral steroid tablets (for example prednisone)', type: 'single', role: 'score', options: [
    { code: 'none', label: 'None in the past year', points: 0 },
    { code: 'short_courses', label: '3 or more short courses in the past year', points: 3 },
    { code: 'long_term', label: '2.5 mg a day or more for 3 months or longer, now or in the past year', points: 6 }] },
  { field: 'jh_injections', id: 'F1c', domain: 'F', prompt: 'Steroid injections into the same joint in the past 2 years', type: 'single', role: 'score', options: [
    { code: 'none', label: 'None', points: 0 }, { code: '1_2', label: '1 or 2', points: 2 },
    { code: '3plus', label: '3 or more, or every 3 months', points: 5 }] },
  { field: 'jh_fluoroquinolone', id: 'F1e', domain: 'F', prompt: 'A fluoroquinolone antibiotic (ciprofloxacin, levofloxacin) in the past 12 months?', type: 'single', role: 'score', options: YN(3, 0) },
  { field: 'jh_aromatase', id: 'F1f', domain: 'F', prompt: 'Currently taking an aromatase inhibitor (anastrozole, letrozole, exemestane)?', type: 'single', role: 'score', options: YN(4, 0) },
  { field: 'jh_dpp4', id: 'F1g', domain: 'F', prompt: 'Currently taking a DPP-4 inhibitor (sitagliptin, saxagliptin, linagliptin, alogliptin)?', type: 'single', role: 'score', options: [
    { code: 'no', label: 'No', points: 0 }, { code: 'yes_with_pain', label: 'Yes, and I have joint pain', points: 3 }, { code: 'yes_no_pain', label: 'Yes, without joint pain', points: 0 }] },
  { field: 'jh_diuretic', id: 'F1h', domain: 'F', prompt: 'Currently taking a thiazide or loop diuretic ("water pill")?', type: 'single', role: 'score', options: YN(2, 0) },
  { field: 'jh_glp1', id: 'F2', domain: 'F', prompt: 'Currently taking a GLP-1 medication (semaglutide, tirzepatide)?', type: 'single', role: 'score', options: YN(0, 0),
    help: 'With a BMI of 30 or more and strength training 2 or more days a week: minus 3. Without regular strength training: 0.' },
  { field: 'jh_other_meds', id: 'F3', domain: 'F', prompt: 'Anything else you use (recorded, not scored)', type: 'multi', role: 'record', optional: true, options: [
    { code: 'statin', label: 'Statin' }, { code: 'nsaid_acetaminophen', label: 'Anti-inflammatory pain relievers or acetaminophen' },
    { code: 'ha_prp', label: 'Hyaluronic acid, PRP or other joint injections' }, { code: 'mht', label: 'Menopausal hormone therapy' },
    { code: 'none', label: 'None of these' }] },

  { field: 'jh_pain_days', id: 'G1', domain: 'G', prompt: 'On how many days a week do you have joint pain?', type: 'single', role: 'score', options: [
    { code: '0', label: 'None', points: 0 }, { code: '1_2', label: '1 or 2 days', points: 2 }, { code: '3_5', label: '3 to 5 days', points: 4 }, { code: 'daily', label: 'Every day', points: 6 }] },
  { field: 'jh_stiffness', id: 'G2', domain: 'G', prompt: 'How long does joint stiffness last after waking?', type: 'single', role: 'score', options: [
    { code: 'none', label: 'No stiffness', points: 0 }, { code: 'under30', label: 'Under 30 minutes', points: 1 }, { code: '30plus', label: '30 minutes or longer', points: 3 }] },
  { field: 'jh_swelling', id: 'G3', domain: 'G', prompt: 'In the past month, has any joint visibly swollen?', type: 'single', role: 'score', options: YN(3, 0) },
  { field: 'jh_giving_way', id: 'G4', domain: 'G', prompt: 'In the past month, has a joint given way, buckled or caught?', type: 'single', role: 'score', options: YN(3, 0) }
];

export const JHRA_BMI_BANDS = [
  { min: 40, points: 10 }, { min: 35, points: 8 }, { min: 30, points: 6 }, { min: 25, points: 3 }, { min: 0, points: 0 }
];

/* OARSI 30-second chair stand reference ranges (25th-75th percentile) [16].
   Under 65 uses the 40-64 row; 95 and over uses the 90-94 row. */
export const JHRA_CHAIR_NORMS = [
  { minAge: 90, female: [4, 11], male: [7, 12] },
  { minAge: 85, female: [8, 13], male: [8, 14] },
  { minAge: 80, female: [9, 14], male: [10, 15] },
  { minAge: 75, female: [10, 15], male: [11, 17] },
  { minAge: 70, female: [10, 15], male: [12, 17] },
  { minAge: 65, female: [11, 16], male: [12, 18] },
  { minAge: 0, female: [12, 17], male: [14, 19] }
] as const;
export const JHRA_CHAIR_POINTS = { above: 0, within: 3, below: 8, unable: 10 };

export const JHRA_GLP1_CREDIT = -3;

export type JhraFlagCode = 'F-W1' | 'F-M1' | 'F-M2' | 'F-M3' | 'F-S1' | 'F-G1' | 'F-R1';
export const JHRA_FLAG_COPY: Record<JhraFlagCode, string> = {
  'F-W1': 'Weight loss you did not plan should be reviewed by a physician.',
  'F-M1': 'Ask your clinician about bone-health screening and protection while you take long-term steroid tablets.',
  'F-M2': 'Discuss how often you have injections into the same joint, and the alternatives, with your clinician.',
  'F-M3': 'Build up tendon loading gradually, and report heel or Achilles pain promptly.',
  'F-S1': 'Morning stiffness of 30 minutes or more together with swelling can point to inflammatory arthritis. A medical evaluation is recommended.',
  'F-G1': 'Make strength training a priority to protect your muscle while you lose weight.',
  'F-R1': 'You have a joint replacement. Follow your surgeon\'s and physical therapist\'s precautions; the Load as Medicine after-discharge resources can help.'
};
export const JHRA_SAFETY_COPY = 'One or more of your answers points to a problem that needs a healthcare professional first. Please contact your doctor or physical therapist before using the rest of this assessment or starting a new exercise program. If symptoms are severe or getting worse quickly, seek urgent care.';

export const JHRA_REASSESS_DAYS = 90;
