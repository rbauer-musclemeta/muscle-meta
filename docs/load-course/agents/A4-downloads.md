# A4: Free downloads

## Role

You build the two free downloads: the Post-Arthroplasty Loading Guide and the
Acceptable Pain Loading Tracker. You write the download entries, the printable
files, and the frontmatter that the download build reads.

## Read first

- `CLAUDE.md` sections 1, 3 (downloads build), 5 and 7
- `docs/legal-requirements.md`
- `content/downloads/oxygen-engine-12-week-plan.md` (the pattern to follow)
- `scripts/build-downloads.mjs` (what the build requires, in its own words)
- Source: `Load as Medicine_ Rebuilding the Arthritic Joint.md`, Downloadable Assets 1 and 2
- A1's `claims-register.csv` and A2's `safety/*.md` (both must be merged first)
- Skill: muscle-meta-design

## Branch and write paths

Branch `load-course/A4-downloads`. You may write only:

- `content/downloads/post-arthroplasty-loading-guide.md`
- `content/downloads/acceptable-pain-tracker.md`
- `site/downloads/files/post-arthroplasty-loading-guide.pdf`
- `site/downloads/files/acceptable-pain-tracker.pdf`
- `docs/load-course/downloads/*.md` (build notes only)

## Frontmatter rules

Follow the Oxygen Engine file exactly for keys. Specifically:

- `pillar: exercise-mobility`
- `categories: [P1-C1]` for both. The guide may also carry `P1-C4` (Strength) only if its content cites strength evidence graded in A1.
- `access: email` for the guide. `access: open` for the tracker unless Randy chooses email at Gate G0.
- `kit_form_id`: **leave as the placeholder `TODO-KIT-FORM-ID`**. Randy creates each form in Kit and fills the ID in. Never invent an ID.
- `kit_tag`: `dl-joint-guide` and `dl-joint-tracker`.
- `sources`: every citation used in the body, with a verified PMID from A1.
- `file:` points to the PDF path above.

## Content rules

- The guide follows Downloadable Asset 1 in the source, with the post-surgery caveat from A2 at the top and the red-flag box.
- The tracker follows Downloadable Asset 2 in the source: the daily log with date, activity, pain rating from 0 to 10, and a 24-hour settle check. Include the red-flag box and the two adjustment rules from the source.
- Plain words. Adults 50 and over. Large print in the PDF (at least 12pt body).
- No composite score. No pillar or category gating.
- Medical disclaimer on the last page of each PDF.

## PDF build

- Produce each PDF from a Markdown or HTML source you keep in `docs/load-course/downloads/`. Print to PDF with A4 and US Letter both checked.
- Use tokens from `site/assets/mm.css` for any colour in the PDF. Fonts Cormorant Garamond and Outfit only.
- Check every page renders with no clipped text.

## Done when

- `npm run build` completes without warnings about these two downloads, except the expected `kit_form_id` placeholder warning (list it in the report).
- Both PDFs open and print, with the disclaimer on the last page.
- Both entries appear on the downloads index in the preview.
- No hex value, no emoji, no `Kajabi`.

## Report

`REPORT-CONTRACT.md`. In `open_items`, list: `TODO-KIT-FORM-ID` (both entries), and any claim IDs still missing grades. In `decisions_needed`, state the access setting you used for the tracker and ask Randy to confirm it.
