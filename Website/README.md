# Website

This folder is the source of crestbrowser.com: the product homepage, the
privacy and support pages, and Crest Help at `/docs/`. It is a
[Fumadocs](https://fumadocs.dev) site on React Router, built as static files.

## Layout

| Path | Contents |
| --- | --- |
| `app/routes/` | Pages: `home.tsx`, `privacy.tsx`, `support.tsx`, `docs.tsx` (help articles), plus the search index, sitemap, and LLM routes |
| `app/styles/` | `home.css` for the homepage, `site.css` for privacy and support. Help articles use Fumadocs' styles from `app/app.css` |
| `content/docs/` | Help articles in Markdown or MDX. Folders in parentheses group the sidebar without changing URLs, and each `meta.json` sets a group's title and page order |
| `public/` | Files served as-is: images, crests, demos, `CNAME`, `robots.txt`, and redirect pages |

An article's URL comes from its file name: `content/docs/(browse-faster)/link-routing.md`
is served at `/docs/link-routing/`. Link between articles with those URLs.

Help used to live at `/guides/`. Every article also gets a page at its old
`/guides/` address that forwards to `/docs/`, keeping any `#section`, so
existing links keep working. Do not publish new pages under `/guides/`.

## Work on the site

Install Node.js 20 or later, then:

```sh
npm install
npm run dev
```

To check that the site builds:

```sh
npm run build
```

The static site is written to `build/client/`, which Git ignores.
