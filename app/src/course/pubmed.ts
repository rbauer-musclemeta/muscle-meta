import 'server-only';
import type { Reference } from './content';

/* Every PMID must resolve through PubMed before it ships (CLAUDE.md, evidence
   rules). Checks first-author surname and year against PubMed in one request,
   the same test scripts/build-blog.mjs applies to articles. */
export async function checkPubmed(refs: Reference[]): Promise<string[]> {
  if (!refs.length) return [];
  const ids = refs.map(r => r.pmid).join(',');
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=muscle-meta-app&id=${ids}`;
  let data: { result?: Record<string, { error?: string; sortfirstauthor?: string; authors?: { name: string }[]; pubdate?: string; title?: string }> };
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [`PubMed did not respond (HTTP ${res.status}). Nothing was imported; try again.`];
    data = await res.json();
  } catch {
    return ['PubMed could not be reached. Nothing was imported; try again.'];
  }
  const problems: string[] = [];
  for (const r of refs) {
    const hit = data.result?.[r.pmid];
    if (!hit || hit.error) { problems.push(`PMID ${r.pmid} does not resolve in PubMed`); continue; }
    const first = (hit.sortfirstauthor || hit.authors?.[0]?.name || '').split(' ')[0].toLowerCase();
    const cited = r.authors.split(/[ ,]/)[0].toLowerCase();
    const year = (hit.pubdate || '').slice(0, 4);
    if (first && fold(first) !== fold(cited)) problems.push(`PMID ${r.pmid}: PubMed first author is ${first}, the reference says ${cited}`);
    if (year && Number(year) !== Number(r.year)) problems.push(`PMID ${r.pmid}: PubMed year is ${year}, the reference says ${r.year}`);
  }
  return problems;
}

function fold(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
}
