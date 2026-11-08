# Load as Medicine: email copy (A7, phase A)

Copy only. Nothing here exists in Kit. Phase B (creating tags and draft
sequences in Kit) waits for gate G5 and Randy's written approval of this copy.

Refreshed 2026-11-08 with A1's register (`load-course/A1-evidence`,
`load-course/A1-glp1`) and A2's approved safety copy (`load-course/A2-safety`).
No `[CLAIM-...]` or `[A2-...]` placeholder remains. Each email lists its claims,
grades and sources in a "Claims used" table; reader copy carries no claim IDs.

## Files

Sequence lengths, send days, newsletter links, nurture subscribers getting the
newsletter, and the $37.00 one-time price were confirmed by Randy on 2026-11-08.

| File | Sequence | Position | Send | Entry condition (for phase B) |
|---|---|---|---|---|
| `guide-delivery.md` | Guide delivery | 1 of 1 | On sign-up | Incentive email of the guide's own Kit form (double opt-in) |
| `welcome-01-guide-and-reframe.md` | Welcome | 1 of 4 | Day 1 after confirming | Tag `dl-joint-guide` |
| `welcome-02-five-out-of-ten.md` | Welcome | 2 of 4 | Day 3 | same |
| `welcome-03-small-first-step.md` | Welcome | 3 of 4 | Day 6 | same |
| `welcome-04-the-course.md` | Welcome | 4 of 4 | Day 10, held until the course can be bought (M4) | same |
| `nurture-01-rest.md` | Course nurture | 1 of 3 | Day 14 | Tag `course-nurture`, no course purchase |
| `nurture-02-flares.md` | Course nurture | 2 of 3 | Day 18 | same |
| `nurture-03-choosing-an-exercise.md` | Course nurture | 3 of 3 | Day 22 | same |
| `newsletter-01.md` | Newsletter | issue 1 | Broadcast, Randy sends | Tag `newsletter` |
| `newsletter-glp1-joint-health.md` | Newsletter | GLP-1 intro | Broadcast, Randy sends, when the download is live | Tag `newsletter` |

## Links used

| What | URL |
|---|---|
| Guide file (incentive and welcome 1) | `https://muscle-meta.com/downloads/files/post-arthroplasty-loading-guide.pdf` |
| Guide page (newsletter) | `https://muscle-meta.com/downloads/post-arthroplasty-loading-guide/` |
| Tracker (open, no email) | `https://muscle-meta.com/downloads/acceptable-pain-tracker/` |
| Free check | `https://muscle-meta.com/tools/joint-load-check/` |
| Sales page | `https://muscle-meta.com/courses/load-course/` |
| Blog post 1 | `https://muscle-meta.com/blog/why-rest-is-the-wrong-prescription-for-a-sore-joint/` |
| GLP-1 download | `https://muscle-meta.com/downloads/joint-health-on-a-glp1/` |

## Placeholders left (phase B)

| Placeholder | Filled from | What goes there |
|---|---|---|
| `[KIT-FOOTER-UNSUBSCRIBE]` | Existing Kit email template | Unsubscribe line, unchanged |
| `[KIT-FOOTER-ADDRESS]` | Existing Kit email template | Physical address line, unchanged |

## Rules applied to every email

- Sentence case subject lines, no exclamation marks, no emoji, no hex.
- One call to action per email.
- No request for health details. No reference to anything a reader answered in the joint-load check.
- No purchase button, countdown, deadline or discount. The course email links to the sales page only.
- Kit receives the email address, the download tag and the form source. Nothing else.
- A2's email disclaimer line, then the unsubscribe line and the address line, at the end of every email.
- Claims in the register's safe wording, never stronger. C09, C19 and C20 are not used. Runner data as raw 3.5% and 10.2% only.
- The pain guideline is "the acceptable pain guideline", never a "safe" level (A2).
- Each file records its mm-humanizer-voice runs.

## Not used

`marketing:email-sequence` is not installed. Structure follows the A7 spec and the
"newsletter or email" mode in `source/references/modes-and-personas.md`.
