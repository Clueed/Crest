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
   clicks and speeds up idle time.
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
| `sources` | Glob patterns for source files whose changes may make the article stale |
| `labels` | Every UI string the scenario or article relies on, declared once. Refer to one as `$name` |
| `launch` | `env` for the test copy and the requested `window` size |
| `setup` | Steps that prepare the app without being recorded |
| `steps` | The recorded steps |
| `assets` | Capture name to image path, relative to the article's folder |
| `clip` | The clip's path, relative to the article's folder |
| `verify` | The article's own steps, followed by checks of the outcome |

Each step has a `name` and an `action`:

| Action | Keys |
| --- | --- |
| `click` | `target` |
| `type` | `target`, `text`. Fails unless the field takes focus and then holds the text |
| `scroll` | `target`, `lines` |
| `key` | `keys`, a System Events phrase such as `keystroke "," using command down` |
| `open_url` | `url`, opened in the test copy from another app |
| `expect` | `target`, and optionally `attribute` (default `AXValue`) and `contains` |
| `wait` | `seconds` |

Any step can add:
- `settle`: seconds to wait afterwards;
- `capture`: take a screenshot with this name;
- `observe`: a popup's label, to record its menu items as seen strings.

A target matches on `identifier`, `identifier_prefix`, `role` and `label`.
`within` scopes the search to another target, such as an open popup.

## Writing a scenario

- Prefer accessibility identifiers to labels, so copy changes only touch
  `labels`.
- Look for menu items `within` their popup. A bare "Work" also matches the
  menu bar's Spaces menu.
- Only describe in the article what the replay actually shows.
