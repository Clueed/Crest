import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`Chromium and WebKit on Mac`,description:`Choose the engine new pages open in, send a website to the other engine, and see what each engine supports.`},r=`Crest for Mac includes two web engines. New pages open in Chromium unless you choose otherwise, and any website or page can use WebKit, the engine behind Safari. Crest on iPhone and iPad uses WebKit.

Your Spaces, tabs, history, passwords and settings are the same whichever engine shows a page. Website data is not: each engine keeps its own cookies and storage for a Space, so signing in to a site in Chromium does not sign you in to it in WebKit.

## Chromium [#chromium]

Crest's Chromium engine is built on [ungoogled-chromium](https://github.com/ungoogled-software/ungoogled-chromium), which removes Google integrations from Chromium. It runs [Chrome Web Store extensions](/guides/install-chrome-web-store/).

Chromium starts the first time you need it. If WebKit is your default and no page uses Chromium, it stays unloaded. Opening a Chromium page or an extension starts it, and it stays running until you quit Crest.

## Choose the default engine [#choose-the-default-engine]

1. Open **Crest Settings → Engines**.
2. Select **Chromium** or **WebKit**.

The default applies to pages you open afterwards. Open pages keep their engine, and links a page opens stay on that page's engine. Select **Use Recommended Default** to return to Chromium.

## Open a website in the other engine [#open-a-website-in-the-other-engine]

- **For one page:** choose **Page → Open Page in WebKit** or **Open Page in Chromium**. The page reloads in the other engine. Other pages from the site keep opening where they did.
- **For a whole website:** open Site Controls and change **Opens in**. The page reloads in that engine, and later pages from the website open there too.

A tab whose page runs in the engine that is not your default shows that engine's mark on its icon.

## Website rules [#website-rules]

Choosing **Opens in** saves a website rule. Rules are listed under **Crest Settings → Engines → Website rules**, where you can:

- select **Add Website Rule…** to send a website to an engine before you visit it;
- select a rule to change its website or engine;
- select **Remove Rule** to return a website to your default engine.

Rules match the website's scheme, host and port. A rule for \`example.com\` does not cover its subdomains. A choice made while browsing privately is not saved as a rule; it lasts until you quit Crest.

## Protected video [#protected-video]

Chromium in Crest cannot play DRM-protected video. When a page asks for it, Crest automatically switches to WebKit to try Apple's FairPlay support, unless you have explicitly chosen an engine for that website. The switch checks for unsaved work first. Choosing **Stay on Page** keeps the page in Chromium and leaves its website rule unchanged; repeated requests from that document do not prompt again. After an allowed move, the website opens in WebKit on later visits. Select **Move Back** to return it to Chromium, or remove its rule in Settings. Playback still depends on the site's support for FairPlay.

## After updating from a WebKit-only Crest [#after-updating-from-a-webkit-only-crest]

The previous stable 0.6 release used WebKit only. Updating to Crest 0.7 keeps your Spaces, tabs, history and Crest Passwords. New pages open in Chromium unless you choose WebKit as your default. Each engine keeps separate website data, so Chromium does not inherit your WebKit sign-ins. Your existing WebKit website data remains available to pages opened in WebKit.

Extensions installed in earlier versions do not carry over. Install them again from the Chrome Web Store.

## What each engine supports [#what-each-engine-supports]

| Feature | Chromium | WebKit |
| --- | --- | --- |
| Chrome Web Store extensions | Yes | No |
| Reader | No | Yes |
| Built-in ad and tracker blocking | No. Use a blocking extension. | Yes |
| Protected video | Automatically switches to WebKit after unsaved-changes checks | FairPlay, when the website supports it |
| Find in Page | Shows the number of matches | Shows whether there is a match |
| Save Web Archive | \`.mhtml\` file | \`.webarchive\` file |
| Inspect a page | Chromium DevTools | Web Inspector |

Tabs, Spaces, Split View, Peek, Crest Passwords, site permissions, Picture in Picture and downloads are available in both. Their engine controls can differ; Chromium downloads also offer pause and resume. See [Translate, read, and use page tools](/guides/page-tools/) and [Downloads](/guides/history-archive-and-downloads/#downloads) for details.

## Current Chromium limits [#current-chromium-limits]

- Crest Passwords handles saved passwords. Built-in address and payment-card autofill are not available.
- Screen sharing offers your tabs in the same Space first, with their audio when the site asks for it. A window or your screen goes through the macOS picker, which shares no audio.
- Local service-worker and extension notifications work while Crest runs. Remote Web Push is not available.

See [Site permissions and notifications](/guides/content-blocking-and-site-permissions/) for permission controls and the Google-free engine's site and download protection limits.
`,i={contents:[{heading:void 0,content:`Crest for Mac includes two web engines. New pages open in Chromium unless you choose otherwise, and any website or page can use WebKit, the engine behind Safari. Crest on iPhone and iPad uses WebKit.`},{heading:void 0,content:`Your Spaces, tabs, history, passwords and settings are the same whichever engine shows a page. Website data is not: each engine keeps its own cookies and storage for a Space, so signing in to a site in Chromium does not sign you in to it in WebKit.`},{heading:`chromium`,content:`Crest's Chromium engine is built on ungoogled-chromium, which removes Google integrations from Chromium. It runs Chrome Web Store extensions.`},{heading:`chromium`,content:`Chromium starts the first time you need it. If WebKit is your default and no page uses Chromium, it stays unloaded. Opening a Chromium page or an extension starts it, and it stays running until you quit Crest.`},{heading:`choose-the-default-engine`,content:`Open **Crest Settings → Engines**.`},{heading:`choose-the-default-engine`,content:`Select **Chromium** or **WebKit**.`},{heading:`choose-the-default-engine`,content:`The default applies to pages you open afterwards. Open pages keep their engine, and links a page opens stay on that page's engine. Select **Use Recommended Default** to return to Chromium.`},{heading:`open-a-website-in-the-other-engine`,content:`**For one page:** choose **Page → Open Page in WebKit** or **Open Page in Chromium**. The page reloads in the other engine. Other pages from the site keep opening where they did.`},{heading:`open-a-website-in-the-other-engine`,content:`**For a whole website:** open Site Controls and change **Opens in**. The page reloads in that engine, and later pages from the website open there too.`},{heading:`open-a-website-in-the-other-engine`,content:`A tab whose page runs in the engine that is not your default shows that engine's mark on its icon.`},{heading:`website-rules`,content:`Choosing **Opens in** saves a website rule. Rules are listed under **Crest Settings → Engines → Website rules**, where you can:`},{heading:`website-rules`,content:`select **Add Website Rule…** to send a website to an engine before you visit it;`},{heading:`website-rules`,content:`select a rule to change its website or engine;`},{heading:`website-rules`,content:`select **Remove Rule** to return a website to your default engine.`},{heading:`website-rules`,content:"Rules match the website's scheme, host and port. A rule for `example.com` does not cover its subdomains. A choice made while browsing privately is not saved as a rule; it lasts until you quit Crest."},{heading:`protected-video`,content:`Chromium in Crest cannot play DRM-protected video. When a page asks for it, Crest automatically switches to WebKit to try Apple's FairPlay support, unless you have explicitly chosen an engine for that website. The switch checks for unsaved work first. Choosing **Stay on Page** keeps the page in Chromium and leaves its website rule unchanged; repeated requests from that document do not prompt again. After an allowed move, the website opens in WebKit on later visits. Select **Move Back** to return it to Chromium, or remove its rule in Settings. Playback still depends on the site's support for FairPlay.`},{heading:`after-updating-from-a-webkit-only-crest`,content:`The previous stable 0.6 release used WebKit only. Updating to Crest 0.7 keeps your Spaces, tabs, history and Crest Passwords. New pages open in Chromium unless you choose WebKit as your default. Each engine keeps separate website data, so Chromium does not inherit your WebKit sign-ins. Your existing WebKit website data remains available to pages opened in WebKit.`},{heading:`after-updating-from-a-webkit-only-crest`,content:`Extensions installed in earlier versions do not carry over. Install them again from the Chrome Web Store.`},{heading:`what-each-engine-supports`,content:`| Feature                     | Chromium | WebKit |
| --------------------------- | -------- | ------ |
| Chrome Web Store extensions | Yes      | No     |`,table:`table-0`},{heading:`what-each-engine-supports`,content:`| Feature | Chromium | WebKit |
| ------- | -------- | ------ |
| Reader  | No       | Yes    |`,table:`table-0`},{heading:`what-each-engine-supports`,content:`| Feature                          | Chromium                      | WebKit |
| -------------------------------- | ----------------------------- | ------ |
| Built-in ad and tracker blocking | No. Use a blocking extension. | Yes    |`,table:`table-0`},{heading:`what-each-engine-supports`,content:`| Feature         | Chromium                                                      | WebKit                                 |
| --------------- | ------------------------------------------------------------- | -------------------------------------- |
| Protected video | Automatically switches to WebKit after unsaved-changes checks | FairPlay, when the website supports it |`,table:`table-0`},{heading:`what-each-engine-supports`,content:`| Feature      | Chromium                    | WebKit                         |
| ------------ | --------------------------- | ------------------------------ |
| Find in Page | Shows the number of matches | Shows whether there is a match |`,table:`table-0`},{heading:`what-each-engine-supports`,content:"| Feature          | Chromium      | WebKit             |\n| ---------------- | ------------- | ------------------ |\n| Save Web Archive | `.mhtml` file | `.webarchive` file |",table:`table-0`},{heading:`what-each-engine-supports`,content:`| Feature        | Chromium          | WebKit        |
| -------------- | ----------------- | ------------- |
| Inspect a page | Chromium DevTools | Web Inspector |`,table:`table-0`},{heading:`what-each-engine-supports`,content:`Tabs, Spaces, Split View, Peek, Crest Passwords, site permissions, Picture in Picture and downloads are available in both. Their engine controls can differ; Chromium downloads also offer pause and resume. See Translate, read, and use page tools and Downloads for details.`},{heading:`current-chromium-limits`,content:`Crest Passwords handles saved passwords. Built-in address and payment-card autofill are not available.`},{heading:`current-chromium-limits`,content:`Screen sharing offers your tabs in the same Space first, with their audio when the site asks for it. A window or your screen goes through the macOS picker, which shares no audio.`},{heading:`current-chromium-limits`,content:`Local service-worker and extension notifications work while Crest runs. Remote Web Push is not available.`},{heading:`current-chromium-limits`,content:`See Site permissions and notifications for permission controls and the Google-free engine's site and download protection limits.`}],headings:[{id:`chromium`,content:`Chromium`},{id:`choose-the-default-engine`,content:`Choose the default engine`},{id:`open-a-website-in-the-other-engine`,content:`Open a website in the other engine`},{id:`website-rules`,content:`Website rules`},{id:`protected-video`,content:`Protected video`},{id:`after-updating-from-a-webkit-only-crest`,content:`After updating from a WebKit-only Crest`},{id:`what-each-engine-supports`,content:`What each engine supports`},{id:`current-chromium-limits`,content:`Current Chromium limits`}]},a=[{depth:2,url:`#chromium`,title:(0,t.jsx)(t.Fragment,{children:`Chromium`})},{depth:2,url:`#choose-the-default-engine`,title:(0,t.jsx)(t.Fragment,{children:`Choose the default engine`})},{depth:2,url:`#open-a-website-in-the-other-engine`,title:(0,t.jsx)(t.Fragment,{children:`Open a website in the other engine`})},{depth:2,url:`#website-rules`,title:(0,t.jsx)(t.Fragment,{children:`Website rules`})},{depth:2,url:`#protected-video`,title:(0,t.jsx)(t.Fragment,{children:`Protected video`})},{depth:2,url:`#after-updating-from-a-webkit-only-crest`,title:(0,t.jsx)(t.Fragment,{children:`After updating from a WebKit-only Crest`})},{depth:2,url:`#what-each-engine-supports`,title:(0,t.jsx)(t.Fragment,{children:`What each engine supports`})},{depth:2,url:`#current-chromium-limits`,title:(0,t.jsx)(t.Fragment,{children:`Current Chromium limits`})}];function o(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,ol:`ol`,p:`p`,strong:`strong`,table:`table`,tbody:`tbody`,td:`td`,th:`th`,thead:`thead`,tr:`tr`,ul:`ul`,...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:`Crest for Mac includes two web engines. New pages open in Chromium unless you choose otherwise, and any website or page can use WebKit, the engine behind Safari. Crest on iPhone and iPad uses WebKit.`}),`
`,(0,t.jsx)(n.p,{children:`Your Spaces, tabs, history, passwords and settings are the same whichever engine shows a page. Website data is not: each engine keeps its own cookies and storage for a Space, so signing in to a site in Chromium does not sign you in to it in WebKit.`}),`
`,(0,t.jsx)(n.h2,{id:`chromium`,children:`Chromium`}),`
`,(0,t.jsxs)(n.p,{children:[`Crest's Chromium engine is built on `,(0,t.jsx)(n.a,{href:`https://github.com/ungoogled-software/ungoogled-chromium`,children:`ungoogled-chromium`}),`, which removes Google integrations from Chromium. It runs `,(0,t.jsx)(n.a,{href:`/guides/install-chrome-web-store/`,children:`Chrome Web Store extensions`}),`.`]}),`
`,(0,t.jsx)(n.p,{children:`Chromium starts the first time you need it. If WebKit is your default and no page uses Chromium, it stays unloaded. Opening a Chromium page or an extension starts it, and it stays running until you quit Crest.`}),`
`,(0,t.jsx)(n.h2,{id:`choose-the-default-engine`,children:`Choose the default engine`}),`
`,(0,t.jsxs)(n.ol,{children:[`
`,(0,t.jsxs)(n.li,{children:[`Open `,(0,t.jsx)(n.strong,{children:`Crest Settings → Engines`}),`.`]}),`
`,(0,t.jsxs)(n.li,{children:[`Select `,(0,t.jsx)(n.strong,{children:`Chromium`}),` or `,(0,t.jsx)(n.strong,{children:`WebKit`}),`.`]}),`
`]}),`
`,(0,t.jsxs)(n.p,{children:[`The default applies to pages you open afterwards. Open pages keep their engine, and links a page opens stay on that page's engine. Select `,(0,t.jsx)(n.strong,{children:`Use Recommended Default`}),` to return to Chromium.`]}),`
`,(0,t.jsx)(n.h2,{id:`open-a-website-in-the-other-engine`,children:`Open a website in the other engine`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`For one page:`}),` choose `,(0,t.jsx)(n.strong,{children:`Page → Open Page in WebKit`}),` or `,(0,t.jsx)(n.strong,{children:`Open Page in Chromium`}),`. The page reloads in the other engine. Other pages from the site keep opening where they did.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`For a whole website:`}),` open Site Controls and change `,(0,t.jsx)(n.strong,{children:`Opens in`}),`. The page reloads in that engine, and later pages from the website open there too.`]}),`
`]}),`
`,(0,t.jsx)(n.p,{children:`A tab whose page runs in the engine that is not your default shows that engine's mark on its icon.`}),`
`,(0,t.jsx)(n.h2,{id:`website-rules`,children:`Website rules`}),`
`,(0,t.jsxs)(n.p,{children:[`Choosing `,(0,t.jsx)(n.strong,{children:`Opens in`}),` saves a website rule. Rules are listed under `,(0,t.jsx)(n.strong,{children:`Crest Settings → Engines → Website rules`}),`, where you can:`]}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[`select `,(0,t.jsx)(n.strong,{children:`Add Website Rule…`}),` to send a website to an engine before you visit it;`]}),`
`,(0,t.jsx)(n.li,{children:`select a rule to change its website or engine;`}),`
`,(0,t.jsxs)(n.li,{children:[`select `,(0,t.jsx)(n.strong,{children:`Remove Rule`}),` to return a website to your default engine.`]}),`
`]}),`
`,(0,t.jsxs)(n.p,{children:[`Rules match the website's scheme, host and port. A rule for `,(0,t.jsx)(n.code,{children:`example.com`}),` does not cover its subdomains. A choice made while browsing privately is not saved as a rule; it lasts until you quit Crest.`]}),`
`,(0,t.jsx)(n.h2,{id:`protected-video`,children:`Protected video`}),`
`,(0,t.jsxs)(n.p,{children:[`Chromium in Crest cannot play DRM-protected video. When a page asks for it, Crest automatically switches to WebKit to try Apple's FairPlay support, unless you have explicitly chosen an engine for that website. The switch checks for unsaved work first. Choosing `,(0,t.jsx)(n.strong,{children:`Stay on Page`}),` keeps the page in Chromium and leaves its website rule unchanged; repeated requests from that document do not prompt again. After an allowed move, the website opens in WebKit on later visits. Select `,(0,t.jsx)(n.strong,{children:`Move Back`}),` to return it to Chromium, or remove its rule in Settings. Playback still depends on the site's support for FairPlay.`]}),`
`,(0,t.jsx)(n.h2,{id:`after-updating-from-a-webkit-only-crest`,children:`After updating from a WebKit-only Crest`}),`
`,(0,t.jsx)(n.p,{children:`The previous stable 0.6 release used WebKit only. Updating to Crest 0.7 keeps your Spaces, tabs, history and Crest Passwords. New pages open in Chromium unless you choose WebKit as your default. Each engine keeps separate website data, so Chromium does not inherit your WebKit sign-ins. Your existing WebKit website data remains available to pages opened in WebKit.`}),`
`,(0,t.jsx)(n.p,{children:`Extensions installed in earlier versions do not carry over. Install them again from the Chrome Web Store.`}),`
`,(0,t.jsx)(n.h2,{id:`what-each-engine-supports`,children:`What each engine supports`}),`
`,(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:`Feature`}),(0,t.jsx)(n.th,{children:`Chromium`}),(0,t.jsx)(n.th,{children:`WebKit`})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Chrome Web Store extensions`}),(0,t.jsx)(n.td,{children:`Yes`}),(0,t.jsx)(n.td,{children:`No`})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Reader`}),(0,t.jsx)(n.td,{children:`No`}),(0,t.jsx)(n.td,{children:`Yes`})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Built-in ad and tracker blocking`}),(0,t.jsx)(n.td,{children:`No. Use a blocking extension.`}),(0,t.jsx)(n.td,{children:`Yes`})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Protected video`}),(0,t.jsx)(n.td,{children:`Automatically switches to WebKit after unsaved-changes checks`}),(0,t.jsx)(n.td,{children:`FairPlay, when the website supports it`})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Find in Page`}),(0,t.jsx)(n.td,{children:`Shows the number of matches`}),(0,t.jsx)(n.td,{children:`Shows whether there is a match`})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Save Web Archive`}),(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.code,{children:`.mhtml`}),` file`]}),(0,t.jsxs)(n.td,{children:[(0,t.jsx)(n.code,{children:`.webarchive`}),` file`]})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:`Inspect a page`}),(0,t.jsx)(n.td,{children:`Chromium DevTools`}),(0,t.jsx)(n.td,{children:`Web Inspector`})]})]})]}),`
`,(0,t.jsxs)(n.p,{children:[`Tabs, Spaces, Split View, Peek, Crest Passwords, site permissions, Picture in Picture and downloads are available in both. Their engine controls can differ; Chromium downloads also offer pause and resume. See `,(0,t.jsx)(n.a,{href:`/guides/page-tools/`,children:`Translate, read, and use page tools`}),` and `,(0,t.jsx)(n.a,{href:`/guides/history-archive-and-downloads/#downloads`,children:`Downloads`}),` for details.`]}),`
`,(0,t.jsx)(n.h2,{id:`current-chromium-limits`,children:`Current Chromium limits`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsx)(n.li,{children:`Crest Passwords handles saved passwords. Built-in address and payment-card autofill are not available.`}),`
`,(0,t.jsx)(n.li,{children:`Screen sharing offers your tabs in the same Space first, with their audio when the site asks for it. A window or your screen goes through the macOS picker, which shares no audio.`}),`
`,(0,t.jsx)(n.li,{children:`Local service-worker and extension notifications work while Crest runs. Remote Web Push is not available.`}),`
`]}),`
`,(0,t.jsxs)(n.p,{children:[`See `,(0,t.jsx)(n.a,{href:`/guides/content-blocking-and-site-permissions/`,children:`Site permissions and notifications`}),` for permission controls and the Google-free engine's site and download protection limits.`]})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};