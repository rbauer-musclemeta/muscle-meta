# Scoring direction: what the joint-load check shows

One page for A3 (build), A6 (sales and category copy that describes the check)
and A9 (QA).

## The rule

The joint-load check gives the reader **three things and no number**:

1. **The red-flag outcome.**
2. **A short reading of the belief and load answers**, in plain words.
3. **One next step.**

It never shows a composite percentage, a risk score, a tier, a coloured risk
bar, or any number that rises as things look worse.

## Why

- CLAUDE.md section 1: the user-facing scale (MM™ Health Score) runs higher is
  better. Higher-is-worse scales stay clinician-only and are never shown to
  users. The source tool's "composite risk" percentage ran the wrong way and
  was shown to users.
- CLAUDE.md 7.3: no composite risk percentage or "risk score" in this
  workstream.
- The source tool's percentage added up unlike things (surgery history, a count
  of risk factors, beliefs) into one figure with no validated meaning. A number
  like that reads as precise and is not.
- The check is a belief and loading conversation. A risk number works against
  that: it can make a reader more afraid to move, which is the problem the
  course addresses [CLAIM-C10].

## What is removed from the source tool

- "Composite risk" and its percentage.
- The tier labels MINIMAL, LOW, MODERATE, HIGH and CRITICAL, and any word that
  stands in for them.
- The coloured tier bar.
- The "risk factors selected" count shown as a result.
- Readiness labels driven by tier ("Not yet, build first", "Foundation
  phase").
- The "Active catabolic cascade pattern" flag ("your joint may be in an
  unloading spiral"). It was triggered by the percentage and reads as a
  diagnosis.

Answers may still be used internally to choose which reading and next step to
show. That logic is never shown as a score.

## 1. Red-flag outcome

From `red-flag-screen.md`. Either the check stopped (and the reader never
reaches results), or the results open with the clear-screen line:

> None of the warning signs in the safety check was reported. If any of them
> appear later, stop the exercises and contact a clinician.

## 2. Reading of the answers

Two or three short paragraphs, chosen from the blocks below. Each describes
what the reader told us and what it means for where to start. None of them
describes the joint.

### Belief

| Answer in the check | Reading |
|---|---|
| Movement wears the joint out, like sandpaper on a tire | You told us you see movement as something that wears the joint down. Many people were told exactly that. The picture has changed: cartilage is living tissue that relies on movement to get its nutrients [CLAIM-NEW-1], and in one large review, recreational runners had lower rates of knee and hip arthritis than people who did not run [CLAIM-C01]. That is an association, not proof, but it does not fit the "wearing out" idea. Lesson 1 explains why. |
| Exercise is healthy, but rest is the safe default when it aches | You told us rest is your default when the joint aches. Short rest makes sense for a hot, swollen joint or after surgery. As an everyday default, though, long periods of rest can leave a joint and the muscles around it less able to handle load [CLAIM-NEW-2]. The acceptable pain guide below gives you another option. |
| Movement is what feeds the cartilage | You already see movement as part of joint care. That is the starting point the course builds on. |

### Flare strategy

| Answer | Reading |
|---|---|
| Total rest and regular medication | When the joint flares, you stop moving and rely on medication. That is an understandable response to pain. International guidelines place exercise and education as the first treatment for knee and hip osteoarthritis, alongside, not instead of, the medicines your clinician recommends [CLAIM-C05]. |
| Pull back and wait for the flare to pass | When the joint flares, you pull back and wait. Easing off for a few days is reasonable. The aim is to come back with a smaller dose rather than wait indefinitely. |
| Keep moving and adjust | When the joint flares, you adjust and keep going. That is the approach the course teaches. |

### Load tolerance (20 minutes of flat walking, cycling or pool exercise)

| Answer | Reading |
|---|---|
| Cannot tolerate it: pain goes past 5 quickly and stays for days | Right now, 20 minutes is more than your joint settles from. That tells us where to start, not where you will stay. A smaller dose is the way in. |
| Gets through it, but the ache often goes past 5 or lasts more than a day | You can do 20 minutes, but the joint is not always settling by the next day. Adjusting the dose with the acceptable pain guide is the next step. |
| Ache stays at 5 or below and settles within 24 hours | The joint is settling well after 20 minutes of low-impact activity. There is room to build from here. |

Always follow the readings with the short version of the acceptable pain guide
from `pain-rule-wording.md`.

### Conditional notes (shown after the readings)

- Rheumatoid or other inflammatory arthritis selected: the short version from
  `inflammatory-arthritis-note.md`.
- Joint replacement scheduled or completed: the short version from
  `post-surgery-caveat.md`.
- GLP-1 medicine selected: no claim-bearing note until A1 grades
  `[CLAIM-C13]`. Until then, use only: "If you are using a GLP-1 medicine for
  weight loss, ask your clinician how strength work and protein fit your plan."

## 3. One next step

Show one only, chosen in this order. The first match wins.

| Condition | Next step |
|---|---|
| Joint replacement scheduled or within the last 6 months | Get your surgeon's or physical therapist's go-ahead, then open the Post-Arthroplasty Loading Guide and take it to your next appointment. |
| Low load tolerance (first answer) | Start with short bouts: about 5 to 10 minutes of gentle movement, once or twice a day, and use the tracker to see how the joint settles. |
| Belief answer is "wears it out" | Try a 5-minute "circulation restart" today: sit on a chair and slowly straighten and bend your knee, or do slow hip circles while holding a counter. |
| Flare strategy is total rest | Try two sets of chair sit-to-stands this week, keeping any ache within the acceptable pain guide. |
| Anything else | Pick one activity you enjoy and book three 15-minute sessions this week. Use the tracker to log how each one settles. |

The next step is an action, not a sales message. A link to the course may sit
below it as a secondary button, labelled "See the course".

## Words A9 should search for on the results screen

None of these may appear: `%`, "risk score", "composite", "tier", "minimal",
"moderate risk", "high risk", "critical", "your joint is", "you have",
"damage", "safe" used about the joint, "cleared".
