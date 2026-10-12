/* =============================================================================
   build-downloads.mjs — turns content/downloads/*.md into real HTML.

   Netlify runs this on every deploy (`npm run build`, after the blog build).
   Each download is ONE Markdown file, written by hand or saved from the
   content editor at /cms/. From it the build writes:
     site/downloads/<slug>/index.html   the landing page for that download
     site/downloads/index.html          its card, between the downloads markers
     site/sitemap.xml                   its URL, between the downloads markers

   The file people actually get (an interactive HTML plan, a PDF handout) is
   uploaded to site/downloads/files/ and named in the `file` field.

   It REFUSES to build when a download breaks a house rule (CLAUDE.md):
   non-canonical pillar or category key, a missing file, an email download
   without a Kit tag, a PMID that does not resolve to the cited paper,
   gate/upgrade wording, emoji, or a literal hex colour. A failed build keeps
   the last good deploy live.

   Drafts (`draft: true`) are built on deploy previews and branch deploys,
   with a Draft banner and noindex, and never on production.
   ========================================================================== */

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content', 'downloads');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(SITE, 'downloads');
const CACHE_FILE = path.join(ROOT, 'content', 'pmid-cache.json');
const SITE_URL = 'https://muscle-meta.com';
const MARKER = 'mm-download-build';

const CONTEXT = process.env.CONTEXT || 'dev';
const IS_PRODUCTION = CONTEXT === 'production';
const BUILD_DRAFTS = !IS_PRODUCTION;
const OFFLINE = process.env.PMID_OFFLINE === '1' && !IS_PRODUCTION;

/* ---- Framework facts. Mirrors PILLAR_DEFS / CATEGORY_DEFS in mm.js. ---- */
const PILLARS = {
  'exercise-mobility':    { n: 1, name: 'Exercise & Mobility' },
  'nutrition-metabolism': { n: 2, name: 'Nutrition & Metabolism' },
  'recovery-stress':      { n: 3, name: 'Recovery & Stress' },
  'balance-brain-health': { n: 4, name: 'Balance & Brain Health' }
};
const CATEGORIES = {
  'P1-C1': 'Joint Health', 'P1-C2': 'Functional Independence', 'P1-C3': 'Mobility',
  'P1-C4': 'Strength', 'P1-C5': 'Endurance', 'P2-C6': 'Nutrition',
  'P2-C7': 'Metabolic Flexibility', 'P3-C8': 'Recovery', 'P3-C9': 'Lifestyle',
  'P3-C10': 'Stress Management', 'P4-C11': 'Balance', 'P4-C12': 'Brain Health'
};
const ACCESS = ['email', 'open'];

const GATE_WORDS = /\b(unlock(s|ed)?|upgrade to (see|access|view)|founding member|members[- ]only|locked)\b/i;
const EMOJI = /\p{Extended_Pictographic}/u;
const HEX_IN_STYLE = /style\s*=\s*"[^"]*#[0-9a-f]{3,8}\b/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/* ---------------------------------------------------------------------------- */

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const isoDate = d => (d instanceof Date ? d.toISOString() : new Date(String(d)).toISOString()).slice(0, 10);
/* Inline Markdown only (bold, italics, links) for one-line fields. */
const inline = s => marked.parseInline(String(s ?? ''));

function splitFrontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing the --- frontmatter block at the top`);
  return { data: parseYaml(m[1]) || {}, body: m[2] };
}

/* ---- PMID verification: cache first, then PubMed. Same rule as the blog. ---- */
async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_FILE, 'utf8')); } catch { return {}; }
}
async function fetchPubmed(pmid) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=muscle-meta-build&id=${pmid}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`PubMed answered ${res.status}`);
  const doc = (await res.json())?.result?.[pmid];
  if (!doc || doc.error) return null;
  return { firstAuthor: String(doc.sortfirstauthor || '').split(' ')[0], year: String(doc.pubdate || '').slice(0, 4), title: doc.title };
}
async function verifySources(dl, cache, errors) {
  for (const [i, src] of (dl.data.sources || []).entries()) {
    const where = `${dl.file} source ${i + 1}`;
    if (!src || !src.citation) { errors.push(`${where}: add the citation text`); continue; }
    if (!src.pmid) continue; /* A citation without a PMID is allowed (e.g. a guideline). */
    const pmid = String(src.pmid).trim();
    if (!/^\d{5,9}$/.test(pmid)) { errors.push(`${where}: PMID "${pmid}" is not a PMID`); continue; }
    let meta = cache[pmid];
    if (!meta) {
      if (OFFLINE) { console.warn(`  ! ${where}: PMID ${pmid} not verified (offline local run)`); continue; }
      try { meta = await fetchPubmed(pmid); await new Promise(r => setTimeout(r, 400)); }
      catch (err) { errors.push(`${where}: could not reach PubMed to verify PMID ${pmid} (${err.message}). Try the deploy again.`); continue; }
      if (!meta) { errors.push(`${where}: PMID ${pmid} does not exist in PubMed`); continue; }
    }
    const cit = String(src.citation);
    if (!cit.toLowerCase().includes(meta.firstAuthor.toLowerCase()) || !cit.includes(meta.year)) {
      errors.push(`${where}: PMID ${pmid} is "${meta.title}" by ${meta.firstAuthor} (${meta.year}), which does not match the citation "${cit}"`);
    }
    src.pmid = pmid;
  }
}

/* ---- Rule checks on one download. ---- */
function check(dl, errors, warnings) {
  const d = dl.data, f = dl.file;
  for (const k of ['title', 'heading', 'description', 'summary', 'lede', 'file']) {
    if (!d[k]) errors.push(`${f}: ${k} is missing`);
  }
  if (d.description && (d.description.length < 70 || d.description.length > 170)) {
    errors.push(`${f}: description is ${d.description.length} characters; keep it between 70 and 170 for search results`);
  }
  if (!ACCESS.includes(d.access)) errors.push(`${f}: access must be "email" or "open"`);
  if (d.access === 'email') {
    if (!d.kit_tag) errors.push(`${f}: an email download needs a kit_tag (a label for reports, e.g. plan-oxygen-engine-12wk)`);
    else if (!SLUG.test(d.kit_tag)) errors.push(`${f}: kit_tag "${d.kit_tag}" must be lowercase words joined by hyphens`);
    if (d.kit_form_id && !/^\d{5,10}$/.test(String(d.kit_form_id))) {
      errors.push(`${f}: kit_form_id "${d.kit_form_id}" must be the number from the Kit form's URL`);
    }
    /* Not an error: the page still builds and its form says capture is not
       connected yet. Loud in the log so it is not forgotten. */
    if (!d.kit_form_id) warnings.push(`${f}: no kit_form_id yet, so its sign-up form cannot send anything. Create the Kit form and add its ID.`);
  }
  if (d.file) {
    const rel = String(d.file);
    if (!rel.startsWith('/downloads/files/')) errors.push(`${f}: file must be uploaded to /downloads/files/ (found "${rel}")`);
    else if (!existsSync(path.join(SITE, rel))) errors.push(`${f}: file "${rel}" does not exist in site/downloads/files/. Upload it first.`);
  }
  if (!PILLARS[d.pillar]) errors.push(`${f}: pillar must be one of ${Object.keys(PILLARS).join(', ')}`);
  const cats = d.categories || [];
  if (!cats.length) errors.push(`${f}: add at least one category key (e.g. P1-C5)`);
  for (const c of cats) if (!CATEGORIES[c]) errors.push(`${f}: "${c}" is not a canonical category key (P1-C1 … P4-C12)`);
  if (d.course && (!d.course.url || !d.course.name)) errors.push(`${f}: course needs both a name and a link`);
  for (const [i, it] of (d.inside || []).entries()) {
    if (!it || !it.lead || !it.text) errors.push(`${f}: "What is inside" item ${i + 1} needs both a lead and a sentence`);
  }

  const text = [d.title, d.heading, d.description, d.summary, d.lede, d.get_heading, d.get_note,
    d.button_label, JSON.stringify(d.inside || []), dl.body].join('\n');
  if (GATE_WORDS.test(text)) errors.push(`${f}: contains gate or upgrade wording ("${text.match(GATE_WORDS)[0]}"). Nothing in the framework is locked.`);
  if (EMOJI.test(text)) errors.push(`${f}: contains an emoji`);
  if (HEX_IN_STYLE.test(dl.body)) errors.push(`${f}: has a literal hex colour in a style attribute; use a token from mm.css`);
}

/* ---------------------------------------------------------------------------- */
/*  Templates — same chrome as the hand-written pages and the blog              */
/* ---------------------------------------------------------------------------- */

const FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@400;500;600;700&display=swap';

const NAV = `<header class="mm-nav">
  <div class="mm-nav-inner">
    <a href="/" class="mm-logo">Muscle-Meta Matrix<sup style="color:var(--teal);font-size:55%">™</sup><span>Clinical intelligence for active aging</span></a>
    <button class="mm-navtoggle" aria-label="Menu" aria-expanded="false"><span></span></button>
    <nav class="mm-navlinks">
      <a href="/courses/">Courses</a>
      <a href="/tools/">Tools</a>
      <a href="/learn/">Learn</a>
      <a href="/blog/">Articles</a>
      <a href="/downloads/">Free guides</a>
    </nav>
  </div>
</header>`;

const FOOT = `<footer class="mm-footer">
  <div class="mmm-container">
    <span class="wordmark">Muscle-Meta Matrix&trade;</span>
    <p style="margin-top:6px">Clinical intelligence for active aging &middot; Randy Bauer, PT</p>
    <p style="margin-top:var(--s-4)"><a href="/legal/privacy/">Privacy</a> &middot; <a href="/legal/terms/">Terms</a> &middot; <a href="/legal/medical-disclaimer/">Medical disclaimer</a></p>
  </div>
</footer>

<script src="/assets/mm.js"></script>
</body>
</html>
`;

/* The email form or the open button. Shared by the landing page and the card. */
function getBlock(d, { heading, note, marginTop }) {
  const action = d.access === 'email'
    ? `        <!-- data-kit-form is the Kit form whose incentive email sends the file; data-deliver is the "open it now" link. -->
        <form${d.kit_form_id ? ` data-kit-form="${esc(d.kit_form_id)}"` : ''} data-tag="${esc(d.kit_tag)}" data-deliver="${esc(d.file)}">
          <input type="email" placeholder="you@example.com" aria-label="Email address" required>
          <button type="submit" class="mmm-btn mmm-btn-primary">${esc(d.button_label || 'Send it to me')}</button>
        </form>`
    : `        <div><a class="mmm-btn mmm-btn-primary" href="${esc(d.file)}">${esc(d.button_label || 'Open it')}</a></div>`;
  return `      <div class="mm-capture" style="margin-top:${marginTop}">
        <div>
          <h3>${heading}</h3>
          <p class="micro" style="margin-top:var(--s-2)">${note}</p>
          <p class="status"></p>
        </div>
${action}
      </div>`;
}

function renderPage(dl) {
  const d = dl.data;
  const url = `${SITE_URL}/downloads/${dl.slug}/`;
  const eyebrow = d.eyebrow ? `Free download &middot; ${esc(d.eyebrow)}` : 'Free download';
  const inside = (d.inside || []).length ? `
      <h2 style="margin:var(--s-8) 0 var(--s-4);font-size:var(--fs-h3)">What is inside</h2>
      <ul style="padding-left:1.2em;line-height:1.8">
${d.inside.map(it => `        <li><strong>${inline(it.lead)}</strong> ${inline(it.text)}</li>`).join('\n')}
      </ul>
` : '';
  /* Extra sections. ## headings get the same look as the generated ones. */
  const body = dl.body.trim() ? '\n' + marked.parse(dl.body.trim())
    .replace(/<h2>/g, '<h2 style="margin:var(--s-7) 0 var(--s-4);font-size:var(--fs-h3)">')
    .trim().split('\n').map(l => '      ' + l).join('\n') + '\n' : '';
  const course = d.course ? `Part of <a href="${esc(d.course.url)}">${esc(d.course.name)}</a> course; the same ${esc(d.noun || 'download')} is free inside it. ` : '';
  const privacy = d.access === 'email'
    ? `We send the ${esc(d.noun || 'download')} and occasional clinical notes. Unsubscribe any time &mdash; see the <a href="/legal/privacy/">privacy policy</a>.`
    : '';
  const sources = (d.sources || []).length
    ? ` Sources: ${d.sources.map(s => esc(s.short || s.citation) + (s.pmid ? ` (PMID ${esc(s.pmid)})` : '')).join(', ')}.`
    : '';
  const draftBanner = d.draft ? `      <p class="micro" style="margin-bottom:var(--s-4)"><strong>Draft.</strong> Visible on previews only; not on the live site.</p>\n` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="generator" content="${MARKER}">
<title>${esc(d.title)} — Muscle-Meta Matrix™</title>
<meta name="description" content="${esc(d.description)}">
<link rel="canonical" href="${url}">
${d.draft ? '<meta name="robots" content="noindex">\n' : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<meta property="og:site_name" content="Muscle-Meta Matrix">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(d.title)}">
<meta property="og:description" content="${esc(d.og_description || d.description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/assets/mm.css">
</head>
<body>

${NAV}

<main>
  <section class="mmm-section">
    <div class="mmm-container" style="max-width:820px">
${draftBanner}      <span class="eyebrow">${eyebrow}</span>
      <h1 style="margin:var(--s-4) 0 var(--s-5);font-size:var(--fs-h1)">${esc(d.heading)}</h1>
      <p class="lede">${inline(d.lede)}</p>

${getBlock(d, { heading: esc(d.get_heading || 'Get it'), note: inline(d.get_note || d.summary), marginTop: 'var(--s-7)' })}
${inside}${body}
      <p class="micro" style="margin-top:var(--s-7)">${course}${privacy}</p>
      <p class="micro" style="margin-top:var(--s-3)">Educational content, not medical advice. <a href="/legal/medical-disclaimer/">Read the medical disclaimer</a>.${sources}</p>
    </div>
  </section>
</main>

${FOOT}`;
}

/* Card on /downloads/: the same capture block, plus a link to the full page. */
function renderCard(dl) {
  const d = dl.data;
  const note = `${inline(d.summary)} <a href="/downloads/${dl.slug}/">What is inside</a>`;
  return getBlock(d, { heading: esc(d.card_title || d.title), note, marginTop: 'var(--s-5)' });
}

async function updateBetween(file, start, end, inner) {
  let text = await readFile(file, 'utf8');
  const re = new RegExp(`(${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})[\\s\\S]*?(${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`);
  if (!re.test(text)) throw new Error(`${path.relative(ROOT, file)}: the markers "${start}" … "${end}" are missing`);
  text = text.replace(re, (_, a, b) => `${a}\n${inner}${inner ? '\n' : ''}${b}`);
  await writeFile(file, text);
}

/* ---------------------------------------------------------------------------- */

async function main() {
  console.log(`[downloads] context=${CONTEXT}${BUILD_DRAFTS ? ' (drafts included)' : ''}${OFFLINE ? ' (PMID check offline)' : ''}`);
  const files = existsSync(CONTENT) ? (await readdir(CONTENT)).filter(f => f.endsWith('.md')) : [];
  const errors = [];
  const warnings = [];
  const cache = await loadCache();
  const items = [];

  for (const file of files) {
    let parsed;
    try { parsed = splitFrontmatter(await readFile(path.join(CONTENT, file), 'utf8'), file); }
    catch (err) { errors.push(err.message); continue; }
    const slug = (parsed.data.slug || file.replace(/\.md$/, '')).toLowerCase();
    if (!SLUG.test(slug)) { errors.push(`${file}: slug "${slug}" must be lowercase words joined by hyphens`); continue; }
    const dl = { file, slug, data: parsed.data, body: parsed.body };
    if (dl.data.draft && !BUILD_DRAFTS) { console.log(`[downloads] skip draft ${file}`); continue; }
    check(dl, errors, warnings);
    await verifySources(dl, cache, errors);
    items.push(dl);
  }

  const seen = new Map();
  for (const dl of items) {
    if (seen.has(dl.slug)) errors.push(`two downloads share the slug "${dl.slug}"`);
    seen.set(dl.slug, true);
    const idx = path.join(OUT, dl.slug, 'index.html');
    if (existsSync(idx) && !(await readFile(idx, 'utf8')).includes(`content="${MARKER}"`)) {
      errors.push(`${dl.file}: /downloads/${dl.slug}/ is a hand-written page. Delete it or pick another slug.`);
    }
  }

  if (errors.length) {
    console.error(`\n[downloads] BUILD STOPPED: ${errors.length} problem(s). The live site is unchanged.\n`);
    errors.forEach(e => console.error('  - ' + e));
    console.error('');
    process.exit(1);
  }

  warnings.forEach(w => console.warn('[downloads] WARNING ' + w));

  /* Listed order: `order` ascending (unset last), then title. */
  items.sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || String(a.data.title).localeCompare(String(b.data.title)));

  /* Remove pages this script generated earlier; hand-made ones are left alone. */
  for (const entry of await readdir(OUT, { withFileTypes: true })) {
    const idx = path.join(OUT, entry.name, 'index.html');
    if (entry.isDirectory() && existsSync(idx) && (await readFile(idx, 'utf8')).includes(`content="${MARKER}"`)) {
      await rm(path.join(OUT, entry.name), { recursive: true, force: true });
    }
  }

  for (const dl of items) {
    await mkdir(path.join(OUT, dl.slug), { recursive: true });
    await writeFile(path.join(OUT, dl.slug, 'index.html'), renderPage(dl));
    console.log(`[downloads] wrote /downloads/${dl.slug}/${dl.data.draft ? ' (draft)' : ''}`);
  }

  const listed = items.filter(dl => dl.data.listed !== false);
  await updateBetween(path.join(OUT, 'index.html'),
    '<!-- downloads:start (generated by scripts/build-downloads.mjs; edit content/downloads/ instead) -->',
    '      <!-- downloads:end -->', listed.map(renderCard).join('\n\n'));

  const urls = items.filter(dl => !dl.data.draft).map(dl =>
    `  <url><loc>${SITE_URL}/downloads/${dl.slug}/</loc>${dl.data.updated || dl.data.date ? `<lastmod>${isoDate(dl.data.updated || dl.data.date)}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority></url>`);
  await updateBetween(path.join(SITE, 'sitemap.xml'),
    '<!-- downloads:start (generated by scripts/build-downloads.mjs) -->',
    '  <!-- downloads:end -->', urls.join('\n'));

  console.log(`[downloads] done: ${items.length} download(s), ${listed.length} card(s) on /downloads/, sitemap`);
}

main().catch(err => { console.error('[downloads] crashed:', err); process.exit(1); });
