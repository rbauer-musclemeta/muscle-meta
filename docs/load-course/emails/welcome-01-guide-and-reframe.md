# Welcome 1: the guide and the belief reframe

| Field | Value |
|---|---|
| Sequence | Welcome, 4 emails over about 10 days |
| Position | 1 of 4 |
| Send | Day 1 after the subscriber confirms |
| Entry | Tag `dl-joint-guide` |
| Subject | Your joint is not a car tire |
| Preview text | The wear-and-tear picture leaves out the most useful part. |
| Call to action | Link: "Open your guide" to `https://muscle-meta.com/downloads/files/post-arthroplasty-loading-guide.pdf` |
| Claims | C01, C03 |
| Placeholders | `[CLAIM-C01]`, `[CLAIM-C03]`, `[A2-disclaimer]`, `[KIT-FOOTER-UNSUBSCRIBE]`, `[KIT-FOOTER-ADDRESS]` |
| Status | Draft copy. Not in Kit. |

## Body

Hello,

A lot of people picture a sore knee or hip as a car tire. Every mile wears off a little tread, and one day you are down to bone on bone.

That picture makes sense, and it is why so many people stop moving as soon as a joint aches.

Here is a more useful one. Cartilage, the smooth layer that covers the ends of the bones, is living tissue. It has no blood supply of its own. It gets its nourishment from the fluid inside the joint, and movement is what pushes that fluid in and out. Think of a kitchen sponge: squeezed and released, it stays soaked and springy. Left alone, it dries out. [CLAIM-C03]

So the question changes. It stops being "how do I save my joint from use?" and becomes "how much use does my joint do well with?"

There is population data that points the same way. In a large review of runners, people who ran for recreation had lower rates of hip and knee arthritis than people who were inactive, and people running at competitive, elite volume had higher rates. That is an association. It does not show that running protects a joint, but it does not fit the tire picture either. [CLAIM-C01]

The guide I sent you puts the same idea to work after a joint replacement. If it is still unopened, it is a good place to start.

[Open your guide](https://muscle-meta.com/downloads/files/post-arthroplasty-loading-guide.pdf)

Next time: a simple rule for telling a working ache from a warning sign.

Randy

## Footer

[A2-disclaimer]

[KIT-FOOTER-UNSUBSCRIBE]

[KIT-FOOTER-ADDRESS]

## Humanizer run

- Run: 2026-11-01, `anthropic-skills:mm-humanizer-voice`, prose only.
- Removed: a "not just X, it's Y" contrast in the opening; the source script's certainty wording (borrowed certainty from the source script) recast as an association; a one-line closer ("Movement is medicine.") after the runner paragraph.
- Kept: one contrast (tire versus sponge), because it corrects a belief the reader holds.
- Check: the source's percentages (3.5%, 10.2%, 13.3%) and sample size are deliberately left out until A1 grades C01; no number added. No em dashes.
- For mm-research-validator: C01, C03 (A1 pending). If A1 grades C01 below what "lower rates" implies, cut that paragraph.
