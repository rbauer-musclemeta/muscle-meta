# muscle-meta.com

One domain, many assets. Static HTML on Netlify, data in Supabase. One small
build step: blog posts are written in Markdown and rendered to HTML on deploy.

```
CLAUDE.md      house rules — read before changing anything
content/blog/  blog posts in Markdown (edited at muscle-meta.com/cms/)
scripts/       build-blog.mjs: Markdown -> site/blog/, feed, sitemap, schema
docs/          internal notes; never published
site/          the website. Netlify publishes ONLY this directory.
netlify.toml   publish = "site", build = "npm run build", headers
```

Blog workflow: see `docs/blog-workflow.md`.

Commit to `main` and Netlify deploys. Branches get preview URLs — check the
preview before merging, and run `docs/deployment-checklist.md`.

## Two blanks to fill before anything saves
`site/assets/mm.js` — `supabaseKey` (publishable key) and `kitFormId`.
Both are public values and belong in the committed file; with no build step,
Netlify environment variables cannot reach the browser. The service role key
never goes in this repo.
