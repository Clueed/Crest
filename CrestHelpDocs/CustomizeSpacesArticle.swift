import XCTest

/// Crest Studio on a Space's Appearance page: the crest on the Space's sidebar
/// background, its Crest and Sidebar colors, and the steps.
/// Scenario: Website/helpdocs/customize-spaces.json.
final class CustomizeSpacesArticle: HelpArticleCase {

    // MARK: - Variables

    private var steps: XCUIElement { element("space-forge-steps") }
    private var identity: XCUIElement { element("space-forge-identity") }

    // MARK: - Actions - Article

    func testCapture() throws {
        try visitStudio()
        try record {
            try click("start-from", steps.radioButtons[try label("start_from")], settle: 1.0)
            // Below the Settings list, so nothing shows a hover.
            try move("rest-pointer", app.outlines.firstMatch, at: CGVector(dx: 0.5, dy: 0.97), settle: 1.0)
            try capture("studio")
        }
    }

    /// The article followed: open the Space's Appearance page, choose Icon
    /// under Emblem, and step back with Undo.
    func testVerify() throws {
        try visitStudio()
        try openAppearance("article-")
        try expect(
            "crest-on-stage", element("space-forge-stage").descendants(matching: .any)[try label("crest")])
        try click("article-emblem", steps.radioButtons[try label("emblem")])
        let icon = identity.radioButtons[try label("icon")]
        try click("article-icon", icon, settle: 1.0)
        try expect("icon-chosen", icon, contains: "1")
        try click("article-undo", element("space-forge-undo"), settle: 1.0)
        try expect("crest-restored", identity.radioButtons[try label("crest")], contains: "1")
    }

    // MARK: - Actions - Setup

    /// Opens Work's Appearance page and visits the steps and the Space actions
    /// menu that the section names, then comes back to the start. The showcase
    /// seed gives Work the Lion crest.
    private func visitStudio() throws {
        try launch(environment: ["CREST_SHOWCASE_SESSION": "1"])
        try setup {
            try openAppearance("")
            // A narrow window clips Crest Studio while the sidebar is docked.
            try click("undock-sidebar", element("browser-sidebar-toggle"), settle: 1.0)
            try click("emblem-step", steps.radioButtons[try label("emblem")])
            try expect("icon-choice", identity.radioButtons[try label("icon")])
            try click("sidebar-step", steps.radioButtons[try label("sidebar")])
            try click("space-actions", element("space-settings-menu"), settle: 1.0)
            observe(element("space-settings-menu"))
            key("close-menu", XCUIKeyboardKey.escape.rawValue)
        }
    }

    private func openAppearance(_ prefix: String) throws {
        key("\(prefix)open-settings", ",", .command, settle: 1.5)
        try click(
            "\(prefix)open-work", app.element(labelled: try label("work"), identifierPrefix: "settings-space-"),
            settle: 1.0)
        try click("\(prefix)appearance", element("space-settings-tabs").radioButtons[try label("appearance")])
    }
}
