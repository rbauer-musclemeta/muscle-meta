# Deployment checklist

## First deploy — the one-time runbook

Do these in order. Steps 1-5 put the site live; 6-10 make it work properly.
GitHub Desktop only — no command line needed anywhere.

### 1. Make a new GitHub repo (do NOT reuse `oxygen-engine`)
- github.com → New repository → name it `muscle-meta`
- Private is fine. Do not add a README, .gitignore or licence — this repo has them.
- Leave `rbauer-musclemeta/oxygen-engine` exactly as it is. It is the course's
  standalone calculator and deploys somewhere else. Two repos, two Netlify
  sites, nothing destructive.

### 2. Get the files onto disk
- Unzip `muscle-meta-repo.zip` → you get a folder `mm-repo`
- GitHub Desktop → File → Clone repository → the new `muscle-meta`
- Copy everything **inside** `mm-repo` into the cloned folder. The cloned
  folder must contain `netlify.toml`, `CLAUDE.md`, `site/`, `docs/` at its top
  level — not a nested `mm-repo` folder.

### 3. Publish
- GitHub Desktop shows ~39 changed files → summary "Initial site" → Commit to main
- Push origin

### 4. Connect Netlify
- Netlify → Add new site → Import an existing project → GitHub → `muscle-meta`
- **Type nothing into build settings.** `netlify.toml` already sets
  `publish = "site"` and an empty build command. If Netlify pre-fills a
  framework, set it to "None".
- Deploy. It takes about 30 seconds — there is no build.

### 5. Check the deploy URL before touching DNS
Open the `*.netlify.app` URL and confirm: home page draws, nav works at 390px
wide, `/courses/`, `/courses/oxygen-engine/`, `/tools/oxygen-engine/` all load.
A green "Published" badge is not proof a page renders.

### 6. Point the domain
- Netlify → Domain management → Add `muscle-meta.com`
- Follow Netlify's DNS instructions at the registrar; add `www` as an alias
- Wait for the HTTPS certificate to issue (usually minutes) before announcing

### 7. Kajabi subdomain for course delivery
- Kajabi → map `learn.muscle-meta.com`
- **Set it to `noindex`.** Otherwise the member area competes with
  `/courses/oxygen-engine/` for the same queries and Google sometimes picks the
  login screen.
- Marketing surface on the main domain, delivery on the subdomain. See
  CLAUDE.md §5b.

### 8. Swap the enrol links
Two `<!-- ENROLL: -->` comments in `site/courses/oxygen-engine/index.html` mark
placeholder hrefs pointing at `https://learn.muscle-meta.com/`. Replace both
with the real Kajabi offer URL. Add the price to the page and to the `Course`
JSON-LD `offers` block at the same time.

### 9. Email capture
`site/assets/mm.js` → `MM_CONFIG.kitFormId` is empty, so the forms on
`/downloads/` are inert (the page says so in the console).
- Kit → create a NEW form for this site. Do not reuse one of the legacy forms
  (BHA, pickleball, Hustle Back to Health) — they are wired to old tags and
  sequences.
- Paste its id into `kitFormId`, commit, push.
- Test with a real address and confirm the subscriber lands with the right tag.

### 10. Tell Google it exists
- Search Console → add `muscle-meta.com` as a domain property
- Submit `https://muscle-meta.com/sitemap.xml`
- Confirm `/courses/oxygen-engine/` is indexable (it is not in robots.txt)

### Later, not now
- `/about/` — the credential page. For YMYL health content this is the single
  highest-value page still missing.
- `/assess/` — assessments, on the main domain, never a subdomain.
- Supabase: `MM_CONFIG.supabaseKey` stays empty until sign-in is actually
  needed. The site works fully without it.
- Convert `site/tools/oxygen-engine/index.html` to the shared `mm.css`/`mm.js`
  (it is still self-contained and has no nav).

---

# Per-change checklist

Run this before merging to `main`. Most of it is two minutes.

## Every time
- [ ] Preview URL renders — an API or build saying "success" is not proof a page draws
- [ ] Check at 390px wide, not just desktop
- [ ] Every link on the changed page resolves (no 404s, no links to unbuilt pages)
- [ ] No literal hex colors or font names introduced — tokens only
- [ ] No emoji in product UI or copy
- [ ] New page added to `site/sitemap.xml`
- [ ] New page linked from at least one other page (nothing orphaned)

## When a page has clinical content
- [ ] Every claim carries an evidence grade
- [ ] Every PMID resolves through PubMed — check, do not assume
- [ ] No diagnosis language; safety screens intact
- [ ] Category numbers omitted where the framework naming is still unresolved

## When a page touches the database
- [ ] Supabase security advisors run clean after any schema change
- [ ] RLS policy exists and was tested as a signed-out visitor
- [ ] No service-role key anywhere in the repo
- [ ] Sign-in tested on the deploy preview — its URL must be in Supabase's
      redirect allow-list or OAuth silently fails on previews only

## Before enabling payment
- [ ] `/legal/terms/` and `/legal/privacy/` written and published
- [ ] Refund policy stated
- [ ] Entitlement revocation path decided and tested
- [ ] Test-card purchase produces an entitlement row and grants the purchased
      product (entitlements attach to products, never to pillars or categories —
      no part of the framework is gated)

## Periodically
- [ ] Link check across the site
- [ ] HTML validation on new templates
- [ ] Calculators smoke-tested: a known input still produces a known output
