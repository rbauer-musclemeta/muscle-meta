# Welcome 4: the course

| Field | Value |
|---|---|
| Sequence | Welcome |
| Position | 4 of 4 |
| Send | Day 10. Hold this email until the sales page at `/courses/load-course/` is live and the course can be bought (milestone M4). |
| Entry | Tag `dl-joint-guide` |
| Subject | Load as Medicine, the short course |
| Preview text | Three short lessons on moving a sore knee or hip with more confidence. |
| Call to action | Link: "Read about the course" to `https://muscle-meta.com/courses/load-course/`. A text link to the sales page, not a purchase button. |
| Claims | C03, C07 |
| Placeholders | `[CLAIM-C03]`, `[CLAIM-C07]`, `[TO-CONFIRM: price]`, `[A2-disclaimer]`, `[KIT-FOOTER-UNSUBSCRIBE]`, `[KIT-FOOTER-ADDRESS]` |
| Status | Draft copy. Not in Kit. Price is assumed and must be confirmed. |

## Body

Hello,

Over the past ten days you've had the guide, the 5 out of 10 rule and the case for a small first step. Those ideas come from a short course I wrote, called Load as Medicine. It is an educational course, not treatment.

There are three lessons.

1. Why rest is the wrong prescription. How movement helps nourish cartilage, and how to get a stiff joint moving again. [CLAIM-C03]
2. The acceptable pain rule. How to read an ache, and what to do when a joint flares.
3. Finding your exercise. The options that have been studied for knee and hip arthritis, including cycling, water exercise, yoga and strength training, and how to choose one you will keep doing. [CLAIM-C07]

Each lesson has a video of about two minutes with me, a short interactive exercise, a tracker and a download.

The course is written for adults 50 and over living with knee or hip arthritis. That includes people working back after a knee replacement and people who want to keep playing their sport. It does not diagnose anything, and it does not replace care from your own clinician.

The price is $37, paid once. [TO-CONFIRM: price]

The course page has the full outline, who the course suits and who it does not, and the research behind each lesson.

[Read about the course](https://muscle-meta.com/courses/load-course/)

If now is not the right time, nothing changes. The guide and the tracker are yours to keep.

Randy

## Footer

[A2-disclaimer]

[KIT-FOOTER-UNSUBSCRIBE]

[KIT-FOOTER-ADDRESS]

## Humanizer run

- Run: 2026-11-01, `anthropic-skills:mm-humanizer-voice`, prose only.
- Removed: sales language from the source ("top-tier rehabilitation experts", "the secret to biological rebuilding"); bold labels on each lesson line; a stock send-off ("I can't wait to see you inside").
- Check: lesson names, video length and lesson parts come from PLAN.md and the source; price is the PLAN.md assumption, marked to confirm. No urgency, deadline, discount or button. No em dashes.
- For mm-research-validator: C03, C07 (A1 pending). Lesson 3 line says "options that have been studied", not "most effective".
- Note: lesson 1 keeps its source title; if A2's copy fixes rename it, use the new title here.
