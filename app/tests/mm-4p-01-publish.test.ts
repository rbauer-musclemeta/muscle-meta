/* The published MM_4P_01 definition in the migration must be exactly what
   the engine scores against. Regenerate with:
     node scripts/write-mm4p-publish-migration.mjs */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MIGRATION, migrationSql } from '../scripts/write-mm4p-publish-migration.mjs';
import { definition } from '../scripts/export-mm4p-definition.mjs';
import { MM4P_ITEMS } from '../src/engine/mm-4p-01-definition.ts';

describe('MM_4P_01 publishing migration', () => {
  const file = readFileSync(MIGRATION, 'utf8');

  it('matches the generator output byte for byte', () => {
    expect(file).toBe(migrationSql());
  });

  it('embeds the current definition', () => {
    const json = file.split('$def$')[1];
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(definition)));
  });

  it('lists the safety question first and every item once', () => {
    const fields = definition.questions.map(q => q.field);
    expect(fields[0]).toBe('safety_review_status');
    expect(fields.slice(1)).toEqual(MM4P_ITEMS.map(i => i.field));
    expect(definition.questions.filter(q => q.role === 'score')).toHaveLength(42);
  });
});
