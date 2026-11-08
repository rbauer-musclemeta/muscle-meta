# A3: Free joint-load check

## Role

You rebuild the existing joint assessment as a free, self-contained page at
`site/tools/joint-load-check/index.html`, following the pattern of
`site/tools/oxygen-engine/index.html`. You keep the questions and the design of
the source, and you remove the parts that break the repository's rules.

## Read first

- `CLAUDE.md` sections 1, 2, 3 and 7
- `docs/load-course/source/MM-JointHealth-Assessment.html` (the source)
- `site/tools/oxygen-engine/index.html` (the pattern to follow: header, footer, asset links, save behaviour, print view)
- `site/assets/mm.css` (the only source of colours, fonts and spacing)
- Skills: muscle-meta-design, muscle-meta-html-templates
- A2's `docs/load-course/safety/*.md` once merged. Until then, use placeholders marked `TODO-A2`.

## Branch and write paths

Branch `load-course/A3-tool`. You may write only `site/tools/joint-load-check/` (index.html and any file it needs in that folder).

## What to change from the source

1. **Remove the composite risk percentage** and its tier labels (MINIMAL to CRITICAL). Replace the results with: the red-flag outcome; a short reading of the belief and load answers in plain words; one next step. See A2's `scoring-direction.md`.
2. **Add the red-flag screen before step 1.** Use A2's `red-flag-screen.md`. Any "yes" stops the check and shows the clinician message with no further questions.
3. **Fix the name bug.** A blank name currently produces "Your's Joint Health Report". Use a neutral title when no name is given.
4. **Fix the duplicate score.** The two replacement options "Considering it" and "Completed, 6+ months ago" both score 1. Remove the scoring entirely (see point 1), so this stops mattering. Keep the replacement question as a plain question.
5. **Remove the local links.** Every link beginning `../Muscle Meta Research Assistant/` must be removed or pointed to a live URL from `docs/load-course/PLAN.md` section 1.
6. **Add a privacy notice** before the questions: what is asked, that answers stay in the browser on this device, and that nothing is sent to Kit or Stripe. Match the save behaviour and wording of the Oxygen Engine tool.
7. **Print view.** Keep the print-to-PDF view and make it show the safety outcome and the next step.
8. **Replace all hex values, font names and inline colours** with tokens from `site/assets/mm.css`. Fonts come from the same Google Fonts import the Oxygen Engine uses.
9. **Replace FontAwesome CDN icons** with inline SVG or tokens-only text unless the Oxygen Engine tool already uses that CDN. Match its approach.
10. **Add the medical disclaimer** at the foot of the page and in the results.

## Behaviour

- Works at 390px wide with no horizontal scroll.
- Every tappable element is at least 44px high.
- Body text is at least 16px.
- Every radio and checkbox has a visible label; the page works with a keyboard.
- No email field. The check does not require sign-in or email.
- No `localStorage` writes beyond what the Oxygen Engine tool already does. If you add any, document it in the privacy notice.

## Done when

- The page renders at 390px and at desktop width (give the preview URL).
- No composite percentage or tier label appears anywhere, including the print view.
- The red-flag screen blocks the rest of the check when a "yes" is given.
- No hex value, no emoji, no `Kajabi` string, no pillar or category gating words ("locked", "unlock", "upgrade").
- Headings and buttons are in sentence case.
- Link checker reports no broken internal links from the page.

## Report

`REPORT-CONTRACT.md`. In `checks_run`, list each item under "Done when" and the 390px check with the preview URL. In `open_items`, list any `TODO-A2` placeholders still in the page. In `decisions_needed`, note any question you could not resolve from the source.
