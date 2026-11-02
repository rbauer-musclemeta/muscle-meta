# Copy fixes

Each sentence in the source documents that must change before it is reused,
with its replacement. Agents reusing source copy (A4, A5, A6, A7, A8) use the
replacement, not the original. The sources themselves are not edited.

Sources:

- **Course**: `source/Load as Medicine_ Rebuilding the Arthritic Joint.md`
- **Framework**: `source/Load as Medicine_ A Clinical Framework for Joint Health and Osteoarthritis Management.md`
- **Tool**: `source/MM-JointHealth-Assessment.html` (reference only; A3 rebuilds it)

Claim tags: "(C06, Established)" names the row in A1's claims register and its
grade. Each replacement is written from that row's safe wording, in plain
voice, and never says more. No claim is left without a register row.
C20 is retired (Randy, 2026-11-02) and is not used. "Exercise is medicine for the joint" is an approved course framing tagged (C05, Established), not a new claim.

Claims that are a mismatch or not found in the register are cut, except C02
(kept by Randy as labelled clinical guidance) and C17 (kept only as Randy
Bauer, PT's labelled clinical guidance). C09 is cut everywhere.

C18 (joint fluid and cartilage nutrition) was confirmed by Randy on 2026-11-02
and re-sourced by A1 to lab and modelling studies. It is graded
Unproven-Bridge: every use says "lab studies on cartilage samples suggest" for
the movement part. Randy frames it as part of joint metabolic health, so a
C18 passage may add "this fluid exchange is part of how the joint's
metabolism works", but nothing stronger. The "brittle" sponge claim stays
dropped, and Gilbert 2021 is never cited for it.

Quoted source text below sometimes contains words that are banned in this
workstream ("unlocking", "gated", "safe signal"). They appear only inside the
"As written" lines, as the thing being removed.

## Standing rules (apply everywhere, not only to the lines listed)

### R1. Rebuild: bound it

Exercise has not been shown to regrow cartilage in people (C14,
Unproven-Bridge).

- **Allowed:** rebuild strength, rebuild confidence, rebuild capacity, build
  back up, rebuild your routine.
- **Not allowed about cartilage or the joint:** rebuild cartilage, rebuild the
  joint, rebuild joint surfaces, repair cartilage, regrow, biological
  rebuilding, "choose rebuilding over breakdown", "improves the physical
  integrity of the joint".
- **When the cell-level mechanism is needed**, use this pair, together:
  "Lab and animal studies suggest that cartilage cells sense everyday joint
  loading and use it to balance building and breakdown of cartilage (C03,
  Unproven-Bridge). In people, exercise that loads the knee does not appear to
  harm cartilage, but it has not been shown to regrow cartilage that has been
  lost (C14, Unproven-Bridge)."

### R2. Rest: always with the carve-out

Never say rest starves, harms or "accelerates decline" without the carve-out.
Standard carve-out sentence:

> Short rest is the right call for a hot, swollen joint, during a flare your
> clinician is managing, or when your surgical team has asked for it. The
> problem is long stretches of rest as the everyday default.

When evidence is needed: "When a leg is barely loaded for weeks, as after an
ankle fracture, knee cartilage gets measurably thinner on scans (C15,
Promising)." Never "within days".

### R3. Associations stay associations

"Protective", "prevents", "proves" and "the data proves" are removed.
Recreational runners "had lower rates of hip and knee arthritis than
non-runners in this analysis. That is a link, not proof that running protects
the joint" (C21, Promising). No relative-reduction figure ("60% less", "about a
third the rate", "66% lower") is ever printed: the raw 3.5% and 10.2% only
(C11, Promising).

### R4. Audience

"Adults aged 45–75" becomes "adults 50 and over" everywhere (decided
2026-11-01).

### R5. Authority phrases

"The latest research shows", "Research shows", "Research indicates",
"According to the latest meta-analysis" are replaced by the finding itself,
with its source beside it (randy-brand-voice language guardrails).

### R6. Medicines

Name OARSI only, never ESCEO. Medicine and injection copy closes with "talk
them through with your doctor" (C12, Established).

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
- **Replace with:** "The picture has changed. Cartilage is living tissue. Cartilage has no blood supply of its own. Its nutrients reach it mainly from the fluid inside the joint, and lab studies on cartilage samples suggest that movement and loading help move that fluid into the cartilage (C18, Unproven-Bridge). Lab and animal studies suggest its
  cells sense everyday loading and use it to balance building and breakdown
  (C03, Unproven-Bridge)."
- **Why:** "completely overturned" overstates; "requires load" is stronger
  than C03 and C18 allow.

### F03. Overview, highest-leverage

- **As written:** "Reframing your belief from 'movement causes wear' to 'load
  is medicine' is the highest-leverage intervention you can make for your
  long-term mobility."
- **Replace with:** "Seeing movement as something your joint uses, rather than
  something that wears it out, is a useful first step. In one study of people
  with arthritis, fear of movement was more closely linked with how well they
  managed daily activities than their X-ray findings were (C10, Promising)."
- **Why:** unsupported superlative.

### F04. Overview, "unlocking the biological signals"

- **As written:** "By shifting this mindset, you move from a state of
  fear-avoidance to active recovery, unlocking the biological signals your
  body needs to maintain and rebuild its joint surfaces."
- **Replace with:** "As the fear eases, it gets easier to give the joint
  regular movement. In trials, exercise on land eased knee arthritis pain and
  helped people do more (C06, Established)."
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
  learn how movement may help move the fluid that nourishes cartilage (C18, Unproven-Bridge); how to rate your ache with a practical guideline many
  clinicians use (C02, Unproven-Bridge); and how to choose a type of exercise to
  try first, from the options studied in knee arthritis (C07, Promising). By
  the end you will have a plan you can start this week, and a way to adjust
  it."
- **Why:** R1, R4; "clinical safety rules" overstates a heuristic;
  mechanotransduction "to repair" breaks R1.

### F06. Overview, bridge

- **As written:** "...why our natural instinct to 'rest it' is actually the
  very thing that accelerates joint decline."
- **Replace with:** "...why resting a sore joint, the natural instinct, is
  often not the help it seems."
- **Why:** R2; "accelerates joint decline" is causal and not in the register.

### F07. Lesson 1 opening, "the latest research"

- **As written:** "However, the latest research shows that rest is often a
  counterproductive prescription."
- **Replace with:** "But long stretches of rest are often not the protection
  they seem. When a leg is barely loaded for weeks, as after an ankle fracture,
  knee cartilage gets measurably thinner on scans (C15, Promising)."
- **Why:** R2, R5.

### F08. Lesson 1: "rest is starving the joint" (required)

- **As written (text):** "Think of your cartilage like a sponge: if a sponge
  stays dry and compressed, it becomes brittle and breaks down; but if it is
  regularly pumped with water, it stays resilient and functional (Gilbert
  2021). Without this movement, the tissue is effectively starved."
- **As written (video hook):** "But as a physical therapist, I can tell you:
  resting your joint is actually like starving it."
- **Replace text with:** "Cartilage has no blood supply of its own. Its nutrients reach it mainly from the fluid inside the joint, and lab studies on cartilage samples suggest that movement and loading help move that fluid into the cartilage (C18, Unproven-Bridge). This fluid exchange is part of how the joint's metabolism works. Picture a sponge being gently squeezed and let go. Short rest is the right call for a hot,
  swollen joint, during a flare your clinician is managing, or when your
  surgical team has asked for it. The problem is long stretches of rest as the
  everyday default."
- **Replace hook with:** "We've all been told that if our joints hurt, we
  should rest them so we don't end up 'bone on bone'. As a physical therapist,
  I see it differently. A short rest has its place. Cartilage gets its nourishment from the fluid in the joint, and lab studies suggest movement helps that fluid reach it. Weeks of rest take that movement away."
- **Why:** R2. The "brittle" claim is dropped (Randy, 2026-11-02, C18).
  Gilbert 2021 is not cited for this claim (register: mismatch). The sponge is
  kept only as a picture of fluid moving, not as a claim about brittleness.

### F09. Lesson 1 video, mechanism and the AMPK sentence (required)

- **As written:** "Through a process called mechanotransduction, they convert
  the pressure of movement into chemical signals that tell the Pericellular
  Matrix (PCM) to rebuild (Jiang 2021). This isn't just about biomechanics;
  it's a metabolic event. Joint loading activates the AMPK pathway in your
  mitochondria—the same energy sensors that govern muscle health—telling your
  body to keep the cartilage matrix strong."
- **Replace with:** "Your cartilage cells, called chondrocytes, are living
  sensors. Lab and animal studies suggest they sense everyday joint loading
  through the material around them, and use it to balance building and
  breakdown of cartilage. Scientists call this mechanotransduction (C03,
  Unproven-Bridge; Gilbert 2021). Researchers have also proposed that an energy
  sensor inside these cells, called AMPK, may link joint loading to the health
  of the cell's mitochondria, its energy centres. That idea comes from lab
  research and has not been tested in people (C04, Unproven-Bridge)."
- **Why:** C04 is a hypothesis with no human data. The source places AMPK "in
  your mitochondria"; it is a sensor in the cell, so that phrase is dropped.
  Jiang 2021 is not cited for the matrix claim (register moved C03 to Gilbert
  2021). "Tell the PCM to rebuild" breaks R1. "Researchers have proposed" is
  kept on purpose: it marks the level of evidence, which the guardrails allow.

### F10. Lesson 1 video, evidence point

- **As written:** "The data proves this 'U-shaped' reality. A study of 125,810
  people found that recreational runners ... 3.5%. ... sedentary people ...
  10.2% (Alentorn-Geli 2017). Movement is protective. However, balance is key:
  'Elite' competitive volume can raise risk to 13.3%. We want that
  recreational 'sweet spot' where load acts as medicine."
- **Replace with:** "In a pooled analysis of 17 studies, 3.5% of recreational
  runners had hip or knee arthritis, compared with 10.2% of non-runners and
  13.3% of competitive runners. The study could not tell whether running
  caused the difference (C01, Promising). So it is a link, not proof. But it
  does not fit the idea that every step wears the joint down."
- **Why:** R3. "The data proves" is a banned phrase. "Sweet spot" and
  "competitive volume raises risk" go beyond C01 (the competitive figure was
  not statistically different either). "Movement is good" stays as Randy's
  message, carried by the link, not by a claim of protection.

### F11. "Movers have 60% less arthritis than sitters" (required)

- **As written (Asset 3, question 1):** "(If Yes, re-read Lesson 1: movers
  have 60% less arthritis than sitters)."
- **Replace with:** "(If yes, start with Lesson 1. In one pooled analysis,
  3.5% of recreational runners had hip or knee arthritis, compared with 10.2%
  of non-runners. This is a link, not proof that running prevents arthritis.)"
  (C11, Promising)
- **Why:** Randy's decision 2026-11-02: no "60% less", raw figures only, as an
  association. "Movers" and "sitters" also widened runners to everyone.

### F12. Lesson 1 short step, clinical cue

- **As written:** "...to ensure the joint is loading evenly."
- **Replace with:** "...to help spread the load evenly through the joint."
- **Why:** "ensure" overpromises.

### F13. Lesson 1 close

- **As written:** "Every repetition is a vital nutrient delivery to your
  joints; you are retraining your body to choose rebuilding over breakdown."
- **Replace with:** "Lab studies on cartilage samples suggest that movement helps move joint fluid into cartilage (C18, Unproven-Bridge). Small, regular doses are how confidence and capacity
  build."
- **Why:** R1.

### F14. Lesson 2, "Acceptable Pain Rule" (required)

- **As written (title):** "Lesson 2: The Acceptable Pain Rule"
- **As written (text):** "In reality, your brain often creates a 'protective
  reflex'—an alarm that goes off way before any actual harm occurs. To rebuild
  a joint, we must apply the 'Acceptable Pain Rule.' This framework allows you
  to distinguish between a productive 'loading signal' and an actual injury."
- **Replace title with:** "Lesson 2: The acceptable pain guide"
- **Replace text with:** "Pain is your body's alarm system. With arthritis, a
  moderate ache during exercise does not by itself mean the joint is being
  damaged (C23, Promising). To help people keep moving without guessing,
  many clinicians use a practical guideline, which we call the acceptable pain
  guide. It is clinical guidance, not a tested safety limit, and on its own it
  cannot tell an ache from an injury (C02, Unproven-Bridge). What it does is
  help you judge whether a dose of activity was one your joint recovered from."
- **Why:** labelled as clinical guidance (Randy, 2026-11-02). "Way before any
  actual harm" as a rule is not supported, and copy never says pain cannot signal harm (C23); "to rebuild a joint" breaks R1. Full
  wording in `pain-rule-wording.md`.

### F15. Lesson 2, the OARSI sentence

- **As written:** "Clinical guidelines from OARSI now rank structured exercise
  as a 'Core Treatment,' placing it above NSAIDs, injections, and opioids
  (Bannuru 2019). Exercise is not just a way to mask pain; it is a biological
  intervention that improves the physical integrity of the joint."
- **Replace with:** "International guidelines from OARSI (the Osteoarthritis
  Research Society International, 2019) list arthritis education and
  structured exercise as core treatments for knee and hip osteoarthritis,
  recommended for essentially everyone with the condition (C05, Established).
  In trials, exercise eased knee arthritis pain and helped people do more
  (C06, Established)."
- **Why:** the guideline does not use the word "above" (C05). "Improves the
  physical integrity of the joint" breaks R1.

### F16. Lesson 2 video, reframe

- **As written:** "On a scale of 0 to 10, any ache up to a 5/10 is generally
  considered a 'safe' signal (Gilbert 2021). I know that feeling pain while
  moving is scary, but we are gently retraining your nervous system to lower
  that protective reflex. Think of that mild ache as the sound of your joint
  getting fed and stimulated to rebuild."
- **Replace with:** "We use what I call the acceptable pain guide. On a scale
  of 0 to 10, many clinicians treat an ache that stays at about 5 or below as
  acceptable during exercise, as long as it settles within 24 hours. That's
  clinical guidance, not a tested safety limit (C02, Unproven-Bridge). I know
  that feeling pain while you move is unsettling. In one study of people with
  knee or hip pain, the small rise in pain after each session shrank over 8
  weeks (C02, Unproven-Bridge)."
- **Why:** "safe" overpromises; Gilbert 2021 does not support the rule; "fed
  and stimulated to rebuild" breaks R1; "retraining your nervous system" is an
  unsourced mechanism.

### F17. Lesson 2 video, Fransen evidence point

- **As written:** "Following this rule leads to real results. Research shows
  that land-based exercise reduces pain by 12 points and improves function by
  10 points on a 100-point scale (Fransen 2015). These improvements are often
  more durable and significantly safer than relying on long-term medication."
- **Replace with:** "A Cochrane review of 54 trials found that exercise on land
  reduced knee arthritis pain by about 12 points and improved function by about
  10 points on a 0 to 100 scale, right after the programme. Smaller benefits,
  about 6 points for pain and 3 for function, were still there 2 to 6 months
  later (C06, Established). Exercise is medicine for the joint (C05, Established)."
- **Why:** the trials did not test the 5 out of 10 guideline, so "following
  this rule leads to" is removed. The 12 and 10 points are immediate, not
  lasting. "More durable and significantly safer" is not supported. C20 is retired (Randy, 2026-11-02); its place is taken by the framing line "Exercise is medicine for the joint", which rests on C05. C27 is not added here: a Lesson 2 pain segment is not the place for the metabolic link (see F38). R5.

### F18. Lesson 2 video, action

- **As written:** "...you've found your perfect 'loading dose.'"
- **Replace with:** "...that was a dose your joint recovered from. That's your
  starting point."

### F19. Lesson 2 close

- **As written:** "...by respecting the 5/10 rule, you are teaching your joints
  and your brain that movement is safe again."
- **Replace with:** "Each session that settles within the guide is useful
  information: this amount of movement is one your joint can recover from."

### F20. Lesson 3, muscles as shock absorbers

- **As written:** "...these muscles act as shock absorbers, redistributing the
  load away from the cartilage and onto the 'metabolic engine' of the muscle
  (Wei 2024)."
- **As written (video):** "When you strengthen your quads, you create a
  muscular 'brace' that offloads the cartilage. ... for those biological
  changes to take hold."
- **Replace with:** cut the sentence. Lesson 3 moves straight from "the best
  exercise is the one you will actually do" to the options studied (F21).
- **Replace video lines with:** "Consistency matters more than the exact
  choice. Pick something you enjoy, so you keep doing it long enough for the
  benefits to build."
- **Why:** C09 is a mismatch (Wei 2024 does not measure load redistribution)
  and its re-sourced PMID may not be cited. Rule: cut mismatch claims.

### F21. Lesson 3, the Mo 2023 ranking

- **As written:** "We can be precise here. According to the latest
  meta-analysis (Mo 2023), if your main problem is sharp pain, cycling and
  aquatic exercise are most effective. If your biggest hurdle is stiffness,
  yoga provides the most relief. If you need general symptom control and better
  function, resistance training is your best bet."
- **Replace with:** "One analysis of 39 trials in knee arthritis (Mo 2023)
  found that all five types of exercise it studied helped. Cycling ranked
  highest for one pain score and for walking distance, exercise in water for
  another pain score, yoga for stiffness and daily function, and resistance
  training for overall symptoms. These rankings are options studied, not proof
  that one type is best for you (C07, Promising). The type you will keep doing
  matters most."
- **Why:** a network ranking is not "most effective"; "sharp pain" is not an
  outcome in the paper; knee only. R5.

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
  getting strength back in the leg is a big part of recovery. A review of 14
  trials, covering 880 people after knee replacement, found that resistance
  exercise for the legs (exercise against a weight, band or machine) led to
  somewhat better walking speed, a slightly faster sit-stand-walk test (about
  1 second), more leg strength and a little more knee bend (about 3 degrees)
  than standard exercise, measured right after the programme. The overall
  quality of the evidence was low (C08, Promising; Wei 2024). Your surgical
  team decides when and how this fits your recovery."
- **Why:** usual care was standard exercise, not "passive" rehab; "superior",
  "6 out of 9 major" and "regain independence faster" overstate.

### F25. Results table

- **As written:** columns "Conventional Rehab (CE)" with "Standard recovery",
  "Slower return to agility", "Persistent weakness", "Moderate relief",
  "Limited by stiffness"; and "Active Resistance (ARE) Advantage" with
  "Significantly faster (MD +0.13)", "Nearly 1-second faster mobility",
  "Greater strength", "Significant reduction in pain scores", "+2.74°".
- **Replace with:** two columns, "What was measured" and "Resistance exercise
  compared with standard exercise, right after the programme (C08,
  Promising)". Rows:
  - Walking speed (fastest pace): somewhat faster
  - Sit-stand-walk test: about 1 second faster
  - Leg strength (straightening and bending the knee): stronger
  - Knee bend: about 3 degrees more
  - Six-minute walk, stair climbing, straightening the knee: no clear
    difference
  - Footnote: "Low-quality evidence; the effects were small and measured only
    right after the programme."
- **Why:** remove the conventional rehab column (it characterised usual care
  without data). Do not print a unit for walking speed (the paper does not
  state one). The pain row is removed: the pain scale is not stated and
  "significant reduction" overstates.

### F26. Table footnote

- **As written:** "Source: Wei 2024. Active resistance is the evidence-based
  default for maximizing surgical outcomes."
- **Replace with:** "Source: Wei 2024 (C08, Promising). One review of trials.
  Ask your surgical team how resistance exercise fits your recovery."

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
  cartilage" are not in the register.

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
- **Decision on 50%:** kept as "cut back to about half", labelled "This is
  Randy Bauer, PT's clinical guidance, not a research-tested rule" (C17,
  Unproven-Bridge; no source found). Approved by Randy 2026-11-02.
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
- **Replace with:** "The OARSI guidelines list structured exercise as a core
  treatment for knee and hip osteoarthritis (C05, Established), and it is not
  yet part of your plan. The sit-to-stand short step in Lesson 2 is an easy
  place to begin."

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
- **Replace with:** "Osteoarthritis affects the whole joint, not just the cartilage. The bone under the cartilage, the joint lining, ligaments and, in the knee, the menisci can all change (C26, Established). Cartilage has no blood supply of its own. Its nutrients reach it mainly from the fluid inside the joint, and lab studies on cartilage samples suggest that movement and loading help move that fluid into the cartilage (C18, Unproven-Bridge)."
- **Why:** "refutes" overstates; "metabolic and inflammatory disease" is replaced by the graded whole-joint wording (C26).

### F35. "Movement is a nutrient" and "within days"

- **As written:** "Immobilization starves cartilage." and "Immobilization
  effectively starves the tissue, tipping the signaling balance toward a
  catabolic state within days." and "Chondrocyte nutrition and waste clearance
  are entirely dependent on the mechanical circulation of synovial fluid."
- **Replace with:** "When a leg is barely loaded for weeks, as after an ankle
  fracture, knee cartilage gets measurably thinner on scans. Long-term loss of
  loading, as after spinal cord injury, is linked with steady thinning over
  months (C15, Promising)." Followed by the R2 carve-out.
- **Why:** R2; "within days" has no human data; "entirely dependent" is not in
  the register.

### F36. Running myth rebuttal, population table, FAQ "running is protective"

- **As written:** "moderate loading is protective"; "Protective effect; ~1/3
  the risk of sedentary individuals."; "Sedentarism is a significant risk
  factor for OA."; FAQ: "No, for recreational doses, running is protective.
  Recreational runners have roughly one-third the rate of arthritis compared to
  sedentary people. Only elite-level volume increases risk."
- **Replace table notes with:** "Lowest rate in this analysis"; "Higher rate
  than recreational runners in this analysis"; "Highest rate in this analysis"
  (C01, Promising). Add under the table: "The study could not tell whether
  running caused the difference."
- **Replace FAQ answer with:** "Not for most people who run for fun, based on
  what we know so far. Recreational runners had lower rates of hip and knee
  arthritis than non-runners in one pooled analysis: 3.5% compared with 10.2%.
  That is a link, not proof that running protects the joint (C21, Promising).
  If running is part of your life, the acceptable pain guide can help you judge
  your dose."
- **Why:** R3. "Roughly one-third" is a relative figure (C11: raw figures
  only). "Only elite-level volume increases risk" goes beyond C01.

### F37. Guideline table

- **As written:** "explicitly above opioids and acetaminophen"; the tier table,
  including OARSI/ESCEO labels.
- **Replace with:** in reader copy, one passage: "OARSI guidelines (2019)
  strongly recommend topical anti-inflammatory gels for knee arthritis,
  conditionally advise against acetaminophen (paracetamol), and strongly advise
  against opioids. Other medicines and joint injections depend on the joint and
  on your other health conditions, so talk them through with your doctor (C12,
  Established)." Drop ESCEO. If the table is kept for clinicians, correct it
  from the register notes on C12 (injections are not recommended for hip).

### F38. Mitochondrial mechanotransduction and "Mitochondrial Crisis"

- **As written:** "Mitochondrial dysfunction in chondrocytes is a primary
  driver of OA pathogenesis."; "Consequently, joint health is increasingly viewed through a metabolic lens rather than a purely orthopedic one."; and the pattern name "Mitochondrial Crisis".
- **Replace with:** "Scientists have found signs of poorly working
  mitochondria (the cell's energy centres) in cartilage cells from arthritic
  joints, and they are studying whether this helps drive the disease (C16,
  Unproven-Bridge)." Then the AMPK lines from F09 (C04, Unproven-Bridge). Replace the "metabolic lens" sentence with C27, as Randy accepted it: "Joint health and metabolic health are linked. People with osteoarthritis more often also have high cholesterol, and the link shows up in the hands as well as the knees. Because hands do not carry body weight, researchers think whole-body factors such as low-grade inflammation may play a part, not just extra load. This is still being studied, and these studies show links, not proof that one causes the other (C27, Promising)." Rename the pattern "Mitochondrial signal (early research)".
- **C27 limits:** never say or imply that diabetes, blood sugar or cholesterol causes osteoarthritis; that improving metabolic health treats, protects, slows or reverses it; that "metabolic osteoarthritis" is a diagnosis; or that any diet, supplement or medicine affects the joint.
- **Why:** "primary driver" is never used (C16); "crisis" is reserved for real
  acute conditions (language guardrails).

### F39. Population profiles

- **As written:** "Maintainers (Active Adults 45–75)"; "which accelerates
  deconditioning and cartilage starvation".
- **Replace with:** "Maintainers (active adults 50 and over)"; "Avoiding
  activity is linked with weaker muscles and more difficulty with daily tasks
  (C10, Promising)."

### F40. "Clinical outcomes are gated by the patient's belief system"

- **As written:** "Clinical outcomes are gated by the patient's belief system.
  Fear-avoidance predicts disability more accurately than radiographic
  (X-ray/MRI) severity. Clinicians must explain that cartilage is a living
  tissue that requires load to survive before prescribing exercise."
- **Replace with:** "What a person believes about their joint shapes what they
  are willing to do. In one study of people with arthritis, fear of movement
  was more closely linked with how well they managed daily activities than
  their X-ray findings were (C10, Promising). So the explanation comes before
  the exercise plan: cartilage is living tissue. Cartilage has no blood supply of its own. Its nutrients reach it mainly from the fluid inside the joint, and lab studies on cartilage samples suggest that movement and loading help move that fluid into the cartilage (C18, Unproven-Bridge)."
- **Why:** "gated" is on the 7.3 list. "Predicts" becomes "linked with"
  (cross-sectional study); MRI was not studied. "Requires load to survive"
  overstates.

### F41. Acceptable pain rule in the framework

- **As written:** "If these conditions are met, the activity is safe and does
  not signal joint damage."
- **Replace with:** "If both are met, the dose is generally acceptable to
  continue and build on. This is clinical guidance, not a tested safety limit
  (C02, Unproven-Bridge)."

### F42. Nutrition substrates and GLP-1

- **As written:** "Nutrition provides the substrates (protein, Vitamin C) for
  matrix repair; weight management lowers systemic inflammation." and the
  GLP-1 profile.
- **Nutrition:** do not use. C19 is held by Randy for the first release. The
  "systemic inflammation" part is not sourced (C22 notes).
- **GLP-1, replace with:** "GLP-1 weight-loss medicines lead to some loss of
  muscle along with fat. In older adults losing weight by diet, strength
  training and more protein helped keep more muscle. Those studies were not
  done in people taking GLP-1 medicines, so the benefit there is likely but not
  yet proven (C13, Promising)."

### F43. FAQ "Why does my joint feel better when I move it?"

- **As written:** "Movement circulates synovial fluid, which is the only way
  your cartilage gets nutrients and clears out metabolic waste. Movement is
  'feeding' the joint."
- **Replace with:** "Cartilage has no blood supply of its own. Its nutrients reach it mainly from the fluid inside the joint (synovial fluid), and lab studies on cartilage samples suggest that movement and loading help move that fluid into the cartilage (C18, Unproven-Bridge). That fluid exchange is part of how the joint's metabolism works."
- **Why:** "the only way" is absolute. A second sentence about stiffness
  easing was cut: it has no register row.

### F44. FAQ "Should I take ibuprofen or acetaminophen instead of exercising?"

- **As written:** "...Exercise has moderate, durable effects on pain and
  function with fewer side effects than long-term medication use."
- **Replace with:** "It doesn't have to be one or the other. OARSI guidelines
  list exercise as a core treatment for knee and hip osteoarthritis (C05,
  Established). Exercise is medicine for the joint (C05, Established). Medicines depend on the joint and on your
  other health conditions, so talk them through with your doctor (C12,
  Established)."

### F45. FAQ "I've had a knee replacement; surely I should rest it?"

- **As written:** "Evidence shows that patients who perform active resistance
  exercises after a knee replacement recover walking speed, strength, and range
  of motion faster than those who stick to conventional, passive rehab."
- **Replace with:** "Rest has a place in the early days, and your surgical
  team's plan comes first. After that, a review of 14 trials found that
  resistance exercise for the legs led to somewhat better walking speed, more
  leg strength and a little more knee bend than standard exercise, though the
  evidence was low quality (C08, Promising). Ask your team when resistance work
  fits your recovery."

### F46. FAQ "What is the best exercise for my arthritis?"

- **As written:** "Cycling, walking, yoga, and swimming all show benefits."
- **Replace with:** "In one analysis of trials in knee arthritis, all five
  types of exercise studied helped, including cycling, water exercise and yoga
  (C07, Promising). The best one is the one you will keep doing."

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
    time. Cartilage is different from rubber: it is living tissue. Cartilage has no blood supply of its own. Its nutrients reach it mainly from the fluid inside the joint, and lab studies on cartilage samples suggest that movement and loading help move that fluid into the cartilage (C18, Unproven-Bridge). A short rest is right for a hot,
    swollen joint or after surgery. The problem is long stretches of rest as
    the everyday default."
  - Stat box: "3.5% compared with 10.2%. In one pooled analysis, that was the
    share of recreational runners and of non-runners with hip or knee
    arthritis. A link, not proof." (C11, Promising)
- **Why:** "single most damaging myth" is an unsupported superlative; "starves
  the cells" breaks R2; "roughly a third" is a relative figure (R3).

### F48. Belief answer C

- **As written:** "Cartilage requires physiological mechanical stress to
  signal cells to rebuild and maintain joint structure."
- **Replace with:** "Movement helps move the joint fluid that nourishes my cartilage." (C18, Unproven-Bridge)

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
  `post-surgery-caveat.md`. The GLP-1 flag uses F42. The walking and running
  card becomes: "Recreational runners had lower rates of hip and knee
  arthritis than non-runners in one analysis. That is a link, not proof (C21,
  Promising). Build back gradually using the acceptable pain guide, especially
  after a break."
- **Brand:** "Muscle-Meta™ real-time reframe" becomes "Muscle-Meta Matrix™
  reframe".

## Claims that had no register row (now resolved)

| Tag | Claim | Where used | What happens |
|---|---|---|---|
| UNREGISTERED-1 | Movement and strength work are often part of care for inflammatory arthritis | `inflammatory-arthritis-note.md` | Sourced 2026-11-02 as C25 (Established) |
| UNREGISTERED-2 | Osteoarthritis affects the whole joint, not only cartilage | F34 | Sourced 2026-11-02 as C26 (Established) |

## Mapping from the first draft

For anyone comparing with the earlier commit: CLAIM-NEW-1 became C18,
CLAIM-NEW-2 became C15 (with C10 for the muscle part), CLAIM-NEW-3 became C23,
CLAIM-NEW-5 became C14, CLAIM-NEW-4 became UNREGISTERED-1 and then C25, and CLAIM-NEW-6 became UNREGISTERED-2 and then C26.
