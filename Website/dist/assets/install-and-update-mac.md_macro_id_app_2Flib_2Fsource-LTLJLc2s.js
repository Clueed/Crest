import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`Install and update Crest for Mac`,description:`Download Crest directly, install it in Applications, and understand automatic updates.`},r=`Crest for Mac requires Apple silicon and macOS 26.1 or later. It is distributed directly as a signed and notarized app with Chromium and WebKit; see [Chromium and WebKit on Mac](/guides/engines/). Crest for iPhone and iPad is on the App Store and continues to use WebKit.

## Install the latest Mac release [#install-the-latest-mac-release]

1. Open the [latest stable Crest release](https://github.com/pauljoda/Crest/releases/latest).
2. Download its \`Installer-….dmg\` file.
3. Open the disk image, then drag Crest into **Applications**.
4. Eject the disk image and open Crest from Applications.

Alternatively, Crest can be installed via Homebrew:
1. Open Terminal.
2. Run \`brew install --cask crest-browser\`

Keeping Crest in Applications gives macOS and the updater one stable installed location. If Gatekeeper reports that the app cannot be verified, do not bypass the warning; download the current release again from the official Releases page.

## Automatic updates [#automatic-updates]

Crest uses Sparkle to check for signed updates from inside the installed app. When an update is available, review the release, install it, and let Crest relaunch. Your Spaces and browsing data remain in their normal app storage rather than inside the application bundle.

Turn automatic checks and installs on or off in **Settings → About**, which also has **Check for Updates…**. You can also open the app menu and choose **Check for Updates**. A manual check uses the same signed update channel as the automatic check.

## Update channels [#update-channels]

Use **Settings → About** to choose the update channel:

- **Stable** is the normal public release cadence.
- **Nightly** receives newer builds sooner and can change more frequently.
- **Development** follows the latest signed public \`main\` build and can change several times a day.

Changing channels changes which future update is offered; it does not move or duplicate your profile.

## Updating from an older Crest [#updating-from-an-older-crest]

The same installer updates older WebKit-only versions and versions that already include Chromium. Your Spaces and browser records stay in place. Chromium and WebKit keep separate website sign-ins, and older WebKit extension installations do not carry over. See [Upgrading from a WebKit-only Crest](/guides/engines/#after-updating-from-a-webkit-only-crest) before switching engines.

Crest checks pages for unsaved work before an update restart. Choose **Stay on Page** to keep working, then retry the restart when ready. Updates are offered only when your Mac meets the whole app's macOS requirement.

## iPhone and iPad [#iphone-and-ipad]

Install Crest for iPhone and iPad from the [App Store](https://apps.apple.com/us/app/crest-browser/id6797335023), or join the beta through [TestFlight](https://testflight.apple.com/join/vV1CM49Q). If iCloud sync is enabled, the same durable Space structure can follow you between Mac, iPad, and iPhone.
`,i={contents:[{heading:void 0,content:`Crest for Mac requires Apple silicon and macOS 26.1 or later. It is distributed directly as a signed and notarized app with Chromium and WebKit; see Chromium and WebKit on Mac. Crest for iPhone and iPad is on the App Store and continues to use WebKit.`},{heading:`install-the-latest-mac-release`,content:`Open the latest stable Crest release.`},{heading:`install-the-latest-mac-release`,content:"Download its `Installer-….dmg` file."},{heading:`install-the-latest-mac-release`,content:`Open the disk image, then drag Crest into **Applications**.`},{heading:`install-the-latest-mac-release`,content:`Eject the disk image and open Crest from Applications.`},{heading:`install-the-latest-mac-release`,content:`Alternatively, Crest can be installed via Homebrew:`},{heading:`install-the-latest-mac-release`,content:`Open Terminal.`},{heading:`install-the-latest-mac-release`,content:"Run `brew install --cask crest-browser`"},{heading:`install-the-latest-mac-release`,content:`Keeping Crest in Applications gives macOS and the updater one stable installed location. If Gatekeeper reports that the app cannot be verified, do not bypass the warning; download the current release again from the official Releases page.`},{heading:`automatic-updates`,content:`Crest uses Sparkle to check for signed updates from inside the installed app. When an update is available, review the release, install it, and let Crest relaunch. Your Spaces and browsing data remain in their normal app storage rather than inside the application bundle.`},{heading:`automatic-updates`,content:`Turn automatic checks and installs on or off in **Settings → About**, which also has **Check for Updates…**. You can also open the app menu and choose **Check for Updates**. A manual check uses the same signed update channel as the automatic check.`},{heading:`update-channels`,content:`Use **Settings → About** to choose the update channel:`},{heading:`update-channels`,content:`**Stable** is the normal public release cadence.`},{heading:`update-channels`,content:`**Nightly** receives newer builds sooner and can change more frequently.`},{heading:`update-channels`,content:"**Development** follows the latest signed public `main` build and can change several times a day."},{heading:`update-channels`,content:`Changing channels changes which future update is offered; it does not move or duplicate your profile.`},{heading:`updating-from-an-older-crest`,content:`The same installer updates older WebKit-only versions and versions that already include Chromium. Your Spaces and browser records stay in place. Chromium and WebKit keep separate website sign-ins, and older WebKit extension installations do not carry over. See Upgrading from a WebKit-only Crest before switching engines.`},{heading:`updating-from-an-older-crest`,content:`Crest checks pages for unsaved work before an update restart. Choose **Stay on Page** to keep working, then retry the restart when ready. Updates are offered only when your Mac meets the whole app's macOS requirement.`},{heading:`iphone-and-ipad`,content:`Install Crest for iPhone and iPad from the App Store, or join the beta through TestFlight. If iCloud sync is enabled, the same durable Space structure can follow you between Mac, iPad, and iPhone.`}],headings:[{id:`install-the-latest-mac-release`,content:`Install the latest Mac release`},{id:`automatic-updates`,content:`Automatic updates`},{id:`update-channels`,content:`Update channels`},{id:`updating-from-an-older-crest`,content:`Updating from an older Crest`},{id:`iphone-and-ipad`,content:`iPhone and iPad`}]},a=[{depth:2,url:`#install-the-latest-mac-release`,title:(0,t.jsx)(t.Fragment,{children:`Install the latest Mac release`})},{depth:2,url:`#automatic-updates`,title:(0,t.jsx)(t.Fragment,{children:`Automatic updates`})},{depth:2,url:`#update-channels`,title:(0,t.jsx)(t.Fragment,{children:`Update channels`})},{depth:2,url:`#updating-from-an-older-crest`,title:(0,t.jsx)(t.Fragment,{children:`Updating from an older Crest`})},{depth:2,url:`#iphone-and-ipad`,title:(0,t.jsx)(t.Fragment,{children:`iPhone and iPad`})}];function o(e){let n={a:`a`,code:`code`,h2:`h2`,li:`li`,ol:`ol`,p:`p`,strong:`strong`,ul:`ul`,...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.p,{children:[`Crest for Mac requires Apple silicon and macOS 26.1 or later. It is distributed directly as a signed and notarized app with Chromium and WebKit; see `,(0,t.jsx)(n.a,{href:`/guides/engines/`,children:`Chromium and WebKit on Mac`}),`. Crest for iPhone and iPad is on the App Store and continues to use WebKit.`]}),`
`,(0,t.jsx)(n.h2,{id:`install-the-latest-mac-release`,children:`Install the latest Mac release`}),`
`,(0,t.jsxs)(n.ol,{children:[`
`,(0,t.jsxs)(n.li,{children:[`Open the `,(0,t.jsx)(n.a,{href:`https://github.com/pauljoda/Crest/releases/latest`,children:`latest stable Crest release`}),`.`]}),`
`,(0,t.jsxs)(n.li,{children:[`Download its `,(0,t.jsx)(n.code,{children:`Installer-….dmg`}),` file.`]}),`
`,(0,t.jsxs)(n.li,{children:[`Open the disk image, then drag Crest into `,(0,t.jsx)(n.strong,{children:`Applications`}),`.`]}),`
`,(0,t.jsx)(n.li,{children:`Eject the disk image and open Crest from Applications.`}),`
`]}),`
`,(0,t.jsx)(n.p,{children:`Alternatively, Crest can be installed via Homebrew:`}),`
`,(0,t.jsxs)(n.ol,{children:[`
`,(0,t.jsx)(n.li,{children:`Open Terminal.`}),`
`,(0,t.jsxs)(n.li,{children:[`Run `,(0,t.jsx)(n.code,{children:`brew install --cask crest-browser`})]}),`
`]}),`
`,(0,t.jsx)(n.p,{children:`Keeping Crest in Applications gives macOS and the updater one stable installed location. If Gatekeeper reports that the app cannot be verified, do not bypass the warning; download the current release again from the official Releases page.`}),`
`,(0,t.jsx)(n.h2,{id:`automatic-updates`,children:`Automatic updates`}),`
`,(0,t.jsx)(n.p,{children:`Crest uses Sparkle to check for signed updates from inside the installed app. When an update is available, review the release, install it, and let Crest relaunch. Your Spaces and browsing data remain in their normal app storage rather than inside the application bundle.`}),`
`,(0,t.jsxs)(n.p,{children:[`Turn automatic checks and installs on or off in `,(0,t.jsx)(n.strong,{children:`Settings → About`}),`, which also has `,(0,t.jsx)(n.strong,{children:`Check for Updates…`}),`. You can also open the app menu and choose `,(0,t.jsx)(n.strong,{children:`Check for Updates`}),`. A manual check uses the same signed update channel as the automatic check.`]}),`
`,(0,t.jsx)(n.h2,{id:`update-channels`,children:`Update channels`}),`
`,(0,t.jsxs)(n.p,{children:[`Use `,(0,t.jsx)(n.strong,{children:`Settings → About`}),` to choose the update channel:`]}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Stable`}),` is the normal public release cadence.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Nightly`}),` receives newer builds sooner and can change more frequently.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Development`}),` follows the latest signed public `,(0,t.jsx)(n.code,{children:`main`}),` build and can change several times a day.`]}),`
`]}),`
`,(0,t.jsx)(n.p,{children:`Changing channels changes which future update is offered; it does not move or duplicate your profile.`}),`
`,(0,t.jsx)(n.h2,{id:`updating-from-an-older-crest`,children:`Updating from an older Crest`}),`
`,(0,t.jsxs)(n.p,{children:[`The same installer updates older WebKit-only versions and versions that already include Chromium. Your Spaces and browser records stay in place. Chromium and WebKit keep separate website sign-ins, and older WebKit extension installations do not carry over. See `,(0,t.jsx)(n.a,{href:`/guides/engines/#after-updating-from-a-webkit-only-crest`,children:`Upgrading from a WebKit-only Crest`}),` before switching engines.`]}),`
`,(0,t.jsxs)(n.p,{children:[`Crest checks pages for unsaved work before an update restart. Choose `,(0,t.jsx)(n.strong,{children:`Stay on Page`}),` to keep working, then retry the restart when ready. Updates are offered only when your Mac meets the whole app's macOS requirement.`]}),`
`,(0,t.jsx)(n.h2,{id:`iphone-and-ipad`,children:`iPhone and iPad`}),`
`,(0,t.jsxs)(n.p,{children:[`Install Crest for iPhone and iPad from the `,(0,t.jsx)(n.a,{href:`https://apps.apple.com/us/app/crest-browser/id6797335023`,children:`App Store`}),`, or join the beta through `,(0,t.jsx)(n.a,{href:`https://testflight.apple.com/join/vV1CM49Q`,children:`TestFlight`}),`. If iCloud sync is enabled, the same durable Space structure can follow you between Mac, iPad, and iPhone.`]})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};