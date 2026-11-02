# Red-flag screen

Shown before the first question of the joint-load check. Any "yes" or "not
sure" stops the check: no further questions, no reading of answers, no next
step other than the clinician message. Approved by the clinical reviewer on
2026-11-02; see "Approval" at the end.

These are safety screens, not research claims, so they carry no claim ID. Their
wording and their urgency levels are approved by the clinical reviewer, not by
the claims register.

## Notes for A3 (build)

- Show all questions on one screen, each with "Yes", "No" and "Not sure".
- "Not sure" counts as "yes" and shows the same message.
- The check cannot continue until every question has an answer.
- If more than one answer stops the check, show the most urgent message only:
  "Get help now" beats "Contact a clinician today", which beats "Book an
  appointment".
- Do not store, send or log the answers. Not to Kit, not to analytics, not to
  any form (CLAUDE.md 7.3). If an analytics event fires, it may say only that
  the screen stopped the check, never which question.
- Each message ends with the medical disclaimer (page version, from
  `disclaimer.md`).
- Buttons on the stop screen, in this order: "Go back and change an answer",
  "Start over", "Read the medical disclaimer". No "continue anyway" button.
  "Go back and change an answer" returns to the red-flag questions with the
  previous answers still selected; it never skips the screen.

## Screen copy

### Heading

Before we start: a quick safety check

### Intro

A few signs point to a problem that needs a clinician to look at it first, not
an exercise plan. Please answer each question about the knee or hip you are
checking. If you answer yes or not sure to any of them, we will stop here and
tell you who to see.

### Questions

Each is a yes / no / not sure question. The ID is for the build only and is
never shown.

| ID | Question shown to the reader | Message level |
|---|---|---|
| RF1 | Is your knee or hip giving way under you, or catching and getting stuck so you can't fully bend or straighten it, and is this new or getting worse? | Book an appointment |
| RF2 | Is the joint hot, red or swollen, and do you also have a fever or feel unwell, as if you are coming down with the flu? | Contact a clinician today |
| RF3 | In the last few days, have you suddenly lost the ability to bend or straighten the joint as far as you usually can? | Book an appointment |
| RF4 | Have you had a knee or hip replaced, and do you now have pain, swelling, warmth or tenderness in your calf or the back of your thigh? | Get help now |
| RF5 | Most nights for two weeks or more, has the joint hurt when you are resting or in bed, in a way that does not ease when you change position? | Book an appointment |
| RF6 | Have you lost about 10 pounds or more in the last few months without trying to? | Book an appointment |
| RF7 | Have you had a fall or injury to this joint recently, and does it now look out of shape, or can you not put weight on it? | Contact a clinician today |
| RF8 | Right now or in the last day, have you had chest pain, or suddenly become short of breath? | Get help now |
| RF9 | After surgery on this joint, is the wound red, hot, leaking, or opening up? | Contact a clinician today |
| RF10 | Have you noticed new numbness, tingling or weakness in your leg, or new trouble controlling your bladder or bowels? | Get help now |

## Clinician messages

Shown in place of the rest of the check. One message only, the most urgent
that applies.

### Get help now (RF4, RF8, RF10)

**Heading:** Please get medical help now

What you described can point to a problem that needs to be checked today,
before any exercise. After a joint replacement, pain or swelling in the calf can
be a sign of a blood clot. Chest pain, sudden breathlessness, or new trouble
with your bladder or bowels always needs urgent care.

Call 911 (or your local emergency number), or go to the nearest emergency
department. If your surgeon gave you an after-hours number, you can call it too,
but do not wait to hear back before getting help.

This check cannot tell what is causing it. Please do not exercise this joint
until a clinician has seen you.

### Contact a clinician today (RF2, RF7, RF9)

**Heading:** Please contact a clinician today

What you described is worth checking today, before any exercise. A hot,
swollen joint with a fever, a wound that looks infected, or a joint that is out
of shape or cannot take weight after a fall all need a clinician to examine
them.

Call your doctor, surgeon or physical therapist's office today, or go to urgent
care. If it gets worse, or you feel very unwell, call 911 (or your local
emergency number).

This check cannot tell what is causing it. Please hold off on the exercises
until a clinician has looked at the joint.

### Book an appointment (RF1, RF3, RF5, RF6)

**Heading:** A clinician should look at this first

What you described is worth checking with a clinician before you start a new
exercise plan. A joint that has started giving way or getting stuck, a sudden
loss of movement, pain at rest or at night that does not ease, or weight loss
you cannot explain can each have causes that an exercise plan does not
address. A clinician can tell you what is going on and whether loading the
joint is right for you now.

Please book an appointment with your doctor or a physical therapist in the next
few days. If anything gets suddenly worse, contact them sooner.

This is not a judgement that something is wrong. It means this check is not the
right starting point until a clinician has seen you. You are welcome to come
back once they have.

### Shared closing line (all three messages)

This check is educational. It does not diagnose, and it does not replace a
clinician who can examine you.

### Button copy

- **Go back and change an answer.** Helper line under the button: "Tapped the
  wrong answer? Go back and fix it. If your answers were right, please follow
  the advice above before you start any exercises."
- **Start over.** Helper line: "Clears every answer and starts the check from
  the beginning."
- **Read the medical disclaimer.** Links to `/legal/medical-disclaimer/`.

## Clear-screen line

Shown when every answer is "No". It sits above the first real question.

> Thank you. You did not report any of these signs, so let's carry on. If any
> of them appear later, stop the exercises and contact a clinician.

Note for A3: do not write "you are safe" or "you are cleared". The screen only
says that none of these signs was reported.

## Red-flag box (short form)

For A4 (the top of each download and the tracker), A8 (lessons) and anywhere a
compact version is needed. Keep the list in this order.

**Heading:** Stop and contact a clinician if

- your calf hurts or swells after a joint replacement, or you get chest pain,
  sudden breathlessness, or new trouble controlling your bladder or bowels
  (call 911 or your local emergency number);
- the joint is hot, red or swollen and you feel feverish or unwell;
- a surgical wound is red, hot, leaking or opening up;
- the joint looks out of shape or cannot take weight after a fall or injury;
- the joint starts giving way, or catching and getting stuck so you can't
  fully bend or straighten it, or this gets worse;
- you suddenly cannot bend or straighten it as far as usual;
- pain at rest or at night does not ease when you change position, most nights
  for two weeks or more;
- new numbness, tingling or weakness appears in your leg;
- you lose about 10 pounds or more without trying.

These signs are worth checking before you exercise. They are not a diagnosis.

## Approval

**Signed off 2026-11-02 by Randy (Randall) Bauer, PT, clinical reviewer
(decision D6).** Decisions recorded:

| Item | Decision |
|---|---|
| RF1 | Stops the check only when giving way or getting stuck is new or getting worse. Wording changed to match. |
| RF2, RF3, RF4, RF7 | Approved as written. |
| RF5 | "Most nights for two weeks or more" added. |
| RF6 | "About 10 pounds or more" added. |
| RF8, RF9, RF10 | Kept; moved from proposed into the main list. No switch needed. |
| "Not sure" | Counts as yes. |
| Wording for a joint that catches | "Gets stuck so you can't fully bend or straighten it" approved in place of the clinical term. |
| Stop screen buttons | "Go back and change an answer" and "Start over" added; copy above. |
| Emergency number | 911, with "or your local emergency number", approved as part of RF4 as written. |

Any later change to a question, a message level or the button copy needs the
clinical reviewer's sign-off again.
