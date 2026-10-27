import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`iCloud Passwords in Crest`,description:`How the iCloud Passwords extension connects to Apple's password helper in Crest for Mac, and what Apple requires.`},r=`The iCloud Passwords extension installs from the Chrome Web Store into Crest for Mac and runs on Chromium pages. It is only half of iCloud Passwords. The other half is Apple's system password helper, which the extension reaches through native messaging.

## How the extension finds Apple's helper [#how-the-extension-finds-apples-helper]

Apple registers its helper for Google Chrome. Crest checks Chrome's native-messaging folders when Chromium's own lookup finds nothing, so the extension can reach it. Chromium still checks that the helper allows this extension. Crest does not read your passwords; Apple's helper controls authentication and access to them.

## What Apple checks [#what-apple-checks]

Apple protects its helper with a launch constraint on the browser. The browser must carry the managed **Web Browser Public Key Credential Requests** capability, or use an identity Apple has approved. The entitlement is:

\`\`\`text
com.apple.developer.web-browser.public-key-credential
\`\`\`

The signed Crest release carries this entitlement. Development and review builds do not, so iCloud Passwords cannot pair in them. Adding the entitlement to a build yourself does not authorize it; Apple checks it against the app's provisioning.

## If it does not pair [#if-it-does-not-pair]

- Confirm that you are running the signed Crest release from \`/Applications\`.
- Reinstalling the extension does not change the browser's signature or entitlements.
- Until it pairs, use Crest's built-in passwords for the Space or another password manager.

## Official reference [#official-reference]

- [Web Browser Public Key Credential entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.web-browser.public-key-credential)
`,i={contents:[{heading:void 0,content:`The iCloud Passwords extension installs from the Chrome Web Store into Crest for Mac and runs on Chromium pages. It is only half of iCloud Passwords. The other half is Apple's system password helper, which the extension reaches through native messaging.`},{heading:`how-the-extension-finds-apples-helper`,content:`Apple registers its helper for Google Chrome. Crest checks Chrome's native-messaging folders when Chromium's own lookup finds nothing, so the extension can reach it. Chromium still checks that the helper allows this extension. Crest does not read your passwords; Apple's helper controls authentication and access to them.`},{heading:`what-apple-checks`,content:`Apple protects its helper with a launch constraint on the browser. The browser must carry the managed **Web Browser Public Key Credential Requests** capability, or use an identity Apple has approved. The entitlement is:`},{heading:`what-apple-checks`,content:`The signed Crest release carries this entitlement. Development and review builds do not, so iCloud Passwords cannot pair in them. Adding the entitlement to a build yourself does not authorize it; Apple checks it against the app's provisioning.`},{heading:`if-it-does-not-pair`,content:"Confirm that you are running the signed Crest release from `/Applications`."},{heading:`if-it-does-not-pair`,content:`Reinstalling the extension does not change the browser's signature or entitlements.`},{heading:`if-it-does-not-pair`,content:`Until it pairs, use Crest's built-in passwords for the Space or another password manager.`},{heading:`official-reference`,content:`Web Browser Public Key Credential entitlement`}],headings:[{id:`how-the-extension-finds-apples-helper`,content:`How the extension finds Apple's helper`},{id:`what-apple-checks`,content:`What Apple checks`},{id:`if-it-does-not-pair`,content:`If it does not pair`},{id:`official-reference`,content:`Official reference`}]},a=[{depth:2,url:`#how-the-extension-finds-apples-helper`,title:(0,t.jsx)(t.Fragment,{children:`How the extension finds Apple's helper`})},{depth:2,url:`#what-apple-checks`,title:(0,t.jsx)(t.Fragment,{children:`What Apple checks`})},{depth:2,url:`#if-it-does-not-pair`,title:(0,t.jsx)(t.Fragment,{children:`If it does not pair`})},{depth:2,url:`#official-reference`,title:(0,t.jsx)(t.Fragment,{children:`Official reference`})}];function o(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,p:`p`,pre:`pre`,span:`span`,strong:`strong`,ul:`ul`,...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:`The iCloud Passwords extension installs from the Chrome Web Store into Crest for Mac and runs on Chromium pages. It is only half of iCloud Passwords. The other half is Apple's system password helper, which the extension reaches through native messaging.`}),`
`,(0,t.jsx)(n.h2,{id:`how-the-extension-finds-apples-helper`,children:`How the extension finds Apple's helper`}),`
`,(0,t.jsx)(n.p,{children:`Apple registers its helper for Google Chrome. Crest checks Chrome's native-messaging folders when Chromium's own lookup finds nothing, so the extension can reach it. Chromium still checks that the helper allows this extension. Crest does not read your passwords; Apple's helper controls authentication and access to them.`}),`
`,(0,t.jsx)(n.h2,{id:`what-apple-checks`,children:`What Apple checks`}),`
`,(0,t.jsxs)(n.p,{children:[`Apple protects its helper with a launch constraint on the browser. The browser must carry the managed `,(0,t.jsx)(n.strong,{children:`Web Browser Public Key Credential Requests`}),` capability, or use an identity Apple has approved. The entitlement is:`]}),`
`,(0,t.jsx)(t.Fragment,{children:(0,t.jsx)(n.pre,{className:`shiki shiki-themes github-light github-dark`,style:{"--shiki-light":`#24292e`,"--shiki-dark":`#e1e4e8`,"--shiki-light-bg":`#fff`,"--shiki-dark-bg":`#24292e`},tabIndex:`0`,icon:`<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>`,children:(0,t.jsx)(n.code,{children:(0,t.jsx)(n.span,{className:`line`,children:(0,t.jsx)(n.span,{children:`com.apple.developer.web-browser.public-key-credential`})})})})}),`
`,(0,t.jsx)(n.p,{children:`The signed Crest release carries this entitlement. Development and review builds do not, so iCloud Passwords cannot pair in them. Adding the entitlement to a build yourself does not authorize it; Apple checks it against the app's provisioning.`}),`
`,(0,t.jsx)(n.h2,{id:`if-it-does-not-pair`,children:`If it does not pair`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[`Confirm that you are running the signed Crest release from `,(0,t.jsx)(n.code,{children:`/Applications`}),`.`]}),`
`,(0,t.jsx)(n.li,{children:`Reinstalling the extension does not change the browser's signature or entitlements.`}),`
`,(0,t.jsx)(n.li,{children:`Until it pairs, use Crest's built-in passwords for the Space or another password manager.`}),`
`]}),`
`,(0,t.jsx)(n.h2,{id:`official-reference`,children:`Official reference`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsx)(n.li,{children:(0,t.jsx)(n.a,{href:`https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.web-browser.public-key-credential`,children:`Web Browser Public Key Credential entitlement`})}),`
`]})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};