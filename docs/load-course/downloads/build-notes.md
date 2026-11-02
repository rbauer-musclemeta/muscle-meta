# Downloads: build notes (A4, 2026-11-02)

Build notes for the two Load as Medicine free downloads. Not published; only
`site/` is.

| Download | Entry (the build reads it) | PDF people get | PDF source |
|---|---|---|---|
| Post-arthroplasty loading guide | `content/downloads/post-arthroplasty-loading-guide.md` (access: email) | `site/downloads/files/post-arthroplasty-loading-guide.pdf` (5 pages) | `post-arthroplasty-loading-guide.source.md` |
| Acceptable pain loading tracker | `content/downloads/acceptable-pain-tracker.md` (access: open) | `site/downloads/files/acceptable-pain-tracker.pdf` (5 pages) | `acceptable-pain-tracker.source.md` |

## Where the copy comes from

- A2 safety copy, signed off by Randy as clinical reviewer, used word for word:
  `post-surgery-caveat.md` (full version, top of the guide), `red-flag-screen.md`
  (short-form box, front of both PDFs), `pain-rule-wording.md` (full version in
  the guide, short version and tracker adjustment rules in the tracker),
  `copy-fixes.md` F24 to F29, `disclaimer.md` (download version, last page of
  both PDFs).
- One change to the signed copy, made by Randy: "has given you the go-ahead"
  in place of "has cleared you".
- Grades come from A1's `claims-register.csv`. Claim IDs are kept in HTML
  comments in the sources, never printed. Readers see grade labels only.

## Claims used

| Claim | Grade (register) | Where | Cited |
|---|---|---|---|
| C08 | Promising | Guide: research summary and table | Wei 2024, PMID 39267026 |
| C23 | Promising | Guide: opening of "How much ache is acceptable?" | Bedson 2008 (18764949), Bricca 2019 (30320965), Fransen 2015 (25569281) |
| C02 | Unproven-Bridge | Guide and tracker: acceptable pain guide | No source printed (clinical guidance) |
| C17 | Unproven-Bridge | Tracker: "cut back to about half" | No source; labelled as Randy Bauer, PT's clinical guidance |

Left out on purpose:

- The Sandal 2015 sentence from `pain-rule-wording.md` ("the small rise in pain
  after each session shrank over 8 weeks"): its PMID 26564575 is not in
  `content/pmid-cache.json` and may not be cited.
- C09 (muscles as shock absorbers): cut everywhere.
- The source's conventional rehab column and pain row in the Wei table (F25).
- C23 is graded Promising in the register and, since A2's final pass
  (5aa6000), in `pain-rule-wording.md` too. The PDFs use Promising.

## Landing-page disclaimer (A9 pass 1 fix)

Both entries end with the page version of the medical disclaimer from
`disclaimer.md`, word for word, as a `## Medical disclaimer` section in the
body, so the build renders it on each landing page above the generated
footer line. The PDFs carry the download version on their last page.

## Frontmatter notes

- `kit_form_id` is `""` with a `TODO-KIT-FORM-ID` comment. The build accepts
  only a number, so the literal placeholder text would stop the build; empty
  gives the expected warning instead. Randy creates the Kit form and pastes
  its number.
- The guide carries `P1-C1` and `P1-C4`: it cites strength evidence graded in
  A1 (C08, Wei 2024: knee extension and flexion strength).
- The tracker is `access: open` (PLAN default), pending Randy's confirmation.

## How the PDFs are made

1. `npm ci` in the repo (for `marked`).
2. Fonts: Google Fonts is not reachable from the build session, so the font
   files come from npm: `npm install @fontsource/outfit@5.0.13
   @fontsource/cormorant-garamond@5.0.13` in a scratch folder, then copy
   `outfit-latin-400-normal.woff2`, `outfit-latin-600-normal.woff2`,
   `cormorant-garamond-latin-600-normal.woff2` and
   `cormorant-garamond-latin-700-normal.woff2` into one folder. Both fonts are
   embedded in the PDF (checked with `pdffonts`).
3. Save the script below as `render-pdf.mjs` outside the repo and run, for
   each download:
   `node render-pdf.mjs <repo> <fontDir> post-arthroplasty-loading-guide out/guide.pdf letter`
   (and `a4` to check A4).
4. Copy the Letter PDF to `site/downloads/files/<slug>.pdf`.

Colours: the script copies the `:root` token block from `site/assets/mm.css`
and uses only `var(--token)` values. Body text is 12.5pt. The page ground is
the paper (no full-page fill, so printing does not waste ink); boxes use
`--white`, `--tier-5-muted`, `--teal-muted` and `--gold-muted`.

### Paper size

One PDF cannot be both sizes. The shipped files are US Letter. The same source
was also rendered at A4: both give 5 pages, the same page breaks and no
clipped or overflowing element, so the Letter file prints on A4 with "fit to
page" and nothing is lost. If Randy wants a separate A4 file, render with `a4`.

### Checks run (2026-11-02)

- Letter and A4 renders: 5 pages each, no overflowing elements, every page
  inspected as an image.
- Disclaimer is the last block of each PDF.
- No hex value, emoji, discontinued-platform name or gate wording in the
  sources, the entries or the PDF text.
- `node scripts/build-downloads.mjs`: passes; one warning (guide has no
  `kit_form_id`). `npm run build` stops earlier, in the blog build, because
  the existing blog post's PMIDs are not cached and PubMed is blocked from the
  session; nothing to do with these downloads.
- Generated pages checked at 390px: no horizontal scroll, body text 16px or
  more, buttons and inputs 48px tall.

## render-pdf.mjs

```js
// render-pdf.mjs: docs/load-course/downloads/<name>.source.md -> PDF
// Usage: node render-pdf.mjs <repo> <fontDir> <name> <out.pdf> [letter|a4]
//   fontDir holds the @fontsource woff2 files (outfit 400/600,
//   cormorant-garamond 600/700). Colours come only from site/assets/mm.css.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [repo, fontDir, name, out, size = 'letter'] = process.argv.slice(2);
const { marked } = await import(pathToFileURL(path.join(repo, 'node_modules', 'marked', 'lib', 'marked.esm.js')).href);

const src = fs.readFileSync(path.join(repo, 'docs/load-course/downloads', name + '.source.md'), 'utf8');
const mmcss = fs.readFileSync(path.join(repo, 'site/assets/mm.css'), 'utf8');
const tokens = mmcss.match(/:root\{[\s\S]*?\n\}/)[0];
const font = f => 'file://' + path.join(fontDir, f);

const css = `
${tokens}
@font-face{font-family:'Outfit';font-weight:400;src:url('${font('outfit-latin-400-normal.woff2')}') format('woff2')}
@font-face{font-family:'Outfit';font-weight:600;src:url('${font('outfit-latin-600-normal.woff2')}') format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-weight:600;src:url('${font('cormorant-garamond-latin-600-normal.woff2')}') format('woff2')}
@font-face{font-family:'Cormorant Garamond';font-weight:700;src:url('${font('cormorant-garamond-latin-700-normal.woff2')}') format('woff2')}
@page{size:${size === 'a4' ? 'A4' : 'Letter'};margin:0.6in 0.65in}
*{box-sizing:border-box}
html,body{margin:0;background:transparent;color:var(--ink-soft);font-family:'Outfit',sans-serif;font-size:12.5pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1,h2,h3{font-family:'Cormorant Garamond',serif;color:var(--ink);font-weight:700;margin:0;line-height:1.15}
h1{font-size:30pt;margin:4pt 0 8pt}
h2{font-size:19pt;margin:0 0 8pt}
h3{font-size:15pt;margin:12pt 0 6pt}
p{margin:0 0 8pt}
ul,ol{margin:0 0 8pt;padding-left:18pt}
li{margin:0 0 4pt}
strong{color:var(--ink);font-weight:600}
.eyebrow{font-size:10pt;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--teal-dark);margin:0}
.lede{font-size:14pt;color:var(--ink-soft)}
.doc-head{border-bottom:2pt solid var(--gold);padding-bottom:10pt;margin-bottom:14pt}
section{margin:0 0 14pt}
.box{background:var(--white);border:1pt solid var(--border);border-radius:8pt;padding:12pt 14pt 6pt;break-inside:avoid}
.box-caveat{border-left:5pt solid var(--teal)}
.box-flag{border-left:5pt solid var(--tier-5);background:var(--tier-5-muted)}
.box-guide{border-left:5pt solid var(--gold)}
.box-adjust{border-left:5pt solid var(--teal)}
.box-disclaimer{border:1.5pt solid var(--ink-soft);margin-top:16pt}
.page-break{break-after:page}
h2,h3,caption{break-after:avoid}
table,.results,.keep,.scale,.lines{break-inside:avoid}
li{break-inside:avoid}
.grade{display:inline-block;font-size:9pt;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:1pt 6pt;border-radius:99pt;vertical-align:1pt;white-space:nowrap}
.grade-established{background:var(--teal-muted);color:var(--teal-dark)}
.grade-promising{background:var(--gold-muted);color:var(--gold-dark)}
.grade-unproven-bridge{background:var(--purple-muted);color:var(--purple-dark)}
.ref{font-size:11pt;color:var(--ink-muted);white-space:nowrap}
table{width:100%;border-collapse:collapse;background:var(--white);margin:4pt 0 8pt}
caption{text-align:left;font-weight:600;color:var(--ink);padding-bottom:6pt}
th,td{border:1pt solid var(--border);padding:7pt 8pt;text-align:left;vertical-align:top}
th{background:var(--teal-muted);color:var(--ink);font-weight:600}
.note{font-size:12pt;color:var(--ink-muted)}
.scale{display:flex;margin:6pt 0 12pt;border:1pt solid var(--border);border-radius:6pt;overflow:hidden;background:var(--white)}
.scale span{flex:1;text-align:center;padding:5pt 0;font-weight:600;color:var(--ink);border-right:1pt solid var(--border)}
.scale span:last-child{border-right:0}
.scale span.mid{background:var(--gold-muted)}
.lines{margin-top:10pt}
.lines-label{font-weight:600;color:var(--ink)}
.lines span{display:block;height:28pt;border-bottom:1pt solid var(--ink-faint)}
.logtable th{font-size:12pt}
.logtable td{height:46pt}
.logtable .c-date{width:16%}.logtable .c-act{width:42%}.logtable .c-ache{width:20%}.logtable .c-next{width:22%}
.logtable td.yn{vertical-align:middle;text-align:center;color:var(--ink-muted)}
.evidence li{margin-bottom:6pt}
.byline{margin-top:14pt;font-size:11pt;color:var(--ink-muted);text-align:center}
`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body>${marked.parse(src)}</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const htmlFile = path.resolve(out.replace(/\.pdf$/, '.html'));
  fs.writeFileSync(htmlFile, html);
  await page.goto(pathToFileURL(htmlFile).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const fams = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight));
  console.log('fonts loaded:', fams.join(', '));
  // Clipping check at the printable width.
  await page.emulateMedia({ media: 'print' });
  const overflow = await page.evaluate(() => [...document.querySelectorAll('body *')]
    .filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible')
    .map(e => e.tagName + '.' + e.className));
  console.log('overflowing elements:', overflow.length ? overflow.join(', ') : 'none');
  await page.pdf({ path: out, format: size === 'a4' ? 'A4' : 'Letter', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('wrote', out);
})();
```
