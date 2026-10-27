import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`Extension known limitations`,description:`Where extensions run in Crest, and the limits that apply to them.`},r=`Crest for Mac runs Chrome extensions from the Chrome Web Store on its Chromium engine. The [extension compatibility](/guides/extension-api-compatibility/) page lists which browser features Crest connects to its interface. This page collects the limits.

<Callout type="info" title="Mac, Chromium pages">
Extensions run only on Chromium pages in Crest for Mac. Pages you open in WebKit, including protected-video pages that switch there automatically, run without extensions, as does Crest on iPhone and iPad. Installations and settings stay in one Space on one device.
</Callout>

## Package formats [#package-formats]

- Chrome Web Store extensions install and update through Chromium.
- Unpacked extensions install from Chromium's extension manager in developer mode.
- Firefox add-ons, Safari Web Extensions, Safari content blockers and Safari App Extensions are not supported.

## Spaces and private windows [#spaces-and-private-windows]

- Each Space has its own installation and data. Copying an extension to another Space installs it fresh; its data does not follow.
- Private windows use a fresh, separate profile and do not run installed extensions. You cannot install or remove extensions from a private window.
- A locked Space cannot receive an extension until you unlock it.

## Browser features [#browser-features]

- Crest does not yet match Chrome for every extension API. A feature that needs part of Chrome's window that Crest does not draw may be missing.
- A window an extension opens appears as a Crest window in the extension's Space. A requested window state, such as maximized, is ignored.
- Extension shortcuts work only when Crest's own shortcuts don't use the same keys.

## Companion apps [#companion-apps]

Extensions that talk to a Mac app, such as password managers, depend on that app trusting Crest's signature. See [Native companions](/guides/native-companion-limits/), [Set up 1Password in Crest](/guides/onepassword/) and [iCloud Passwords in Crest](/guides/icloud-passwords/).

## Extensions from older Crest versions [#extensions-from-older-crest-versions]

Earlier versions of Crest ran extensions in WebKit through their own compatibility layer. Crest no longer runs extensions in WebKit, and those installations do not carry over. Install each extension again from the Chrome Web Store in the Space you want.

If an installed extension misbehaves, continue with [Troubleshoot an extension](/guides/troubleshoot-extension-compatibility/).
`,i={contents:[{heading:void 0,content:`Crest for Mac runs Chrome extensions from the Chrome Web Store on its Chromium engine. The extension compatibility page lists which browser features Crest connects to its interface. This page collects the limits.`},{heading:void 0,content:`Extensions run only on Chromium pages in Crest for Mac. Pages you open in WebKit, including protected-video pages that switch there automatically, run without extensions, as does Crest on iPhone and iPad. Installations and settings stay in one Space on one device.`},{heading:`package-formats`,content:`Chrome Web Store extensions install and update through Chromium.`},{heading:`package-formats`,content:`Unpacked extensions install from Chromium's extension manager in developer mode.`},{heading:`package-formats`,content:`Firefox add-ons, Safari Web Extensions, Safari content blockers and Safari App Extensions are not supported.`},{heading:`spaces-and-private-windows`,content:`Each Space has its own installation and data. Copying an extension to another Space installs it fresh; its data does not follow.`},{heading:`spaces-and-private-windows`,content:`Private windows use a fresh, separate profile and do not run installed extensions. You cannot install or remove extensions from a private window.`},{heading:`spaces-and-private-windows`,content:`A locked Space cannot receive an extension until you unlock it.`},{heading:`browser-features`,content:`Crest does not yet match Chrome for every extension API. A feature that needs part of Chrome's window that Crest does not draw may be missing.`},{heading:`browser-features`,content:`A window an extension opens appears as a Crest window in the extension's Space. A requested window state, such as maximized, is ignored.`},{heading:`browser-features`,content:`Extension shortcuts work only when Crest's own shortcuts don't use the same keys.`},{heading:`companion-apps`,content:`Extensions that talk to a Mac app, such as password managers, depend on that app trusting Crest's signature. See Native companions, Set up 1Password in Crest and iCloud Passwords in Crest.`},{heading:`extensions-from-older-crest-versions`,content:`Earlier versions of Crest ran extensions in WebKit through their own compatibility layer. Crest no longer runs extensions in WebKit, and those installations do not carry over. Install each extension again from the Chrome Web Store in the Space you want.`},{heading:`extensions-from-older-crest-versions`,content:`If an installed extension misbehaves, continue with Troubleshoot an extension.`}],headings:[{id:`package-formats`,content:`Package formats`},{id:`spaces-and-private-windows`,content:`Spaces and private windows`},{id:`browser-features`,content:`Browser features`},{id:`companion-apps`,content:`Companion apps`},{id:`extensions-from-older-crest-versions`,content:`Extensions from older Crest versions`}]},a=[{depth:2,url:`#package-formats`,title:(0,t.jsx)(t.Fragment,{children:`Package formats`})},{depth:2,url:`#spaces-and-private-windows`,title:(0,t.jsx)(t.Fragment,{children:`Spaces and private windows`})},{depth:2,url:`#browser-features`,title:(0,t.jsx)(t.Fragment,{children:`Browser features`})},{depth:2,url:`#companion-apps`,title:(0,t.jsx)(t.Fragment,{children:`Companion apps`})},{depth:2,url:`#extensions-from-older-crest-versions`,title:(0,t.jsx)(t.Fragment,{children:`Extensions from older Crest versions`})}];function o(e){let n={a:`a`,h2:`h2`,li:`li`,p:`p`,ul:`ul`,...e.components},{Callout:r}=n;return r||c(`Callout`,!0),(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:[`Crest for Mac runs Chrome extensions from the Chrome Web Store on its Chromium engine. The `,(0,t.jsx)(n.a,{href:`/guides/extension-api-compatibility/`,children:`extension compatibility`}),` page lists which browser features Crest connects to its interface. This page collects the limits.`]}),`
`,(0,t.jsx)(r,{type:`info`,title:`Mac, Chromium pages`,children:(0,t.jsx)(n.p,{children:`Extensions run only on Chromium pages in Crest for Mac. Pages you open in WebKit, including protected-video pages that switch there automatically, run without extensions, as does Crest on iPhone and iPad. Installations and settings stay in one Space on one device.`})}),`
`,(0,t.jsx)(n.h2,{id:`package-formats`,children:`Package formats`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsx)(n.li,{children:`Chrome Web Store extensions install and update through Chromium.`}),`
`,(0,t.jsx)(n.li,{children:`Unpacked extensions install from Chromium's extension manager in developer mode.`}),`
`,(0,t.jsx)(n.li,{children:`Firefox add-ons, Safari Web Extensions, Safari content blockers and Safari App Extensions are not supported.`}),`
`]}),`
`,(0,t.jsx)(n.h2,{id:`spaces-and-private-windows`,children:`Spaces and private windows`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsx)(n.li,{children:`Each Space has its own installation and data. Copying an extension to another Space installs it fresh; its data does not follow.`}),`
`,(0,t.jsx)(n.li,{children:`Private windows use a fresh, separate profile and do not run installed extensions. You cannot install or remove extensions from a private window.`}),`
`,(0,t.jsx)(n.li,{children:`A locked Space cannot receive an extension until you unlock it.`}),`
`]}),`
`,(0,t.jsx)(n.h2,{id:`browser-features`,children:`Browser features`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsx)(n.li,{children:`Crest does not yet match Chrome for every extension API. A feature that needs part of Chrome's window that Crest does not draw may be missing.`}),`
`,(0,t.jsx)(n.li,{children:`A window an extension opens appears as a Crest window in the extension's Space. A requested window state, such as maximized, is ignored.`}),`
`,(0,t.jsx)(n.li,{children:`Extension shortcuts work only when Crest's own shortcuts don't use the same keys.`}),`
`]}),`
`,(0,t.jsx)(n.h2,{id:`companion-apps`,children:`Companion apps`}),`
`,(0,t.jsxs)(n.p,{children:[`Extensions that talk to a Mac app, such as password managers, depend on that app trusting Crest's signature. See `,(0,t.jsx)(n.a,{href:`/guides/native-companion-limits/`,children:`Native companions`}),`, `,(0,t.jsx)(n.a,{href:`/guides/onepassword/`,children:`Set up 1Password in Crest`}),` and `,(0,t.jsx)(n.a,{href:`/guides/icloud-passwords/`,children:`iCloud Passwords in Crest`}),`.`]}),`
`,(0,t.jsx)(n.h2,{id:`extensions-from-older-crest-versions`,children:`Extensions from older Crest versions`}),`
`,(0,t.jsx)(n.p,{children:`Earlier versions of Crest ran extensions in WebKit through their own compatibility layer. Crest no longer runs extensions in WebKit, and those installations do not carry over. Install each extension again from the Chrome Web Store in the Space you want.`}),`
`,(0,t.jsxs)(n.p,{children:[`If an installed extension misbehaves, continue with `,(0,t.jsx)(n.a,{href:`/guides/troubleshoot-extension-compatibility/`,children:`Troubleshoot an extension`}),`.`]})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}function c(e,t){throw Error(`Expected `+(t?`component`:`object`)+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};