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

## Write articles

Write articles in plain Markdown, which agents read as written at
`/llms.txt`, `/llms-full.txt`, and beside each article at `/docs/<article>.md`.
Use MDX only where an article needs a component, such as the cards on the Help
home page.

- **Procedures.** A numbered list renders as steps.
- **Callouts.** Use GitHub's alert syntax. Text after the marker is the
  callout's title, and the kinds are `NOTE`, `TIP`, `IMPORTANT`, `WARNING`,
  and `CAUTION`:

  ```md
  > [!WARNING] Use the signed Crest release
  > 1Password checks the browser's code signature.
  ```

- **Keys.** Write a shortcut the Apple way inside `<kbd>`, such as
  `<kbd>Option-Shift-Command-N</kbd>`. It shows as key caps (⌥ ⇧ ⌘ N), and
  screen readers hear the words.

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

## Work on the site

Install Node.js 22.22 or later, then:

```sh
npm install
npm run dev
```

To check that the site builds:

```sh
npm run build
```

The static site is written to `build/client/`, which Git ignores.
