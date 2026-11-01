# Copy fixes

Each sentence in the source documents that must change before it is reused,
with its replacement. Agents reusing source copy (A4, A5, A6, A7, A8) use the
replacement, not the original. The sources themselves are not edited.

Sources:

- **Course**: `source/Load as Medicine_ Rebuilding the Arthritic Joint.md`
- **Framework**: `source/Load as Medicine_ A Clinical Framework for Joint Health and Osteoarthritis Management.md`
- **Tool**: `source/MM-JointHealth-Assessment.html` (reference only; A3 rebuilds it)

Claim tags: `[CLAIM-Cnn]` is a seed claim in `agents/A1-evidence.md`.
`[CLAIM-NEW-n]` is a claim outside the seed list; see "Claims for A1 to add"
at the end. Every tag is replaced by its grade once A1's register merges. If a
claim fails, cut the sentence that carries it; each replacement below is written
so the rest of the passage still reads without it.

Quoted source text below sometimes contains words that are banned in this
workstream ("unlocking", "gated", "safe signal"). They appear only inside the
"As written" lines, as the thing being removed.

## Standing rules (apply everywhere, not only to the lines listed)

### R1. Rebuild: bound it

Human evidence that exercise regrows cartilage is weak [CLAIM-NEW-5]. The
course uses "rebuild" about cartilage and the joint throughout.

- **Allowed:** rebuild strength, rebuild confidence, rebuild capacity, build
  back up, rebuild your routine.
- **Not allowed about cartilage or the joint:** rebuild cartilage, rebuild the
  joint, rebuild joint surfaces, repair cartilage, regrow, biological
  rebuilding, "choose rebuilding over breakdown", "improves the physical
  integrity of the joint".
- **When the cell-level mechanism is needed**, use this pair, together:
  "In lab studies, cartilage cells respond to regular load by making new
  tissue around themselves [CLAIM-C03]. That has not been shown to regrow
  cartilage in people. What trials in people do show is less pain and better
  function [CLAIM-NEW-5] [CLAIM-C06]."

### R2. Rest: always with the carve-out

Never say rest starves, harms or "accelerates decline" without the carve-out.
Standard carve-out sentence:

> Short rest is the right call for a hot, swollen joint, during a flare your
> clinician is managing, or when your surgical team has asked for it. The
> problem is long stretches of rest as the everyday default.

### R3. Associations stay associations

"Protective", "prevents", "proves" and "the data proves" are removed. Use "was
linked with", "had lower rates of ... in this study".

### R4. Audience

"Adults aged 45–75" becomes "adults 50 and over" everywhere (decided
2026-11-01).

### R5. Authority phrases

"The latest research shows", "Research shows", "Research indicates",
"According to the latest meta-analysis" are replaced by the finding itself,
with its source beside it (randy-brand-voice language guardrails).

## Course

### F00. Title and subtitle

- **As written:** "Load as Medicine: Rebuilding the Arthritic Joint"
- **Replace with:** "Load as Medicine". Subtitle: "An educational course, not
  treatment."
- **Why:** decision D7; "rebuilding the arthritic joint" breaks R1.

### F01. Overview, opening

- **As written:** "The traditional 'wear and tear' model of osteoarthritis (OA)
  is perhaps the most damaging myth in modern orthopedics."
- **Replace with:** "Many of us were told that osteoarthritis (OA) is 'wear
  and tear': that joints wear out like car tires, one mile at a time. It is one
  of the most common beliefs about joints, and one of the least helpful."
- **Why:** "most damaging myth in modern orthopedics" is an unsupported
  superlative and reads as an attack on a profession.

### F02. Overview, the science

- **As written:** "However, modern clinical science has completely overturned
  this. We now understand that cartilage is not a passive shock absorber, but a
  living, metabolic tissue that actually requires mechanical load to stay
  healthy."
- **Replace with:** "The picture has changed. Cartilage is living tissue. It
  has no blood supply of its own and relies on the squeeze and release of
  movement to bring in nutrients [CLAIM-NEW-1], and its cells respond to the
  loads placed on them [CLAIM-C03]."
- **Why:** "completely overturned" overstates; "requires load" stated as a
  fact needs a graded claim.

### F03. Overview, highest-leverage

- **As written:** "Reframing your belief from 'movement causes wear' to 'load
  is medicine' is the highest-leverage intervention you can make for your
  long-term mobility."
- **Replace with:** "Seeing movement as something your joint uses, rather than
  something that wears it out, is a useful first step. Fear of moving can keep
  people away from the very activity that helps [CLAIM-C10]."
- **Why:** unsupported superlative.

### F04. Overview, "unlocking the biological signals"

- **As written:** "By shifting this mindset, you move from a state of
  fear-avoidance to active recovery, unlocking the biological signals your
  body needs to maintain and rebuild its joint surfaces."
- **Replace with:** "As the fear eases, it gets easier to give the joint the
  regular movement it relies on. In lab studies, cartilage cells respond to
  that kind of load by making new tissue [CLAIM-C03]. In people, the clearest
  benefits of exercise are less pain and better function [CLAIM-C06]."
- **Why:** "unlocking" is on the CLAUDE.md 7.3 list; "rebuild its joint
  surfaces" breaks R1; "shifting this mindset" is close to the guardrail's
  banned "change your mindset".

### F05. Course description

- **As written (selected phrases):** "debunks this myth"; "designed for adults
  aged 45–75"; "movement acts as a vital nutrient, stimulating a process called
  mechanotransduction to repair and maintain cartilage"; "accurately
  self-monitor pain using clinical safety rules"; "select the specific exercise
  modality ... that addresses your specific symptoms"; "the confidence to use
  movement as your primary tool for joint preservation".
- **Replace with:** "For decades, adults living with joint pain have been told
  that joints simply wear out with use. This course offers a more useful
  picture, which we call 'load as medicine'. It is written for adults 50 and
  over with knee or hip osteoarthritis. Over three short lessons you will
  learn how movement helps feed cartilage, through the fluid inside the joint
  [CLAIM-NEW-1] and through mechanotransduction, the way cartilage cells sense
  pressure and respond to it [CLAIM-C03]; how to rate your ache with a
  practical guideline physical therapists use [CLAIM-C02]; and how to choose a
  type of exercise to try first, based on what bothers you most [CLAIM-C07].
  By the end you will have a plan you can start this week, and a way to adjust
  it."
- **Why:** R1, R4; "clinical safety rules" overstates a heuristic; "repair"
  cartilage breaks R1.

### F06. Overview, bridge

- **As written:** "...why our natural instinct to 'rest it' is actually the
  very thing that accelerates joint decline."
- **Replace with:** "...why resting a sore joint, the natural instinct, is
  often not the help it seems."
- **Why:** R2; "accelerates joint decline" is causal and unsourced
  [CLAIM-NEW-2].

### F07. Lesson 1 opening, "the latest research"

- **As written:** "However, the latest research shows that rest is often a
  counterproductive prescription."
- **Replace with:** "But long stretches of rest are often not the protection
  they seem [CLAIM-NEW-2]."
- **Why:** R5, R2.

### F08. Lesson 1: "rest is starving the joint" (required)

- **As written (text):** "Think of your cartilage like a sponge: if a sponge
  stays dry and compressed, it becomes brittle and breaks down; but if it is
  regularly pumped with water, it stays resilient and functional (Gilbert
  2021). Without this movement, the tissue is effectively starved."
- **As written (video hook):** "But as a physical therapist, I can tell you:
  resting your joint is actually like starving it."
- **Replace text with:** "Think of your cartilage like a sponge. Each time you
  load the joint and then release it, fluid is squeezed out and drawn back in,
  carrying nutrients with it [CLAIM-NEW-1]. Without regular movement, that
  exchange slows down. Short rest is the right call for a hot, swollen joint,
  during a flare your clinician is managing, or when your surgical team has
  asked for it. The problem is long stretches of rest as the everyday default
  [CLAIM-NEW-2]."
- **Replace hook with:** "We've all been told that if our joints hurt, we
  should rest them so we don't end up 'bone on bone'. As a physical therapist,
  I see it differently. A short rest has its place. But weeks of rest can
  leave your cartilage without the movement it relies on."
- **Why:** R2. "Brittle and breaks down" pushes the metaphor past the
  evidence. Gilbert 2021 is kept only if A1 confirms it supports the nutrition
  claim.

### F09. Lesson 1 video, mechanism and the AMPK sentence (required)

- **As written:** "Through a process called mechanotransduction, they convert
  the pressure of movement into chemical signals that tell the Pericellular
  Matrix (PCM) to rebuild (Jiang 2021). This isn't just about biomechanics;
  it's a metabolic event. Joint loading activates the AMPK pathway in your
  mitochondria—the same energy sensors that govern muscle health—telling your
  body to keep the cartilage matrix strong."
- **Replace with:** "Your cartilage cells, called chondrocytes, are living
  sensors. Through a process called mechanotransduction, they turn the squeeze
  of movement into chemical signals. In lab studies, those signals help the
  cells look after the tissue around them [CLAIM-C03]. Researchers are also
  looking at whether an energy sensor inside these cells, called AMPK, links
  loading to how well the cells produce energy. That work is early, mostly in
  cells and animals, and it is not yet a guide to how much to exercise
  [CLAIM-C04]."
- **Why:** grade expected Unproven-Bridge for C04 (STATUS notes). The source
  also places AMPK "in your mitochondria"; AMPK is an energy sensor in the
  cell, not a mitochondrial pathway, so that phrase is dropped. "Tell the PCM
  to rebuild" breaks R1. "Researchers are also looking at" is kept on purpose:
  it marks the level of evidence, which the guardrails allow.

### F10. Lesson 1 video, evidence point

- **As written:** "The data proves this 'U-shaped' reality. A study of 125,810
  people found that recreational runners ... 3.5%. ... sedentary people ...
  10.2% (Alentorn-Geli 2017). Movement is protective. However, balance is key:
  'Elite' competitive volume can raise risk to 13.3%. We want that
  recreational 'sweet spot' where load acts as medicine."
- **Replace with:** "In one large
  review of studies covering 125,810 people, recreational runners had hip or
  knee arthritis at a rate of 3.5%. People who did not run had a rate of
  10.2%, and long-time competitive runners 13.3% [CLAIM-C01]. That is an
  association. It does not prove that running prevents arthritis. But it does
  not fit the idea that every step wears the joint down."
- **Why:** R3. "The data proves" is a banned phrase. A1 to confirm the
  comparison group's wording ("did not run" or "sedentary") and the joints
  covered.

### F11. "Movers have 60% less arthritis than sitters" (required)

- **As written (Asset 3, question 1):** "(If Yes, re-read Lesson 1: movers
  have 60% less arthritis than sitters)."
- **Replace with:** "(If yes, start with Lesson 1. In one large review,
  recreational runners had lower rates of hip and knee arthritis than people
  who did not run [CLAIM-C11].)"
- **Why:** 60% is not in any source; 3.5% against 10.2% is about 66% lower, and
  the framework says "roughly a third". "Movers" and "sitters" also widen
  runners to everyone. Use only the comparison A1 picks for C11. If A1 adds a
  ratio ("about a third the rate"), it goes here and in F10, nowhere else, and
  it stays tied to runners.

### F12. Lesson 1 short step, clinical cue

- **As written:** "...to ensure the joint is loading evenly."
- **Replace with:** "...to help spread the load evenly through the joint."
- **Why:** "ensure" overpromises.

### F13. Lesson 1 close

- **As written:** "Every repetition is a vital nutrient delivery to your
  joints; you are retraining your body to choose rebuilding over breakdown."
- **Replace with:** "Each easy repetition moves fluid through the joint
  [CLAIM-NEW-1]. Small, regular doses are how confidence and capacity build."
- **Why:** R1.

### F14. Lesson 2, "Acceptable Pain Rule" (required)

- **As written (title):** "Lesson 2: The Acceptable Pain Rule"
- **As written (text):** "In reality, your brain often creates a 'protective
  reflex'—an alarm that goes off way before any actual harm occurs. To rebuild
  a joint, we must apply the 'Acceptable Pain Rule.' This framework allows you
  to distinguish between a productive 'loading signal' and an actual injury."
- **Replace title with:** "Lesson 2: The acceptable pain guide"
- **Replace text with:** "Pain works like an alarm. It deserves attention, but
  it does not always measure damage to the joint [CLAIM-NEW-3]. To help people
  keep moving without guessing, physical therapists often use a practical
  guideline, which we call the acceptable pain guide. It is not a hard limit,
  and on its own it cannot tell an ache from an injury. What it does is help
  you judge whether a dose of activity was one your joint recovered from
  [CLAIM-C02]."
- **Why:** the brief requires it to be labelled a practical guideline. "Way
  before any actual harm" is unsupported; "to rebuild a joint" breaks R1. Full
  wording of the guideline is in `pain-rule-wording.md`.

### F15. Lesson 2, the OARSI sentence

- **As written:** "Clinical guidelines from OARSI now rank structured exercise
  as a 'Core Treatment,' placing it above NSAIDs, injections, and opioids
  (Bannuru 2019). Exercise is not just a way to mask pain; it is a biological
  intervention that improves the physical integrity of the joint."
- **Replace with:** "The international guideline from OARSI (the
  Osteoarthritis Research Society International) lists structured exercise as
  a core treatment for knee and hip osteoarthritis, recommended for almost
  everyone. Medicines and injections are added depending on the person
  [CLAIM-C05] [CLAIM-C12]. In trials, exercise eases pain and helps people do
  more [CLAIM-C06]."
- **Why:** "improves the physical integrity of the joint" breaks R1. Medicine
  rankings stay as A1 confirms them.

### F16. Lesson 2 video, reframe

- **As written:** "On a scale of 0 to 10, any ache up to a 5/10 is generally
  considered a 'safe' signal (Gilbert 2021). I know that feeling pain while
  moving is scary, but we are gently retraining your nervous system to lower
  that protective reflex. Think of that mild ache as the sound of your joint
  getting fed and stimulated to rebuild."
- **Replace with:** "We use what I call the acceptable pain guide. On a scale
  of 0 to 10, an ache up to about 5 during activity is generally acceptable
  [CLAIM-C02]. It's a practical guideline, not a hard limit. I know that
  feeling pain while you move is unsettling. Some people find that as they keep
  moving within the guide, the same activity starts to feel less alarming."
- **Why:** "safe" overpromises; "fed and stimulated to rebuild" breaks R1;
  "retraining your nervous system" is an unsourced mechanism.

### F17. Lesson 2 video, Fransen evidence point

- **As written:** "Following this rule leads to real results. Research shows
  that land-based exercise reduces pain by 12 points and improves function by
  10 points on a 100-point scale (Fransen 2015). These improvements are often
  more durable and significantly safer than relying on long-term medication."
- **Replace with:** "In a large
  review of exercise trials for knee osteoarthritis, exercise on land lowered
  pain by about 12 points and improved function by about 10 points on a 0 to
  100 scale, compared with not exercising. The benefits were still there two
  to six months after the programmes ended [CLAIM-C06]."
- **Why:** the trials did not test the 5 out of 10 guideline, so "following
  this rule leads to" is removed. "Significantly safer than medication" has
  no claim behind it. R5. A1 confirms the comparator and duration.

### F18. Lesson 2 video, action

- **As written:** "...you've found your perfect 'loading dose.'"
- **Replace with:** "...that was a dose your joint recovered from. That's your
  starting point."

### F19. Lesson 2 close

- **As written:** "...by respecting the 5/10 rule, you are teaching your joints
  and your brain that movement is safe again."
- **Replace with:** "Each session that settles within the guide is useful
  evidence: this amount of movement is one your joint can recover from."

### F20. Lesson 3, muscles as shock absorbers

- **As written:** "...these muscles act as shock absorbers, redistributing the
  load away from the cartilage and onto the 'metabolic engine' of the muscle
  (Wei 2024)."
- **As written (video):** "When you strengthen your quads, you create a
  muscular 'brace' that offloads the cartilage. ... for those biological
  changes to take hold."
- **Replace with:** "Strong thigh and hip muscles help control how force passes
  through the knee and hip [CLAIM-C09]. Whether they take load off the
  cartilage itself is still being studied. What is clearer is that stronger
  muscles make everyday things, like stairs and getting up from a chair,
  easier."
- **Replace video line with:** "...so you stay consistent long enough for the
  benefits to build."
- **Why:** STATUS notes Wei 2024 may not measure this; C09 is likely inference.
  Adjust once graded. The "everyday things" sentence is a plain-function
  statement; drop it if the reviewer wants it graded.

### F21. Lesson 3, the Mo 2023 ranking

- **As written:** "We can be precise here. According to the latest
  meta-analysis (Mo 2023), if your main problem is sharp pain, cycling and
  aquatic exercise are most effective. If your biggest hurdle is stiffness,
  yoga provides the most relief. If you need general symptom control and better
  function, resistance training is your best bet."
- **Replace with:** "One analysis that compared many trials (Mo 2023) gives us
  some clues. Cycling and exercise in water ranked highest for pain, yoga
  ranked highest for stiffness, and resistance training did well for overall
  symptoms and function [CLAIM-C07]. Rankings like these are a place to start,
  not a rule. The type you will keep doing matters most."
- **Why:** a network meta-analysis ranking is not "most effective" (STATUS
  notes). R5.

### F22. Lesson 3 close, "biological rebuilding"

- **As written:** "You now have the science, the safety rules, and the
  modalities to rebuild." and "You are now using the same strategies as
  top-tier rehabilitation experts; consistency is the secret to biological
  rebuilding."
- **Replace with:** "You now know how to rate your ache, what type of exercise
  to try first, and how to plan your week. Start small and stay consistent.
  That is how strength and confidence build."
- **Why:** R1; "top-tier experts" and "the secret" are hype.

### F23. Lesson 3 video script timing (defect, not wording)

The `[0:15-0:45]` segment is missing and `[0:45-1:15]` appears twice. Retime
the "Reframe" block to `[0:15-0:45]`. Flag to A8 and Randy before filming.

## Downloadable asset 1: Post-Arthroplasty Loading Guide

Put the full `post-surgery-caveat.md` and the red-flag box at the top.

### F24. Opening

- **As written:** "For those who have undergone a total knee arthroplasty
  (TKA), the goal is often 'protection.' However, relying on conventional,
  passive rehab can leave measurable deficits in strength and mobility.
  Strategic 'Active Resistance' (ARE) is superior because it targets the
  muscles that protect your new joint. Research indicates that the ARE
  protocol outperforms conventional rehab on 6 out of 9 major functional
  measures, helping patients regain independence faster (Wei 2024)."
- **Replace with:** "After a knee replacement (total knee arthroplasty),
  rebuilding strength in the thigh and hip is a big part of recovery. In one
  review of trials (Wei 2024), people who did active resistance exercise
  (exercise against a weight, band or machine) after knee replacement did
  better on several measures than people who had usual rehab [CLAIM-C08]. Your
  surgical team decides when and how this fits your recovery."
- **Why:** "conventional, passive rehab" misdescribes usual care and reads as
  an attack on clinicians. "Superior" and "6 out of 9" wait for A1. "Regain
  independence faster" is not measured.

### F25. Results table

- **As written:** columns "Conventional Rehab (CE)" with "Standard recovery",
  "Slower return to agility", "Persistent weakness", "Moderate relief",
  "Limited by stiffness"; and "Active Resistance (ARE) Advantage" with
  "Significantly faster (MD +0.13)", "Nearly 1-second faster mobility",
  "Greater strength", "Significant reduction in pain scores", "+2.74°".
- **Replace with:** two columns, "What was measured" and "What the review found
  for active resistance, compared with usual rehab [CLAIM-C08]". Each cell
  states the number with its unit, exactly as A1 confirms it, in plain words:
  for example "Walking speed: faster, by [value and unit from A1]". Remove the
  whole conventional rehab column. Remove any row A1 cannot confirm.
- **Why:** the conventional column characterises usual care without data; "MD"
  is unexplained jargon; "significant" wording waits for A1.

### F26. Table footnote

- **As written:** "Source: Wei 2024. Active resistance is the evidence-based
  default for maximizing surgical outcomes."
- **Replace with:** "Source: Wei 2024 [CLAIM-C08]. One review of trials. Ask
  your surgical team how resistance exercise fits your recovery."

## Downloadable asset 2: Acceptable pain loading tracker

Title: "Acceptable pain loading tracker" (sentence case). Red-flag box at the
top; short pain-guide version below it.

### F27. Introduction

- **As written:** "Tracking prevents the two biggest mistakes in joint rehab:
  'under-loading' (which leads to tissue stagnation) and 'over-loading' (which
  causes flares). This log helps you find your 'Goldilocks Zone'—the exact dose
  of movement that stimulates the cartilage without overtaxing the nervous
  system."
- **Replace with:** "Two things make progress hard: doing too little to build
  capacity, and doing too much, which can bring on a flare. This log helps you
  find a dose your joint recovers from, then build on it."
- **Why:** "tissue stagnation", "the exact dose" and "stimulates the
  cartilage" are unsourced.

### F28. Column headings

- **Replace:** "Pain Rating (0-10)" with "Ache during activity (0 to 10)";
  "24-Hour Check (Did it settle?)" with "Back to usual by the next day? Yes /
  No".

### F29. "Red Flags & Adjustments" box, and the 50% rule

- **As written:** "Pain >5/10: If pain exceeds 5 during exercise, reduce the
  intensity (speed/weight) or duration next time." and "Pain Not Settled: If
  the joint feels worse 24 hours later, you have over-loaded. Reduce your
  volume by 50% for the next session until the joint stabilizes."
- **Replace with:** the "Tracker adjustment rules" in `pain-rule-wording.md`.
  Heading "Adjusting your next session" (the red-flag box is separate).
- **Decision on 50%:** kept, but only as labelled clinical guidance: "about
  half the time, distance or sets", followed by "This is Randy's clinical
  guidance from practice, not a figure from a research study." No source
  supports 50%, so it is not presented as evidence. Randy confirms he stands
  behind the figure; if he does not, drop the number and keep "cut the amount
  back".
- **Why:** "you have over-loaded" is a verdict; "until the joint stabilizes"
  implies instability.

## Downloadable asset 3: Self-check

### F30. Question 1

See F11.

### F31. "Low functional tolerance"

- **As written:** "Your joint is currently sensitive. Start with 'micro-bouts'
  ..."
- **Replace with:** "Right now, 20 minutes is more than your joint settles
  from. That tells us where to start, not where you will stay. Begin with short
  bouts: about 10 minutes of gentle movement, twice a day, and use the tracker
  to build from there."
- **Why:** "your joint is currently sensitive" describes the joint (diagnosis
  language).

### F32. "Passive default"

- **As written:** "Your plan is missing the 'Core Treatment.'"
- **Replace with:** "International guidelines list exercise as a core
  treatment for knee and hip osteoarthritis [CLAIM-C05], and it is not yet part
  of your plan. The sit-to-stand short step in Lesson 2 is an easy place to
  begin."

### F33. Closing line

- **As written:** "This content is educational only and does not replace
  medical advice. ..."
- **Replace with:** the download version in `disclaimer.md`.

## Framework document (used by A5, A6 for the FAQ and the category page)

### F34. Executive summary

- **As written:** "Current clinical evidence refutes the model of cartilage as
  a passive surface that thins with use. Instead, OA is better modeled as an
  active, whole-joint metabolic and inflammatory disease. ... chondrocytes rely
  on the mechanical pumping of joint movement ..."
- **Replace with:** "Osteoarthritis is now seen as a condition of the whole
  joint, not just thinning cartilage [CLAIM-NEW-6]. Cartilage relies on joint
  movement to circulate the fluid that feeds it [CLAIM-NEW-1]."
- **Why:** "refutes" overstates.

### F35. "Movement is a nutrient" and "within days"

- **As written:** "Immobilization starves cartilage." and "Immobilization
  effectively starves the tissue, tipping the signaling balance toward a
  catabolic state within days." and "Chondrocyte nutrition and waste clearance
  are entirely dependent on the mechanical circulation of synovial fluid."
- **Replace with:** "Long periods without movement are linked with changes in
  cartilage and in the muscles around the joint [CLAIM-NEW-2]. Cartilage gets
  much of its nutrition from joint fluid moved by loading [CLAIM-NEW-1]."
  Followed by the R2 carve-out.
- **Why:** R2; "within days" and "entirely" are unsourced.

### F36. Running myth rebuttal, population table, FAQ "running is protective"

- **As written:** "moderate loading is protective"; "Protective effect; ~1/3
  the risk of sedentary individuals."; "Sedentarism is a significant risk
  factor for OA."; FAQ: "No, for recreational doses, running is protective.
  Recreational runners have roughly one-third the rate of arthritis compared to
  sedentary people. Only elite-level volume increases risk."
- **Replace table notes with:** "Lowest rate in this review"; "Higher rate than
  recreational runners in this review"; "Highest rate in this review, after
  many years of competitive running" [CLAIM-C01].
- **Replace FAQ answer with:** "Not for most people who run for fun, based on
  what we know so far. In one large review, recreational runners had lower
  rates of knee and hip arthritis than people who did not run, and long-time
  competitive runners had higher rates [CLAIM-C01]. That is an association, not
  proof that running protects the knee. If running is part of your life, the
  acceptable pain guide can help you judge your dose."
- **Why:** R3. The ratio wording waits for C11.

### F37. Guideline table

- **As written:** "explicitly above opioids and acetaminophen"; the tier table.
- **Replace with:** the table only as A1 confirms it [CLAIM-C05] [CLAIM-C12].
  In reader copy, keep medicine detail to one line: "Which medicine, if any,
  suits you is a question for your doctor or pharmacist."

### F38. Mitochondrial mechanotransduction and "Mitochondrial Crisis"

- **As written:** "Mitochondrial dysfunction in chondrocytes is a primary
  driver of OA pathogenesis." and the pattern name "Mitochondrial Crisis".
- **Replace with:** the F09 wording [CLAIM-C04]. Rename the pattern
  "Mitochondrial signal (early research)".
- **Why:** "primary driver" is unsupported; "crisis" is reserved for real acute
  conditions (language guardrails).

### F39. Population profiles

- **As written:** "Maintainers (Active Adults 45–75)"; "which accelerates
  deconditioning and cartilage starvation".
- **Replace with:** "Maintainers (active adults 50 and over)"; "which can
  leave the joint and the muscles around it less ready for load
  [CLAIM-NEW-2]".

### F40. "Clinical outcomes are gated by the patient's belief system"

- **As written:** "Clinical outcomes are gated by the patient's belief system.
  Fear-avoidance predicts disability more accurately than radiographic
  (X-ray/MRI) severity. Clinicians must explain that cartilage is a living
  tissue that requires load to survive before prescribing exercise."
- **Replace with:** "What a person believes about their joint shapes what they
  are willing to do. Fear of movement has been linked with more difficulty in
  daily activities [CLAIM-C10]. So the explanation comes before the exercise
  plan: cartilage is living tissue that relies on movement [CLAIM-NEW-1]."
- **Why:** "gated" is on the 7.3 list. "Predicts more accurately than X-ray"
  is unsourced; restore a comparison only if A1 grades one. "Requires load to
  survive" overstates.

### F41. Acceptable pain rule in the framework

- **As written:** "If these conditions are met, the activity is safe and does
  not signal joint damage."
- **Replace with:** "If both are met, the dose is generally acceptable to
  continue and build on [CLAIM-C02]."

### F42. Nutrition substrates and GLP-1

- **As written:** "Nutrition provides the substrates (protein, Vitamin C) for
  matrix repair; weight management lowers systemic inflammation." and the
  GLP-1 profile.
- **Replace with:** nothing in the first release unless A1 sources them
  ([CLAIM-C13] for GLP-1). STATUS lists both as out of scope.

### F43. FAQ "Why does my joint feel better when I move it?"

- **As written:** "Movement circulates synovial fluid, which is the only way
  your cartilage gets nutrients and clears out metabolic waste. Movement is
  'feeding' the joint."
- **Replace with:** "Movement helps circulate the fluid inside the joint
  (synovial fluid), which is how cartilage gets much of its nutrition
  [CLAIM-NEW-1]. Many people also find that stiffness eases once they get
  going."
- **Why:** "the only way" is absolute.

### F44. FAQ "Should I take ibuprofen or acetaminophen instead of exercising?"

- **As written:** "...Exercise has moderate, durable effects on pain and
  function with fewer side effects than long-term medication use."
- **Replace with:** "It doesn't have to be one or the other. International
  guidelines list exercise as a core treatment, with medicines considered
  alongside it depending on your health [CLAIM-C05] [CLAIM-C12]. Which
  medicine, if any, suits you is a question for your doctor or pharmacist."
- **Why:** the side-effect comparison has no claim behind it; medicine choice
  is not ours to advise.

### F45. FAQ "I've had a knee replacement; surely I should rest it?"

- **As written:** "Evidence shows that patients who perform active resistance
  exercises after a knee replacement recover walking speed, strength, and range
  of motion faster than those who stick to conventional, passive rehab."
- **Replace with:** "Rest has a place in the early days, and your surgical
  team's plan comes first. After that, in one review of trials, people who did
  resistance exercise after knee replacement did better on several measures,
  including walking speed, than people who had usual rehab [CLAIM-C08]. Ask
  your team when resistance work fits your recovery."

### F46. FAQ "What is the best exercise for my arthritis?"

- **As written:** "Cycling, walking, yoga, and swimming all show benefits."
- **Replace with:** "Cycling, walking, yoga and exercise in water have all been
  studied, with benefits for pain and function [CLAIM-C07]."

## Tool (reference only; A3 rebuilds it)

### F47. "Your joint is living tissue, not a rubber tire" (required)

- **As written:** heading "Your joint is living tissue — not a rubber tire.";
  body "The single most damaging myth in joint health is that joints 'wear and
  tear' from movement. ..."; bold line "Complete rest doesn't protect your
  joint. It starves the cells that maintain it."; stat box "Moving
  intelligently is linked to roughly a third of the arthritis risk."
- **Keep the idea. Replace with:**
  - Heading: "Your joint is living tissue, not a tire"
  - Body: "Many of us were told joints wear out like tires, one mile at a
    time. Cartilage is different from rubber: it is living tissue. It has no
    blood supply of its own, so it relies on the squeeze and release of
    movement to bring nutrients in [CLAIM-NEW-1]. Long stretches of rest are
    not the protection they seem [CLAIM-NEW-2], though a short rest is right
    for a hot, swollen joint or after surgery."
  - Stat box: "3.5% compared with 10.2%. In one large review, recreational
    runners had lower rates of hip and knee arthritis than people who did not
    run. An association, not proof." [CLAIM-C01] [CLAIM-C11]
- **Why:** "single most damaging myth" is an unsupported superlative; "starves
  the cells" breaks R2; "moving intelligently" widens runners to everyone.

### F48. Belief answer C

- **As written:** "Cartilage requires physiological mechanical stress to
  signal cells to rebuild and maintain joint structure."
- **Replace with:** "Cartilage relies on regular movement to stay healthy."
  [CLAIM-NEW-1]

### F49. Core loading rules panel

- **As written:** "joint ache during loaded exercise should never exceed 5 out
  of 10."
- **Replace with:** the short version in `pain-rule-wording.md`.
- **Why:** "never exceed" contradicts "up to 5 is acceptable".

### F50. Results, flags and readiness

- **Replace:** composite risk, tiers, tier bar, readiness by tier and the
  "Active catabolic cascade pattern" flag are removed (see
  `scoring-direction.md`). The inflammatory flag is replaced by
  `inflammatory-arthritis-note.md`. The surgery flag is replaced by the short
  `post-surgery-caveat.md`. The walking and running card becomes: "In one large
  review, recreational runners had lower rates of arthritis than people who
  did not run [CLAIM-C01]. Build back gradually using the acceptable pain
  guide, especially after a break."
- **Brand:** "Muscle-Meta™ real-time reframe" becomes "Muscle-Meta Matrix™
  reframe".

## Claims for A1 to add

Claims used in this wording that are not in the seed list. A1 assigns each a
register ID and a grade; the `[CLAIM-NEW-n]` tags are then replaced.

| Tag | Claim as used here | Source as cited in the course | Where used |
|---|---|---|---|
| CLAIM-NEW-1 | Cartilage has no blood supply of its own and gets much of its nutrition from joint fluid moved by loading and unloading | Gilbert 2021 (course) | F02, F05, F08, F13, F34, F35, F40, F43, F47, F48; scoring-direction |
| CLAIM-NEW-2 | Long periods of rest or immobilisation are linked with changes in cartilage and surrounding muscle that reduce tolerance of load | none ("within days" unsourced) | F06, F07, F08, F35, F39, F47; scoring-direction |
| CLAIM-NEW-3 | Pain intensity does not always match the amount of joint damage | none | F14; pain-rule-wording |
| CLAIM-NEW-4 | Exercise is often part of care for rheumatoid and other inflammatory arthritis | none | inflammatory-arthritis-note |
| CLAIM-NEW-5 | Exercise has not been shown to regrow cartilage in people; human trials show less pain and better function | none | R1 |
| CLAIM-NEW-6 | Osteoarthritis affects the whole joint, not only cartilage | none | F34 |
