/* =============================================================================
   build-blog.mjs — turns content/blog/*.md into real HTML under site/blog/.

   Netlify runs this on every deploy (`npm run build`). It writes:
     site/blog/<slug>/index.html   one page per published post
     site/blog/index.html          the article hub: featured posts, then all
     site/blog/feed.xml            RSS for readers and newsletter tools
     site/sitemap.xml              post URLs inserted between the blog markers

   It REFUSES to build when a post breaks a house rule (CLAUDE.md): unknown
   pillar or category key, a claim without an evidence grade, a PMID that does
   not resolve to the cited paper, gate/upgrade wording, emoji, or a literal
   hex colour. A failed build keeps the last good deploy live, so a bad post
   can never reach the site.

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
const CONTENT = path.join(ROOT, 'content', 'blog');
const SITE = path.join(ROOT, 'site');
const OUT = path.join(SITE, 'blog');
const CACHE_FILE = path.join(ROOT, 'content', 'pmid-cache.json');
const SITE_URL = 'https://muscle-meta.com';

/* Netlify sets CONTEXT to production | deploy-preview | branch-deploy | dev. */
const CONTEXT = process.env.CONTEXT || 'dev';
const IS_PRODUCTION = CONTEXT === 'production';
const BUILD_DRAFTS = !IS_PRODUCTION;
/* Only for local runs without internet. Production always verifies. */
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
const GRADES = ['Established', 'Promising', 'Unproven-Bridge'];

/* Wording that reintroduces a gate on the framework (CLAUDE.md "Gating is REMOVED"). */
const GATE_WORDS = /\b(unlock(s|ed)?|upgrade to (see|access|view)|founding member|members[- ]only|locked)\b/i;
const EMOJI = /\p{Extended_Pictographic}/u;
const HEX_IN_STYLE = /style\s*=\s*"[^"]*#[0-9a-f]{3,8}\b/i;

/* ---------------------------------------------------------------------------- */

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const isoDate = d => (d instanceof Date ? d.toISOString() : new Date(String(d)).toISOString()).slice(0, 10);
const longDate = d => new Date(isoDate(d) + 'T12:00:00Z')
  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const rfc822 = d => new Date(isoDate(d) + 'T12:00:00Z').toUTCString();

function splitFrontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing the --- frontmatter block at the top`);
  return { data: parseYaml(m[1]) || {}, body: m[2] };
}

/* ---- PMID verification: cache first, then PubMed. ---- */
async function loadCache() {
  try { return JSON.parse(await readFile(CACHE_FILE, 'utf8')); } catch { return {}; }
}

async function fetchPubmed(pmid) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=muscle-meta-build&id=${pmid}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`PubMed answered ${res.status}`);
  const json = await res.json();
  const doc = json?.result?.[pmid];
  if (!doc || doc.error) return null;
  return {
    firstAuthor: String(doc.sortfirstauthor || '').split(' ')[0],
    year: String(doc.pubdate || '').slice(0, 4),
    title: doc.title,
    journal: doc.source
  };
}

async function verifyReferences(post, cache, errors) {
  const refs = post.data.references || [];
  for (const [i, ref] of refs.entries()) {
    const n = i + 1;
    const where = `${post.file} reference ${n}`;
    if (!ref || typeof ref !== 'object') { errors.push(`${where}: is empty`); continue; }
    if (!GRADES.includes(ref.grade)) errors.push(`${where}: grade must be one of ${GRADES.join(', ')} (found "${ref.grade ?? ''}")`);
    if (!ref.claim) errors.push(`${where}: add the claim this reference supports`);
    if (!ref.citation) errors.push(`${where}: add the citation text`);
    if (!ref.pmid) { if (!ref.url) errors.push(`${where}: needs a PMID, or a url for a non-PubMed source`); continue; }
    const pmid = String(ref.pmid).trim();
    if (!/^\d{5,9}$/.test(pmid)) { errors.push(`${where}: PMID "${pmid}" is not a PMID`); continue; }

    let meta = cache[pmid];
    if (!meta) {
      if (OFFLINE) { console.warn(`  ! ${where}: PMID ${pmid} not verified (offline local run)`); continue; }
      try {
        meta = await fetchPubmed(pmid);
        await new Promise(r => setTimeout(r, 400)); // PubMed allows ~3 requests a second
      } catch (err) {
        errors.push(`${where}: could not reach PubMed to verify PMID ${pmid} (${err.message}). Try the deploy again.`);
        continue;
      }
      if (!meta) { errors.push(`${where}: PMID ${pmid} does not exist in PubMed`); continue; }
    }
    /* The failure mode that matters: a valid PMID for the wrong paper.
       The citation text must name the paper's real first author and year. */
    const cit = String(ref.citation);
    if (!cit.toLowerCase().includes(meta.firstAuthor.toLowerCase()) || !cit.includes(meta.year)) {
      errors.push(`${where}: PMID ${pmid} is "${meta.title}" by ${meta.firstAuthor} (${meta.year}), which does not match the citation "${cit}"`);
    }
    ref._meta = meta;
    ref.pmid = pmid;
  }
}

/* ---- Rule checks on one post. ---- */
function checkPost(post, errors) {
  const d = post.data, f = post.file;
  if (!d.title) errors.push(`${f}: title is missing`);
  if (!d.description) errors.push(`${f}: description is missing`);
  else if (d.description.length < 70 || d.description.length > 170) {
    errors.push(`${f}: description is ${d.description.length} characters; keep it between 70 and 170 for search results`);
  }
  if (!d.date || isNaN(new Date(isoDate(d.date)))) errors.push(`${f}: date is missing or not a date`);
  if (!PILLARS[d.pillar]) errors.push(`${f}: pillar must be one of ${Object.keys(PILLARS).join(', ')}`);
  const cats = d.categories || [];
  if (!cats.length) errors.push(`${f}: add at least one category key (e.g. P1-C5)`);
  for (const c of cats) if (!CATEGORIES[c]) errors.push(`${f}: "${c}" is not a canonical category key (P1-C1 … P4-C12)`);
  if (d.image && !d.image_alt) errors.push(`${f}: image needs image_alt text`);

  const text = [d.title, d.description, post.body, JSON.stringify(d.faq || [])].join('\n');
  if (GATE_WORDS.test(text)) errors.push(`${f}: contains gate or upgrade wording ("${text.match(GATE_WORDS)[0]}"). Nothing in the framework is locked.`);
  if (EMOJI.test(text)) errors.push(`${f}: contains an emoji`);
  if (HEX_IN_STYLE.test(post.body)) errors.push(`${f}: has a literal hex colour in a style attribute; use a token from mm.css`);

  /* Every [n] marker in the body must point at a reference, and every
     reference must be cited somewhere, so no claim floats free. */
  const refs = d.references || [];
  const cited = new Set([...post.body.matchAll(/\[(\d{1,2})\](?![(:])/g)].map(m => Number(m[1])));
  for (const n of cited) if (n < 1 || n > refs.length) errors.push(`${f}: cites [${n}] but there are only ${refs.length} references`);
  refs.forEach((_, i) => { if (!cited.has(i + 1)) errors.push(`${f}: reference ${i + 1} is never cited in the text`); });
}

/* ---------------------------------------------------------------------------- */
/*  Templates                                                                    */
/* ---------------------------------------------------------------------------- */

const FONTS = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@400;500;600;700&display=swap';

function head({ title, description, canonical, noindex, ogType = 'website', image, jsonld, extra = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="generator" content="mm-blog-build">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="Muscle-Meta Matrix™">
${image ? `<meta property="og:image" content="${esc(SITE_URL + image)}">\n<meta name="twitter:card" content="summary_large_image">\n` : '<meta name="twitter:card" content="summary">\n'}<link rel="alternate" type="application/rss+xml" title="Muscle-Meta Matrix™ articles" href="/blog/feed.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/assets/mm.css">
${jsonld ? `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2).replace(/</g, '\\u003c')}\n</script>\n` : ''}${extra}</head>
<body>

<header class="mm-nav">
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
</header>
`;
}

const FOOT = `
<footer class="mm-footer">
  <div class="mmm-container">
    <span class="wordmark">Muscle-Meta Matrix&trade;</span>
    <p style="margin-top:6px">Clinical intelligence for active aging &middot; Randy Bauer, PT</p>
    <p style="margin-top:var(--s-4)"><a href="/legal/privacy/">Privacy</a> &middot; <a href="/legal/terms/">Terms</a> &middot; <a href="/legal/medical-disclaimer/">Medical disclaimer</a> &middot; <a href="/blog/feed.xml">RSS</a></p>
  </div>
</footer>

<script src="/assets/mm.js"></script>
</body>
</html>
`;

const AUTHOR = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#randy-bauer`,
  name: 'Randy Bauer',
  honorificSuffix: 'PT',
  jobTitle: 'Physical Therapist',
  description: 'Mayo Clinic-trained physical therapist with more than 35 years of clinical experience in orthopedic and sports physical therapy.',
  url: `${SITE_URL}/`
};
const ORG = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#org`,
  name: 'Muscle-Meta Matrix',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/assets/favicon.svg`,
  founder: { '@id': AUTHOR['@id'] }
};

const pillarChip = key => {
  const p = PILLARS[key];
  return p ? `<span class="mm-article-pillar pillar-${p.n}">${esc(p.name)}</span>` : '';
};

function readingMinutes(md) {
  const words = md.replace(/[#>*_`\[\]()-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

function newsletterBlock(slug) {
  return `
      <div class="mm-capture" style="margin-top:var(--s-8)">
        <div>
          <h3>Get the Muscle-Meta newsletter</h3>
          <p class="micro" style="margin-top:var(--s-2)">New articles and clinical notes on staying strong after 50, every claim graded. Unsubscribe any time.</p>
          <p class="status"></p>
        </div>
        <form data-tag="src-blog-${esc(slug)}">
          <input type="email" placeholder="you@example.com" aria-label="Email address" required>
          <button type="submit" class="mmm-btn mmm-btn-primary">Subscribe</button>
        </form>
      </div>`;
}

function renderPost(post) {
  const d = post.data;
  const url = `${SITE_URL}/blog/${post.slug}/`;
  const refs = d.references || [];
  const updated = d.updated ? isoDate(d.updated) : isoDate(d.date);

  let html = marked.parse(post.body, { gfm: true });
  html = html.replace(/\[(\d{1,2})\](?![(:])/g, (_, n) =>
    `<sup class="mm-cite"><a href="#ref-${n}" aria-label="Reference ${n}">${n}</a></sup>`);

  const catNames = (d.categories || []).map(k => CATEGORIES[k]).filter(Boolean);

  const refList = refs.length ? `
      <section class="mm-article-refs" aria-labelledby="refs-h">
        <h2 id="refs-h">References and evidence grades</h2>
        <p class="micro">Every claim above is graded: <strong>Established</strong> (consistent evidence), <strong>Promising</strong> (good early evidence, limits noted), or <strong>Unproven-Bridge</strong> (a reasoned link not yet tested directly).</p>
        <ol>
${refs.map((r, i) => {
  const link = r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : r.url;
  const label = r.pmid ? `PubMed ${r.pmid}` : 'Source';
  return `          <li id="ref-${i + 1}"><p class="claim">${esc(r.claim)} <span class="mm-grade grade-${esc(String(r.grade).toLowerCase())}">${esc(r.grade)}</span></p><p class="cite">${esc(r.citation)} <a href="${esc(link)}" rel="noopener">${label}</a>${r.pmid && r._meta?.doi ? ` &middot; <a href="https://doi.org/${esc(r._meta.doi)}" rel="noopener">DOI</a>` : ''}</p></li>`;
}).join('\n')}
        </ol>
      </section>` : '';

  const faq = (d.faq || []).filter(q => q && q.q && q.a);
  const faqHtml = faq.length ? `
      <section class="mm-article-faq" aria-labelledby="faq-h">
        <h2 id="faq-h">Common questions</h2>
${faq.map(q => `        <h3>${esc(q.q)}</h3>\n        ${marked.parse(String(q.a))}`).join('\n')}
      </section>` : '';

  const toolCta = d.related_tool ? `
      <p class="mm-article-cta"><a class="mmm-btn mmm-btn-primary" href="${esc(d.related_tool.url)}">${esc(d.related_tool.label || 'Try the tool')}</a></p>` : '';

  const graph = [
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: d.title,
      description: d.description,
      datePublished: isoDate(d.date),
      dateModified: updated,
      author: { '@id': AUTHOR['@id'] },
      publisher: { '@id': ORG['@id'] },
      mainEntityOfPage: url,
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      articleSection: PILLARS[d.pillar]?.name,
      about: catNames.map(name => ({ '@type': 'Thing', name })),
      keywords: [...catNames, ...(d.keywords || [])].join(', '),
      ...(d.image ? { image: SITE_URL + d.image } : {}),
      ...(refs.length ? {
        citation: refs.map(r => ({
          '@type': 'ScholarlyArticle',
          name: r._meta?.title || r.citation,
          url: r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : r.url,
          ...(r.pmid ? { identifier: `PMID:${r.pmid}` } : {})
        }))
      } : {})
    },
    AUTHOR,
    ORG,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/blog/` },
        { '@type': 'ListItem', position: 3, name: d.title, item: url }
      ]
    }
  ];
  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faq.map(q => ({
        '@type': 'Question', name: q.q,
        acceptedAnswer: { '@type': 'Answer', text: String(q.a) }
      }))
    });
  }

  return head({
    title: `${d.title} — Muscle-Meta Matrix™`,
    description: d.description,
    canonical: url,
    noindex: !!d.draft,
    ogType: 'article',
    image: d.image,
    jsonld: { '@context': 'https://schema.org', '@graph': graph }
  }) + `
<main>
  <article class="mmm-section mm-article">
    <div class="mmm-container mm-article-col">
${d.draft ? '      <p class="mm-draft-banner">Draft: visible on this preview only. It will not appear on muscle-meta.com until draft is switched off.</p>\n' : ''}      <nav class="micro mm-crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog/">Articles</a></nav>
      <div class="mm-article-meta">${pillarChip(d.pillar)}${catNames.map(n => `<span class="mm-article-cat">${esc(n)}</span>`).join('')}</div>
      <h1>${esc(d.title)}</h1>
      <p class="lede">${esc(d.description)}</p>
      <p class="micro mm-byline">By <strong>Randy Bauer, PT</strong> &middot; Mayo Clinic-trained physical therapist &middot; <time datetime="${isoDate(d.date)}">${longDate(d.date)}</time>${d.updated ? ` &middot; updated <time datetime="${updated}">${longDate(updated)}</time>` : ''} &middot; ${readingMinutes(post.body)} min read</p>
${d.image ? `      <img class="mm-article-hero" src="${esc(d.image)}" alt="${esc(d.image_alt)}" loading="eager">\n` : ''}      <div class="mm-prose">
${html}
      </div>${toolCta}${faqHtml}${refList}
      <p class="micro mm-article-disclaimer">Educational content, not medical advice. It does not diagnose or treat any condition. Talk with your clinician before starting a new exercise program or test. See the <a href="/legal/medical-disclaimer/">medical disclaimer</a>.</p>${d.newsletter === false ? '' : newsletterBlock(post.slug)}
    </div>
  </article>
</main>
` + FOOT;
}

function postCard(post, big = false) {
  const d = post.data;
  const p = PILLARS[d.pillar];
  return `        <a class="mm-asset pillar-${p?.n || 1}${big ? ' mm-asset-feature' : ''}" href="/blog/${post.slug}/">
          <span class="kind">${esc(p?.name || '')}${d.draft ? ' &middot; Draft' : ''}</span>
          <h3>${esc(d.title)}</h3>
          <p>${esc(d.description)}</p>
          <p class="micro" style="margin-top:var(--s-4)"><time datetime="${isoDate(d.date)}">${longDate(d.date)}</time> &middot; ${readingMinutes(post.body)} min read</p>
        </a>`;
}

function renderIndex(posts) {
  const featured = posts.filter(p => p.data.featured).slice(0, 3);
  /* Featured posts are not repeated below; with nothing else to show, the
     second list is left out. */
  const rest = posts.filter(p => !featured.includes(p));
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/blog/#page`,
        name: 'Articles',
        url: `${SITE_URL}/blog/`,
        description: 'Evidence-graded articles on muscle-metabolic health, written by a Mayo Clinic-trained physical therapist.',
        publisher: { '@id': ORG['@id'] },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/blog/${p.slug}/`, name: p.data.title
          }))
        }
      },
      ORG,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/blog/` }
        ]
      }
    ]
  };

  const empty = `      <p style="margin-top:var(--s-6)">The first articles are in production. In the meantime, the <a href="/tools/oxygen-engine/">Oxygen Engine</a> covers cardiorespiratory fitness in depth, with its references listed.</p>`;

  return head({
    title: 'Articles — Muscle-Meta Matrix™',
    description: 'Evidence-graded articles on muscle-metabolic health, written by a Mayo Clinic-trained physical therapist.',
    canonical: `${SITE_URL}/blog/`,
    jsonld
  }) + `
<main>
  <section class="mmm-section">
    <div class="mmm-container">
      <span class="eyebrow">Articles</span>
      <h1 style="margin:var(--s-4) 0 var(--s-5)">Articles</h1>
      <p class="lede" style="max-width:720px">Clinical writing on staying strong, mobile and independent after 50. Every claim graded, every citation checked.</p>
${posts.length === 0 ? empty : ''}${featured.length ? `
      <h2 class="mm-blog-h2">Featured</h2>
      <div class="mm-card-grid">
${featured.map(p => postCard(p, true)).join('\n')}
      </div>` : ''}${rest.length ? `
      <h2 class="mm-blog-h2">${featured.length ? 'More articles' : 'All articles'}</h2>
      <div class="mm-card-grid">
${rest.map(p => postCard(p)).join('\n')}
      </div>` : ''}
${newsletterBlock('index')}
    </div>
  </section>
</main>
` + FOOT;
}

function renderFeed(posts) {
  const items = posts.filter(p => !p.data.draft).slice(0, 30).map(p => `    <item>
      <title>${esc(p.data.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid>
      <pubDate>${rfc822(p.data.date)}</pubDate>
      <description>${esc(p.data.description)}</description>
      <category>${esc(PILLARS[p.data.pillar]?.name || '')}</category>
    </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Muscle-Meta Matrix™ articles</title>
    <link>${SITE_URL}/blog/</link>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Evidence-graded articles on muscle-metabolic health by Randy Bauer, PT.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
}

async function updateSitemap(posts) {
  const file = path.join(SITE, 'sitemap.xml');
  let xml = await readFile(file, 'utf8');
  const START = '  <!-- blog:start (generated by scripts/build-blog.mjs) -->';
  const END = '  <!-- blog:end -->';
  xml = xml.replace(/\n?\s*<!-- blog:start[\s\S]*?<!-- blog:end -->/, '');
  const entries = posts.filter(p => !p.data.draft).map(p =>
    `  <url><loc>${SITE_URL}/blog/${p.slug}/</loc><lastmod>${isoDate(p.data.updated || p.data.date)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
  xml = xml.replace('</urlset>', `${START}\n${entries.join('\n')}${entries.length ? '\n' : ''}${END}\n</urlset>`);
  await writeFile(file, xml);
}

/* ---------------------------------------------------------------------------- */

async function main() {
  console.log(`[blog] context=${CONTEXT}${BUILD_DRAFTS ? ' (drafts included)' : ''}${OFFLINE ? ' (PMID check offline)' : ''}`);
  const files = existsSync(CONTENT) ? (await readdir(CONTENT)).filter(f => f.endsWith('.md')) : [];
  const errors = [];
  const cache = await loadCache();
  const posts = [];

  for (const file of files) {
    const raw = await readFile(path.join(CONTENT, file), 'utf8');
    let parsed;
    try { parsed = splitFrontmatter(raw, file); } catch (err) { errors.push(err.message); continue; }
    const slug = (parsed.data.slug || file.replace(/\.md$/, '')).toLowerCase();
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { errors.push(`${file}: slug "${slug}" must be lowercase words joined by hyphens`); continue; }
    const post = { file, slug, data: parsed.data, body: parsed.body };
    if (post.data.draft && !BUILD_DRAFTS) { console.log(`[blog] skip draft ${file}`); continue; }
    checkPost(post, errors);
    await verifyReferences(post, cache, errors);
    posts.push(post);
  }

  const slugs = posts.map(p => p.slug);
  slugs.forEach((s, i) => { if (slugs.indexOf(s) !== i) errors.push(`two posts share the slug "${s}"`); });

  if (errors.length) {
    console.error(`\n[blog] BUILD STOPPED: ${errors.length} problem(s). The live site is unchanged.\n`);
    errors.forEach(e => console.error('  - ' + e));
    console.error('');
    process.exit(1);
  }

  posts.sort((a, b) => isoDate(b.data.date).localeCompare(isoDate(a.data.date)));

  /* Remove post folders this script generated on earlier runs (marked by the
     generator meta tag); anything hand-made under /blog/ is left alone. */
  if (existsSync(OUT)) {
    for (const entry of await readdir(OUT, { withFileTypes: true })) {
      const idx = path.join(OUT, entry.name, 'index.html');
      if (entry.isDirectory() && existsSync(idx) && (await readFile(idx, 'utf8')).includes('content="mm-blog-build"')) {
        await rm(path.join(OUT, entry.name), { recursive: true, force: true });
      }
    }
  }

  for (const post of posts) {
    const dir = path.join(OUT, post.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), renderPost(post));
    console.log(`[blog] wrote /blog/${post.slug}/${post.data.draft ? ' (draft)' : ''}`);
  }
  await writeFile(path.join(OUT, 'index.html'), renderIndex(posts));
  await writeFile(path.join(OUT, 'feed.xml'), renderFeed(posts));
  await updateSitemap(posts);
  console.log(`[blog] done: ${posts.length} post(s), index, feed, sitemap`);
}

main().catch(err => { console.error('[blog] crashed:', err); process.exit(1); });
