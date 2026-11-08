# Guide delivery

| Field | Value |
|---|---|
| Sequence | Guide delivery (download), 1 email |
| Send | Immediately on sign-up. This is the incentive email of the guide's own Kit form, so it also carries the double opt-in confirmation (D8). |
| Kit tag | `dl-joint-guide` (applied by the form) |
| Subject | Your post-surgery loading guide |
| Preview text | Confirm your email and the guide opens. One note to read first. |
| Call to action | Button: "Confirm and get the guide". In Kit, the incentive points to the file `https://muscle-meta.com/downloads/files/post-arthroplasty-loading-guide.pdf` (A4). |
| Claims | C08 (Promising) |
| Safety copy | A2 `post-surgery-caveat.md` short version; A2 `disclaimer.md` email version |
| Placeholders left | `[KIT-FOOTER-UNSUBSCRIBE]`, `[KIT-FOOTER-ADDRESS]` (phase B) |
| Status | Draft copy, refreshed 2026-11-08 with A1 and A2 approved wording. Not in Kit. |

## Body

Hello,

Thanks for asking for the Post-Arthroplasty Loading Guide. Confirm your email address with the button below and the guide will open.

**[Confirm and get the guide]**

Before you start, one note matters more than anything inside the guide:

**After surgery, check with your team first.** Do these exercises only once your surgeon or physical therapist has given you the go-ahead for them, and follow their protocol if it differs from this guide. Get help now for calf pain or swelling, chest pain or sudden breathlessness. Contact your surgical team today for a red, hot or leaking wound, a fever, or a sudden increase in swelling or pain.

After a knee replacement, getting strength back in the leg is a big part of recovery. A review of 14 trials, covering 880 people after knee replacement, found that resistance exercise for the legs led to somewhat better walking speed, a slightly faster sit-stand-walk test (about 1 second), more leg strength and a little more knee bend (about 3 degrees) than standard exercise, measured right after the program. The overall quality of the evidence was low. The guide sets out those results and the questions to take to your surgeon or physical therapist.

Print it or keep it on your phone. It is written to bring to your next appointment.

Over the next ten days I'll send four short emails about using movement as medicine for a knee or hip. You can stop them any time with the link at the bottom of each one.

Randy Bauer, PT

## Footer

This email is educational. It is not medical advice, diagnosis or treatment. Talk with your clinician before changing your exercise plan, especially after surgery. Full disclaimer: muscle-meta.com/legal/medical-disclaimer/

[KIT-FOOTER-UNSUBSCRIBE]

[KIT-FOOTER-ADDRESS]

## Claims used

| ID | Grade | Source | Where |
|---|---|---|---|
| C08 | Promising | Wei 2024 | Knee replacement paragraph, from the register's safe wording and A2 `copy-fixes.md` F24 |

## Humanizer runs

- 2026-11-01, `anthropic-skills:mm-humanizer-voice`, prose only. Removed a staged run-up before the button, a one-line closer, and a bold-labelled benefits list.
- 2026-11-08, `anthropic-skills:mm-humanizer-voice`, prose only, after the evidence refresh. Removed "the early goal is protection" (A2: protection is not the opposite of exercise); kept the C08 sentence close to the register wording rather than smoothing it, so it says no more than the evidence. A2 caveat pasted verbatim, not edited. No new number, study or date beyond the register. No em dashes.
