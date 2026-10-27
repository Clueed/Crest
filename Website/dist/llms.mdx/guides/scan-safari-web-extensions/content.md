# Safari Web Extensions (/guides/scan-safari-web-extensions)

Crest does not scan the apps on your Mac for Safari Web Extensions, and it cannot add one from an app bundle.

Extensions in Crest for Mac run on the Chromium engine, which installs Chrome extensions from the Chrome Web Store. A Safari Web Extension ships inside a Mac app in Safari's format, and Chromium does not load it. WebKit pages, and Crest on iPhone and iPad, run no extensions.

Many Safari Web Extensions also publish a Chrome version. Look for the same extension in the Chrome Web Store and install it from there. See [Install from the Chrome Web Store](/guides/install-chrome-web-store/).

Safari content blockers and legacy Safari App Extensions are separate formats, and Crest does not support them either.
