# Guide delivery

| Field | Value |
|---|---|
| Sequence | Guide delivery (download), 1 email |
| Send | Immediately on sign-up. This is the incentive email of the guide's own Kit form, so it also carries the double opt-in confirmation (D8). |
| Kit tag | `dl-joint-guide` (applied by the form) |
| Subject | Your post-surgery loading guide |
| Preview text | Confirm your email and the guide opens. One note to read first. |
| Call to action | Button: "Confirm and get the guide". In Kit, the incentive points to `https://muscle-meta.com/downloads/files/post-arthroplasty-loading-guide.pdf` |
| Claims | C08 |
| Placeholders | `[CLAIM-C08]`, `[A2-post-surgery-caveat]`, `[A2-disclaimer]`, `[KIT-FOOTER-UNSUBSCRIBE]`, `[KIT-FOOTER-ADDRESS]` |
| Status | Draft copy. Not in Kit. |

## Body

Hello,

Thanks for asking for the Post-Arthroplasty Loading Guide. Confirm your email address with the button below and the guide will open.

**[Confirm and get the guide]**

Before you start, one note matters more than anything inside the guide:

[A2-post-surgery-caveat]

After a joint replacement, the early goal is protection. The guide is about what comes next. It describes the kind of strength exercise that has been compared with standard rehab after knee replacement, what changed for people in those studies, and the questions to take to your surgeon or physical therapist. [CLAIM-C08]

Print it or keep it on your phone. It is written to bring to your next appointment.

Over the next ten days I'll send four short emails about using movement as medicine for a knee or hip. You can stop them any time with the link at the bottom of each one.

Randy Bauer, PT

## Footer

[A2-disclaimer]

[KIT-FOOTER-UNSUBSCRIBE]

[KIT-FOOTER-ADDRESS]

## Humanizer run

- Run: 2026-11-01, `anthropic-skills:mm-humanizer-voice`, prose only (table, placeholders and URL unchanged).
- Removed: a staged run-up before the button ("Here's what you need to know"); a one-line closer after the sign-off paragraph; the guide's three benefits rewritten from a bold-labelled list into one sentence.
- Check: no number, study name or date added. Safety caveat placeholder kept above the guide description. No em dashes.
- For mm-research-validator: C08 (A1 pending). The sentence about the guide's contents must match A1's safe wording for C08.
