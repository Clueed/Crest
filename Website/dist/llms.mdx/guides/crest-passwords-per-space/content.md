# Turn Crest Passwords on or off per Space (/guides/crest-passwords-per-space)

Crest Passwords are private to the Space that owns them. You can stop using Crest-owned suggestions, generation, and save prompts in one Space without deleting its saved passwords or changing another Space.

## Change the setting [#change-the-setting]

On Mac:

1. Open **Crest Settings** and select the Space in the sidebar.
2. Select **Passwords**.
3. Turn **Use Crest Passwords** on or off.

On iPhone and iPad:

1. Open **Settings → Passwords**.
2. Choose the Space you want to change from the **Space** menu.
3. Turn **Use Crest Passwords** on or off.

When Crest Passwords is off, saved passwords remain in that Space until you delete them. Turning the setting back on makes them available to matching sites again.

## Related controls [#related-controls]

The same page lists the Space’s saved passwords, with **Import Passwords…** and **Export Passwords…**. When Crest Passwords is on, supported Mac builds can also show:

- **Sync with iCloud Keychain**, which updates whether existing and future Crest credentials in that Space synchronize through the system Keychain.
- **Offer a copy to Passwords**, which lets the system Passwords app ask separately for a copy after Crest saves in the Space.

System Passwords and passkeys are provider-managed and may appear in any Space for a matching site. They are separate from Crest Passwords’ Space-local records. On Mac, check Crest’s access to system passkeys in **Settings → Privacy → System permissions → Passkeys**.

<Callout type="info" title="What turning it off does not do">
It does not delete saved passwords, export them, move them to another Space, or place password values in CloudKit session data.
</Callout>

Private Spaces must be unlocked before Crest reveals account and site metadata or changes their password settings.

## Storage and deletion [#storage-and-deletion]

Crest Passwords are saved in the system Keychain and suggested only for matching websites. Viewing, copying, or exporting a password can require device authentication.

Deleting a saved password, clearing a site's data, and deleting a whole Space are separate actions, and each shows what it removes before it proceeds.
