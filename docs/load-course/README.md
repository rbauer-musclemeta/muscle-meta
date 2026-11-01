# Load as Medicine workstream: setup status

Files for the joint-health build, placed from Randy's upload list. Start with
`PLAN.md`, then `ORCHESTRATOR.md`. `CLAUDE.md` section 7 holds the workstream rules.

## Overrides recorded on 2026-11-01 (Randy)

- **Supabase, two projects.**
  - **`bxpferfuwoiulnqnfqhf`** (`https://bxpferfuwoiulnqnfqhf.supabase.co`) is **production**: muscle-meta.com and the MatrixApp site both run on it. This workstream does nothing to it until Randy approves a merge.
  - **`ikjadymjalaelkpivveh`** (`https://ikjadymjalaelkpivveh.supabase.co`) is the **development** project: anything database-related is built and tested here first. It reaches production only through a reviewed PR that Randy approves. This overrides item 3 of the upload list.
- **Who touches a database.** Only A8 (paid course, wave 4, after Stripe milestone M4), plus A9b QA reading it. Waves 1 to 3 (evidence, safety, free check, downloads, blog, sales page, email copy) use no database.
- **Keep Randy informed (his request).**
  - Before any action on `ikjadymjalaelkpivveh`, the orchestrator or agent tells Randy in chat, in one or two plain lines: what is about to happen, why, and whether it only reads or also changes something.
  - Afterwards it reports the result.
  - The orchestrator keeps a "Database use" log in `STATUS.md`: date, agent, action, read or write, result.
- **Orchestrator.** It runs in its own dedicated session on this branch.

## Placed

| Path | Source |
|---|---|
| `PLAN.md`, `ORCHESTRATOR.md`, `TASKS.md`, `REPORT-CONTRACT.md` | Upload items 4, 6, 7, 8 (unchanged) |
| `CLAUDE.md` section 7 | Upload item 5, appended |
| `agents/A1-evidence.md` … `agents/A9-qa-verify.md` | Upload item 9 (9 of 10; A10 legal still missing) |
| `source/Load as Medicine_ Rebuilding the Arthritic Joint.md` | Upload item 11 (unchanged) |
| `source/Load as Medicine_ A Clinical Framework for Joint Health and Osteoarthritis Management.md` | Upload item 12 (unchanged) |
| `source/MM-JointHealth-Assessment.html` | Upload item 13 (unchanged). **Reference only, never publish:** shows a composite risk percentage and tiers that A3 must remove. |
| `source/SKILL.md` | Upload item 14, randy-brand-voice (unchanged) |
| `source/references/*.md` (voice-core, modes-and-personas, cbt-informed-coaching, language-guardrails, source-basis) | randy-brand-voice reference files, unchanged. Placed beside `SKILL.md` so its `references/...` links resolve. `source-basis.md` cites the source workspace's local files (memory-os, Persona_Profiles, the manifesto); those links don't resolve in this repo, so treat them as a record of where the voice came from. |

## Still missing (do not start the orchestrator until these are in)

- **Agent prompt `agents/A10` (legal).** It is a wave 1 task, so A10 cannot be dispatched until it arrives. The other wave 1 tasks (A1, A2, A3, A7) can run.
- **A8 runs against Supabase `ikjadymjalaelkpivveh`.** Its "Supabase branch" means a branch of that project, never `bxpferfuwoiulnqnfqhf` (see Overrides).
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
