/* Course content model and the checks every import must pass.

   Lesson content is paid and lives in Supabase (`lessons.content`, `lessons.body_md`),
   never in this public repository (CLAUDE.md §2). Staff import a content bundle at
   /app/admin/course-content; `validateBundle` refuses anything that breaks the rules
   the blog and downloads builds already enforce: canonical category keys, a grade on
   every evidence claim, every cited PMID listed with a grade, no gate wording, no
   emoji, no literal hex colour. PubMed resolution is checked separately
   (`course/pubmed.ts`) because it needs the network.

   Inline text uses two marks only: **bold** and {{PMID}} citation tokens. */

import { CATEGORIES } from '@/engine/framework';

export const BUNDLE_SCHEMA = 'mm-course-content/1';
export const GRADES = ['Established', 'Promising', 'Unproven-Bridge'] as const;
export type Grade = (typeof GRADES)[number];
export const TRACKS = ['foundation', 'builder', 'performer'] as const;
export type Track = (typeof TRACKS)[number];
export const TRACK_LABEL: Record<Track, string> = { foundation: 'Foundation', builder: 'Builder', performer: 'Performer' };

export type Reference = {
  pmid: string; authors: string; year: number; title: string; journal: string;
  volume?: string; issue?: string; pages?: string; doi?: string; grade: Grade;
};

export type Worksheet = { title: string; file_name: string };

export type LessonContent = {
  kind: 'lesson';
  key: string;
  category_keys: string[];
  big_idea: string;
  belief: string;
  outcome: string;
  objectives: string[];
  guide: { q: string; a: string }[];
  evidence: { pmid: string; finding: string; who: string; grade: Grade }[];
  myths: { myth: string; truth: string }[];
  tracks: Record<Track, string[]>;
  safety: { high: string; moderate: string; stop_signs: string[] };
  takeaways: string[];
  reflection: string[];
  refs: string[];
  worksheet: Worksheet | null;
};

export type OrientationContent = {
  kind: 'orientation';
  category_keys: string[];
  intro: string;
  parts: { title: string; body: string }[];
  tracks: { key: Track; rule: string; plan: string }[];
  risk: { level: 'high' | 'moderate' | 'low'; label: string; rule: string; action: string }[];
  disclaimer: string;
  refs: string[];
  worksheet: Worksheet | null;
};

export type Content = LessonContent | OrientationContent;

export type BundleLesson = {
  module: string; slug: string; position: number; code: string; title: string;
  minutes: number; body_md: string; content: Content;
};

export type Bundle = {
  schema: string;
  course: string;
  version: string;
  modules: { slug: string; position: number; title: string; summary: string }[];
  lessons: BundleLesson[];
  references: Record<string, Reference>;
};

/* ── inline text ───────────────────────────────────────────────────────── */

export type Inline = { t: 'text'; v: string } | { t: 'bold'; v: string } | { t: 'cite'; pmid: string };

/* Splits **bold** and {{PMID}} marks into parts. Everything else is plain text,
   so imported content can never inject markup. */
export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\{\{(\d{1,9})\}\}/g;
  let last = 0;
  for (const m of s.matchAll(re)) {
    if (m.index! > last) out.push({ t: 'text', v: s.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ t: 'bold', v: m[1] });
    else out.push({ t: 'cite', pmid: m[2] });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

export function citedPmids(s: string): string[] {
  return Array.from(s.matchAll(/\{\{(\d{1,9})\}\}/g), m => m[1]);
}

/* Every string in a value, for the wording checks. */
function strings(v: unknown, acc: string[] = []): string[] {
  if (typeof v === 'string') acc.push(v);
  else if (Array.isArray(v)) v.forEach(x => strings(x, acc));
  else if (v && typeof v === 'object') Object.values(v).forEach(x => strings(x, acc));
  return acc;
}

/* All PMIDs a lesson cites, wherever they appear. */
export function lessonPmids(c: Content): string[] {
  const set = new Set<string>();
  for (const s of strings(c)) citedPmids(s).forEach(p => set.add(p));
  if (c.kind === 'lesson') c.evidence.forEach(e => set.add(e.pmid));
  return [...set];
}

/* ── validation ────────────────────────────────────────────────────────── */

export const GATE_WORDS = /\b(unlock(s|ed)?|upgrade to (see|access|view)|founding member|members[- ]only|locked)\b/i;
const EMOJI = /\p{Extended_Pictographic}/u;
const HEX = /#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REJECTED_PILLARS = /Metabolic Flexibility & Nutrition|Recovery & Stress Reduction|Brain & Balance/;

export type Validation = { errors: string[]; warnings: string[] };

export function validateBundle(input: unknown): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const b = input as Bundle;
  if (!b || typeof b !== 'object') return { errors: ['The file is not a content bundle.'], warnings };
  if (b.schema !== BUNDLE_SCHEMA) errors.push(`schema must be "${BUNDLE_SCHEMA}" (found "${String(b.schema)}")`);
  if (!Array.isArray(b.modules) || !Array.isArray(b.lessons) || !b.references) {
    errors.push('bundle needs modules, lessons and references');
    return { errors, warnings };
  }

  const moduleSlugs = new Set(b.modules.map(m => m.slug));
  const refs = b.references;
  for (const [pmid, r] of Object.entries(refs)) {
    if (!/^\d{1,9}$/.test(pmid) || r.pmid !== pmid) errors.push(`reference ${pmid}: key and pmid must match and be numeric`);
    if (!GRADES.includes(r.grade)) errors.push(`reference ${pmid}: grade must be one of ${GRADES.join(', ')}`);
    if (!r.authors || !r.title || !r.journal || !r.year) errors.push(`reference ${pmid}: authors, title, journal and year are required`);
  }

  const seen = new Set<string>();
  for (const l of b.lessons) {
    const where = `lesson ${l?.slug ?? '?'}`;
    if (!l || !SLUG.test(l.slug ?? '')) { errors.push(`${where}: slug must be lowercase words joined by hyphens`); continue; }
    if (seen.has(`${l.module}/${l.slug}`)) errors.push(`${where}: duplicate slug in module ${l.module}`);
    seen.add(`${l.module}/${l.slug}`);
    if (!moduleSlugs.has(l.module)) errors.push(`${where}: module "${l.module}" is not in the bundle`);
    if (!l.title?.trim()) errors.push(`${where}: title is required`);
    if (!Number.isInteger(l.position)) errors.push(`${where}: position must be a whole number`);
    if (!l.body_md?.trim()) errors.push(`${where}: body_md is required`);
    const c = l.content;
    if (!c || (c.kind !== 'lesson' && c.kind !== 'orientation')) { errors.push(`${where}: content.kind must be lesson or orientation`); continue; }

    for (const k of c.category_keys ?? []) if (!(k in CATEGORIES)) errors.push(`${where}: "${k}" is not a canonical category key (P1-C1 … P4-C12)`);
    if (c.kind === 'lesson') {
      if (!c.category_keys?.length) errors.push(`${where}: a lesson needs at least one category key`);
      for (const f of ['big_idea', 'belief', 'outcome'] as const) if (!c[f]?.trim()) errors.push(`${where}: ${f} is required`);
      if (!c.guide?.length) errors.push(`${where}: the lesson guide is empty`);
      if (!c.evidence?.length) errors.push(`${where}: a lesson needs at least one evidence card`);
      for (const e of c.evidence ?? []) {
        if (!GRADES.includes(e.grade)) errors.push(`${where}: evidence for PMID ${e.pmid} has no valid grade`);
        if (!e.finding?.trim()) errors.push(`${where}: evidence for PMID ${e.pmid} has no finding`);
      }
      for (const t of TRACKS) if (!c.tracks?.[t]?.length) errors.push(`${where}: the ${t} plan is empty`);
      if (!c.safety?.high || !c.safety?.moderate || !c.safety?.stop_signs?.length) errors.push(`${where}: safety guidance (high, moderate, stop signs) is required`);
    } else {
      if (!c.parts?.length || !c.risk?.length || !c.tracks?.length) errors.push(`${where}: orientation needs parts, tracks and risk levels`);
    }

    for (const p of lessonPmids(c)) {
      if (!refs[p]) errors.push(`${where}: cites PMID ${p}, which is not in references`);
      else if (!c.refs?.includes(p)) errors.push(`${where}: cites PMID ${p} but does not list it in refs`);
    }
    for (const p of c.refs ?? []) if (!refs[p]) errors.push(`${where}: refs lists PMID ${p}, which is not in references`);

    const text = strings({ t: l.title, b: l.body_md, c });
    for (const s of text) {
      const gate = s.match(GATE_WORDS);
      if (gate) { errors.push(`${where}: gate or upgrade wording ("${gate[0]}"). Nothing in the framework is locked.`); break; }
    }
    if (text.some(s => EMOJI.test(s))) errors.push(`${where}: contains an emoji`);
    if (text.some(s => HEX.test(s))) errors.push(`${where}: contains a literal hex colour; use a token from mm.css`);
    if (text.some(s => REJECTED_PILLARS.test(s))) errors.push(`${where}: uses a rejected pillar name (CLAUDE.md, pillar naming)`);
    if (!c.worksheet) warnings.push(`${where}: no worksheet listed`);
  }
  if (!b.lessons.length) errors.push('bundle has no lessons');
  return { errors, warnings };
}

/* Citation numbering for a lesson: the order of its refs list. */
export function citeNumbers(refs: string[]): Map<string, number> {
  return new Map(refs.map((p, i) => [p, i + 1]));
}

export function formatReference(r: Reference): string {
  const authors = r.authors.endsWith('.') ? r.authors : `${r.authors}.`;
  const vol = [r.volume, r.issue ? `(${r.issue})` : ''].join('');
  const tail = [vol, r.pages].filter(Boolean).join(':');
  return `${authors} ${r.title}. ${r.journal}. ${r.year}${tail ? `;${tail}` : ''}.`;
}
