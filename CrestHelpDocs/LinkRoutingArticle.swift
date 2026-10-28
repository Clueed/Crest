import XCTest

/// Create one link route: github.com, Contains, opens in Work.
/// Scenario: Website/helpdocs/link-routing.yaml.
final class LinkRoutingArticle: HelpArticleCase {

    // MARK: - Actions - Article

    func testCapture() throws {
        try startInPersonal()
        try record {
            try openLinks("")
            try scroll("show-routing", element("settings-form-links"), lines: 30, settle: 1.0)
            try click("new-route", app.buttons[try label("new_route")])
            try scroll("show-route", element("settings-form-links"), lines: 30)
            let match = app.popUpButtons["Match"]
            try click("open-match", match, settle: 0.8)
            observe(match)
            try click("choose-contains", match.menuItems[try label("contains")])
            try type("type-pattern", "github.com", into: app.textFields[try label("pattern")])
            let destination = app.popUpButtons[try label("destination")]
            try click("open-destination", destination, settle: 0.8)
            observe(destination)
            try click("choose-work", destination.menuItems[try label("work")])
            // Clicking the section heading ends editing.
            try click("finish", app.descendants(matching: .any)[try label("routing")], settle: 1.0)
            try capture("route")
        }
    }

    /// The article followed literally, then a link opened from another app.
    func testVerify() throws {
        try startInPersonal()
        try openLinks("article-1-")
        try click("article-2-new-route", app.buttons[try label("new_route")])
        try scroll("show-route", element("settings-form-links"), lines: 30)
        try type("article-3-pattern", "github.com", into: app.textFields[try label("pattern")])
        let match = app.popUpButtons["Match"]
        try click("article-4-when-url", match, settle: 0.8)
        try click("article-4-contains", match.menuItems[try label("contains")])
        let destination = app.popUpButtons[try label("destination")]
        try click("article-5-open-in-space", destination, settle: 0.8)
        try click("article-5-work", destination.menuItems[try label("work")])
        try open("open-link", "https://github.com/pauljoda/Crest", settle: 4)
        try expect(
            "routed-to-work", element("space-switcher-picker").buttons[try label("work")], contains: "Selected")
    }

    // MARK: - Actions - Setup

    /// Starting in Personal makes choosing Work a real change. The showcase
    /// seed has the Spaces Work and Personal.
    private func startInPersonal() throws {
        try launch(environment: ["CREST_SHOWCASE_SESSION": "1"])
        try setup {
            try click(
                "start-in-personal", element("space-switcher-picker").buttons[try label("personal")], settle: 1.0)
        }
    }

    private func openLinks(_ prefix: String) throws {
        key("\(prefix)open-settings", ",", .command, settle: 1.5)
        try click("\(prefix)open-links", element("settings-links"))
        // A narrow window clips the route card while the sidebar is docked.
        try click("undock-sidebar", element("browser-sidebar-toggle"))
    }
}
