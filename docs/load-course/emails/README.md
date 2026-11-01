# Load as Medicine: email copy (A7, phase A)

Copy only. Nothing here exists in Kit. Phase B (creating tags and draft
sequences in Kit) waits for gate G5 and Randy's written approval of this copy.

## Files

| File | Sequence | Position | Send | Entry condition (for phase B) |
|---|---|---|---|---|
| `guide-delivery.md` | Guide delivery | 1 of 1 | On sign-up | Incentive email of the guide's own Kit form (double opt-in) |
| `welcome-01-guide-and-reframe.md` | Welcome | 1 of 4 | Day 1 after confirming | Tag `dl-joint-guide` |
| `welcome-02-five-out-of-ten.md` | Welcome | 2 of 4 | Day 3 | same |
| `welcome-03-small-first-step.md` | Welcome | 3 of 4 | Day 6 | same |
| `welcome-04-the-course.md` | Welcome | 4 of 4 | Day 10 | same |
| `nurture-01-rest.md` | Course nurture | 1 of 3 | Day 14 | Tag `course-nurture`, no course purchase |
| `nurture-02-flares.md` | Course nurture | 2 of 3 | Day 18 | same |
| `nurture-03-choosing-an-exercise.md` | Course nurture | 3 of 3 | Day 22 | same |
| `newsletter-01.md` | Newsletter | issue 1 | Broadcast, Randy sends | Tag `newsletter` |

Send days are proposals for Randy to confirm.

## Placeholders used

| Placeholder | Filled by | What goes there |
|---|---|---|
| `[CLAIM-Cnn]` | A1 (`evidence/claims-register.csv`) | The graded claim. Rewrite the sentence to the register's `safe_wording`, or delete it if the claim is not verified. |
| `[A2-post-surgery-caveat]` | A2 (`safety/post-surgery-caveat.md`) | Post-surgery caveat, verbatim. |
| `[A2-pain-rule-wording]` | A2 (`safety/pain-rule-wording.md`) | Exceptions to the 5 out of 10 rule, verbatim. |
| `[A2-disclaimer]` | A2 (`safety/disclaimer.md`) | Medical disclaimer line, verbatim. |
| `[KIT-FOOTER-UNSUBSCRIBE]` | Existing Kit email template | Unsubscribe line, unchanged. |
| `[KIT-FOOTER-ADDRESS]` | Existing Kit email template | Physical address line, unchanged. |
| `[TO-CONFIRM: price]` | Randy | Confirms $37.00 one-time before the email is used. |

## Rules applied to every email

- Sentence case subject lines, no exclamation marks, no emoji, no hex.
- One call to action per email.
- No request for health details. No reference to anything a reader answered in the joint-load check.
- No purchase button, countdown, deadline or discount. The course email links to the sales page only.
- Kit receives the email address, the download tag and the form source. Nothing else.
- Disclaimer line, then the unsubscribe line and the address line, at the end of every email.
- Each file records its mm-humanizer-voice run.

## Not used

`marketing:email-sequence` is not installed. Structure follows the A7 spec and the
"newsletter or email" mode in `source/references/modes-and-personas.md`.
