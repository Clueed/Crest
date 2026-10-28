# Website

This folder is the source of crestbrowser.com: the product homepage, the
privacy and support pages, and Crest Help at `/docs/`. It is a
[Fumadocs](https://fumadocs.dev) site on React Router, built as static files.

## Layout

| Path | Contents |
| --- | --- |
| `app/routes/` | Pages: `home.tsx`, `privacy.tsx`, `support.tsx`, `docs.tsx` (help articles), plus the search index, sitemap, and LLM routes |
| `app/components/` | The shared header and footer (`site-chrome.tsx`), the privacy and support page parts (`article-page.tsx`), and the homepage's sections in `home/` |
| `app/lib/site-links.ts` | Every link the header, footer, and Crest Help's header show |
| `app/app.css` | The one stylesheet: Tailwind, Fumadocs, and Crest's colors, type, and measures |
| `content/docs/` | Help articles in Markdown or MDX. Folders in parentheses group the sidebar without changing URLs, and each `meta.json` sets a group's title and page order |
| `helpdocs/` | Scenarios that regenerate and check help articles against the app. See `Scripts/helpdocs/README.md` |
| `public/` | Files served as-is: images, crests, demos, `CNAME`, and `robots.txt` |

An article's URL comes from its file name: `content/docs/(browse-faster)/link-routing.md`
is served at `/docs/link-routing/`. Link between articles with those URLs.

Help used to live at `/guides/`. Every article also gets a page at its old
`/guides/` address that forwards to `/docs/`, keeping any `#section`, so
existing links keep working. An old page whose article has a new name is
listed in `renamedDocs` in `app/lib/shared.ts`. Do not publish new pages
under `/guides/`.

## Styles

Every page is styled with Tailwind classes. Crest's palette (`paper`, `ink`,
`night`, `gold`, and the rest), its serif and sans type, and the `page-width`
and `wide-width` measures are defined once in `app/app.css`, and Crest Help's
Fumadocs colors point at the same palette. Use `cn` from `app/lib/cn.ts` to
combine classes.

The homepage's drawings of Crest's windows are measured in the app's points:
inside them `--spacing` is one point, so `h-48` and `text-pt-13` are 48 and 13
points at any size.

The homepage reads a few URL parameters for screenshots: `?shot` holds every
animation still, `crest` and `mode` pick the template, `step` the feature tour
step, `dev` the device, `plat` the download platform, `open` opens the full
Arc list, and `y` scrolls the page by that many pixels.

Keep an article's images as PNG in a folder named after the article, and
reference them with relative paths. The build serves each one as AVIF with a
WebP fallback, at the column width and twice it, and lazy-loads every image
but the article's first. A clip's poster, `<clip>.poster.png`, becomes a
single AVIF.

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
