# Website

This folder is the source of crestbrowser.com: the product homepage, the
privacy and support pages, and Crest Help at `/guides/`. It is a
[Fumadocs](https://fumadocs.dev) site on React Router, built as static files.

## Layout

| Path | Contents |
| --- | --- |
| `app/routes/` | Pages: `home.tsx`, `privacy.tsx`, `support.tsx`, `docs.tsx` (help articles), plus the search index, sitemap, and LLM routes |
| `app/styles/` | `home.css` for the homepage, `site.css` for privacy and support. Help articles use Fumadocs' styles from `app/app.css` |
| `content/guides/` | Help articles in Markdown or MDX. Folders in parentheses group the sidebar without changing URLs, and each `meta.json` sets a group's title and page order |
| `public/` | Files served as-is: images, crests, demos, `CNAME`, `robots.txt`, and redirect pages |
| `dist/` | The generated site that GitHub Pages publishes. Never edit it by hand |

An article's URL comes from its file name: `content/guides/(browse-faster)/link-routing.md`
is served at `/guides/link-routing/`. Link between articles with those URLs.

## Work on the site

Install Node.js 20 or later, then:

```sh
npm install
npm run dev
```

## Publish

```sh
npm run build:website
```

This rebuilds `dist/`. Commit the result with your change; pushing to `main`
deploys `dist/` to GitHub Pages.
