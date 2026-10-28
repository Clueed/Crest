import XCTest

/// Preview a local page at the Phone viewport from the developer toolbar,
/// which local addresses show automatically.
/// Scenario: Website/helpdocs/localhost-developer-tools.yaml.
final class LocalhostDeveloperToolsArticle: HelpArticleCase {

    // MARK: - Variables

    private var viewportMenu: XCUIElement { element("developer-viewport-menu") }

    // MARK: - Actions - Article

    func testCapture() throws {
        try openPage()
        try record {
            try click("open-viewport-menu", viewportMenu, settle: 0.8)
            collectText()
            try click("choose-phone", viewportMenu.menuItems[try label("phone")], settle: 2.0)
            // Off the toolbar, so no tooltip covers it.
            try move("rest-pointer", app.webViews["Harbor Bakery"], at: CGVector(dx: 0.5, dy: 0.9), settle: 1.5)
            try capture("phone")
        }
    }

    /// Choose the Phone preset, then return to the normal viewport.
    func testVerify() throws {
        try openPage()
        try click("open-viewport-menu", viewportMenu, settle: 0.8)
        try click("choose-phone", viewportMenu.menuItems[try label("phone")], settle: 1.5)
        try expect("phone-is-previewed", viewportMenu, contains: "Phone")
        try click("reopen-viewport-menu", viewportMenu, settle: 0.8)
        try click("choose-normal", viewportMenu.menuItems[try label("normal")], settle: 1.5)
        try expect("preview-is-off", viewportMenu, contains: "Off")
    }

    // MARK: - Actions - Setup

    /// Opens the fixture page, a local address that shows the developer
    /// toolbar without any setting, and hides the sidebar so the narrow
    /// preview stands out.
    private func openPage() throws {
        try launch(environment: ["CREST_SHOWCASE_SESSION": "1"])
        try setup {
            try openTab("page", "")
            try expect("toolbar-is-shown", viewportMenu, contains: "Off")
            key("hide-sidebar", "s", .command, settle: 1.5)
        }
    }
}
