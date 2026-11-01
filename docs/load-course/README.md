# Load as Medicine workstream: setup status

Files for the joint-health build, placed from Randy's upload list. Start with
`PLAN.md`, then `ORCHESTRATOR.md`. `CLAUDE.md` section 7 holds the workstream rules.

## Overrides recorded on 2026-11-01 (Randy)

- **Supabase.** Use project `ikjadymjalaelkpivveh` only. Do not use `bxpferfuwoiulnqnfqhf`. This overrides item 3 of the upload list.
- **Orchestrator.** It runs in its own dedicated session on this branch.

## Placed

| Path | Source |
|---|---|
| `PLAN.md`, `ORCHESTRATOR.md`, `TASKS.md`, `REPORT-CONTRACT.md` | Upload items 4, 6, 7, 8 (unchanged) |
| `CLAUDE.md` section 7 | Upload item 5, appended |
| `agents/A3-assessment-tool.md` … `agents/A7-email.md` | Upload item 9 (5 of 10) |
| `source/Load as Medicine_ Rebuilding the Arthritic Joint.md` | Upload item 11 (unchanged) |
| `source/Load as Medicine_ A Clinical Framework for Joint Health and Osteoarthritis Management.md` | Upload item 12 (unchanged) |
| `source/MM-JointHealth-Assessment.html` | Upload item 13 (unchanged). **Reference only, never publish:** shows a composite risk percentage and tiers that A3 must remove. |
| `source/SKILL.md` | Upload item 14, randy-brand-voice (unchanged) |

## Still missing (do not start the orchestrator until these are in)

- **Agent prompts.** `agents/A1` (evidence), `A2` (safety), `A8` (course), `A9` (QA) and `A10` (legal). Wave 1 needs A1, A2 and A10.
- **randy-brand-voice reference files** that `source/SKILL.md` points to: `references/voice-core.md`, `modes-and-personas.md`, `cbt-informed-coaching.md`, `language-guardrails.md`, `source-basis.md`. Place them in `source/randy-brand-voice/references/`.
- **Skill `marketing:email-sequence`.** A7 names it, but it is not installed. A7 runs without it and reports that, unless it is installed.

## Notes for A1 and A2 from the setup read-through (sources are not edited)

- **No PMIDs in either source document.** The course cites author and year only: Gilbert 2021, Jiang 2021, Alentorn-Geli 2017, Bannuru 2019, Fransen 2015, Wei 2024, Mo 2023. All need PubMed verification.
- **Causal wording to recast as association (CLAUDE.md 7.4):**
  - "Movement is protective"
  - "movers have 60% less arthritis than sitters". Also, 3.5% vs 10.2% is about 66% lower, not 60%.
  - Framework FAQ "running is protective"
- **"unlocking the biological signals"** in the course overview uses a word on the 7.3 list. It isn't gating, but reword it.
- **Course Lesson 3 video script:** the `[0:15-0:45]` segment is missing and `[0:45-1:15]` appears twice.
- **Audience age:** the course says 45–75; PLAN.md says 50 and over.
