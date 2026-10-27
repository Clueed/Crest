import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`Native companions`,description:`How extensions in Crest for Mac connect to their companion Mac apps, and what those apps check.`},r=`Most extensions need no desktop helper. A smaller group, with password managers the common example, uses \`nativeMessaging\` to talk to a separate Mac app.

## How Crest finds the helper [#how-crest-finds-the-helper]

Extensions run on Chromium, which handles \`nativeMessaging\` as Chrome does. Each companion app registers a small manifest that names its helper and the extension IDs it will answer.

Most companion apps register only with Google Chrome. When Chromium's own lookup finds no manifest, Crest also checks Chrome's per-user and system \`NativeMessagingHosts\` folders. Chromium still checks the manifest's \`allowed_origins\`, so a helper answers only the extensions its app lists.

## The app decides whether to trust Crest [#the-app-decides-whether-to-trust-crest]

Some companion apps check the browser's code signature before they answer.

- **1Password** accepts a browser you add through its **Add Browser** setting, and checks that browser's signature. See [Set up 1Password in Crest](/guides/onepassword/).
- **iCloud Passwords** uses Apple's password helper, which Apple protects with a launch constraint on the browser's identity and entitlements. See [iCloud Passwords in Crest](/guides/icloud-passwords/).

Use the signed and notarized Crest release in \`/Applications\`. A development build carries a different signature, and companion apps that check the signature reject it.

## What Crest does not do [#what-crest-does-not-do]

- Crest does not copy Chrome's profile or read a companion app's data.
- Safari app extensions and their native handlers do not work in Crest.

## Availability [#availability]

Official Crest for Mac builds are signed with Developer ID, notarized, and published through GitHub Releases, with updates through a signed Sparkle appcast.
`,i={contents:[{heading:void 0,content:"Most extensions need no desktop helper. A smaller group, with password managers the common example, uses `nativeMessaging` to talk to a separate Mac app."},{heading:`how-crest-finds-the-helper`,content:"Extensions run on Chromium, which handles `nativeMessaging` as Chrome does. Each companion app registers a small manifest that names its helper and the extension IDs it will answer."},{heading:`how-crest-finds-the-helper`,content:"Most companion apps register only with Google Chrome. When Chromium's own lookup finds no manifest, Crest also checks Chrome's per-user and system `NativeMessagingHosts` folders. Chromium still checks the manifest's `allowed_origins`, so a helper answers only the extensions its app lists."},{heading:`the-app-decides-whether-to-trust-crest`,content:`Some companion apps check the browser's code signature before they answer.`},{heading:`the-app-decides-whether-to-trust-crest`,content:`**1Password** accepts a browser you add through its **Add Browser** setting, and checks that browser's signature. See Set up 1Password in Crest.`},{heading:`the-app-decides-whether-to-trust-crest`,content:`**iCloud Passwords** uses Apple's password helper, which Apple protects with a launch constraint on the browser's identity and entitlements. See iCloud Passwords in Crest.`},{heading:`the-app-decides-whether-to-trust-crest`,content:"Use the signed and notarized Crest release in `/Applications`. A development build carries a different signature, and companion apps that check the signature reject it."},{heading:`what-crest-does-not-do`,content:`Crest does not copy Chrome's profile or read a companion app's data.`},{heading:`what-crest-does-not-do`,content:`Safari app extensions and their native handlers do not work in Crest.`},{heading:`availability`,content:`Official Crest for Mac builds are signed with Developer ID, notarized, and published through GitHub Releases, with updates through a signed Sparkle appcast.`}],headings:[{id:`how-crest-finds-the-helper`,content:`How Crest finds the helper`},{id:`the-app-decides-whether-to-trust-crest`,content:`The app decides whether to trust Crest`},{id:`what-crest-does-not-do`,content:`What Crest does not do`},{id:`availability`,content:`Availability`}]},a=[{depth:2,url:`#how-crest-finds-the-helper`,title:(0,t.jsx)(t.Fragment,{children:`How Crest finds the helper`})},{depth:2,url:`#the-app-decides-whether-to-trust-crest`,title:(0,t.jsx)(t.Fragment,{children:`The app decides whether to trust Crest`})},{depth:2,url:`#what-crest-does-not-do`,title:(0,t.jsx)(t.Fragment,{children:`What Crest does not do`})},{depth:2,url:`#availability`,title:(0,t.jsx)(t.Fragment,{children:`Availability`})}];function o(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,strong:`strong`,ul:`ul`,...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:[`Most extensions need no desktop helper. A smaller group, with password managers the common example, uses `,(0,t.jsx)(n.code,{children:`nativeMessaging`}),` to talk to a separate Mac app.`]}),`
`,(0,t.jsx)(n.h2,{id:`how-crest-finds-the-helper`,children:`How Crest finds the helper`}),`
`,(0,t.jsxs)(n.p,{children:[`Extensions run on Chromium, which handles `,(0,t.jsx)(n.code,{children:`nativeMessaging`}),` as Chrome does. Each companion app registers a small manifest that names its helper and the extension IDs it will answer.`]}),`
`,(0,t.jsxs)(n.p,{children:[`Most companion apps register only with Google Chrome. When Chromium's own lookup finds no manifest, Crest also checks Chrome's per-user and system `,(0,t.jsx)(n.code,{children:`NativeMessagingHosts`}),` folders. Chromium still checks the manifest's `,(0,t.jsx)(n.code,{children:`allowed_origins`}),`, so a helper answers only the extensions its app lists.`]}),`
`,(0,t.jsx)(n.h2,{id:`the-app-decides-whether-to-trust-crest`,children:`The app decides whether to trust Crest`}),`
`,(0,t.jsx)(n.p,{children:`Some companion apps check the browser's code signature before they answer.`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`1Password`}),` accepts a browser you add through its `,(0,t.jsx)(n.strong,{children:`Add Browser`}),` setting, and checks that browser's signature. See `,(0,t.jsx)(n.a,{href:`/guides/onepassword/`,children:`Set up 1Password in Crest`}),`.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`iCloud Passwords`}),` uses Apple's password helper, which Apple protects with a launch constraint on the browser's identity and entitlements. See `,(0,t.jsx)(n.a,{href:`/guides/icloud-passwords/`,children:`iCloud Passwords in Crest`}),`.`]}),`
`]}),`
`,(0,t.jsxs)(n.p,{children:[`Use the signed and notarized Crest release in `,(0,t.jsx)(n.code,{children:`/Applications`}),`. A development build carries a different signature, and companion apps that check the signature reject it.`]}),`
`,(0,t.jsx)(n.h2,{id:`what-crest-does-not-do`,children:`What Crest does not do`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsx)(n.li,{children:`Crest does not copy Chrome's profile or read a companion app's data.`}),`
`,(0,t.jsx)(n.li,{children:`Safari app extensions and their native handlers do not work in Crest.`}),`
`]}),`
`,(0,t.jsx)(n.h2,{id:`availability`,children:`Availability`}),`
`,(0,t.jsx)(n.p,{children:`Official Crest for Mac builds are signed with Developer ID, notarized, and published through GitHub Releases, with updates through a signed Sparkle appcast.`})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};