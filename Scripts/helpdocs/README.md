# Help article scenarios

These scripts keep Crest Help articles in `Website/content/docs/` true to the
app. Each covered article has a scenario: its metadata in
`Website/helpdocs/<slug>.json` and its steps in a Swift UI test in
`CrestHelpDocs/`. The runner builds a test copy of Crest, replays the
scenario through XCUITest, and then:

- regenerates the article's screenshots and clip,
- checks every UI string the article shows against the running app, and
- follows the article from a fresh session and checks that it worked.

The runner never edits article text. It reports what is stale, and a person
or an agent fixes the wording.

## Requirements

- A Mac GUI session that has granted Screen Recording to the terminal. The
  runner can't run in CI.
- Xcode and ffmpeg. Run `npm ci` in `Website` so the check stage can build
  the site.
- A display of at least 1440×900. On smaller displays the window shrinks to
  fit, and captures no longer match a typical Mac.

## Run

```sh
Scripts/helpdocs/helpdocs.py link-routing             # every stage, then remove the test build
Scripts/helpdocs/helpdocs.py --changed --base main    # only articles whose sources changed
Scripts/helpdocs/helpdocs.py link-routing --publish   # also copy fresh captures next to the article
Scripts/helpdocs/helpdocs.py link-routing --stage check --stage verify --keep
```

The stages run in this order:

1. **build**: builds an unsigned Debug copy of Crest and the `CrestHelpDocs`
   test runner into the work folder.
2. **capture**: records the screen with ScreenCaptureKit while the
   scenario's `testCapture` runs. The recorder reports when its first frame
   was taken, so the clip lines up with the test's steps exactly. It takes a
   window-only PNG for each `capture`, and reports which ones differ from the
   published images.
3. **polish**: turns the recording into the article's clip. It speeds up
   idle time, easing in and out of it, zooms in on clicks, timed on the clip
   so a speed-up never hurries the zoom, and frames the window on the docs
   page background, the same margin on every side. It renders one clip per site
   theme, using the `--color-fd-background` values in `Website/app/app.css`:
   the `@theme` value for light and the `.dark` value for dark. Each clip's
   first frame is saved beside it as `<clip>.poster.png`, which the page
   shows until the clip loads. Screenshots need no frame; their corners are
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
5. **verify**: runs the scenario's `testVerify` in a fresh session.

Afterwards the test copy is quit, unregistered from Launch Services, and
deleted, unless you pass `--keep`. Recordings, captures, `run.json` and
`report.json` stay in the work folder (`--work`, default
`$TMPDIR/crest-helpdocs`), outside the repository.

The runner uses only the Python standard library, like the other tools in
`Scripts/`. Recording, captures, image comparison, clips and pointer moves
are in `media.swift`, which the runner compiles into the work folder with
`xcrun swiftc` on first use.

## Scenario metadata

| Key | Contents |
| --- | --- |
| `article` | The article, relative to `Website/` |
| `section` | Optional heading; the check then covers only that section |
| `sources` | Glob patterns for source files whose changes may make the article stale. The scenario, its article and its Swift test always count |
| `labels` | Every Crest UI string the scenario or article relies on, declared once. The test reads one with `label("name")` |
| `keys` | Bold terms in the article that name keyboard keys rather than UI text |
| `serve` | A fixture folder next to the scenario, served on a free local port; the test reads a page's address with `fixture("page.html")` |
| `test` | The Swift test class in `CrestHelpDocs/` |
| `launch` | The requested `window` size in points (default 1040×780, a 4:3 window that fits a 1440×900 display above the Dock) |
| `assets` | Capture name to image path, relative to the article's folder |
| `clip` | The light clip's path, relative to the article's folder. The dark clip adds `.dark` before the extension. Each clip has a poster beside it with `.poster` before the extension. The article shows them with `<Clip src={…} dark={…} poster={…} darkPoster={…} label="…" />` |
| `clip_zoom` | How far the clip zooms in on clicks; `1.0` keeps the whole window (default `1.7`) |

## Scenario steps

The test subclasses `HelpArticleCase` in `CrestHelpDocs/` and declares:

- `testCapture`: `launch`, unrecorded steps in `setup { }`, whose text
  counts as seen, then the clip's steps in `record { }`;
- `testVerify`: the same launch and setup, then the article's own steps
  and checks of the outcome.

Each step takes a name, shown in the run and the clip's log, and an
`XCUIElement`:

| Step | Does |
| --- | --- |
| `click` | Clicks the target; `right: true` for a secondary click |
| `type` | Types text one character at a time. With `into:`, clicks the field first and fails unless it takes focus and then holds the text. Without one, types into the field that has focus, such as the command palette after ⌘L |
| `drag` | Drags the target `onto:` another or `by:` an offset in points, over `duration`, holding `hold` seconds before release |
| `move` | Rests the pointer at a fraction of the target's frame (default its centre) |
| `scroll` | Scrolls the target by `lines` |
| `key` | Presses a key with modifiers, such as `key("open-settings", ",", .command)` |
| `open` | Opens a URL in the test copy from outside it |
| `expect` | Waits for the target; with `contains:`, for its value (or `in: \.label`) to include the text. A switch's value reads `1` when on |
| `wait` | Waits a number of seconds |
| `capture` | Has the runner screenshot the window; with `around:`, only the frame those elements share and `pad` points around it, such as the command palette |
| `collectText` | Records the window's text, for UI that is gone by the end |
| `observe` | Records an open popup's menu items, which the window's text leaves out |

Every step but `capture` takes `settle:`, seconds to wait afterwards.
`hideDeveloperToolbar()` and `openTab(_:_:)` cover setup that several
scenarios share.

Find targets with XCUITest queries: `element("settings-general")` for an
identifier, `app.webViews["Kitchen Conversions"]` for a type and label, and
`app.element(labelled:identifierPrefix:)` for an identifier that carries an
ID, such as a sidebar tab. Scope menu items to their popup, such as
`popup.menuItems["Work"]`; a bare "Work" also matches the menu bar's Spaces
menu. When a target isn't found, the step prints the app's accessibility
tree to `test.log` in the work folder.

### How the runner and the test talk

The runner starts each test with `xcodebuild test-without-building` and
hands it the server, labels and window size through `HELPDOCS_RUN`. The test
runner app is sandboxed and may only read outside its container, so:

- the test attaches `run.json`, its steps, clicks and every string seen, to
  its result, and the runner exports it with `xcresulttool`;
- `capture` prints a request; the runner takes the window with
  `screencapture -l`, which leaves its corners transparent, and the test
  waits for the file.
- before each click, drag and `move`, the test asks the runner to glide the
  pointer to the target. The runner eases it there over a time that grows
  with the distance, taking each position from the clock, then answers with
  a file. The test then hovers on the target so the app sees the pointer
  arrive. XCUITest's own hover moves the pointer in uneven steps, and the
  sandboxed test may not move it itself.

## Writing a scenario

- Prefer accessibility identifiers to labels, so copy changes only touch
  `labels`.
- Use a fixture page from `serve` when the scenario needs web content, so
  captures don't depend on the network or on a live site. Write strings from
  fixture pages inline; `labels` is only for Crest's own text.
- Only describe in the article what the replay actually shows.
