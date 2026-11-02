# A7: Email sequences

## Role

You write the email copy for the Kit sequences and, in the second half of the
project, set them up in Kit through the Kit connector. You write copy in wave 1.
You create nothing in Kit and send nothing until Randy approves the copy in
writing (gate G5).

## Read first

- `CLAUDE.md` sections 1, 4 (Kit notes in section 3), 7
- `docs/legal-requirements.md` (what Kit receives)
- The existing Kit forms and tags on the account (read only, via the connector)
- Skills: randy-brand-voice, mm-humanizer-voice, marketing:email-sequence (for structure)
- A2's safety wording and A1's claims register (merged versions only)

## Phase A: copy (wave 1)

Branch `load-course/A7-email`. You may write only `docs/load-course/emails/*.md`.

Write these sequences in Markdown, one file per email, with subject, preview text, body, and the single call to action.

1. **Guide delivery (download sequence, one email).** Delivers the Post-Arthroplasty Loading Guide. Links the PDF on the site. Includes the post-surgery caveat from A2.
2. **Welcome sequence, about 10 days, four emails.** Email 1: the guide and the belief reframe. Email 2: the 5 out of 10 rule. Email 3: why the first step is small. Email 4: the course, with the price, a link to the sales page, and no purchase button. Each email ends with the disclaimer line.
3. **Course nurture, three emails, for people who have not bought.** Each email follows one lesson topic. No pressure language. No countdown. No discount.
4. **Newsletter issue 1 draft.** A summary of the first blog post, the free check and the guide.

Rules for every email:

- Plain words, sentence case subject lines, no emoji, no exclamation marks in subject lines.
- Never ask for health details. Never reference what someone answered in the check.
- Unsubscribe line and the physical address line from the existing footer.
- Each email has one call to action.
- Run mm-humanizer-voice and record the run.

## Phase B: Kit setup (wave 5, only after G5 approval)

Only after Randy approves the copy in writing and gate G4 has passed:

- Create tags `dl-joint-guide`, `dl-joint-tracker`, `course-nurture`, `newsletter`, as named in `content/downloads/*.md`.
- Create the sequences from the approved copy, in draft state.
- Test with one internal test subscriber, and report the test.
- Do not switch any sequence to live. Randy does that.
- Do not send any broadcast.

## Data rules

- Kit receives the email address, the download tag and the form source. Nothing else.
- Never write health answers, pain ratings, risk-related answers or purchase details into a Kit field.
- Double opt-in must stay on for every form (D8).

## Done when (Phase A)

- Every email file exists with subject, preview text, body and call to action.
- The disclaimer line appears in every email.
- The humanizer run is recorded for each file.

## Report

`REPORT-CONTRACT.md`. Phase A: `status: done` when the copy exists. Phase B is a separate report. In `decisions_needed`, ask Randy to approve the copy and to confirm the number of emails in each sequence.
