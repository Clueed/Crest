import XCTest

/// Create a Split View on Mac: drag a sidebar tab onto the page on show, then
/// click the other card to focus it. Scenario: Website/helpdocs/split-view.yaml.
final class SplitViewArticle: HelpArticleCase {

    // MARK: - Variables

    private var recipeTab: XCUIElement {
        app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH 'tab-' AND label == 'Lemon Tart'")).firstMatch
    }

    private var conversionsPage: XCUIElement { app.webViews["Kitchen Conversions"] }

    // MARK: - Actions - Article

    func testCapture() throws {
        try openFixtureTabs()
        try record {
            wait("pause", 0.8)
            // Lemon Tart joins the Kitchen Conversions page as a second card.
            try drag("drag-tab-onto-page", recipeTab, onto: conversionsPage, duration: 1.6, hold: 1.0, settle: 2.0)
            try click("focus-other-card", conversionsPage, settle: 3.0)
        }
    }

    func testVerify() throws {
        try openFixtureTabs()
        try drag("drag-tab-onto-page", recipeTab, onto: conversionsPage, settle: 2.0)
        try expect("split-has-both", app.buttons[try label("split_view")], contains: try label("two_tabs"))
        try expect("recipe-card-shown", app.webViews["Lemon Tart"])
        try expect("conversions-card-shown", conversionsPage)
        try click("focus-other-card", conversionsPage, settle: 1.0)
        try expect("address-follows-focus", element("address-display"), contains: "conversions.html")
    }

    // MARK: - Actions - Setup

    /// Hides the developer toolbar that local pages turn on, closes the seeded
    /// start tab, and opens the two fixture pages as separate tabs. On the way,
    /// shows the other two paths the section names so the check sees them:
    /// the command in Settings → Shortcuts, and the page link menu.
    private func openFixtureTabs() throws {
        // The plain isolated seed keeps the sidebar short, so both tabs stay in view.
        try launch()
        try setup {
            key("open-settings", ",", .command, settle: 1.5)
            try click("open-general", element("settings-general"))
            try scroll("show-developer", element("settings-form-general"), lines: 60)
            try click("hide-developer-toolbar", element("automatic-developer-toolbar-toggle"))
            try click("open-shortcuts", element("settings-shortcuts"), settle: 1.5)
            try type("find-shortcut", "Split With Next Tab", into: element("shortcut-search"), settle: 1.0)
            key("close-settings", "w", .command, settle: 1.0)
            key("close-start-tab", "w", .command, settle: 1.0)
            try openTab("recipe", "recipe.html")
            try click("link-menu", app.links["kitchen conversions"], right: true, settle: 1.0)
            key("close-link-menu", XCUIKeyboardKey.escape.rawValue, settle: 0.5)
            key("clear-link-highlight", "r", .command, settle: 1.5)
            try openTab("conversions", "conversions.html")
        }
    }

    private func openTab(_ name: String, _ page: String) throws {
        key("new-tab-\(name)", "t", .command, settle: 1.0)
        try type("enter-\(name)", try fixture(page), into: element("command-palette-field"))
        key("open-\(name)", XCUIKeyboardKey.return.rawValue, settle: 2.0)
    }
}
