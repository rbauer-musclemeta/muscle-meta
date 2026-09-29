/* Copies the pure scoring engine into the Supabase edge function so both
   run byte-identical code. Run after any change to app/src/engine, then
   redeploy the function. tests/engine-sync.test.ts fails if they drift. */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, '../src/engine');
const dest = path.resolve(here, '../../supabase/functions/complete-assessment/engine');
mkdirSync(dest, { recursive: true });
for (const f of readdirSync(src).filter(f => f.endsWith('.ts'))) {
  writeFileSync(path.join(dest, f), readFileSync(path.join(src, f)));
  console.log('synced', f);
}
