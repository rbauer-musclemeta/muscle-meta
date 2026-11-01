# Course nurture 1: what rest does and does not do (lesson 1)

| Field | Value |
|---|---|
| Sequence | Course nurture, 3 emails, for subscribers who have not bought the course |
| Position | 1 of 3 |
| Send | Day 14 (4 days after welcome 4) |
| Entry | Tag `course-nurture`; exit on course purchase. Purchase status must come from the site, never from a health answer, and is not written into a Kit field. |
| Subject | What rest does for a sore joint, and what it does not |
| Preview text | A few easy days can help. Weeks of stillness take something away. |
| Call to action | Link: "See what lesson 1 covers" to `https://muscle-meta.com/courses/load-course/` |
| Claims | C03, C09 |
| Placeholders | `[CLAIM-C03]`, `[CLAIM-C09]`, `[A2-disclaimer]`, `[KIT-FOOTER-UNSUBSCRIBE]`, `[KIT-FOOTER-ADDRESS]` |
| Status | Draft copy. Not in Kit. |

## Body

Hello,

When a joint hurts, resting it feels like the responsible thing to do. Sometimes it is. A few easier days during a flare can settle things down, and a joint that is hot, swollen or locking needs a clinician's eye before anything else.

The trouble starts when a few days become a few months.

Cartilage gets its nourishment from joint fluid that movement pushes in and out. Take away the movement for long enough and you take away that supply. [CLAIM-C03] The muscles around the joint lose strength too, and those muscles help absorb the load each step puts through a knee or hip. [CLAIM-C09]

So the useful question is how much rest, and for how long, rather than rest or no rest.

Lesson 1 of Load as Medicine works through that question. It explains the sponge idea in more detail, then walks you through a five-minute daily routine for getting a stiff joint moving again.

[See what lesson 1 covers](https://muscle-meta.com/courses/load-course/)

Randy

## Footer

[A2-disclaimer]

[KIT-FOOTER-UNSUBSCRIBE]

[KIT-FOOTER-ADDRESS]

## Humanizer run

- Run: 2026-11-01, `anthropic-skills:mm-humanizer-voice`, prose only.
- Removed: "the latest research shows" (borrowed authority); "effectively starved" and "catabolic state within days" from the source (time-window certainty, not yet graded); a closer ("Motion is lotion.").
- Kept: the rest carve-out (flare days, hot or swollen or locking joint), so the email does not tell anyone to move through a red flag.
- Check: no number or study added. No pressure language, countdown or discount. No em dashes.
- For mm-research-validator: C03, C09 (A1 pending). If C09 grades Unproven-Bridge, change to "the muscles around the joint lose strength too" and drop the shock-absorber clause.
- Note: the red-flag examples here should be checked against A2's `red-flag-screen.md` once it merges.
