# Set up 1Password in Crest (/guides/onepassword)

The 1Password Chrome Web Store extension runs on Chromium pages in Crest for Mac. To unlock and fill through the 1Password app, the app must trust Crest as a browser.

<Callout type="warn" title="Use the signed Crest release">
1Password checks the browser's code signature. Use the Developer ID signed and notarized Crest release installed in `/Applications`. A development build carries a different signature, and 1Password rejects it.
</Callout>

## Before you begin [#before-you-begin]

- Install and unlock **1Password for Mac**.
- Switch to the Crest Space that should own the extension. Installations do not copy to another Space or device on their own.

## Install the extension [#install-the-extension]

1. In Crest for Mac, open the 1Password page in the Chrome Web Store.
2. Select **Add to Crest**.
3. Review the package, its permissions and the destination Space in Crest's review sheet.
4. Select **Add Extension**, then **Done**.

## Authorize Crest in 1Password [#authorize-crest-in-1password]

1. Open and unlock **1Password for Mac**.
2. Select your account or collection at the top of the sidebar, then select **Settings**.
3. Select **Browser** in the sidebar.
4. Select **Add Browser**.
5. Choose **Crest** in `/Applications`.
6. Review 1Password's access prompt and select **Authorize**.

1Password warns that an additional browser can reach your saved information while 1Password is unlocked, so it can save and fill logins. Only authorize a Crest build you trust.

## If it does not connect [#if-it-does-not-connect]

Reinstalling the extension does not change the signature 1Password checks. Confirm that you added the Crest app in `/Applications`, then see [Native companions](/guides/native-companion-limits/) and [Troubleshoot an extension](/guides/troubleshoot-extension-compatibility/).

## Official references [#official-references]

- [Connect additional browsers to the 1Password app](https://support.1password.com/additional-browsers/)
- [1Password browser code-signature requirements](https://support.1password.com/code-signature/)
