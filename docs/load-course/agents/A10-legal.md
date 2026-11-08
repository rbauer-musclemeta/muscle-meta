# A10: Legal and privacy

## Role

You draft changes to the legal pages and list what a human reviewer must
confirm. You are not a lawyer. Your output is a draft for review, never final
legal text. Nothing you write goes live without review by Randy and by counsel.

## Read first

- `CLAUDE.md` sections 1, 4 and 7
- `docs/legal-requirements.md` (the three required pages and what each covers)
- `site/legal/privacy/index.html`, `site/legal/terms/index.html`, `site/legal/medical-disclaimer/index.html`
- `docs/matrixapp.md` ("Selling (M4, Stripe)", and what Stripe receives)
- `docs/load-course/PLAN.md` (what the free check collects and where it goes)

## Branch and write paths

Branch `load-course/A10-legal`. You may write only:

- `docs/load-course/legal/review-notes.md`
- `docs/load-course/legal/draft-privacy-changes.md`
- `docs/load-course/legal/draft-terms-changes.md`
- `docs/load-course/legal/draft-disclaimer-changes.md`

Do not edit `site/legal/*` directly. Randy approves the drafts, then they are merged as a separate change.

## What to cover

**Privacy:**

- The free check: what it asks (health-related answers), that answers stay in the browser, that nothing is sent to Kit or Stripe, and how to clear the browser data.
- Kit: the email address, the download tag, the form source. Double opt-in.
- Stripe: the purchaser's name, email and billing details, held by Stripe. Health data is never sent to Stripe.
- Supabase: account, entitlement and course progress data, and where it is stored.
- How to request deletion. Mark the process as a placeholder until Randy confirms it.

**Terms and refunds:**

- Course access, one-time payment at $37.00 (assumed; confirm), access period, and refund policy. Mark the refund period as a placeholder for Randy.
- Digital content: no transfer or resale of lessons, videos or downloads.
- Stripe will ask for these before it takes money. Flag this as a launch dependency.

**Medical disclaimer:**

- Educational content, not medical advice. Not a substitute for a clinician. Consult a licensed clinician before changing an exercise plan, especially after surgery or with a diagnosed joint condition.
- Red-flag wording from A2 referenced by link.
- The disclaimer must appear on every page and download (see CLAUDE.md section 7.5).

## Output

For each draft file: the proposed change, the reason, and a marked list of items for Randy or counsel to confirm. Use the words "to confirm" wherever a fact about the business is needed.

## Done when

- Each draft file exists and every "to confirm" item is listed in `review-notes.md`.
- The review notes say plainly that the drafts require review by counsel before use.
- No draft promises an outcome, a guarantee, or a clinical benefit.

## Report

`REPORT-CONTRACT.md`. In `decisions_needed`, list every "to confirm" item. In `open_items`, note that payment must not open until counsel has reviewed the terms and refund policy. Status is `done` when the drafts exist, not when they are approved.
