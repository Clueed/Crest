import XCTest

/// One Crest Help article replayed against a test copy of Crest.
///
/// `Scripts/helpdocs/run` starts each test with `HELPDOCS_RUN`, the path of a
/// JSON file naming the fixture server, the scenario's labels and the window
/// size. A recording test attaches `run.json` to its result: the steps and
/// clicks of its recorded part, and every string the app showed, which the
/// runner turns into the article's clip and checks the article against.
@MainActor
class HelpArticleCase: XCTestCase {

    // MARK: - Types

    /// What the runner hands a test.
    struct Input: Decodable {
        let server: String?
        let labels: [String: String]
        let window: [Double]
    }

    /// The run log `polish.py` and the check stage read.
    struct Log: Encodable {
        struct Step: Encodable {
            let name: String
            let action: String
            let t: Double
            let seconds: Double
        }

        struct Click: Encodable {
            let t: Double
            let x: Double
            let y: Double
            let step: String
            let move: Double?
        }

        var started = Date().timeIntervalSince1970
        var steps: [Step] = []
        var clicks: [Click] = []
        var window: [String: Double] = [:]
        var screenPoints: [Double] = []
        var seen: [String] = []
    }

    /// A step that could not run as written.
    struct StepFailed: Error, CustomStringConvertible {
        let description: String
    }

    // MARK: - Variables

    let app = XCUIApplication()
    private(set) var input: Input!
    private var log = Log()
    private var seen: Set<String> = []
    /// Whether each step records the window's text, for unrecorded setup.
    private var collectsText = false

    // MARK: - Initializers

    override func setUp() async throws {
        continueAfterFailure = false
        guard let path = ProcessInfo.processInfo.environment["HELPDOCS_RUN"] else {
            throw XCTSkip("run through Scripts/helpdocs/run")
        }
        input = try JSONDecoder().decode(Input.self, from: Data(contentsOf: URL(fileURLWithPath: path)))
    }

    override func tearDown() async throws {
        app.terminate()
    }

    // MARK: - Actions - Session

    /// Launches Crest in an isolated session and sizes its window.
    func launch(environment: [String: String] = [:]) throws {
        app.launchEnvironment = ["CREST_ISOLATED_SESSION": "1"].merging(environment) { $1 }
        app.launch()
        guard app.windows.firstMatch.waitForExistence(timeout: 30) else {
            throw StepFailed(description: "Crest showed no window")
        }
        try placeWindow()
        Thread.sleep(forTimeInterval: 2)
    }

    /// Runs `steps` without recording them; the text they show counts as seen.
    func setup(_ steps: () throws -> Void) rethrows {
        collectsText = true
        defer { collectsText = false }
        try steps()
    }

    /// Runs `steps` as the recorded part of the article's clip.
    func record(_ steps: () throws -> Void) throws {
        log.started = Date().timeIntervalSince1970
        log.steps = []
        log.clicks = []
        try steps()
        try finish()
    }

    // MARK: - Actions - Targets

    /// The element with accessibility identifier `identifier`, of any type.
    func element(_ identifier: String) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: identifier).firstMatch
    }

    /// A Crest label the scenario declares, so a renamed one is found in the article.
    func label(_ name: String) throws -> String {
        guard let value = input.labels[name] else { throw StepFailed(description: "undeclared label \(name)") }
        return value
    }

    /// `path` on the scenario's fixture server.
    func fixture(_ path: String) throws -> String {
        guard let server = input.server else { throw StepFailed(description: "the scenario serves no fixture") }
        return "\(server)/\(path)"
    }

    private func require(_ element: XCUIElement, _ name: String, timeout: TimeInterval = 5) throws -> XCUIElement {
        guard element.waitForExistence(timeout: timeout) else {
            throw StepFailed(description: "\(name): target not found: \(element)")
        }
        return element
    }

    // MARK: - Actions - Steps

    func key(_ name: String, _ key: String, _ modifiers: XCUIElement.KeyModifierFlags = [], settle: TimeInterval = 0.6)
    {
        step(name, "key", settle: settle) { app.typeKey(key, modifierFlags: modifiers) }
    }

    func click(_ name: String, _ target: XCUIElement, right: Bool = false, settle: TimeInterval = 0.6) throws {
        try step(name, "click", settle: settle) {
            let target = try require(target, name)
            let moved = glide(to: target.center)
            logClick(name, at: target.center, move: moved)
            right ? target.rightClick() : target.click()
        }
    }

    /// Types `text` a character at a time. With `field`, clicks it first and
    /// fails unless it takes focus and then holds the text; without one, types
    /// into the field that has focus, such as the command palette after ⌘L.
    func type(_ name: String, _ text: String, into field: XCUIElement? = nil, settle: TimeInterval = 0.6) throws {
        try step(name, "type", settle: settle) {
            if let field {
                let field = try require(field, name)
                logClick(name, at: field.center, move: glide(to: field.center))
                field.click()
                Thread.sleep(forTimeInterval: 0.3)
                guard field.value(forKey: "hasKeyboardFocus") as? Bool == true else {
                    throw StepFailed(description: "\(name): field never took focus")
                }
            }
            for character in text {
                app.typeText(String(character))
            }
            if let field, field.value as? String != text {
                throw StepFailed(description: "\(name): field holds \(field.value ?? "nil"), expected \(text)")
            }
        }
    }

    /// Presses on `target`, drags it onto `destination` over `duration`
    /// seconds, holds for `hold` seconds and releases.
    func drag(
        _ name: String, _ target: XCUIElement, onto destination: XCUIElement, duration: TimeInterval = 1.2,
        hold: TimeInterval = 0.8, settle: TimeInterval = 0.6
    ) throws {
        try step(name, "drag", settle: settle) {
            let target = try require(target, name)
            let destination = try require(destination, name)
            let start = target.center
            let end = destination.center
            logClick(name, at: start, move: glide(to: start))
            let distance = hypot(end.x - start.x, end.y - start.y)
            target.click(
                forDuration: 0.25, thenDragTo: destination,
                withVelocity: XCUIGestureVelocity(distance / duration), thenHoldForDuration: hold)
            logClick(name, at: end, move: nil)
        }
    }

    func scroll(_ name: String, _ target: XCUIElement, lines: Int, settle: TimeInterval = 0.6) throws {
        try step(name, "scroll", settle: settle) {
            try require(target, name).scroll(byDeltaX: 0, deltaY: CGFloat(-lines * 10))
        }
    }

    /// Waits for `target`, and with `contains`, for its value to include it.
    func expect(_ name: String, _ target: XCUIElement, contains text: String? = nil) throws {
        try step(name, "expect", settle: 0) {
            let target = try require(target, name)
            guard let text else { return }
            let holds = NSPredicate { _, _ in (target.value as? String)?.contains(text) == true }
            guard
                XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: holds, object: nil)], timeout: 5)
                    == .completed
            else { throw StepFailed(description: "\(name): expected \(text) in \(target.value ?? "nil")") }
        }
    }

    func wait(_ name: String, _ seconds: TimeInterval) {
        step(name, "wait", settle: 0) { Thread.sleep(forTimeInterval: seconds) }
    }

    private func step(_ name: String, _ action: String, settle: TimeInterval, _ body: () throws -> Void) rethrows {
        let started = Date().timeIntervalSince1970
        try body()
        Thread.sleep(forTimeInterval: settle)
        if collectsText { collectText() }
        log.steps.append(
            .init(name: name, action: action, t: started - log.started, seconds: Date().timeIntervalSince1970 - started)
        )
        print("ok  \(name)")
    }

    // MARK: - Actions - Pointer

    /// Glides the pointer to `point` through a run of hovers, so a click in
    /// the clip follows a visible approach. Answers the seconds it took.
    /// XCUITest has no pointer path of its own, and the runner may not post
    /// events directly.
    private func glide(to point: CGPoint) -> Double {
        let started = Date()
        let start = CGEvent(source: nil)?.location ?? point
        let distance = hypot(point.x - start.x, point.y - start.y)
        let window = app.windows.firstMatch
        let origin = window.coordinate(withNormalizedOffset: .zero)
        let corner = window.frame.origin
        let moves = max(Int(distance / 40), 1)
        for index in 1...moves {
            var t = Double(index) / Double(moves)
            t = t * t * (3 - 2 * t)
            origin.withOffset(
                CGVector(
                    dx: start.x + (point.x - start.x) * t - corner.x, dy: start.y + (point.y - start.y) * t - corner.y)
            ).hover()
        }
        let seconds = Date().timeIntervalSince(started)
        print("    glide \(Int(distance)) pt in \(moves) hovers, \(String(format: "%.2f", seconds)) s")
        return seconds
    }

    private func logClick(_ name: String, at point: CGPoint, move: Double?) {
        log.clicks.append(
            .init(
                t: Date().timeIntervalSince1970 - log.started, x: point.x, y: point.y, step: name, move: move))
    }

    // MARK: - Actions - Window

    /// Sizes the window to the scenario's request, shrunk to fit the display,
    /// by dragging its bottom-right corner, as a person would. Crest opens
    /// zoomed at the top left of the screen, so only the size changes.
    private func placeWindow() throws {
        let window = app.windows.firstMatch
        let display = CGDisplayBounds(CGMainDisplayID())
        let size = CGSize(
            width: min(input.window[0], display.width - 24), height: min(input.window[1], display.height - 33 - 55))
        let corner = window.coordinate(withNormalizedOffset: CGVector(dx: 1, dy: 1)).withOffset(
            CGVector(dx: -2, dy: -2))
        let target = window.coordinate(withNormalizedOffset: .zero).withOffset(
            CGVector(dx: size.width, dy: size.height))
        corner.click(forDuration: 0.3, thenDragTo: target)
        // The drag lands a few points off; a second one from the new corner corrects it.
        let off = CGVector(dx: size.width - window.frame.width, dy: size.height - window.frame.height)
        if abs(off.dx) > 1 || abs(off.dy) > 1 {
            let corner = window.coordinate(withNormalizedOffset: CGVector(dx: 1, dy: 1)).withOffset(
                CGVector(dx: -2, dy: -2))
            corner.click(forDuration: 0.3, thenDragTo: corner.withOffset(off))
        }
        let frame = window.frame
        if abs(frame.width - size.width) > 4 || abs(frame.height - size.height) > 4 {
            print("    window is \(frame.size), not the requested \(size)")
        }
    }

    // MARK: - Actions - Log

    /// Records every string the window shows, for the article check.
    func collectText() {
        guard let snapshot = try? app.windows.firstMatch.snapshot() else { return }
        var queue = [snapshot]
        while let element = queue.popLast() {
            for text in [element.label, element.title, element.value as? String] {
                if let text, !text.isEmpty { seen.insert(text) }
            }
            queue.append(contentsOf: element.children)
        }
    }

    /// Attaches `run.json`, with the window's frame and every string seen, to
    /// the test result, where the runner exports it; the sandboxed runner
    /// cannot write outside its container.
    private func finish() throws {
        collectText()
        let frame = app.windows.firstMatch.frame
        log.window = ["X": frame.minX, "Y": frame.minY, "Width": frame.width, "Height": frame.height]
        let display = CGDisplayBounds(CGMainDisplayID())
        log.screenPoints = [display.width, display.height]
        log.seen = seen.sorted()
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        let attachment = XCTAttachment(data: try encoder.encode(log), uniformTypeIdentifier: "public.json")
        attachment.name = "run.json"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}

extension XCUIElement {
    /// The element's centre in screen points.
    fileprivate var center: CGPoint { CGPoint(x: frame.midX, y: frame.midY) }
}
