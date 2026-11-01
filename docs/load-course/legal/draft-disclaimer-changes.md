# Draft: medical disclaimer changes

Status: draft for review. Not legal advice. Written by agent A10, who is not a
lawyer. This text must be reviewed by Randy and by counsel before any of it is
used on `site/legal/medical-disclaimer/`. Nothing here is live.

Target page: `site/legal/medical-disclaimer/index.html`. It already has sound
starting wording, written by an agent, with a card asking for review before
launch. This draft keeps that wording and adds what the joint-health course
needs.

A2 owns the course disclaimer text (`disclaimer.md`) and the red-flag questions.
A2's work is not merged yet, so the red-flag wording is referenced here by the
placeholder `[A2-red-flag-screen]`. When A2 merges, the two texts must be
reconciled so the site has one disclaimer, not two that differ (TC-D05).

Every item marked **to confirm** is listed again, with its ID, in
`review-notes.md`.

---

## 1. Proposed change

### 1a. The legal page

Keep the existing three paragraphs (lede, "estimate, not measure", "talk with
your physician"). Add the sections below after them. Remove the review card only
when counsel has reviewed the page, and when it is rebuilt drop the literal
colour value that card uses (see `review-notes.md`, finding F1).

#### Proposed added text

##### Joint pain, arthritis and joint replacement

The joint-health material on this site, including the Load as Medicine course,
the free joint-load check and the related downloads, is educational. It is not a
substitute for a clinician who can examine you.

Speak with a licensed clinician, such as your physician, surgeon or physical
therapist, before you change your exercise plan, and especially:

- after any joint surgery, including a joint replacement, and before you go
  beyond the activity your surgical team has cleared;
- if a clinician has diagnosed a joint condition, including inflammatory
  arthritis;
- if you are unsure whether an exercise is right for you.

##### When to stop and get help

Stop and contact a clinician, without waiting to finish a lesson or a check, if
you notice any of the warning signs listed in [A2-red-flag-screen]. Link target:
the red-flag section of this page, or A2's published red-flag list, once merged
(TC-D01).

If a sign seems severe or sudden, or there is chest pain, trouble breathing, or
calf pain and swelling after surgery, seek urgent care or call your local
emergency number [emergency wording to confirm with the clinical reviewer]
(TC-D02).

##### About the free joint-load check

The check asks about safety warning signs first. If you answer yes to any of
them, it stops and suggests you speak with a clinician. The check does not
diagnose anything and does not give a risk score. It offers a plain reading of
your answers and one next step for you to discuss with your clinician if you
wish.

##### Pain during exercise

The course explains a way of using pain as a guide during exercise. That
guidance is educational and general. It does not replace advice from a
clinician who knows your history.

##### Who wrote this material

The material is written by Randy Bauer, PT [licence details to publish, to
confirm] (TC-D03). Reading it or taking the course does not make you a patient
of Randy Bauer or of any practice.

##### Research and evidence

Research notes on this site describe what studies found. Where a study found an
association, we say so; it does not mean the same result will happen for you.

### 1b. Where the disclaimer appears

CLAUDE.md section 7.5 and PLAN.md section 4 require the disclaimer on every
page and download, not only in the course. Proposed rule for A3, A4, A5, A6 and
A8:

- Every page in this workstream (free check, downloads, blog posts, sales page,
  category page, each lesson) ends with a short disclaimer block and a link to
  `/legal/medical-disclaimer/`.
- The free check shows it both at the foot of the page and with the results.
- Every PDF download carries it on the last page, and a one-line version in the
  footer of each page [one-line wording to confirm] (TC-D04).
- Email sequences carry a one-line version in each email footer.

Proposed short block (for pages and downloads; final wording comes from A2's
`disclaimer.md`, reconciled with this page, TC-D05):

> Educational only. This is not medical advice, diagnosis or treatment, and it
> is not a substitute for a licensed clinician. Speak with your clinician before
> changing your exercise plan, especially after surgery or if a clinician has
> diagnosed a joint condition. Stop and get help if you notice any warning
> sign in our [medical disclaimer](/legal/medical-disclaimer/).

### 1c. Indexing

The medical disclaimer page is currently indexable, while privacy and terms are
`noindex`. Keeping it indexable seems right for a health site, since it carries
the credential and the safety wording [to confirm] (TC-D06).

---

## 2. Reasons

- The A10 spec requires: educational, not medical advice, not a substitute for a
  clinician, consult before changing an exercise plan especially after surgery
  or with a diagnosed joint condition, red-flag wording referenced by link, and
  the disclaimer on every page and download.
- PLAN.md D7, confirmed at G0: "An educational course, not treatment."
- PLAN.md D1, confirmed at G0: no composite score for users. The page says the
  check gives no risk score.
- CLAUDE.md 7.3 and 7.4: no diagnosis language, and associations stay
  associations. The wording avoids diagnosis phrasing, and the
  research section says associations are not promises.
- No outcome, guarantee or clinical benefit is promised.

## 3. Items for Randy or counsel to confirm

| ID | Item | Who |
|---|---|---|
| TC-D01 | Link target for the red-flag list once A2 merges | Randy, after A2 |
| TC-D02 | Urgent-care and emergency wording | Clinical reviewer (Randy Bauer, PT) and counsel |
| TC-D03 | Licence details to publish (state, licence type and number, or none) | Randy |
| TC-D04 | One-line disclaimer for PDF page footers and email footers | Randy and counsel |
| TC-D05 | Reconcile this page with A2's `disclaimer.md` into one approved text | Randy, after A2 |
| TC-D06 | Keep the medical disclaimer page indexable | Randy |
