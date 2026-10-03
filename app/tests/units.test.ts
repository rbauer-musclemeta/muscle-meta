import { describe, expect, it } from 'vitest';
import { ENTRY_UNITS, toCanonical } from '../src/lib/units';
import { METRICS } from '../src/engine/definitions';

describe('entry units', () => {
  it('lists the canonical unit first for every measure that offers a choice', () => {
    for (const [code, units] of Object.entries(ENTRY_UNITS)) {
      const def = METRICS.find(m => m.code === code);
      expect(def, code).toBeDefined();
      expect(units[0].unit).toBe(def!.unit);
      expect(units[0].toCanonical).toBe(1);
    }
  });
  it('stores kilograms as pounds and keeps the original entry', () => {
    expect(toCanonical('grip_strength', 30, 'kg')).toEqual({ value: 66.1, note: 'Entered as 30 kg' });
    expect(toCanonical('body_weight', 80, 'kg')).toEqual({ value: 176.4, note: 'Entered as 80 kg' });
    expect(toCanonical('body_weight', 180, 'lb')).toEqual({ value: 180, note: null });
  });
  it('stores yards as meters', () => {
    expect(toCanonical('walking_distance', 500, 'yd')).toEqual({ value: 457.2, note: 'Entered as 500 yd' });
    expect(toCanonical('walking_distance', 450, 'm')).toEqual({ value: 450, note: null });
  });
  it('rejects a unit the measure does not offer and passes single-unit measures through', () => {
    expect(toCanonical('walking_distance', 500, 'ft')).toBeNull();
    expect(toCanonical('chair_rise_30s', 12, null)).toEqual({ value: 12, note: null });
  });
  it('tells members the chair height', () => {
    expect(METRICS.find(m => m.code === 'chair_rise_30s')!.method).toContain('18 to 20 inches');
  });
});
