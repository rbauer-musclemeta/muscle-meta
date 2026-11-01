# Draft: privacy page changes

Status: draft for review. Not legal advice. Written by agent A10, who is not a
lawyer. This text must be reviewed by Randy and by counsel before any of it is
used on `site/legal/privacy/`. Nothing here is live.

Target page: `site/legal/privacy/index.html` (currently a placeholder that says
it must be written before any email address is collected).

Every item marked **to confirm** is listed again, with its ID, in
`review-notes.md`.

---

## 1. Proposed change

Replace the placeholder card with the page text below. Headings are sentence
case. When the page is built, keep it on the shared tokens in
`site/assets/mm.css` and drop the literal colour value the current placeholder
card uses (see `review-notes.md`, finding F1).

### Proposed page text

#### Privacy

Last updated: [date of publication, to confirm] (TC-P01)

This page explains what muscle-meta.com collects, why, where it is kept, who
else handles it, and how to ask for it to be deleted. The site is run by
[legal business name, to confirm] (TC-P02), [business address, to confirm]
(TC-P03). Questions about privacy go to [privacy contact email, to confirm]
(TC-P04).

The site is meant for adults. It is not directed at anyone under
[minimum age, to confirm: 18 proposed] (TC-P05).

#### The short version

- The free joint-load check keeps your answers in your browser, on your device.
  They are not sent to us, to our email provider or to our payment provider.
- If you ask for a free download by email, we send your email address to our
  email provider, Kit, and Kit records which download you asked for and which
  form you used. You confirm your address before anything else is sent.
- If you buy a course, Stripe handles the payment. Stripe receives your name,
  email and billing details. It never receives any health information.
- If you make an account, we store your account, the courses you bought
  and your progress through them.
- You can ask us to delete your information at any time.

#### The free joint-load check

What it asks: questions about joint symptoms, safety warning signs, how you feel
about movement and how much load you currently do. These answers can be
health-related.

Where the answers go: they stay in your browser on the device you are using.
They are not sent to muscle-meta.com servers, to Kit, to Stripe or to any
analytics service. The check does not create an account and does not need your
email address.

How long they stay: [to confirm against A3's final build] (TC-P06). Proposed
wording if the check stores nothing after the page closes: "Your answers are
cleared when you close or reload the page." Proposed wording if the check saves
answers on the device: "Your answers are saved in this browser so you can come
back to them. They stay on this device until you clear them."

How to clear them: use the "Clear my answers" button on the check, if the final
build has one (TC-P07), or clear this site's data in your browser settings (in
most browsers: settings, privacy, site data, then remove muscle-meta.com).

The safety questions: if you answer yes to a safety question, the check stops
and suggests you speak with a clinician. That answer also stays in your browser.
The safety questions are those in [A2-red-flag-screen].

#### Email and free downloads (Kit)

We use Kit (kit.com) to send email.

What Kit receives from us: your email address, sent when you submit a download
form.

What Kit records about that sign-up: which form you used (the form source) and
a short tag naming the download you asked for. Kit may also record technical
details of the sign-up itself, such as the time and the network address it came
from [to confirm against Kit's current privacy terms] (TC-P08).

What Kit never receives from us: your answers to the joint-load check, any
symptom, condition or health answer, and any payment information.

Confirmation: after you sign up, Kit sends an email asking you to confirm your
address (double opt-in). Nothing else is sent until you confirm.

What we send: the download you asked for, and [description of follow-up emails,
to confirm: for example a short welcome series and occasional articles]
(TC-P09). Every email has an unsubscribe link.

Kit's own handling of your data is set out in Kit's privacy policy [link, to
confirm] (TC-P10).

#### Payments (Stripe)

We use Stripe to take payment for courses.

What Stripe receives: your name, email address, card or other payment details,
and billing address. Stripe holds these. We do not see or store your full card
number.

What we receive back from Stripe: a confirmation that the payment went through,
the product bought, the amount, and the email address used, so we can give you
access to the course.

What Stripe never receives: any health information, any answer from the
joint-load check, or any course progress.

Stripe's own handling of your data is set out in Stripe's privacy policy [link,
to confirm] (TC-P11).

#### Your account, purchases and course progress

If you sign in to the member area at muscle-meta.com/app/, we keep:

- Account details: your email address and [sign-in method, to confirm: email
  link, and Google sign-in if it is enabled] (TC-P12).
- Access records: which courses or products you bought and when access
  started [and ends, if a fixed term applies] (TC-P13).
- Course progress: which lessons you opened or completed, and any notes or
  tracker entries you choose to save in the member area [scope to confirm against
  the course build, A8] (TC-P14).

Where it is kept: with our database provider, Supabase, [hosting region, to
confirm: United States is stated on the current placeholder] (TC-P15). Access to
each record is restricted so that you can see only your own information.

Lesson videos are kept in private storage and reached only through short-lived
links issued to people with access to the course.

#### Cookies and similar storage

- The member area uses a sign-in cookie on muscle-meta.com to keep you signed in.
- The free check uses browser storage only as described above.
- Analytics: [to confirm whether any analytics or tracking service is used on
  the site; none was found in the site code on 2026-11-01] (TC-P16). If one is
  added, it must never receive health answers.

#### Hosting

The site is hosted by Netlify. Like any web host, Netlify keeps standard server
logs (for example, the address a request came from and the page requested) for
security and operation [retention to confirm] (TC-P17).

#### How long we keep information

- Email sign-ups in Kit: until you unsubscribe or ask for deletion
  [to confirm] (TC-P18).
- Account, access and progress records: while your account is open, and
  [period, to confirm] after you close it (TC-P19).
- Payment records: as long as tax and accounting rules require
  [period, to confirm] (TC-P20).

#### Asking for your information to be deleted

[Placeholder: deletion process to confirm by Randy] (TC-P21). Proposed: email
[privacy contact email] from the address you used, saying what you want deleted.
We will confirm the request and delete your account, access and progress
records, and remove you from Kit, within [number, to confirm] days (TC-P22).
Some payment records may need to be kept for tax law; if so, we will say which.

You can also unsubscribe from email at any time with the link in any email, and
clear the free check's answers yourself as described above.

#### Your rights

[To confirm with counsel which privacy laws apply and what rights wording is
needed, for example for visitors in particular US states, the UK or the EU]
(TC-P23).

#### Changes to this page

If we change how we handle information, we will update this page and the date
at the top.

#### Medical disclaimer

Muscle-Meta Matrix&trade; is educational. It does not provide medical advice,
diagnosis or treatment. See the [medical disclaimer](/legal/medical-disclaimer/).

---

## 2. Reasons

- The current page is a placeholder that says it must be written before any
  email address is collected. The free downloads (A4) will collect email through
  Kit, so this page is a dependency for G2, not only for payment.
- PLAN.md D1 and D6, confirmed at G0: the free check keeps answers in the
  browser, only email and download tag (plus form source) reach Kit, and no
  health answers reach Kit or Stripe. The page states those limits plainly so
  they can be checked against the build.
- D8, confirmed at G0: double opt-in in Kit.
- `docs/matrixapp.md`, "Selling (M4, Stripe)": Stripe sells, the database grants;
  health data never goes to Stripe.
- `site/assets/mm.js` `capture()` sends only `email_address` to the Kit form
  endpoint. The tag is applied by the Kit form itself, not sent from the page.
  The text above matches that.
- `docs/legal-requirements.md`: the page must say what is collected, where it
  lives, who else sees it and how to delete it.
- No outcome, guarantee or clinical benefit is promised anywhere in the text.

## 3. Items for Randy or counsel to confirm

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
