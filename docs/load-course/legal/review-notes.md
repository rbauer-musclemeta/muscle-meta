# Legal review notes: Load as Medicine

Agent: A10. Date: 2026-11-01. Branch: `load-course/A10-legal`.

## Read this first

**These drafts require review by counsel before use.** A10 is an agent, not a
lawyer, and nothing in this folder is legal advice. The drafts are a starting
point for Randy and counsel. None of them is live, and none of them changes
`site/legal/*`. After Randy and counsel approve the text, it is applied to the
legal pages as a separate change.

**Payment must not open until counsel has reviewed the terms and the refund
policy.** Stripe asks for published terms and a refund policy before it takes
money, so this is a launch dependency for milestone M4 and Gate G4.

**The privacy page is needed before any email is collected.** The current
privacy page is a placeholder that says so. The free downloads (A4) collect email
through Kit, so the privacy text must be approved and live before those forms go
live (G2), not only before payment.

## Files

| File | What it covers |
|---|---|
| `draft-privacy-changes.md` | Free check (answers stay in the browser), Kit (email, download tag, form source, double opt-in), Stripe (name, email, billing; no health data), account, access and course progress records, deletion (placeholder) |
| `draft-terms-changes.md` | Course purchase ($37.00 one-time, assumed), access period, refund policy (placeholder), no transfer or resale of lessons, videos or downloads, Stripe launch dependency |
| `draft-disclaimer-changes.md` | Educational only, not a substitute for a clinician, consult before changing exercise especially after surgery or with a diagnosed joint condition, red flags by link to `[A2-red-flag-screen]`, disclaimer on every page and download |

## Decisions these drafts rely on (confirmed at G0, 2026-11-01)

- D1: the free check keeps answers in the browser and shows no composite score.
- D3 and D8: Kit only, with double opt-in.
- D6: only email and the download tag (plus form source) reach Kit. No health
  answers reach Kit or Stripe.
- D7: "Load as Medicine", subtitle "An educational course, not treatment."
- Audience: adults 50 and over.
- D2 (from PLAN.md): Stripe, $37.00 one-time. Still assumed, so marked to confirm.

## Findings

- **F1.** The three current legal pages use a literal colour value and inline
  colour styles on their review cards (`site/legal/privacy/index.html`,
  `site/legal/terms/index.html`, `site/legal/medical-disclaimer/index.html`).
  That breaks the tokens-only rule in CLAUDE.md section 1. A10 did not edit
  these pages; the change that applies the approved drafts should replace the
  inline values with tokens from `site/assets/mm.css`.
- **F2.** `site/assets/mm.js` `capture()` sends only the email address to the
  Kit form endpoint. The download tag comes from the Kit form's own settings.
  This matches D6. Any change that adds fields to that request must be checked
  against the privacy text.
- **F3.** No analytics or tracking script was found in the site code on
  2026-11-01. The privacy draft says so as a to-confirm item. If analytics are
  added, the privacy page must change and no health answers may reach them.
- **F4.** The free check's storage behaviour depends on A3's final build. The
  A3 spec says to match the Oxygen Engine tool, which has no browser storage
  calls. The privacy draft offers wording for both cases.
- **F5.** Clinical reviewer (D6) is Randy Bauer, PT, so there is no separate
  second reviewer. Counsel may want to know this when reviewing the safety and
  emergency wording.
- **F6.** The drafts make no promise of an outcome, a guarantee or a clinical
  benefit. The terms state that no particular result is promised.
- **F7.** Questions counsel may want to consider, flagged without a view: whether
  any US state consumer health data law reaches course progress or tracker
  entries saved in the member area; whether HIPAA wording is needed or should be
  avoided; whether visitors outside the US need separate privacy or refund
  wording.

## Every to-confirm item

### Privacy

| ID | Item | Who |
|---|---|---|
| TC-P01 | Publication date | Randy |
| TC-P02 | Legal business name that operates the site | Randy |
| TC-P03 | Business address to publish | Randy |
| TC-P04 | Privacy contact email | Randy |
| TC-P05 | Minimum age (18 proposed) | Randy and counsel |
| TC-P06 | Whether the free check stores answers after the page closes; wording to match A3's final build | Randy, after A3 |
| TC-P07 | Whether the check has a "Clear my answers" button | Randy, after A3 |
| TC-P08 | What Kit records about a sign-up (time, network address) per Kit's current terms | Counsel |
| TC-P09 | What follow-up emails a subscriber receives (A7 sequences) | Randy |
| TC-P10 | Link to Kit's privacy policy | Randy |
| TC-P11 | Link to Stripe's privacy policy | Randy |
| TC-P12 | Sign-in methods offered (email link; Google sign-in exists in code) | Randy |
| TC-P13 | Whether course access is lifetime or a fixed term | Randy |
| TC-P14 | Exact course progress data stored (after A8) | Randy, after A8 |
| TC-P15 | Supabase hosting region | Randy |
| TC-P16 | Whether any analytics service is used | Randy |
| TC-P17 | Netlify log retention to state | Counsel |
| TC-P18 | Kit retention after unsubscribe | Randy and counsel |
| TC-P19 | Account data retention after closure | Randy and counsel |
| TC-P20 | Payment record retention | Counsel |
| TC-P21 | Deletion process (placeholder) | Randy |
| TC-P22 | Deletion response time in days | Randy and counsel |
| TC-P23 | Which privacy laws apply and the rights wording needed, including state consumer health data laws | Counsel |

### Terms and refunds

| ID | Item | Who |
|---|---|---|
| TC-T01 | Publication date | Randy |
| TC-T02 | Legal business name | Randy |
| TC-T03 | Minimum age (18 proposed) | Randy and counsel |
| TC-T04 | Price $37.00 USD, one-time (assumed) | Randy |
| TC-T05 | Sales tax or VAT handling at checkout | Randy and counsel |
| TC-T06 | Access period (lifetime or fixed term) | Randy |
| TC-T07 | What buyers get if a course is withdrawn | Randy and counsel |
| TC-T08 | Refund period (placeholder) | Randy |
| TC-T09 | Support email | Randy |
| TC-T10 | Whether refunds depend on course use | Randy |
| TC-T11 | Statutory refund or cancellation rights for buyers outside the US | Counsel |
| TC-T12 | Ending access without refund for breach | Counsel |
| TC-T13 | Owner of the intellectual property | Randy and counsel |
| TC-T14 | Limitation of liability, warranty and indemnity wording | Counsel |
| TC-T15 | Governing law, venue and dispute process | Counsel |
| TC-T16 | Whether changes to terms affect earlier purchases | Counsel |

### Medical disclaimer

| ID | Item | Who |
|---|---|---|
| TC-D01 | Link target for the red-flag list once A2 merges | Randy, after A2 |
| TC-D02 | Urgent-care and emergency wording | Clinical reviewer (Randy Bauer, PT) and counsel |
| TC-D03 | Licence details to publish (state, licence type and number, or none) | Randy |
| TC-D04 | One-line disclaimer for PDF page footers and email footers | Randy and counsel |
| TC-D05 | Reconcile the legal page with A2's `disclaimer.md` into one approved text | Randy, after A2 |
| TC-D06 | Keep the medical disclaimer page indexable | Randy |

## Next steps

1. Randy fills in the business facts (name, address, emails, price, access
   period, refund period, deletion process).
2. Counsel reviews all three drafts, with priority on the terms and refund
   policy (blocks payment) and the privacy page (blocks email capture).
3. After A2 merges, reconcile the disclaimer and replace `[A2-red-flag-screen]`.
4. After A3 and A8, confirm the storage and progress wording.
5. Apply the approved text to `site/legal/*` as a separate change, using tokens
   only.
