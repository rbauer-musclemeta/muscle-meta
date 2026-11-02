# A2: Safety and clinical copy

## Role

You write the safety and clinical wording that every other task uses: the
red-flag screen, the pain-rule wording, the post-surgery caveat, the inflammatory
arthritis note, the medical disclaimer and the scoring-direction rule. You
produce wording only. Other agents paste it in.

## Read first

- `CLAUDE.md` sections 1, 2 and 7
- `docs/load-course/PLAN.md`
- Source: `Load as Medicine_ Rebuilding the Arthritic Joint.md` (Lessons 1 to 3, the Short Steps, Downloadable Assets 1 to 3)
- Source: `MM-JointHealth-Assessment.html` (the flags and the scoring engine)
- `docs/legal-requirements.md` and `site/legal/medical-disclaimer/index.html`
- Skill: randy-brand-voice (read `references/language-guardrails.md` and `references/cbt-informed-coaching.md`)
- `docs/load-course/evidence/claims-register.csv` from A1. Use only graded claims. If A1 has not merged, write your draft with placeholders `[CLAIM-Cnn]` and say so in the report.

## Branch and write paths

Branch `load-course/A2-safety`. You may write only `docs/load-course/safety/*.md`.

## Deliverables

1. `red-flag-screen.md`: the questions shown before the assessment begins. Any "yes" stops the check and shows a clinician message. Include at least: locking or giving way; a hot, swollen joint with fever; sudden loss of motion; calf pain or swelling after joint replacement; pain at rest or at night that does not ease; unexplained weight loss; a recent fall or injury with a deformity. Write each question in plain words for a reader aged 50 or over.
2. `pain-rule-wording.md`: the 5-out-of-10 and 24-hour rules, written as practical guidance, with the exceptions: follow your surgeon's or clinician's protocol; see a clinician for hot, swollen or locked joints; the rule does not replace advice from a clinician who knows your history.
3. `post-surgery-caveat.md`: the wording that sits above every post-surgery exercise.
4. `inflammatory-arthritis-note.md`: the note for people with rheumatoid or other inflammatory arthritis.
5. `disclaimer.md`: the medical disclaimer for every page and download. Keep the existing wording in `site/legal/medical-disclaimer/` unless it conflicts with these rules.
6. `scoring-direction.md`: a one-page note stating what the joint-load check shows instead of a composite percentage. The check gives three things: the red-flag outcome, a short reading of the belief and load answers, and the next step. It never gives a number that rises with risk.
7. `copy-fixes.md`: each sentence in the source that must change, with the replacement. Cover at least: "rest is starving the joint" (add the carve-out); "movers have 60% less arthritis" (replace with the graded figure from A1); "your joint is living tissue, not a rubber tire" (keep the idea, remove any claim the grade does not support); "Acceptable Pain Rule" (add that it is a practical guideline); the AMPK sentence in Lesson 1 (rewrite to the graded wording).

## Rules for your wording

- No diagnosis. Use "this can point to", "it is worth checking", "a clinician can tell you".
- No promise of outcome. Use "some people find", "in the studies we looked at".
- Associations stay associations.
- Sentence case. No emoji. No hex. No Kajabi.
- Plain words. A technical term is explained the first time it appears.
- Never refer to scoring with a percentage that rises with risk.

## Done when

- Each deliverable exists and is complete.
- Every clinical claim in your wording has a grade from the register, or is marked `[CLAIM-Cnn]` with its ID.
- `copy-fixes.md` covers every item listed above.
- You have checked the wording against randy-brand-voice's language guardrails.

## Report

`REPORT-CONTRACT.md`. In `checks_run`, list: guardrail check against randy-brand-voice; no hex or emoji in your files; every claim ID resolves in the register or is a placeholder. In `decisions_needed`, list each red-flag question that the clinical reviewer must approve before launch.

Only a clinical reviewer named by Randy can approve this wording. Say so in the report.
