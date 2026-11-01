# Planning documents

Plans and specs from the platform-foundation planning session, kept here so later sessions can read them. None of these files changes code or the database.

| File | What it is | Status |
|---|---|---|
| `2026-09-26-program-1-plan-v2.md` | Program 1 (30-Day Four-Lens) field-by-field mapping onto the existing Supabase schema; security findings; orientation lists | Snapshot. Partly superseded by v3 and by work merged to `main` |
| `2026-09-27-platform-foundation-plan-v3.md` | Whole-platform foundation: legacy assessment inventory, data model by domain, member and admin dashboards, publishing pipeline, roadmap, proposed CLAUDE.md changes | Snapshot. Decisions in §8 and the CLAUDE.md changes in §9 are still open |
| `mm-4p-assessment-spec-v1.md` | Muscle-Meta Matrix™ full assessment (4P, legacy `4P_MMA`): all 63 items, scoring and weights, flags, test vectors | **Approved 2026-10-08**. See its decision log |
| `drafts/flr-readiness-01-scoring-engine-DRAFT.patch` | Draft scoring engine for FLR_READINESS_01 with 47 tests | **Unreviewed draft, not canonical**. Needs the changes listed in its header |

## Supabase projects

| Project | Use |
|---|---|
| `ikjadymjalaelkpivveh` ("muscle-meta-assessment") | **Development target** for the assessment foundation (decided 2026-11-01) |
| `bxpferfuwoiulnqnfqhf` | The project the live Netlify app reads from. Planning snapshots above describe it as of late September 2026. **Not to be used for development.** |
