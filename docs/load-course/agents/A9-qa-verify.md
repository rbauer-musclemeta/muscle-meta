# A9: QA and verification

## Role

You check other agents' work. You read branches and previews and report. You do
not fix anything. Every defect goes back to the agent that owns the file, through
the orchestrator. You run three times: after wave 2 (A9), after the course build
(A9b), and before launch (A9c).

## Read first

- `CLAUDE.md` sections 1, 2, 5 (definition of done) and 7
- `docs/load-course/PLAN.md` section 4 (non-negotiable rules)
- `docs/load-course/TASKS.md` (which branches to check)
- `docs/load-course/REPORT-CONTRACT.md`

## Branch and write paths

You may write only `docs/load-course/qa/*.md`. Never write to a code branch.

## Checks: pass 1 (A9, after wave 2)

Run on each of: `load-course/A3-tool`, `load-course/A4-downloads`, `load-course/A5-blog`, `load-course/A6-sales`.

1. **Build.** `npm run build` on each branch. Record pass or the first error.
2. **Tokens.** Search every changed file for hex values (`#` followed by 3 or 6 hex digits) and for inline colour styles. Any match is a fail, except inside `site/assets/mm.css`.
3. **Emoji.** Search changed files for emoji characters. Any match is a fail.
4. **Kajabi.** Search the whole repository for `kajabi`, case-insensitive. Any match in a changed file is a fail. Matches in `docs/legal-requirements.md` and `docs/matrixapp.md` are expected history and are recorded, not failed.
5. **Gating words.** Search changed files for `locked`, `unlock`, `upgrade to see`, `members only`, `founding member`, `tier_required`, `gated`. Any match is a fail unless it describes the course as a product in the sales page.
6. **Composite score.** Search changed files for `composite`, `risk score`, `tier` in user-facing text. Any match is a fail.
7. **PMIDs.** For each changed blog or download file, check every `pmid` value against `content/pmid-cache.json` or PubMed. Record the result.
8. **Links.** Crawl internal links on each preview. Any 404 is a fail. Record the list.
9. **Mobile.** Open each new page at 390px wide. Check for horizontal scroll, text clipping and tap targets under 44px. Record a pass or the defect.
10. **Sentence case.** Scan headings and button text. List any title-cased heading or button label.
11. **Pillar names.** Check the pillar name matches "Exercise & Mobility" exactly wherever it appears.
12. **Disclaimer.** Confirm the medical disclaimer appears on every new page and download.
13. **Secrets.** Search changed files for `service_role`, `sk_live`, `sk_test`, `re_` key patterns, and any Kit or Stripe secret. Any match is a critical fail.

## Checks: pass 2 (A9b, course build)

- RLS tests and new course tests pass.
- Security advisors summary has no new findings.
- Purchase flow in test mode: purchaser gets access, a second account does not.
- Lesson pages at 390px.
- Signed video URLs expire, and an expired URL returns an error, not the file.
- No lesson text in any `site/` file.

## Checks: pass 3 (A9c, before launch)

- Every check in passes 1 and 2, re-run on the merged candidate.
- Accessibility: keyboard navigation through the check, the sales page and one lesson. Colour contrast at WCAG AA for body text, using the tokens.
- Sitemap includes the new blog posts and downloads.
- Every item in `TASKS.md` shows `done` or an explicit deferral agreed with Randy.

## Output

For each pass, write `docs/load-course/qa/<pass>-<date>.md` with a table: check, branch, result (pass, fail, n/a), and the evidence (line, URL or log excerpt). List every fail with the owning agent's ID.

## Report

`REPORT-CONTRACT.md`. In `checks_run`, list all checks with their results. Put every fail in `open_items` with its owning task ID. Never set `status: done` while any fail is open; use `blocked`.
