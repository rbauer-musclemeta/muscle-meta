# A8: Paid course inside MatrixApp

## Role

You build the paid three-lesson course at `/app/load-course/`. You start only
after milestone M4 (Stripe checkout and the entitlement webhook) is merged and
gate G4's prerequisites are met. Until then you do nothing; the orchestrator
reports you as `waiting on M4`.

## Read first

- `CLAUDE.md` sections 1, 2 (paid content cannot be a file), 4 (Supabase), 5b and 7
- `docs/matrixapp.md` (the program template and "Selling (M4, Stripe)")
- `app/src/programs/registry.ts` (add the new entry; the `course` kind is planned, not yet built)
- `supabase/migrations/` (follow the naming and style of existing migrations)
- `supabase/tests/rls_program1.sql` (follow its pattern for the new tests)
- `docs/program-1/00-PROGRAM-1-HANDOFF.md`
- Skill: muscle-meta-saas-development, mm-course-pipeline
- The three lesson scripts in `docs/load-course/source/`

## Preconditions (check first, stop if any fail)

1. M4 is merged on `main`: a Stripe webhook edge function exists and writes `entitlements`.
2. Randy has provided Stripe test-mode keys through Supabase secrets. You never see or write the keys.
3. Randy has provided the three lesson video files, or confirmed the lessons launch with placeholders.
4. The legal pages (privacy, terms with refund policy, medical disclaimer) are merged on `main`.

If any precondition fails, write a report with `status: blocked` and name the one that failed.

## Branch and write paths

Branch `load-course/A8-course`. You may write only:

- `supabase/migrations/<timestamp>_load_course.sql` (one new migration)
- `supabase/tests/load_course_rls.sql`
- `app/src/programs/registry.ts` (add one entry)
- `app/src/programs/load-course/**` (the course kind's screens and any new code)
- `app/tests/load-course.test.ts`

## What to build

1. **Database rows** in one migration: the `programs` row for the course, a `products` row at $37.00 one-time (price as a Stripe price ID placeholder), `course` and `modules` rows for three lessons, and `lessons` rows with `body_md` for each lesson's text. Lesson text is stored only here.
2. **Row-level security.** A member can read a lesson only when an active entitlement exists for the course. Anonymous users read nothing from `lessons`. Staff read through the existing staff check. Write the tests in `load_course_rls.sql` and run them.
3. **Registry entry** in `app/src/programs/registry.ts`, with `kind: 'course'`, `route: 'load-course'`, `access: 'program:load-course'` and `salesPath: '/courses/load-course/'`. Add the `course` kind only if the new screens need it; keep the change small.
4. **Lesson screens** in `/app/load-course/`: one page per lesson, scroll-driven, with the video from a signed URL, the interactive, the tracker and the download. Lesson text is fetched at runtime under RLS.
5. **Video.** The bucket is private. Generate signed URLs at request time with a short expiry. No video file is committed to the repository.
6. **Downloads for members.** Signed URLs from the private bucket, as the matrixapp.md "Digital product" row describes.
7. **Medical disclaimer** on every lesson screen.

## Hard rules

- No lesson text, video, or tracker template in the repository's public `site/` folder.
- No health answers written to any table outside the course's own progress rows, and never to Stripe.
- The service role key never appears in any file you write. Use the existing server-side pattern only.
- Run the RLS tests and the Supabase security advisors. Both must pass before you report `done`.
- No pillar or category gating. The entitlement attaches to the course product only.

## Done when

- The migration applies cleanly on a Supabase branch.
- `supabase/tests/rls_program1.sql` still ends `RLS_TESTS_PASSED`, and `load_course_rls.sql` passes.
- Security advisors show nothing new (list the output summary).
- A Stripe test-mode purchase unlocks the course for the test account and does not unlock it for a second account (report the test steps and results).
- The app builds and its unit tests pass (`app/tests`).
- Lesson pages render at 390px.

## Report

`REPORT-CONTRACT.md`. Put the preconditions first in `checks_run` with their result. In `decisions_needed`, list anything Randy must provide for production (live Stripe keys, final price ID, final video files).
