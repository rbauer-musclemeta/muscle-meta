# The Muscle-Metabolic Health Matrix (course)

Paid, self-directed course at `muscle-meta.com/app/metabolic-health/`, with an
optional Personal Session. Members arrive from the free Readiness Check, which
sets their track (Foundation, Builder or Performer) and safety level.

| | |
| --- | --- |
| Registry entry | `route: metabolic-health`, `dbSlug` / `courseSlug: metabolic-health-matrix`, `kind: course` |
| Access | `course:metabolic-health` (add-on `coaching:metabolic-health-1to1`) |
| Products | `metabolic-health-course`, `metabolic-health-personal-session` (draft; no prices yet) |
| Modules | `start` (Start here), `module-1` … `module-4` |
| Lessons | 13: Start here plus 3 per module. Text and 57 graded PubMed references live in `lessons.content` |
| Worksheets | 13 PDFs in `program-assets/metabolic-health-matrix/worksheets/`, one per lesson |

## Apply order

1. **Migration.** Apply `supabase/migrations/20261116120000_course_metabolic_health_matrix.sql`.
   Its preflight stops with a clear message if `lessons` has a NOT NULL column it
   does not know about; nothing is changed in that case.
2. **Access test.** Run `supabase/tests/rls_course_metabolic_health.sql` in the SQL
   editor. It must print `RLS_TESTS_PASSED`. It checks that anonymous visitors and
   members without `course:metabolic-health` read no lessons, that entitled members
   read them, and that `lesson_progress` rows are private to their owner.
3. **Import the lessons.** Sign in as staff, open `/app/admin/course-content`,
   choose `metabolic-health-matrix.content.json` and press *Check and import*.
   Nothing is written unless every check passes: canonical category keys, a grade
   on every evidence claim and reference, every cited PMID listed, no gate wording,
   no emoji, no literal hex colour, and every PMID resolving in PubMed with the
   right first author and year. Importing again updates lessons in place; member
   progress is kept.
4. **Upload the worksheets.** On the same screen, select all 13 PDFs at once.
   Each is matched to its lesson by file name (`content.worksheet.file_name`).
   Members download them through links that expire after ten minutes.
5. **Test as a member.** Give a test account access from its admin member page,
   then open `/app/metabolic-health/`.

## Changing content

Edit the source, rebuild the bundle, bump `version`, and import again. The bundle
and PDFs are kept outside this public repository.

## Not yet in place

- Readiness Check scoring in a versioned engine module with fixtures. Until it
  ships, a member's track is the one they choose in a lesson; the plan opens on
  Foundation.
- Prices and checkout (M4).
