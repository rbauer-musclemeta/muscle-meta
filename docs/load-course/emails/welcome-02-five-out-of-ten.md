# Welcome 2: the 5 out of 10 rule

| Field | Value |
|---|---|
| Sequence | Welcome |
| Position | 2 of 4 |
| Send | Day 3 |
| Entry | Tag `dl-joint-guide` |
| Subject | The 5 out of 10 rule |
| Preview text | A practical way to tell a working ache from a warning sign. |
| Call to action | Link: "Get the free tracker" to `https://muscle-meta.com/downloads/acceptable-pain-tracker/` |
| Claims | C02 |
| Placeholders | `[CLAIM-C02]`, `[A2-pain-rule-wording]`, `[A2-post-surgery-caveat]`, `[A2-disclaimer]`, `[KIT-FOOTER-UNSUBSCRIBE]`, `[KIT-FOOTER-ADDRESS]` |
| Status | Draft copy. Not in Kit. |

## Body

Hello,

When a knee or hip aches halfway through a walk, the natural move is to stop. The ache feels like a warning that something is wearing down.

Pain is a real signal and it deserves attention. It is not always a measure of damage. A sensitive joint can sound its alarm early, well before any harm is done.

Many clinicians use a practical guideline to tell the two apart. It has two parts. [CLAIM-C02]

1. During or just after activity, an ache up to about 5 on a scale of 0 to 10 is generally acceptable.
2. By the next day, the joint is back to where it started.

When both are true, your joint is handling that amount of activity. When the ache climbs higher, or the joint is worse the next day, treat it as information: do a little less next time, rather than nothing.

[A2-pain-rule-wording]

This is a guideline, not a prescription. It does not replace your surgeon's protocol after a joint replacement, or advice from a clinician who knows your history.

[A2-post-surgery-caveat]

The rule is easier to use when you write it down. The free Acceptable Pain Loading Tracker gives you one line a day: what you did, how it felt, and whether the joint had settled by the next day. It stays on paper or on your own device.

[Get the free tracker](https://muscle-meta.com/downloads/acceptable-pain-tracker/)

Next time: why the first step should be smaller than you think.

Randy

## Footer

[A2-disclaimer]

[KIT-FOOTER-UNSUBSCRIBE]

[KIT-FOOTER-ADDRESS]

## Humanizer run

- Run: 2026-11-01, `anthropic-skills:mm-humanizer-voice`, prose only.
- Removed: the source script's "Think of that mild ache as the sound of your joint getting fed" (adds an unsupported mechanism); "Research shows" with no named source; a staged run-up ("Here's the rule:").
- Kept: the numbered two-part rule as a list, because the two items are parallel and the reader will come back to them.
- Check: no number added beyond the 5 out of 10 and next-day check in the source; "24 hours" written as "by the next day" pending A2's wording. Safety wording kept. No em dashes.
- For mm-research-validator: C02 (A1 pending). If A1 finds no source for a numeric threshold, keep "many clinicians use a practical guideline" and drop the citation.
- Note: the tracker page path assumes A4's slug `acceptable-pain-tracker`. If Randy sets the tracker to `access: email`, the link still goes to the page, not the file.
