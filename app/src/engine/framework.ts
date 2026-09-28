/* Canonical Muscle-Meta Matrix framework facts used by the engine.
   Mirrors CLAUDE.md, site/assets/mm.js and the Supabase `pillars` /
   `categories` tables. Pure data, no imports: runs in Node, the browser and
   Deno (the Supabase edge function bundles this file). */

export const PILLARS = [
  { id: 1, code: 'E', slug: 'exercise-mobility', name: 'Exercise & Mobility' },
  { id: 2, code: 'N', slug: 'nutrition-metabolism', name: 'Nutrition & Metabolism' },
  { id: 3, code: 'R', slug: 'recovery-stress', name: 'Recovery & Stress' },
  { id: 4, code: 'B', slug: 'balance-brain-health', name: 'Balance & Brain Health' }
] as const;

export const CATEGORIES = {
  'P1-C1': { pillar: 1, slug: 'joint-health', name: 'Joint Health' },
  'P1-C2': { pillar: 1, slug: 'functional-independence', name: 'Functional Independence' },
  'P1-C3': { pillar: 1, slug: 'mobility', name: 'Mobility' },
  'P1-C4': { pillar: 1, slug: 'strength', name: 'Strength' },
  'P1-C5': { pillar: 1, slug: 'endurance', name: 'Endurance' },
  'P2-C6': { pillar: 2, slug: 'nutrition', name: 'Nutrition' },
  'P2-C7': { pillar: 2, slug: 'metabolic-flexibility', name: 'Metabolic Flexibility' },
  'P3-C8': { pillar: 3, slug: 'recovery', name: 'Recovery' },
  'P3-C9': { pillar: 3, slug: 'lifestyle', name: 'Lifestyle' },
  'P3-C10': { pillar: 3, slug: 'stress-management', name: 'Stress Management' },
  'P4-C11': { pillar: 4, slug: 'balance', name: 'Balance' },
  'P4-C12': { pillar: 4, slug: 'brain-health', name: 'Brain Health' }
} as const;
export type CategoryKey = keyof typeof CATEGORIES;

/* The Four Lenses are measurement and interpretation domains. They are NOT
   pillars, are never combined into one score, and never feed the Muscle-Meta
   Health Score. Order here is the fixed tie-break order. */
export const LENSES = [
  { key: 'structure', name: 'Structure', question: 'What is my body made of, and is it changing?' },
  { key: 'capacity', name: 'Capacity', question: 'How much force and stamina can I produce?' },
  { key: 'function', name: 'Function', question: 'Can I do the tasks that matter to me?' },
  { key: 'experience', name: 'Experience', question: 'How do pain, energy, confidence and recovery feel?' }
] as const;
export type LensKey = (typeof LENSES)[number]['key'];
