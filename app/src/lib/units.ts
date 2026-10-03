/* Units a member may enter a measure in. Every measure is STORED in one
   canonical unit (METRICS[].unit) so the Day 30 comparison is always like
   with like; a value typed in another unit is converted on save and the
   original entry is kept in method_note ("Entered as 18 kg").

   Decided by Randy, 2026-10-03: body weight and grip strength in pounds or
   kilograms; six-minute walk in meters, or yards converted to meters. */

export type EntryUnit = { unit: string; label: string; toCanonical: number };

export const ENTRY_UNITS: Readonly<Record<string, readonly EntryUnit[]>> = {
  body_weight: [
    { unit: 'lb', label: 'lbs', toCanonical: 1 },
    { unit: 'kg', label: 'kg', toCanonical: 2.20462 }
  ],
  grip_strength: [
    { unit: 'lb', label: 'lbs', toCanonical: 1 },
    { unit: 'kg', label: 'kg', toCanonical: 2.20462 }
  ],
  walking_distance: [
    { unit: 'm', label: 'meters', toCanonical: 1 },
    { unit: 'yd', label: 'yards', toCanonical: 0.9144 }
  ]
};

/* Converts an entered value to the measure's canonical unit. Returns null
   for a unit the measure does not offer. One decimal place is kept. */
export function toCanonical(code: string, value: number, unit: string | null | undefined):
  { value: number; note: string | null } | null {
  const options = ENTRY_UNITS[code];
  if (!options) return { value, note: null };
  const chosen = unit ? options.find(o => o.unit === unit) : options[0];
  if (!chosen) return null;
  if (chosen.toCanonical === 1) return { value, note: null };
  return {
    value: Math.round(value * chosen.toCanonical * 10) / 10,
    note: `Entered as ${value} ${chosen.unit}`
  };
}
