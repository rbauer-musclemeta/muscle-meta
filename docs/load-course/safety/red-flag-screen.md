# Red-flag screen

Shown before the first question of the joint-load check. Any "yes" stops the
check: no further questions, no reading of answers, no next step other than the
clinician message. Draft for clinical review; see "Approval" at the end.

These are safety screens, not research claims, so they carry no claim ID. Their
wording and their urgency levels are approved by the clinical reviewer, not by
the claims register.

## Notes for A3 (build)

- Show all questions on one screen, each with "Yes", "No" and "Not sure".
- "Not sure" counts as "yes". The message for "Not sure" is the same as for
  "yes" (reviewer to confirm; see "Approval").
- The check cannot continue until every question has an answer.
- If more than one answer is "yes", show the most urgent message only: "Get
  help now" beats "Contact a clinician today", which beats "Book an
  appointment".
- Do not store, send or log the answers. Not to Kit, not to analytics, not to
  any form (CLAUDE.md 7.3). If an analytics event fires, it may say only that
  the screen stopped the check, never which question.
- Each message ends with the medical disclaimer (page version, from
  `disclaimer.md`).
- Buttons on the stop screen: "Read the medical disclaimer" and "Back to
  muscle-meta.com". No "continue anyway" button.

## Screen copy

### Heading

Before we start: a quick safety check

### Intro

A few signs point to a problem that needs a clinician to look at it first, not
an exercise plan. Please answer each question about the knee or hip you are
checking. If you answer yes to any of them, we will stop here and tell you who
to see.

### Questions

Each is a yes / no / not sure question. The ID is for the build only and is
never shown.

| ID | Question shown to the reader | Message level |
|---|---|---|
| RF1 | Has your knee or hip started to give way under you, or to catch and get stuck so you cannot fully bend or straighten it? | Book an appointment |
| RF2 | Is the joint hot, red or swollen, and do you also have a fever or feel unwell, as if you are coming down with the flu? | Contact a clinician today |
| RF3 | In the last few days, have you suddenly lost the ability to bend or straighten the joint as far as you usually can? | Book an appointment |
| RF4 | Have you had a knee or hip replaced, and do you now have pain, swelling, warmth or tenderness in your calf or the back of your thigh? | Get help now |
| RF5 | Does the joint hurt when you are resting or in bed at night, in a way that does not ease when you change position? | Book an appointment |
| RF6 | Have you lost weight in the last few months without trying to? | Book an appointment |
| RF7 | Have you had a fall or injury to this joint recently, and does it now look out of shape, or can you not put weight on it? | Contact a clinician today |

### Proposed additions (reviewer to accept or remove)

These were not in the brief. They are standard stop signs for adults with knee
or hip pain, especially after surgery. A3 should build them in but behind a
single switch, so they can be removed without a code change if the reviewer
says no.

| ID | Question shown to the reader | Message level |
|---|---|---|
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
be a sign of a blood clot, and chest pain or sudden breathlessness always needs
urgent care.

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
exercise plan. A joint that gives way or gets stuck, a sudden loss of movement,
pain at rest or at night that does not ease, or weight loss you cannot explain
can each have causes that an exercise plan does not address. A clinician can
tell you what is going on and whether loading the joint is right for you now.

Please book an appointment with your doctor or a physical therapist in the next
few days. If anything gets suddenly worse, contact them sooner.

This is not a judgement that something is wrong. It means this check is not the
right starting point until a clinician has seen you. You are welcome to come
back once they have.

### Shared closing line (all three messages)

This check is educational. It does not diagnose, and it does not replace a
clinician who can examine you.

## Clear-screen line

Shown when every answer is "No". It sits above the first real question.

> Thank you. You did not report any of these signs, so let's carry on. If
> any of these signs appear later, stop the exercises and contact a clinician.

Note for A3: do not write "you are safe" or "you are cleared". The screen only
says that none of these signs was reported.

## Red-flag box (short form)

For A4 (the top of each download and the tracker), A8 (lessons) and anywhere a
compact version is needed. Keep the list in this order.

**Heading:** Stop and contact a clinician if

- your calf hurts or swells after a joint replacement, or you get chest pain
  or sudden breathlessness (call 911 or your local emergency number);
- the joint is hot, red or swollen and you feel feverish or unwell;
- a surgical wound is red, hot, leaking or opening up;
- the joint looks out of shape or cannot take weight after a fall or injury;
- the joint gives way, or catches and gets stuck;
- you suddenly cannot bend or straighten it as far as usual;
- pain at rest or at night does not ease when you change position;
- you are losing weight without trying.

These signs are worth checking before you exercise. They are not a diagnosis.

(If the reviewer removes RF8, RF9 or RF10, remove the matching words from the
first and third bullets.)

## Approval

Only the second clinical reviewer named by Randy (D6) can approve this
wording. Each question, its message level, the "Not sure counts as yes" rule and
the three proposed additions need that reviewer's decision before Gate G1.
Points for the reviewer:

- RF1: giving way is common in knee osteoarthritis. As written, any giving way
  stops the check. Should it stop only if it is new or getting worse?
- RF5: should "keeps you awake most nights" or a time frame (for example,
  "for more than a few weeks") be added, so ordinary night aching does not
  stop the check?
- RF6: should a threshold be added (an amount of weight or a time span)?
- RF7: "cannot put weight on it" was added to "looks out of shape". Keep?
- RF4 and RF8: the emergency wording uses 911. Confirm for the audience.
- RF8 to RF10: accept or remove each one.
