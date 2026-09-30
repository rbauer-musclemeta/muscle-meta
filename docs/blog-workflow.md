# Blog workflow — muscle-meta.com

Posts are Markdown files in `content/blog/`. You write them in the editor at
**https://muscle-meta.com/cms/**; every save is a commit to GitHub, Netlify
rebuilds, and `scripts/build-blog.mjs` turns the file into a real HTML page at
`/blog/<slug>/`, adds it to the articles page, the RSS feed and the sitemap,
and writes its schema.

## Writing a post in the editor

1. Open https://muscle-meta.com/cms/ and sign in (see "Sign-in" below).
2. Blog posts → New blog post.
3. Fill in the form. New posts start with **Draft on**, so saving is safe.
4. Save. The post is committed to GitHub but, while Draft is on, it never
   appears on muscle-meta.com.
5. When it is ready: switch **Draft off** and save. Netlify rebuilds; the post
   is live in one to two minutes.
6. Check it at `https://muscle-meta.com/blog/<slug>/`, on your phone too.

If the post does not appear, the build refused it. Netlify → Deploys → the
failed deploy → the log lists every problem in plain English. Fix those in the
editor and save again. The live site is untouched while a build is failing.

## What each field does

| Field | Rule the build enforces |
| --- | --- |
| Title | Required. Sentence case. |
| Summary | 70 to 170 characters. Used under the title, in Google and on cards. |
| Publish date / Last updated | Dates. "Last updated" only for meaningful revisions. |
| Draft | On = never published to production. |
| Feature on the articles page | Up to three featured posts lead `/blog/`. |
| Pillar | One of the four canonical pillars. |
| Categories | One or more canonical keys, P1-C1 to P4-C12. |
| Header image + description | Description required whenever there is an image. |
| Tool or course button | Optional call to action under the article. |
| Article | Markdown. Cite a reference by typing `[1]`, `[2]` … |
| References | Each needs the claim it supports, an evidence grade, and a PMID (or a link for non-PubMed sources). Every reference must be cited in the text, and every `[n]` must have a reference. |
| Common questions | Optional FAQ, shown on the page and in schema. |

## The checks that stop a post

- Pillar or category key that is not canonical.
- A reference without a grade (Established / Promising / Unproven-Bridge) or a claim.
- A PMID that does not exist, or whose PubMed first author and year are not in
  the citation text. This catches the "valid PMID, wrong paper" error.
- Wording that gates the framework: unlock, locked, upgrade to see, members-only,
  founding member.
- Emoji, or a literal hex colour in the article's HTML.
- Summary too short or too long; image without a description; duplicate slugs.

## PMIDs

`content/pmid-cache.json` lists PMIDs someone has already read in PubMed. The
build checks references against it first and asks PubMed about anything new.
If PubMed is unreachable the build stops rather than guessing; retry the deploy.
Add a PMID to the cache only after reading its title in PubMed yourself.

## Sign-in

- **Token (works now):** GitHub → Settings → Developer settings → Fine-grained
  tokens → Generate. Repository access: only `rbauer-musclemeta/muscle-meta`.
  Permissions: Contents = Read and write. Paste it via "Sign In with Token" on
  the editor. It is stored only in that browser.
- **"Sign in with GitHub" button (optional):** register a GitHub OAuth app with
  callback `https://api.netlify.com/auth/done`, then add its client ID and
  secret in Netlify → Project configuration → Access & security → OAuth →
  Install provider → GitHub.

## Drafts on a preview

Drafts are rendered on Netlify deploy previews and branch deploys (with a
Draft banner and noindex) and skipped on production. To review a draft as a
real page, open a pull request that contains it, or save it on a branch.

## Images

Uploads go to `site/assets/blog/`. Use JPG or WebP around 1600 px wide and
under 300 KB; the editor does not resize.

## Newsletter

Every post ends with a sign-up block that subscribes readers to the
Muscle-Meta newsletter in Kit, with `src-blog-<slug>` sent in the subscriber's
`tag` field so you can see which article brought them in. It works once
`kitFormId` in `site/assets/mm.js` is set to the Muscle-Meta newsletter form.
