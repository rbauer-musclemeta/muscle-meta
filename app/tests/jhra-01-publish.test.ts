/* The published JHRA_01 definition in the migration must be exactly what
   the engine scores against. Regenerate with:
     node scripts/write-jhra-publish-migration.mjs */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MIGRATION, migrationSql } from '../scripts/write-jhra-publish-migration.mjs';
import { definition } from '../scripts/export-jhra-definition.mjs';
import { JHRA_SAFETY, JHRA_QUESTIONS } from '../src/engine/jhra-01-definition.ts';

describe('JHRA_01 publishing migration', () => {
  const file = readFileSync(MIGRATION, 'utf8');

  it('matches the generator output byte for byte', () => {
    expect(file).toBe(migrationSql());
  });

  it('embeds the current definition', () => {
    const json = file.split('$def$')[1];
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(definition)));
  });

  it('lists the 7 safety questions first and every question once', () => {
    const fields = definition.questions.map((q: { field: string }) => q.field);
    expect(fields.slice(0, 7)).toEqual(JHRA_SAFETY.map(q => q.field));
    expect(fields.slice(7)).toEqual(JHRA_QUESTIONS.map(q => q.field));
    expect(new Set(fields).size).toBe(fields.length);
  });

  it('the tool page renders from the engine and sends only published fields', () => {
    const dir = new URL('../../site/tools/joint-health-risk/', import.meta.url);
    const page = readFileSync(new URL('index.html', dir), 'utf8');
    const script = readFileSync(new URL('jhra-page.js', dir), 'utf8');
    expect(page).toContain('src="jhra-01.js"');
    expect(page).toContain('src="jhra-page.js"');
    const fields = new Set(definition.questions.map((q: { field: string }) => q.field));
    const literal = [...(page + script).matchAll(/["'`](jh_[a-z0-9_]+)["'`]/g)].map(m => m[1]);
    for (const f of literal) expect(fields.has(f), f).toBe(true);
  });
});
