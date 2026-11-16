import { describe, expect, it } from 'vitest';
import { validateBundle, parseInline, lessonPmids, citeNumbers, BUNDLE_SCHEMA, type Bundle } from '../src/course/content';

/* A minimal, valid bundle. Fixture text is placeholder copy, not course content. */
function fixture(): Bundle {
  return {
    schema: BUNDLE_SCHEMA,
    course: 'metabolic-health-matrix',
    version: 'test',
    modules: [{ slug: 'module-1', position: 1, title: 'Module 1', summary: 'Summary' }],
    references: {
      '12345': { pmid: '12345', authors: 'Doe J, Roe R', year: 2020, title: 'A study', journal: 'J Test', grade: 'Established' }
    },
    lessons: [{
      module: 'module-1', slug: 'lesson-one', position: 1, code: '1.1', title: 'Lesson one', minutes: 10,
      body_md: '# Lesson one',
      content: {
        kind: 'lesson', key: 'm1l1', category_keys: ['P1-C1'],
        big_idea: 'Idea', belief: 'Belief', outcome: 'Outcome', objectives: ['Learn'],
        guide: [{ q: 'Question', a: 'Answer with **bold** {{12345}}' }],
        evidence: [{ pmid: '12345', finding: 'Finding', who: 'Adults', grade: 'Established' }],
        myths: [], tracks: { foundation: ['a'], builder: ['b'], performer: ['c'] },
        safety: { high: 'h', moderate: 'm', stop_signs: ['chest pain'] },
        takeaways: [], reflection: [], refs: ['12345'], worksheet: { title: 'W', file_name: 'w.pdf' }
      }
    }]
  };
}
const lesson = (b: Bundle) => b.lessons[0].content as Extract<Bundle['lessons'][0]['content'], { kind: 'lesson' }>;

describe('validateBundle', () => {
  it('accepts a valid bundle', () => {
    expect(validateBundle(fixture())).toEqual({ errors: [], warnings: [] });
  });
  it('rejects a wrong schema and a non-object', () => {
    expect(validateBundle(null).errors.length).toBe(1);
    const b = fixture(); b.schema = 'other';
    expect(validateBundle(b).errors.join()).toMatch(/schema/);
  });
  it('requires a grade on every evidence claim and reference', () => {
    const b = fixture();
    // @ts-expect-error testing a missing grade
    delete lesson(b).evidence[0].grade;
    // @ts-expect-error testing a bad grade
    b.references['12345'].grade = 'Strong';
    const e = validateBundle(b).errors.join('\n');
    expect(e).toMatch(/evidence for PMID 12345 has no valid grade/);
    expect(e).toMatch(/reference 12345: grade/);
  });
  it('rejects a non-canonical category key', () => {
    const b = fixture(); lesson(b).category_keys = ['P9-C1'];
    expect(validateBundle(b).errors.join()).toMatch(/canonical category key/);
  });
  it('rejects gate wording', () => {
    const b = fixture(); lesson(b).takeaways = ['Upgrade to see the full plan'];
    expect(validateBundle(b).errors.join()).toMatch(/gate or upgrade wording/);
    const c = fixture(); c.lessons[0].body_md = 'This section is members-only.';
    expect(validateBundle(c).errors.join()).toMatch(/gate or upgrade wording/);
  });
  it('rejects emoji and literal hex colours', () => {
    const b = fixture(); lesson(b).big_idea = 'Strong muscles \u{1F4AA}';
    expect(validateBundle(b).errors.join()).toMatch(/emoji/);
    const c = fixture(); lesson(c).outcome = 'Shown in #009090';
    expect(validateBundle(c).errors.join()).toMatch(/hex colour/);
  });
  it('rejects a cited PMID that is not in references or refs', () => {
    const b = fixture(); lesson(b).guide[0].a = 'See {{99999}}';
    expect(validateBundle(b).errors.join()).toMatch(/cites PMID 99999, which is not in references/);
    const c = fixture(); lesson(c).refs = [];
    expect(validateBundle(c).errors.join()).toMatch(/does not list it in refs/);
  });
  it('rejects bad slugs, duplicate slugs and unknown modules', () => {
    const b = fixture(); b.lessons[0].slug = 'Lesson One';
    expect(validateBundle(b).errors.join()).toMatch(/slug/);
    const c = fixture(); c.lessons.push(structuredClone(c.lessons[0]));
    expect(validateBundle(c).errors.join()).toMatch(/duplicate slug/);
    const d = fixture(); d.lessons[0].module = 'module-9';
    expect(validateBundle(d).errors.join()).toMatch(/not in the bundle/);
  });
  it('requires all three track plans and safety guidance', () => {
    const b = fixture(); lesson(b).tracks.performer = []; lesson(b).safety.stop_signs = [];
    const e = validateBundle(b).errors.join('\n');
    expect(e).toMatch(/performer plan is empty/);
    expect(e).toMatch(/safety guidance/);
  });
  it('warns when a lesson has no worksheet', () => {
    const b = fixture(); lesson(b).worksheet = null;
    expect(validateBundle(b).warnings.join()).toMatch(/no worksheet/);
  });
});

describe('parseInline', () => {
  it('splits bold and citation marks and leaves everything else as text', () => {
    expect(parseInline('A **b** c {{123}}.')).toEqual([
      { t: 'text', v: 'A ' }, { t: 'bold', v: 'b' }, { t: 'text', v: ' c ' }, { t: 'cite', pmid: '123' }, { t: 'text', v: '.' }
    ]);
  });
  it('never turns markup into anything but text', () => {
    expect(parseInline('<script>x</script>')).toEqual([{ t: 'text', v: '<script>x</script>' }]);
  });
  it('collects cited PMIDs and numbers them in refs order', () => {
    expect(lessonPmids(lesson(fixture()))).toEqual(['12345']);
    expect(citeNumbers(['9', '7']).get('7')).toBe(2);
  });
});
