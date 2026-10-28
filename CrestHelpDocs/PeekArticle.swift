import XCTest

/// Pull a link into Peek on Mac: drag a page link, watch the live preview
/// follow the pointer, and release to keep it open as a Peek.
/// The preview sits beside the pointer, so the clip keeps the whole window
/// rather than zooming in. Scenario: Website/helpdocs/peek-and-quick-window.json.
final class PeekArticle: HelpArticleCase {

    // MARK: - Variables

    private var link: XCUIElement { app.links["mountain weather forecast"] }
    private var pull: CGVector { CGVector(dx: 90, dy: 150) }

    // MARK: - Actions - Article

    func testCapture() throws {
        try openPage()
        try record {
            wait("pause", 0.8)
            try drag("pull-link", link, by: pull, duration: 1.4, hold: 1.2, settle: 1.5)
            // Peek's controls are gone once it becomes a tab.
            collectText()
            // Promote into the current Space.
            try click("open-in-tab", element("peek-open-selected-space"), settle: 0.5)
            // Off the vanished controls, onto blank page space.
            try move("rest-pointer", app.webViews["Mountain Weather"], at: CGVector(dx: 0.5, dy: 0.85), settle: 3.0)
        }
    }

    /// Drag the link again, then promote the Peek into a tab with its controls.
    func testVerify() throws {
        try openPage()
        try drag("pull-link", link, by: pull, settle: 2.0)
        try expect("peek-is-open", element("peek-close-control"))
        try expect("peek-shows-link", app.webViews["Mountain Weather"])
        try click("open-in-tab", element("peek-open-selected-space"), settle: 1.5)
        try expect(
            "tab-is-active", app.element(labelled: "Mountain Weather", identifierPrefix: "tab-"), contains: "Active")
    }

    // MARK: - Actions - Setup

    /// Confirms Drag links to Peek is on, as it is by default, hides the
    /// developer toolbar, and opens the fixture page in a new tab.
    private func openPage() throws {
        try launch(environment: ["CREST_SHOWCASE_SESSION": "1"])
        try setup {
            key("open-settings", ",", .command, settle: 1.5)
            try click("open-links", element("settings-links"))
            try expect("drag-to-peek-is-on", element("drag-links-to-peek-toggle"), contains: "1")
            try hideDeveloperToolbar()
            try openTab("page", "")
        }
    }
}
