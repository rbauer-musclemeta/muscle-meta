# MatrixApp — the Muscle-Meta member app

MatrixApp is where members use what they bought: programs, assessments,
courses and digital products. It lives at **muscle-meta.com/app/** and is
private (never indexed).

Decided 2026-09-30. Replaces the earlier app.muscle-meta.com plan.

## How it is put together

```
browser ─► muscle-meta.com/app/four-lens/readiness
             │  main Netlify site (dynamic-duckanoo-9f7287), root netlify.toml:
             │  /app/*  →  https://mm-matrixapp.netlify.app/app/:splat  (200 proxy)
             ▼
           mm-matrixapp (second Netlify site, base directory "app")
             Next.js 16, basePath "/app", @supabase/ssr
             ▼
           Supabase bxpferfuwoiulnqnfqhf (identity, access, results; RLS)
```

- **One domain, one sign-in.** The session cookie belongs to muscle-meta.com.
- **Separate deploys.** A change under `app/` rebuilds only MatrixApp
  (`app/netlify.toml` → `ignore`); the public site rebuilds as before.
- **Proxy rules in code** (CLAUDE.md §5b): redirects and sign-in email links
  use `originForHost()` / `publicOrigin()`, never the request host; raw
  `<a>`, `<link>` and metadata URLs use `withBase()`. Server actions accept
  muscle-meta.com as an origin (`next.config.ts`).

## Addresses

| Address | Screen |
| --- | --- |
| `/app/` | My programs: what the member owns, where they are, what else exists |
| `/app/sign-in` | One sign-in (email link or code) for everything |
| `/app/<program>/` | Program home: the next step |
| `/app/four-lens/orientation` → `safety` → `readiness` → `results` → `baseline` → `dashboard` | The Four-Lens journey |
| `/app/no-access?program=<program>` | Signed in, but the account does not include that program |
| `/app/admin`, `/app/admin/assets`, `/app/admin/members/<id>` | Staff only |

`admin`, `sign-in`, `auth`, `no-access` are reserved and can never be a
program route.

## The program template

`app/src/programs/registry.ts` lists every program. One entry per program:

| Field | Meaning |
| --- | --- |
| `route` | Web address segment: `/app/<route>/` |
| `dbSlug` | `programs.slug` in the database (may differ from `route`) |
| `kind` | Which template drives it. Today: `assessment-journey` |
| `access` | Entitlement key that unlocks it (checked again by RLS) |
| `addOns` | Extra entitlements, e.g. one-to-one coaching |
| `assessmentCode` | For assessment journeys: `assessments.code` |
| `durationDays` | Program length, or null for open-ended |
| `salesPath` | The public page on muscle-meta.com that sells it |

Adding a program of an existing kind is **database rows plus one registry
entry**. New behaviour is a new `kind` (planned: `course`, `download`,
`assessment-only`) or a new versioned engine module with its own fixtures.

## Selling (M4, Stripe)

"Stripe sells, the database grants." Each `products` row says what it
unlocks and for how long; a Stripe webhook (Supabase edge function) writes
`entitlements`; MatrixApp only ever reads entitlements.

| Product type | Stripe | Entitlement |
| --- | --- | --- |
| Membership | Subscription | Active while the subscription is |
| One-off program or course | One-time payment | Lifetime or fixed term |
| Assessment | One-time payment | The assessment plus saved results |
| Digital product | One-time payment | Signed download from the private bucket |
| One-to-one coaching | Separate subscription | Coaching add-on for a program |

Checkout, the customer portal (cancel, update card), coupons and Stripe Tax
come from Stripe. Health data never goes to Stripe.

## Leaving Kajabi

1. Inventory every offer, course, page, form, contact count and active
   subscription (Kajabi connector).
2. Paying members: portable only if Kajabi charges through Randy's own
   Stripe account; otherwise re-subscribe with a loyalty coupon.
3. Paid lessons → Supabase `lessons`; free material → site pages; landing
   pages → `/courses/<slug>/`.
4. Contacts already live in Kit; do not import twice.
5. Cut-over: point learn.muscle-meta.com at `/app/`, keep Kajabi read-only for
   a month, then cancel.

## Setting it up (one time)

1. **Netlify:** open project `mm-matrixapp` → Project configuration → Build &
   deploy → Link repository → `rbauer-musclemeta/muscle-meta`, branch `main`,
   **base directory `app`**. Everything else comes from `app/netlify.toml`.
2. **Supabase → Authentication → URL configuration:** Site URL
   `https://muscle-meta.com/app`; redirect URLs
   `https://muscle-meta.com/app/**`,
   `https://*--mm-matrixapp.netlify.app/app/**`,
   `https://*--dynamic-duckanoo-9f7287.netlify.app/app/**`,
   `http://localhost:3000/app/**`.
3. **Supabase → Email templates → Magic link:** include `{{ .ConfirmationURL }}`
   and `{{ .Token }}`.
4. **Supabase → Authentication:** email OTP expiry 3600 s or less; Settings →
   Infrastructure → upgrade Postgres.
5. Merge the branch. Sign in at muscle-meta.com/app as rbauer@bauerpt.com
   (becomes owner), grant access from `/app/admin`, run the end-to-end list in
   `docs/program-1/00-PROGRAM-1-HANDOFF.md`.
