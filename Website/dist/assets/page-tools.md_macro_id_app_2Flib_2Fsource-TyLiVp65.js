import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`Translate, read, and use page tools`,description:`Translate webpages on device, use Reader, find text, adjust zoom, share, and export pages.`},r=`Page actions operate on the focused page. In Split View, click or tap a card first so the intended page owns the command.

On Mac, each page runs in Chromium or WebKit. Crest on iPhone and iPad uses WebKit. A few page tools depend on the page's engine, and this page notes where. To switch a page, see [Chromium and WebKit on Mac](/guides/engines/).

## Translate a page [#translate-a-page]

Translate webpages on device using Apple’s Translation framework. Whole-page translation works on iPhone, iPad, and Mac, where it works on both Chromium and WebKit pages. On a Chromium page you can also select text and translate the selection from the page's context menu; it uses the same on-device translation.

On Mac, open the translation toolbar with **Shift-Command-L**. On iPhone and iPad, tap the address bar’s translation button for options, or touch and hold it to translate immediately.

Choose **Detect Language** or a source language, pick a target language, then translate. **Show Original** restores the page’s original text. Language availability depends on Apple’s support; Apple asks before downloading a language that is needed.

**Automatically Translate** is off by default. When enabled, Crest uses your preferred device language and languages already downloaded. Showing the original keeps that page untranslated until you navigate or reload.

Downloaded language packs are shared with other apps and remain on the device after Private Browsing ends.

## Read and search [#read-and-search]

- **Reader** converts a supported article into a focused reading surface. Use the page controls, menu, command palette, or assign a shortcut. Reader works on WebKit pages. On Mac, open a Chromium page in WebKit to read it in Reader.
- **Find in Page** uses **Command-F**. Step through matches and close Find when finished. On a Chromium page, Find shows how many matches there are and which one is selected; on a WebKit page, it shows whether there is a match.
- **Zoom In**, **Zoom Out**, and **Actual Size** use **Command-+**, **Command--**, and **Command-0**.

Set a default zoom for pages in **Settings → Appearance**, from **50% to 300%**.

## Video and audio [#video-and-audio]

Use the sidebar’s Now Playing controls for eligible active media. On Mac, supported videos can open in **Picture in Picture**. Turn on **Picture in Picture when switching tabs** in **Settings → General** to start it automatically. Availability depends on the website and its player.

## Copy and share [#copy-and-share]

- **Copy Page Link** uses **Shift-Command-C**.
- **Copy Page Link as Markdown** uses **Option-Shift-Command-C** and produces a title-and-URL link suitable for notes or issue trackers.
- **Share Page** opens the platform share sheet when available.

## Export [#export]

- **Print Page** uses **Command-P**.
- **Export as PDF** writes a portable rendered document.
- **Save Web Archive** saves the whole page in one file. A Chromium page saves an \`.mhtml\` file, and a WebKit page saves a \`.webarchive\` file.

**File → Open File…** offers the archive format of the focused page's engine. Chromium cannot open a \`.webarchive\`, and WebKit cannot open an \`.mhtml\` file.

Export and Share are available through menus and the command palette even when no default shortcut is assigned.

## Reload choices [#reload-choices]

**Command-R** performs a normal reload. **Shift-Command-R** reloads from the origin when a cached response is not what you need. **Command-.** stops the current load.

## Content and site controls [#content-and-site-controls]

The contextual site controls also expose the page's engine, Reader and content blocking where the engine offers them, permissions, extension actions, and developer status. On Chromium pages, blocking ads and trackers comes from the extensions you install. Decisions for camera, microphone, automatic downloads, popups, or external-app handoff are remembered within the current Space.
`,i={contents:[{heading:void 0,content:`Page actions operate on the focused page. In Split View, click or tap a card first so the intended page owns the command.`},{heading:void 0,content:`On Mac, each page runs in Chromium or WebKit. Crest on iPhone and iPad uses WebKit. A few page tools depend on the page's engine, and this page notes where. To switch a page, see Chromium and WebKit on Mac.`},{heading:`translate-a-page`,content:`Translate webpages on device using Apple’s Translation framework. Whole-page translation works on iPhone, iPad, and Mac, where it works on both Chromium and WebKit pages. On a Chromium page you can also select text and translate the selection from the page's context menu; it uses the same on-device translation.`},{heading:`translate-a-page`,content:`On Mac, open the translation toolbar with **Shift-Command-L**. On iPhone and iPad, tap the address bar’s translation button for options, or touch and hold it to translate immediately.`},{heading:`translate-a-page`,content:`Choose **Detect Language** or a source language, pick a target language, then translate. **Show Original** restores the page’s original text. Language availability depends on Apple’s support; Apple asks before downloading a language that is needed.`},{heading:`translate-a-page`,content:`**Automatically Translate** is off by default. When enabled, Crest uses your preferred device language and languages already downloaded. Showing the original keeps that page untranslated until you navigate or reload.`},{heading:`translate-a-page`,content:`Downloaded language packs are shared with other apps and remain on the device after Private Browsing ends.`},{heading:`read-and-search`,content:`**Reader** converts a supported article into a focused reading surface. Use the page controls, menu, command palette, or assign a shortcut. Reader works on WebKit pages. On Mac, open a Chromium page in WebKit to read it in Reader.`},{heading:`read-and-search`,content:`**Find in Page** uses **Command-F**. Step through matches and close Find when finished. On a Chromium page, Find shows how many matches there are and which one is selected; on a WebKit page, it shows whether there is a match.`},{heading:`read-and-search`,content:`**Zoom In**, **Zoom Out**, and **Actual Size** use **Command-+**, **Command--**, and **Command-0**.`},{heading:`read-and-search`,content:`Set a default zoom for pages in **Settings → Appearance**, from **50% to 300%**.`},{heading:`video-and-audio`,content:`Use the sidebar’s Now Playing controls for eligible active media. On Mac, supported videos can open in **Picture in Picture**. Turn on **Picture in Picture when switching tabs** in **Settings → General** to start it automatically. Availability depends on the website and its player.`},{heading:`copy-and-share`,content:`**Copy Page Link** uses **Shift-Command-C**.`},{heading:`copy-and-share`,content:`**Copy Page Link as Markdown** uses **Option-Shift-Command-C** and produces a title-and-URL link suitable for notes or issue trackers.`},{heading:`copy-and-share`,content:`**Share Page** opens the platform share sheet when available.`},{heading:`export`,content:`**Print Page** uses **Command-P**.`},{heading:`export`,content:`**Export as PDF** writes a portable rendered document.`},{heading:`export`,content:"**Save Web Archive** saves the whole page in one file. A Chromium page saves an `.mhtml` file, and a WebKit page saves a `.webarchive` file."},{heading:`export`,content:"**File → Open File…** offers the archive format of the focused page's engine. Chromium cannot open a `.webarchive`, and WebKit cannot open an `.mhtml` file."},{heading:`export`,content:`Export and Share are available through menus and the command palette even when no default shortcut is assigned.`},{heading:`reload-choices`,content:`**Command-R** performs a normal reload. **Shift-Command-R** reloads from the origin when a cached response is not what you need. **Command-.** stops the current load.`},{heading:`content-and-site-controls`,content:`The contextual site controls also expose the page's engine, Reader and content blocking where the engine offers them, permissions, extension actions, and developer status. On Chromium pages, blocking ads and trackers comes from the extensions you install. Decisions for camera, microphone, automatic downloads, popups, or external-app handoff are remembered within the current Space.`}],headings:[{id:`translate-a-page`,content:`Translate a page`},{id:`read-and-search`,content:`Read and search`},{id:`video-and-audio`,content:`Video and audio`},{id:`copy-and-share`,content:`Copy and share`},{id:`export`,content:`Export`},{id:`reload-choices`,content:`Reload choices`},{id:`content-and-site-controls`,content:`Content and site controls`}]},a=[{depth:2,url:`#translate-a-page`,title:(0,t.jsx)(t.Fragment,{children:`Translate a page`})},{depth:2,url:`#read-and-search`,title:(0,t.jsx)(t.Fragment,{children:`Read and search`})},{depth:2,url:`#video-and-audio`,title:(0,t.jsx)(t.Fragment,{children:`Video and audio`})},{depth:2,url:`#copy-and-share`,title:(0,t.jsx)(t.Fragment,{children:`Copy and share`})},{depth:2,url:`#export`,title:(0,t.jsx)(t.Fragment,{children:`Export`})},{depth:2,url:`#reload-choices`,title:(0,t.jsx)(t.Fragment,{children:`Reload choices`})},{depth:2,url:`#content-and-site-controls`,title:(0,t.jsx)(t.Fragment,{children:`Content and site controls`})}];function o(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,strong:`strong`,ul:`ul`,...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:`Page actions operate on the focused page. In Split View, click or tap a card first so the intended page owns the command.`}),`
`,(0,t.jsxs)(n.p,{children:[`On Mac, each page runs in Chromium or WebKit. Crest on iPhone and iPad uses WebKit. A few page tools depend on the page's engine, and this page notes where. To switch a page, see `,(0,t.jsx)(n.a,{href:`/guides/engines/`,children:`Chromium and WebKit on Mac`}),`.`]}),`
`,(0,t.jsx)(n.h2,{id:`translate-a-page`,children:`Translate a page`}),`
`,(0,t.jsx)(n.p,{children:`Translate webpages on device using Apple’s Translation framework. Whole-page translation works on iPhone, iPad, and Mac, where it works on both Chromium and WebKit pages. On a Chromium page you can also select text and translate the selection from the page's context menu; it uses the same on-device translation.`}),`
`,(0,t.jsxs)(n.p,{children:[`On Mac, open the translation toolbar with `,(0,t.jsx)(n.strong,{children:`Shift-Command-L`}),`. On iPhone and iPad, tap the address bar’s translation button for options, or touch and hold it to translate immediately.`]}),`
`,(0,t.jsxs)(n.p,{children:[`Choose `,(0,t.jsx)(n.strong,{children:`Detect Language`}),` or a source language, pick a target language, then translate. `,(0,t.jsx)(n.strong,{children:`Show Original`}),` restores the page’s original text. Language availability depends on Apple’s support; Apple asks before downloading a language that is needed.`]}),`
`,(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:`Automatically Translate`}),` is off by default. When enabled, Crest uses your preferred device language and languages already downloaded. Showing the original keeps that page untranslated until you navigate or reload.`]}),`
`,(0,t.jsx)(n.p,{children:`Downloaded language packs are shared with other apps and remain on the device after Private Browsing ends.`}),`
`,(0,t.jsx)(n.h2,{id:`read-and-search`,children:`Read and search`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Reader`}),` converts a supported article into a focused reading surface. Use the page controls, menu, command palette, or assign a shortcut. Reader works on WebKit pages. On Mac, open a Chromium page in WebKit to read it in Reader.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Find in Page`}),` uses `,(0,t.jsx)(n.strong,{children:`Command-F`}),`. Step through matches and close Find when finished. On a Chromium page, Find shows how many matches there are and which one is selected; on a WebKit page, it shows whether there is a match.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Zoom In`}),`, `,(0,t.jsx)(n.strong,{children:`Zoom Out`}),`, and `,(0,t.jsx)(n.strong,{children:`Actual Size`}),` use `,(0,t.jsx)(n.strong,{children:`Command-+`}),`, `,(0,t.jsx)(n.strong,{children:`Command--`}),`, and `,(0,t.jsx)(n.strong,{children:`Command-0`}),`.`]}),`
`]}),`
`,(0,t.jsxs)(n.p,{children:[`Set a default zoom for pages in `,(0,t.jsx)(n.strong,{children:`Settings → Appearance`}),`, from `,(0,t.jsx)(n.strong,{children:`50% to 300%`}),`.`]}),`
`,(0,t.jsx)(n.h2,{id:`video-and-audio`,children:`Video and audio`}),`
`,(0,t.jsxs)(n.p,{children:[`Use the sidebar’s Now Playing controls for eligible active media. On Mac, supported videos can open in `,(0,t.jsx)(n.strong,{children:`Picture in Picture`}),`. Turn on `,(0,t.jsx)(n.strong,{children:`Picture in Picture when switching tabs`}),` in `,(0,t.jsx)(n.strong,{children:`Settings → General`}),` to start it automatically. Availability depends on the website and its player.`]}),`
`,(0,t.jsx)(n.h2,{id:`copy-and-share`,children:`Copy and share`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Copy Page Link`}),` uses `,(0,t.jsx)(n.strong,{children:`Shift-Command-C`}),`.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Copy Page Link as Markdown`}),` uses `,(0,t.jsx)(n.strong,{children:`Option-Shift-Command-C`}),` and produces a title-and-URL link suitable for notes or issue trackers.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Share Page`}),` opens the platform share sheet when available.`]}),`
`]}),`
`,(0,t.jsx)(n.h2,{id:`export`,children:`Export`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Print Page`}),` uses `,(0,t.jsx)(n.strong,{children:`Command-P`}),`.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Export as PDF`}),` writes a portable rendered document.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Save Web Archive`}),` saves the whole page in one file. A Chromium page saves an `,(0,t.jsx)(n.code,{children:`.mhtml`}),` file, and a WebKit page saves a `,(0,t.jsx)(n.code,{children:`.webarchive`}),` file.`]}),`
`]}),`
`,(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:`File → Open File…`}),` offers the archive format of the focused page's engine. Chromium cannot open a `,(0,t.jsx)(n.code,{children:`.webarchive`}),`, and WebKit cannot open an `,(0,t.jsx)(n.code,{children:`.mhtml`}),` file.`]}),`
`,(0,t.jsx)(n.p,{children:`Export and Share are available through menus and the command palette even when no default shortcut is assigned.`}),`
`,(0,t.jsx)(n.h2,{id:`reload-choices`,children:`Reload choices`}),`
`,(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:`Command-R`}),` performs a normal reload. `,(0,t.jsx)(n.strong,{children:`Shift-Command-R`}),` reloads from the origin when a cached response is not what you need. `,(0,t.jsx)(n.strong,{children:`Command-.`}),` stops the current load.`]}),`
`,(0,t.jsx)(n.h2,{id:`content-and-site-controls`,children:`Content and site controls`}),`
`,(0,t.jsx)(n.p,{children:`The contextual site controls also expose the page's engine, Reader and content blocking where the engine offers them, permissions, extension actions, and developer status. On Chromium pages, blocking ads and trackers comes from the extensions you install. Decisions for camera, microphone, automatic downloads, popups, or external-app handoff are remembered within the current Space.`})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};