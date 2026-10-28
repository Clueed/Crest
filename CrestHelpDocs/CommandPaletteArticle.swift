import XCTest

/// Search a site from the command palette: type a provider's shortcut, see its
/// chips, press Tab to choose it, and type a query. The clip stops before
/// Return, so it needs no network. Scenario: Website/helpdocs/command-palette.yaml.
final class CommandPaletteArticle: HelpArticleCase {

    // MARK: - Variables

    private var providerToken: XCUIElement { element("command-palette-provider-token") }

    // MARK: - Actions - Article

    func testCapture() throws {
        try openPage()
        try record {
            wait("pause", 0.8)
            // Selects the page's address, which typing replaces.
            key("open-palette", "l", .command, settle: 1.2)
            // "yt" matches no tab or page, so only its search shows.
            try type("type-shortcut", "yt", settle: 3.5)
            collectText()
            try expect(
                "chips-show", element("command-palette-provider-chip-youTube"), contains: label("search_youtube"),
                in: \.label)
            key("choose-provider", XCUIKeyboardKey.tab.rawValue, settle: 1.0)
            try expect("provider-chosen", providerToken, contains: label("stop_youtube"), in: \.label)
            try type("type-query", "aurora borealis", into: element("command-palette-field"), settle: 2.5)
            collectText()
        }
    }

    /// The article's steps with Wikipedia: shortcut, Tab, query. Return would
    /// leave for a live site, so the check stops at the palette's search row.
    func testVerify() throws {
        try openPage()
        key("open-palette", "l", .command, settle: 1.0)
        try type("type-shortcut", "w", settle: 1.0)
        try expect(
            "chip-offered", element("command-palette-provider-chip-wikipedia"), contains: "Wikipedia", in: \.label)
        key("press-tab", XCUIKeyboardKey.tab.rawValue, settle: 1.0)
        try expect("provider-chosen", providerToken, contains: "Wikipedia", in: \.label)
        try type("type-query", "aurora borealis", into: element("command-palette-field"))
        try expect("searches-wikipedia", element("command-palette-primary-action"), contains: "Wikipedia")
    }

    // MARK: - Actions - Setup

    /// Confirms Tab to search providers is on, as the article assumes, hides
    /// the developer toolbar, and opens a calm page behind the palette.
    private func openPage() throws {
        try launch(environment: ["CREST_SHOWCASE_SESSION": "1"])
        try setup {
            key("open-settings", ",", .command, settle: 1.5)
            try click("open-search", element("settings-search"), settle: 1.0)
            try expect("tab-to-search-is-on", element("palette-tab-to-search"), contains: "1")
            try hideDeveloperToolbar()
            try openTab("page", "")
        }
    }
}
