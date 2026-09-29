/* The edge function must run exactly the engine the app was tested with. */
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const src = path.resolve(__dirname, '../src/engine');
const fn = path.resolve(__dirname, '../../supabase/functions/complete-assessment/engine');

describe('engine copy in the edge function', () => {
  for (const f of readdirSync(src).filter(f => f.endsWith('.ts'))) {
    it(`${f} matches app/src/engine (run: node scripts/sync-engine.mjs)`, () => {
      expect(readFileSync(path.join(fn, f), 'utf8')).toBe(readFileSync(path.join(src, f), 'utf8'));
    });
  }
});
