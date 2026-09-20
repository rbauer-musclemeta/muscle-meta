# muscle-meta.com

One domain, many assets. Static HTML on Netlify, data in Supabase. No build step.

```
CLAUDE.md      house rules — read before changing anything
docs/          internal notes; never published
site/          the website. Netlify publishes ONLY this directory.
netlify.toml   publish = "site", security headers, no build command
```

Commit to `main` and Netlify deploys. Branches get preview URLs — check the
preview before merging, and run `docs/deployment-checklist.md`.

## Two blanks to fill before anything saves
`site/assets/mm.js` — `supabaseKey` (publishable key) and `kitFormId`.
Both are public values and belong in the committed file; with no build step,
Netlify environment variables cannot reach the browser. The service role key
never goes in this repo.
