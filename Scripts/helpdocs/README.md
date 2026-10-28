# Help article scenarios

These scripts keep Crest Help articles in `Website/content/docs/` true to the
app. Each covered article has a scenario in `Website/helpdocs/<slug>.yaml`.
The runner builds a test copy of Crest, replays the scenario through the
accessibility tree, and then:

- regenerates the article's screenshots and clip,
- checks every UI string the article shows against the running app, and
- follows the article from a fresh session and checks that it worked.

The runner never edits article text. It reports what is stale, and a person
or an agent fixes the wording.

## Requirements

- A Mac GUI session that has granted Accessibility and Screen Recording to the
  terminal. The runner can't run in CI.
- uv, ffmpeg and Xcode. Run `npm ci` in `Website` so the check stage can
  build the site.
- A display of at least 1440×900. On smaller displays the window shrinks to
  fit, and captures no longer match a typical Mac.

## Run

```sh
Scripts/helpdocs/run link-routing             # every stage, then remove the test build
Scripts/helpdocs/run --changed --base main    # only articles whose sources changed
Scripts/helpdocs/run link-routing --publish   # also copy fresh captures next to the article
Scripts/helpdocs/run link-routing --stage check --stage verify --keep
```

The stages run in this order:

1. **build**: builds an unsigned Debug copy of Crest into the work folder.
2. **capture**: launches it in an isolated, seeded session, runs `setup`
   unrecorded, then records the screen while it replays `steps`. It takes a
   window-only PNG for each `capture`, and reports which ones differ from
   the published images.
3. **polish**: turns the recording into the article's clip. It zooms in on
   clicks, speeds up idle time, and frames the window on the docs page
   background. It renders one clip per site theme, using the
   `--color-fd-background` values in `Website/app/app.css`: the `@theme`
   value for light and the `.dark` value for dark. Each clip's first frame
   is saved beside it as `<clip>.poster.png`, which the page shows until
   the clip loads. Screenshots need no frame; their corners are
   transparent. The website build serves screenshots and posters as AVIF
   (screenshots with a WebP fallback), so publish them as PNG. An article
   shows a screenshot at half its pixel width, the Retina capture's size in
   points, and never wider than the column, so a cropped capture appears at
   the size it has in the app.
4. **check**: fails if any of these is true:
   - a declared label wasn't shown in the app;
   - a **bold** term in the article wasn't shown in the app;
   - a label whose value changed since `--base` still appears anywhere in
     the article, including alt text;
   - a published asset isn't referenced by the article.

   It also builds the website.
5. **verify**: relaunches the app, runs `setup`, then replays `verify`.

Afterwards the test copy is quit, unregistered from Launch Services, and
deleted, unless you pass `--keep`. Recordings, captures, `run.json` and
`report.json` stay in the work folder (`--work`, default
`$TMPDIR/crest-helpdocs`), outside the repository.

Run `Scripts/helpdocs/axdump` while the test copy is running to print its
accessibility tree when you choose targets for a new scenario.

## Scenario format

| Key | Contents |
| --- | --- |
| `article` | The article, relative to `Website/` |
| `section` | Optional heading; the check then covers only that section |
| `sources` | Glob patterns for source files whose changes may make the article stale |
| `labels` | Every Crest UI string the scenario or article relies on, declared once. Refer to one as `$name` |
| `keys` | Bold terms in the article that name keyboard keys rather than UI text |
| `serve` | A fixture folder next to the scenario, served on a free local port as `{server}` |
| `launch` | `env` for the test copy and the requested `window` size |
| `setup` | Steps that prepare the app without being recorded. The text they pass counts as seen |
| `steps` | The recorded steps |
| `assets` | Capture name to image path, relative to the article's folder |
| `clip` | The light clip's path, relative to the article's folder. The dark clip adds `.dark` before the extension. Each clip has a poster beside it with `.poster` before the extension. The article shows them with `<Clip src={…} dark={…} poster={…} darkPoster={…} label="…" />` |
| `clip_zoom` | How far the clip zooms in on clicks; `1.0` keeps the whole window (default `1.7`) |
| `verify` | The article's own steps, followed by checks of the outcome |

Each step has a `name` and an `action`:

| Action | Keys |
| --- | --- |
| `click` | `target`, and optionally `button: right` for a secondary click |
| `type` | `text`, typed one character at a time. With `target`, it clicks the field first and fails unless the field takes focus and then holds the text. Without one, it types into the field that already has focus, such as the command palette after ⌘L |
| `drag` | `target`, and either `by` (points) or `to`, a target to drop on at `at`, a fraction of its frame (default `[0.5, 0.5]`); optionally `duration` and `hold` before release |
| `move` | `target`, and optionally `at`, a fraction of its frame (default `[0.5, 0.5]`) |
| `scroll` | `target`, `lines` |
| `key` | `keys`, a System Events phrase for a shortcut or special key, such as `keystroke "," using command down` or `key code 48`. Plain text such as `keystroke "gith"` fails; System Events sends it all at once, so it looks pasted in a clip. Use `type` |
| `open_url` | `url`, opened in the test copy from another app |
| `expect` | `target`, and optionally `attribute` (default `AXValue`) and `contains`; or `absent: true` to wait until nothing matches `target` |
| `wait` | `seconds` |

Any step can add:
- `settle`: seconds to wait afterwards;
- `capture`: take a screenshot with this name;
- `crop`: with `capture`, keep only the frame shared by the targets in
  `around` and `pad` points around it (default 16), such as the command
  palette rather than the whole window;
- `collect`: record the window's text, for UI that is gone by the end;
- `observe`: a popup's label, to record its menu items as seen strings.

A target matches on `identifier`, `identifier_prefix`, `role` and `label`.
`within` scopes the search to another target, such as an open popup.

## Writing a scenario

- Prefer accessibility identifiers to labels, so copy changes only touch
  `labels`.
- Look for menu items `within` their popup. A bare "Work" also matches the
  menu bar's Spaces menu.
- Use a fixture page from `serve` when the scenario needs web content, so
  captures don't depend on the network or on a live site. Write strings from
  fixture pages inline; `labels` is only for Crest's own text.
- Only describe in the article what the replay actually shows.
