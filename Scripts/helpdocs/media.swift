import AVFoundation
import CoreGraphics
import CoreImage
import Foundation
import ImageIO
import ScreenCaptureKit
import UniformTypeIdentifiers

// The image, video and pointer work of Scripts/helpdocs/helpdocs.py, which
// compiles this file with `xcrun swiftc` into its work folder and runs:
//
//   media record <mov>
//   media glide <x> <y>
//   media capture <pid> <png> [<left> <top> <width> <height>]
//   media compare <published png> <new png>
//   media polish <recording> <run.json> <zoom> (<clip> <poster> <#rrggbb>)...

// MARK: - Failure

/// A command that could not run as asked.
struct Failure: Error, CustomStringConvertible {
    let description: String
}

// MARK: - Processes

extension Process {

    /// Starts `arguments` found on `PATH`, with the given pipes.
    static func start(_ arguments: [String], input: Pipe? = nil, output: Pipe? = nil) throws -> Process {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        process.arguments = arguments
        if let input { process.standardInput = input }
        if let output { process.standardOutput = output }
        try process.run()
        return process
    }

    /// Runs `arguments` to completion and returns what they printed.
    @discardableResult
    static func output(_ arguments: [String]) throws -> Data {
        let output = Pipe()
        let process = try start(arguments, output: output)
        let data = output.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()
        guard process.terminationStatus == 0 else { throw Failure(description: "\(arguments[0]) failed") }
        return data
    }
}

extension FileHandle {

    /// Fills `buffer` from the handle; false when it ends first.
    func read(into buffer: inout [UInt8]) -> Bool {
        var filled = 0
        while filled < buffer.count {
            let count = buffer.withUnsafeMutableBytes { bytes in
                Darwin.read(fileDescriptor, bytes.baseAddress! + filled, bytes.count - filled)
            }
            guard count > 0 else { return false }
            filled += count
        }
        return true
    }
}

// MARK: - Images

extension CGImage {

    static func load(_ path: String) throws -> CGImage {
        guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
            let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
        else { throw Failure(description: "cannot read \(path)") }
        return image
    }

    func write(to path: String) throws {
        guard
            let destination = CGImageDestinationCreateWithURL(
                URL(fileURLWithPath: path) as CFURL, UTType.png.identifier as CFString, 1, nil)
        else { throw Failure(description: "cannot write \(path)") }
        CGImageDestinationAddImage(destination, self, nil)
        guard CGImageDestinationFinalize(destination) else { throw Failure(description: "cannot write \(path)") }
    }

    /// Each pixel's luma, weighted as ITU-R 601-2 like Pillow's "L" mode.
    func luma() -> [UInt8] {
        var pixels = [UInt8](repeating: 0, count: width * height * 4)
        pixels.withUnsafeMutableBytes { bytes in
            let context = CGContext(
                data: bytes.baseAddress, width: width, height: height, bitsPerComponent: 8, bytesPerRow: width * 4,
                space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
            context.draw(self, in: CGRect(x: 0, y: 0, width: width, height: height))
        }
        return stride(from: 0, to: pixels.count, by: 4).map { index in
            let red = UInt32(pixels[index]) * 19595
            let green = UInt32(pixels[index + 1]) * 38470
            return UInt8((red + green + UInt32(pixels[index + 2]) * 7471 + 0x8000) >> 16)
        }
    }
}

// MARK: - Framing

/// How clips and screenshots set the window on the docs page: the same
/// margin on every side and a soft shadow below, each in proportion to the
/// window's width. A page shows both as wide as its column, so the app looks
/// the same size in a clip as in a screenshot.
enum Framing {

    // MARK: - Static Variables

    /// The window width, in pixels, that the measures below are given for:
    /// a clip's window.
    static let reference = Double(Clip.width - 2 * Clip.pad)
    /// The margin on each side, against the window's width.
    static let margin = Double(Clip.pad) / reference
    /// How far the shadow drops and blurs, against the window's width.
    static let drop = 8 / reference
    static let blur = 18 / reference
    /// The shadow's opacity under the middle of the window.
    static let opacity = 70.0 / 255

    // MARK: - Actions

    /// The margin in pixels around a window `width` pixels wide.
    static func pad(around width: Int) -> Int {
        Int((Double(width) * margin).rounded(.toNearestOrEven))
    }

    /// The shadow `shape` casts: black where it is opaque, dropped and blurred
    /// in proportion to `width`, the window's width in pixels.
    static func shadow(of shape: CIImage, width: Double) -> CIImage {
        let none = CIVector(x: 0, y: 0, z: 0, w: 0)
        return shape.applyingFilter(
            "CIColorMatrix",
            parameters: [
                "inputRVector": none, "inputGVector": none, "inputBVector": none,
                "inputAVector": CIVector(x: 0, y: 0, z: 0, w: opacity), "inputBiasVector": none,
            ]
        )
        .transformed(by: CGAffineTransform(translationX: 0, y: -drop * width))
        .applyingGaussianBlur(sigma: blur * width)
    }

    /// `image`, a window with transparent corners, on a transparent margin
    /// with its shadow below, as a clip frames it. The page shows through
    /// the margin, so one image suits every site theme.
    static func frame(_ image: CGImage) throws -> CGImage {
        let pad = Double(pad(around: image.width))
        let bounds = CGRect(
            x: 0, y: 0, width: Double(image.width) + 2 * pad, height: Double(image.height) + 2 * pad)
        let window = CIImage(cgImage: image).transformed(by: CGAffineTransform(translationX: pad, y: pad))
        let framed = window.composited(over: shadow(of: window, width: Double(image.width))).cropped(to: bounds)
        // Blend in the capture's own values, as the page blends the image.
        let context = CIContext(options: [.workingColorSpace: NSNull(), .outputColorSpace: NSNull()])
        guard
            let result = context.createCGImage(
                framed, from: bounds, format: .RGBA8,
                colorSpace: image.colorSpace ?? CGColorSpace(name: CGColorSpace.sRGB)!)
        else { throw Failure(description: "cannot frame the capture") }
        return result
    }
}

// MARK: - Record

/// Records the main display with ScreenCaptureKit until interrupted.
///
/// Prints `recording <seconds since 1970>` once the first frame arrives: the
/// wall-clock time of the video's zero, from the frame's own host-clock
/// timestamp, so the runner lines the run log up with the video exactly.
///
/// The video leaves the pointer out. Its path, sampled 240 times a second,
/// goes to `PointerPath.path(for:)` beside the video, so the clip draws a
/// larger pointer that moves smoothly between frames.
final class Recorder: NSObject, SCStreamOutput {

    // MARK: - Variables

    private let output: URL
    private let queue = DispatchQueue(label: "media.record")
    private var stream: SCStream?
    private var writer: AVAssetWriter?
    private var input: AVAssetWriterInput?
    /// The host-clock time of the first frame, once it arrives.
    private var started: Double?
    private var sampler: DispatchSourceTimer?
    /// Host-clock seconds and screen points.
    private var samples: [(t: Double, x: Double, y: Double)] = []

    // MARK: - Initializers

    init(output: String) {
        self.output = URL(fileURLWithPath: output)
    }

    // MARK: - Actions - Recording

    func start() async throws {
        let content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: true)
        guard let display = content.displays.first(where: { $0.displayID == CGMainDisplayID() }) else {
            throw Failure(description: "no main display to record")
        }
        let mode = CGDisplayCopyDisplayMode(display.displayID)
        let (width, height) = (mode?.pixelWidth ?? display.width, mode?.pixelHeight ?? display.height)
        let configuration = SCStreamConfiguration()
        configuration.width = width
        configuration.height = height
        configuration.minimumFrameInterval = CMTime(value: 1, timescale: 60)
        configuration.pixelFormat = kCVPixelFormatType_32BGRA
        configuration.colorSpaceName = CGColorSpace.sRGB
        configuration.showsCursor = false

        try? FileManager.default.removeItem(at: output)
        let writer = try AVAssetWriter(outputURL: output, fileType: .mov)
        let input = AVAssetWriterInput(
            mediaType: .video,
            outputSettings: [
                AVVideoCodecKey: AVVideoCodecType.h264, AVVideoWidthKey: width, AVVideoHeightKey: height,
                AVVideoCompressionPropertiesKey: [AVVideoAverageBitRateKey: width * height * 24],
                AVVideoColorPropertiesKey: [
                    AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
                    AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
                    AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
                ],
            ])
        input.expectsMediaDataInRealTime = true
        writer.add(input)
        self.writer = writer
        self.input = input

        let stream = SCStream(
            filter: SCContentFilter(display: display, excludingWindows: []), configuration: configuration,
            delegate: nil)
        try stream.addStreamOutput(self, type: .screen, sampleHandlerQueue: queue)
        let sampler = DispatchSource.makeTimerSource(flags: .strict, queue: queue)
        sampler.schedule(deadline: .now(), repeating: .nanoseconds(1_000_000_000 / 240), leeway: .nanoseconds(0))
        sampler.setEventHandler { [unowned self] in
            guard let location = CGEvent(source: nil)?.location else { return }
            samples.append((CMClockGetTime(CMClockGetHostTimeClock()).seconds, location.x, location.y))
        }
        sampler.resume()
        self.sampler = sampler
        try await stream.startCapture()
        self.stream = stream
    }

    /// Stops capturing and finishes the file.
    func stop() async {
        try? await stream?.stopCapture()
        sampler?.cancel()
        await withCheckedContinuation { continuation in
            queue.async { continuation.resume() }
        }
        guard let started, let writer, let input else { return }
        input.markAsFinished()
        await writer.finishWriting()
        let path = PointerPath(samples: samples.map { .init(t: $0.t - started, x: $0.x, y: $0.y) })
        try? JSONEncoder().encode(path).write(to: URL(fileURLWithPath: PointerPath.path(for: output.path)))
    }

    func stream(_ stream: SCStream, didOutputSampleBuffer buffer: CMSampleBuffer, of type: SCStreamOutputType) {
        // Only complete frames carry an image; idle ones mean nothing changed.
        guard type == .screen, buffer.isValid, let writer, let input,
            let attachments = CMSampleBufferGetSampleAttachmentsArray(buffer, createIfNecessary: false)
                as? [[SCStreamFrameInfo: Any]],
            let status = attachments.first?[.status] as? Int, SCFrameStatus(rawValue: status) == .complete
        else { return }
        let time = buffer.presentationTimeStamp
        if started == nil {
            started = time.seconds
            writer.startWriting()
            writer.startSession(atSourceTime: time)
            let age = CMTimeSubtract(CMClockGetTime(CMClockGetHostTimeClock()), time).seconds
            print("recording \(Date().timeIntervalSince1970 - age)")
            fflush(stdout)
        }
        if input.isReadyForMoreMediaData { input.append(buffer) }
    }
}

// MARK: - Pointer

/// Where the pointer was during a recording, in seconds from its first frame
/// and screen points.
struct PointerPath: Codable {
    struct Sample: Codable {
        let t: Double
        let x: Double
        let y: Double
    }

    let samples: [Sample]

    /// The path beside the recording at `recording`.
    static func path(for recording: String) -> String {
        (recording as NSString).deletingPathExtension + ".pointer.json"
    }

    /// The pointer's first move after `t`, from when it covers 2 points
    /// within 50 ms to when it has stayed within half a point for a tenth of
    /// a second. Slower drift, such as a hover settling, is not a move.
    func firstMove(after t: Double) -> (start: Double, end: Double)? {
        func still(_ a: Sample, _ b: Sample) -> Bool { hypot(a.x - b.x, a.y - b.y) < 0.5 }
        guard let from = samples.firstIndex(where: { $0.t >= t }) else { return nil }
        let start = samples.indices.dropFirst(max(from, 1)).first { index in
            let ahead = samples[index...].prefix { $0.t - samples[index].t <= 0.05 }
            return ahead.contains { hypot($0.x - samples[index - 1].x, $0.y - samples[index - 1].y) >= 2 }
        }
        guard let start else { return nil }
        for index in start..<samples.count {
            let rest = samples[index...].prefix { $0.t - samples[index].t <= 0.1 }
            if samples[samples.count - 1].t - samples[index].t > 0.1, rest.allSatisfy({ still($0, samples[index]) }) {
                return (samples[start - 1].t, samples[index].t)
            }
        }
        return nil
    }

    /// The position at `t`, between the samples around it.
    func position(at t: Double) -> (x: Double, y: Double)? {
        guard let last = samples.last else { return nil }
        guard let after = samples.firstIndex(where: { $0.t >= t }) else { return (last.x, last.y) }
        guard after > 0 else { return (samples[0].x, samples[0].y) }
        let (a, b) = (samples[after - 1], samples[after])
        let k = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1
        return (a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k)
    }
}

/// Moves the pointer to `target`, in screen points, as a person would. A
/// guide eases along a path that bows off the straight line towards the end,
/// over a time that grows with the distance, and the pointer follows it on a
/// spring, so it starts gently, lags a little, overshoots and settles. Each
/// position is taken from the clock, so a late sample never changes the
/// pointer's speed.
func glide(to target: CGPoint) {
    let start = CGEvent(source: nil)?.location ?? target
    let (dx, dy) = (target.x - start.x, target.y - start.y)
    let distance = hypot(dx, dy)
    guard distance >= 1 else { return }
    let duration = min(0.25 + distance / 1800, 0.65)
    // The bow is widest two thirds of the way along, always to the same side.
    let bow = min(distance * 0.08, 40) / distance
    // A 4 Hz spring, damped so it overshoots by a few points.
    let frequency = 4 * 2 * Double.pi
    let (stiffness, damping) = (frequency * frequency, 2 * 0.6 * frequency)
    var (position, velocity) = (start, CGVector.zero)
    var simulated = 0.0
    // Ahead of the recorder's encoding, so a sample is rarely late.
    pthread_set_qos_class_self_np(QOS_CLASS_USER_INTERACTIVE, 0)
    let started = Date()
    while true {
        let now = Date().timeIntervalSince(started)
        while simulated < now {
            let progress = min(simulated / duration, 1)
            let eased = progress * progress * progress * (progress * (progress * 6 - 15) + 10)
            let side = bow * 27 / 4 * eased * eased * (1 - eased)
            let guide = CGPoint(x: start.x + dx * eased - dy * side, y: start.y + dy * eased + dx * side)
            velocity.dx += (stiffness * (guide.x - position.x) - damping * velocity.dx) / 1000
            velocity.dy += (stiffness * (guide.y - position.y) - damping * velocity.dy) / 1000
            position.x += velocity.dx / 1000
            position.y += velocity.dy / 1000
            simulated += 1.0 / 1000
        }
        let settled =
            simulated >= duration && hypot(target.x - position.x, target.y - position.y) < 0.5
            && hypot(velocity.dx, velocity.dy) < 10
        CGWarpMouseCursorPosition(settled ? target : position)
        if settled || now > duration + 1 {
            CGWarpMouseCursorPosition(target)
            return
        }
        Thread.sleep(forTimeInterval: 1.0 / 120)
    }
}

// MARK: - Capture

/// The test copy's main window, which `screencapture -l` takes alone, with
/// transparent corners and nothing that overlaps it.
struct Window {
    let number: CGWindowID
    let bounds: CGRect

    /// The largest normal window `pid` shows.
    init(largestOf pid: pid_t) throws {
        let list =
            CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID)
            as? [[String: Any]] ?? []
        let windows = list.compactMap { info -> Window? in
            guard info[kCGWindowOwnerPID as String] as? pid_t == pid, info[kCGWindowLayer as String] as? Int == 0,
                let number = info[kCGWindowNumber as String] as? CGWindowID,
                let bounds = info[kCGWindowBounds as String] as? NSDictionary,
                let frame = CGRect(dictionaryRepresentation: bounds)
            else { return nil }
            return Window(number: number, bounds: frame)
        }
        guard let largest = windows.max(by: { $0.bounds.width * $0.bounds.height < $1.bounds.width * $1.bounds.height })
        else { throw Failure(description: "process \(pid) shows no window") }
        self = largest
    }

    private init(number: CGWindowID, bounds: CGRect) {
        self.number = number
        self.bounds = bounds
    }

    /// Takes the window into `path`, framed as a clip frames it, or keeping
    /// only `crop`, in screen points, unframed.
    func capture(to path: String, crop: CGRect?) throws {
        try Process.output(["screencapture", "-x", "-o", "-l\(number)", path])
        let image = try CGImage.load(path)
        guard let crop else { return try Framing.frame(image).write(to: path) }
        let scale = Double(image.width) / bounds.width
        let left = max(((crop.minX - bounds.minX) * scale).rounded(.toNearestOrEven), 0)
        let top = max(((crop.minY - bounds.minY) * scale).rounded(.toNearestOrEven), 0)
        let right = min(((crop.maxX - bounds.minX) * scale).rounded(.toNearestOrEven), Double(image.width))
        let bottom = min(((crop.maxY - bounds.minY) * scale).rounded(.toNearestOrEven), Double(image.height))
        guard let cropped = image.cropping(to: CGRect(x: left, y: top, width: right - left, height: bottom - top))
        else { throw Failure(description: "crop \(crop) lies outside the window") }
        try cropped.write(to: path)
    }
}

// MARK: - Compare

/// Prints how a fresh capture differs from the published image, or nothing
/// when under 0.2% of its pixels changed noticeably.
func compare(published: String, new: String) throws {
    let old = try CGImage.load(published)
    let fresh = try CGImage.load(new)
    guard old.width == fresh.width, old.height == fresh.height else {
        print("size changed \(old.width)×\(old.height) -> \(fresh.width)×\(fresh.height)")
        return
    }
    let changed = zip(old.luma(), fresh.luma()).filter { abs(Int($0) - Int($1)) >= 16 }.count
    let fraction = Double(changed) / Double(old.width * old.height)
    if fraction > 0.002 { print(String(format: "%.1f%% of pixels changed", fraction * 100)) }
}

// MARK: - Polish

/// The run log a recording test attaches, with the wall-clock time of the
/// recording's first frame added.
struct RunLog: Decodable {
    struct Step: Decodable {
        let name: String
        let action: String
        let t: Double
        let seconds: Double
    }

    /// A press, logged with the step that made it. A drag logs its press
    /// and its release, in that order.
    struct Click: Decodable {
        let step: String
        let t: Double
        let x: Double
        let y: Double
        let move: Double?
    }

    let started: Double
    let recordingStarted: Double
    let steps: [Step]
    let clicks: [Click]
    let window: [String: Double]
    let screenPoints: [Double]
}

/// Turns a raw screen recording and its run log into a short framed clip.
///
/// Crops to the Crest window, speeds up idle stretches, easing in and out of
/// them, eases a zoom in around each group of clicks and back out, draws the
/// pointer, and frames the result with rounded corners on the docs page
/// background, once for each site theme. The zoom is timed on the clip, so a
/// speed-up never hurries it.
struct Clip {

    // MARK: - Types

    /// One rendering of the clip and its first frame, on a page background.
    struct Destination {
        let clip: String
        let poster: String
        let background: (red: UInt8, green: UInt8, blue: UInt8)
    }

    /// A click in seconds, of the recording or the clip, and window pixels.
    struct Click {
        let t: Double
        let x: Double
        let y: Double
    }

    /// One frame of the clip: the recording time it shows, the clip time
    /// its camera follows, and the pointer drawn over it in window pixels.
    struct Frame {
        let t: Double
        let camera: Double
        let pointer: (x: Double, y: Double, press: Double)?
    }

    // MARK: - Static Variables

    /// The clip's width; its height follows the window's shape, so the
    /// frame is the same on every side.
    static let width = 1280
    static let pad = 56
    /// The corner radius of a Crest window, in points; the frame masks the
    /// window to it so no desktop shows at the corners.
    static let windowRadius = 26.0
    static let fps = 60.0
    /// The length idle stretches are sped up towards.
    static let target = 13.0
    /// Recording seconds over which playback eases between 1x and the idle speed.
    static let ramp = 0.4
    /// The drawn pointer's size against the system's.
    static let pointerSize = 1.6
    /// Seconds the clip holds still, without the pointer, at each end.
    static let still = 1.0
    /// The pointer's outline, in points with the tip at the origin and y up:
    /// the system arrow's shape.
    static let arrow: CGPath = {
        let path = CGMutablePath()
        path.addLines(between: [
            CGPoint(x: 0, y: 0), CGPoint(x: 0, y: -17), CGPoint(x: 4, y: -13.2), CGPoint(x: 6.9, y: -19.8),
            CGPoint(x: 9.8, y: -18.6), CGPoint(x: 7, y: -12.2), CGPoint(x: 12.2, y: -12.2),
        ])
        path.closeSubpath()
        return path
    }()

    // MARK: - Variables

    let recording: String
    /// The window in recording pixels; its size is even, as the encoder needs.
    let window: (left: Int, top: Int, width: Int, height: Int)
    /// The clip's size in pixels, with the window `pad` in from each edge.
    let size: (width: Int, height: Int)
    /// Recording pixels per screen point.
    let scale: Double
    let zoom: Double
    /// The clicks in recording seconds.
    let clicks: [Click]
    /// When the button is down, in recording seconds: an instant for a
    /// click, from the press to the release for a drag.
    let presses: [(start: Double, end: Double)]
    /// Where the pointer was, if the recording logged it.
    let pointer: PointerPath?
    /// The pointer's first move, in recording seconds, and the window edge
    /// it flies in from instead of where it started, in window pixels.
    private(set) var entrance: (start: Double, end: Double, from: (x: Double, y: Double))?
    /// A move after the last press, which only takes the pointer out of the
    /// way: instead the pointer flies out from where that move starts, to
    /// the nearest window edge, in recording seconds and window pixels.
    private(set) var exit: (start: Double, end: Double, from: (x: Double, y: Double), to: (x: Double, y: Double))?
    /// The window's top left in screen points.
    let origin: (x: Double, y: Double)
    var activeSpans: [(start: Double, end: Double)]
    let first: Double
    let last: Double

    // MARK: - Initializers

    init(recording: String, log: RunLog, zoom: Double) throws {
        let probe = try Process.output([
            "ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width", "-of", "csv=p=0",
            recording,
        ])
        guard
            let videoWidth = Double(
                String(decoding: probe, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines))
        else { throw Failure(description: "cannot read the width of \(recording)") }
        let offset = log.started - log.recordingStarted
        let scale = videoWidth / log.screenPoints[0]
        // Two points in from the window's frame: its outermost rows are
        // blended with the desktop, which would show along the edges.
        let frame = log.window
        let (x, y) = ((frame["X"] ?? 0) + 2, (frame["Y"] ?? 0) + 2)
        let (width, height) = ((frame["Width"] ?? 0) - 4, (frame["Height"] ?? 0) - 4)
        self.recording = recording
        self.scale = scale
        origin = (x, y)
        pointer = try? JSONDecoder().decode(
            PointerPath.self, from: Data(contentsOf: URL(fileURLWithPath: PointerPath.path(for: recording))))
        self.zoom = zoom
        window = (
            Int((x * scale).rounded(.toNearestOrEven)), Int((y * scale).rounded(.toNearestOrEven)),
            Int((width * scale).rounded(.toNearestOrEven)) / 2 * 2,
            Int((height * scale).rounded(.toNearestOrEven)) / 2 * 2
        )
        let inner = Double(Self.width - 2 * Self.pad)
        size = (Self.width, Int((inner * height / width).rounded(.toNearestOrEven)) / 2 * 2 + 2 * Self.pad)

        // Every step marks activity. Play these at 1x: the pointer's approach
        // to each click and half a second after it, all typing, dragging and
        // pointer moves, and the final hold.
        let clicks = log.clicks.map { Click(t: $0.t + offset, x: ($0.x - x) * scale, y: ($0.y - y) * scale) }
        let activity = Set(log.steps.map { $0.t + offset } + clicks.map(\.t)).sorted()
        activeSpans =
            zip(clicks, log.clicks).map { click, logged in (click.t - (logged.move ?? 0.35) - 0.15, click.t + 0.5) }
            + log.steps.filter { ["type", "drag", "move"].contains($0.action) }.map {
                ($0.t + offset, $0.t + offset + $0.seconds)
            }
        self.clicks = clicks
        let drags = Set(log.steps.filter { $0.action == "drag" }.map(\.name))
        var presses: [(start: Double, end: Double)] = []
        var index = 0
        while index < clicks.count {
            let step = log.clicks[index].step
            if drags.contains(step), index + 1 < clicks.count, log.clicks[index + 1].step == step {
                presses.append((clicks[index].t, clicks[index + 1].t))
                index += 2
            } else {
                presses.append((clicks[index].t, clicks[index].t))
                index += 1
            }
        }
        self.presses = presses

        // The clip ends when the last step's settle does, so a scenario sets
        // its final hold. The recording only has frames while the screen
        // changes, so a still ending may lie past its end; the last frame is
        // held to fill it.
        guard let firstActivity = activity.first, let lastActivity = activity.last,
            let ending = log.steps.map({ $0.t + offset + $0.seconds }).max()
        else { throw Failure(description: "the run log records no steps") }
        first = max(firstActivity - 0.5, 0)
        last = ending
        activeSpans.append((lastActivity, last))
        if let move = pointer?.firstMove(after: first) {
            let end = window(pointer!.position(at: move.end)!)
            entrance = (move.start, move.end, edge(nearest: end))
        }
        if let release = presses.last?.end, let move = pointer?.firstMove(after: release + 0.05) {
            let from = window(pointer!.position(at: move.start)!)
            let to = edge(nearest: from)
            exit = (move.start, move.start + flightTime(from: from, to: to), from, to)
        }
    }

    // MARK: - Actions - Timing

    private static func smooth(_ x: Double) -> Double {
        let x = min(max(x, 0), 1)
        return x * x * (3 - 2 * x)
    }

    /// Groups clicks closer than 2.5 s, so the camera stays in and pans between them.
    private static func clusters(of clicks: [Click]) -> [[Click]] {
        var clusters: [[Click]] = []
        for click in clicks {
            if let previous = clusters.last?.last, click.t - previous.t < 2.5 {
                clusters[clusters.count - 1].append(click)
            } else {
                clusters.append([click])
            }
        }
        return clusters
    }

    /// Zoom factor and centre, in window pixels, at clip time `t`, for click
    /// `clusters` in clip time.
    func camera(at t: Double, in clusters: [[Click]]) -> (factor: Double, x: Double, y: Double) {
        let (width, height) = (Double(window.width), Double(window.height))
        for group in clusters {
            let start = group[0].t - 0.6
            let end = group[group.count - 1].t + 0.9
            guard start <= t, t <= end + 0.6 else { continue }
            let envelope = Self.smooth((t - start) / 0.6) * (1 - Self.smooth((t - end) / 0.6))
            var (x, y) = (group[0].x, group[0].y)
            // Pan to each next click in the half second before it.
            for next in group.dropFirst() {
                let k = Self.smooth((t - (next.t - 0.5)) / 0.5)
                x += (next.x - x) * k
                y += (next.y - y) * k
                if k < 1 { break }
            }
            return (
                1 + (zoom - 1) * envelope, width / 2 + (x - width / 2) * envelope,
                height / 2 + (y - height / 2) * envelope
            )
        }
        return (1, width / 2, height / 2)
    }

    /// How idle recording time `t` is: 0 within an active span, rising to 1
    /// a ramp away from the nearest one.
    func idleness(at t: Double) -> Double {
        let distance = activeSpans.map { max($0.start - t, t - $0.end, 0) }.min() ?? .infinity
        return Self.smooth(distance / Self.ramp)
    }

    /// The recording time of each clip frame. Active time plays at 1x; idle
    /// time is sped up, between 2x and 8x, so the clip lands near the target
    /// length, and playback eases between the two speeds.
    func frameTimes() -> [Double] {
        func times(idleSpeed: Double) -> [Double] {
            var times: [Double] = []
            var t = first
            while t < last {
                times.append(t)
                t += (1 + (idleSpeed - 1) * idleness(at: t)) / Self.fps
            }
            return times
        }
        let speeds = stride(from: 2.0, through: 8.0, by: 0.25)
        let idleSpeed = speeds.first { Double(times(idleSpeed: $0).count) / Self.fps <= Self.target } ?? 8
        let result = times(idleSpeed: idleSpeed)
        let active = Double(result.filter { idleness(at: $0) == 0 }.count) / Self.fps
        print(
            String(
                format: "    source %.1fs, active %.1fs, idle x%.2f -> %.1fs", last - first, active, idleSpeed,
                Double(result.count) / Self.fps))
        return result
    }

    /// The pointer in window pixels at recording time `t`, and how far it is
    /// pressed in, from 0 to 1: it eases in before each press, stays in
    /// while the button is down and eases out after the release.
    ///
    /// Before its first move the pointer is hidden. During that move it
    /// flies in from the entrance edge: the logged path, offset by the gap
    /// between that edge and where the pointer started, the gap easing to
    /// nothing.
    func pointer(at t: Double) -> (x: Double, y: Double, press: Double)? {
        guard let logged = pointer?.position(at: t) else { return nil }
        if let exit, t >= exit.start {
            guard t < exit.end else { return nil }
            let k = Self.smooth((t - exit.start) / (exit.end - exit.start))
            return (exit.from.x + (exit.to.x - exit.from.x) * k, exit.from.y + (exit.to.y - exit.from.y) * k, 0)
        }
        var position = window(logged)
        if let entrance, let start = pointer?.position(at: entrance.start) {
            guard t >= entrance.start else { return nil }
            let gap = 1 - Self.smooth((t - entrance.start) / (entrance.end - entrance.start))
            let from = window(start)
            position.x += (entrance.from.x - from.x) * gap
            position.y += (entrance.from.y - from.y) * gap
        }
        let press = presses.map { 1 - Self.smooth(max($0.start - t, t - $0.end, 0) / 0.18) }.max() ?? 0
        return (position.x, position.y, press)
    }

    /// `point`, in screen points, in window pixels.
    private func window(_ point: (x: Double, y: Double)) -> (x: Double, y: Double) {
        ((point.x - origin.x) * scale, (point.y - origin.y) * scale)
    }

    /// The window edge nearest `point`, in window pixels, just far enough
    /// past it that the pointer is hidden.
    private func edge(nearest point: (x: Double, y: Double)) -> (x: Double, y: Double) {
        let (width, height) = (Double(window.width), Double(window.height))
        let margin = 24 * Self.pointerSize * scale
        let edges = [
            (point.x, (-margin, point.y)), (width - point.x, (width + margin, point.y)),
            (point.y, (point.x, -margin)), (height - point.y, (point.x, height + margin)),
        ]
        return edges.min { $0.0 < $1.0 }!.1
    }

    /// Seconds to fly from `start` to `end`, in window pixels: longer for
    /// a longer way.
    private func flightTime(from start: (x: Double, y: Double), to end: (x: Double, y: Double)) -> Double {
        min(0.35 + hypot(end.x - start.x, end.y - start.y) / scale / 1800, 0.7)
    }

    /// The pointer easing from `start` to `end`, in window pixels, over its
    /// flight time, one position per frame.
    private func flight(from start: (x: Double, y: Double), to end: (x: Double, y: Double))
        -> [(x: Double, y: Double, press: Double)]
    {
        let count = Int((flightTime(from: start, to: end) * Self.fps).rounded())
        return (1...count).map {
            let k = Self.smooth(Double($0) / Double(count))
            return (start.x + (end.x - start.x) * k, start.y + (end.y - start.y) * k, 0)
        }
    }

    /// The clip's frames: a still second, the pointer flying in from the
    /// nearest edge, the recording, the pointer flying out to the nearest
    /// edge, and a still second.
    ///
    /// When the pointer moves, it flies in on its first move, to where that
    /// move ends, and the clip starts a still second before it. Otherwise
    /// the clip holds its first frame while the pointer flies in. Likewise
    /// a move after the last press becomes the flight out, and the clip
    /// ends a still second after it.
    private func frames(at times: [Double]) -> [Frame] {
        let (first, last) = (times[0], times[times.count - 1])
        let ending = Double(times.count - 1) / Self.fps
        let still = Int(Self.still * Self.fps)
        var recorded = times.enumerated().map {
            Frame(t: $1, camera: Double($0) / Self.fps, pointer: pointer(at: $1))
        }
        var frames: [Frame] = []
        if let entrance {
            let arrival = recorded.firstIndex { $0.t >= entrance.start } ?? 0
            recorded.removeFirst(max(arrival - still, 0))
            frames = Array(repeating: Frame(t: first, camera: 0, pointer: nil), count: max(still - arrival, 0))
        } else {
            frames = Array(repeating: Frame(t: first, camera: 0, pointer: nil), count: still)
            if let entry = pointer(at: first) {
                frames += flight(from: edge(nearest: (entry.x, entry.y)), to: (entry.x, entry.y)).dropLast().map {
                    Frame(t: first, camera: 0, pointer: $0)
                }
            }
        }
        if let exit {
            let gone = recorded.firstIndex { $0.t >= exit.end } ?? recorded.count
            recorded.removeLast(max(recorded.count - gone - still, 0))
            let padding = max(still - (recorded.count - gone), 0)
            let held = recorded[recorded.count - 1]
            return frames + recorded + Array(repeating: Frame(t: held.t, camera: held.camera, pointer: nil), count: padding)
        }
        frames += recorded
        if let exit = pointer(at: last) {
            frames += flight(from: (exit.x, exit.y), to: edge(nearest: (exit.x, exit.y))).map {
                Frame(t: last, camera: ending, pointer: $0)
            }
        }
        return frames + Array(repeating: Frame(t: last, camera: ending, pointer: nil), count: still)
    }

    // MARK: - Actions - Rendering

    /// Draws the pointer into `context` with its tip at `tip`, `size` pixels
    /// per point, pressed in by `press`.
    private func drawPointer(in context: CGContext, at tip: CGPoint, size: Double, press: Double) {
        let size = size * (1 - 0.18 * press)
        context.saveGState()
        context.translateBy(x: tip.x, y: tip.y)
        context.scaleBy(x: size, y: size)
        context.setLineJoin(.round)
        context.setShadow(
            offset: CGSize(width: 0, height: -1.2 * size), blur: 3.5 * size,
            color: CGColor(srgbRed: 0, green: 0, blue: 0, alpha: 0.35))
        context.addPath(Self.arrow)
        context.setStrokeColor(CGColor(srgbRed: 1, green: 1, blue: 1, alpha: 1))
        context.setLineWidth(2.6)
        context.strokePath()
        context.setShadow(offset: .zero, blur: 0, color: nil)
        context.addPath(Self.arrow)
        context.setFillColor(CGColor(srgbRed: 0, green: 0, blue: 0, alpha: 1))
        context.fillPath()
        context.restoreGState()
    }

    /// Writes one clip per destination, and its first frame as the poster.
    func render(to destinations: [Destination]) throws {
        let times = frameTimes()
        // The clip time of each click: the first frame that reaches it.
        let clusters = Self.clusters(
            of: clicks.map { click in
                Click(
                    t: Double(times.firstIndex { $0 >= click.t } ?? times.count) / Self.fps, x: click.x, y: click.y)
            })
        let (width, height) = (Double(window.width), Double(window.height))
        let inner = (width: size.width - 2 * Self.pad, height: size.height - 2 * Self.pad)
        let radius = (Self.windowRadius * scale * Double(inner.width) / width).rounded(.toNearestOrEven)
        let sRGB = CGColorSpace(name: CGColorSpace.sRGB)!
        // Core Graphics counts up from the bottom.
        let innerRect = CGRect(
            x: Self.pad, y: Self.pad, width: inner.width, height: inner.height)
        let corners = CGPath(roundedRect: innerRect, cornerWidth: radius, cornerHeight: radius, transform: nil)
        let backgrounds = destinations.map { background($0, behind: innerRect, radius: radius) }

        let decoded = Pipe()
        let decoder = try Process.start(
            [
                "ffmpeg", "-v", "error", "-i", recording, "-vf",
                "fps=\(Int(Self.fps)),crop=\(window.width):\(window.height):\(window.left):\(window.top)",
                "-f", "rawvideo", "-pix_fmt", "rgb24", "-",
            ], output: decoded)
        // Full range with sRGB tags, so browsers show the background exactly
        // as the page's own CSS colour.
        let encoders = try destinations.map { destination -> (Process, Pipe) in
            let input = Pipe()
            let process = try Process.start(
                [
                    "ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
                    "-s", "\(size.width)x\(size.height)", "-r", "\(Int(Self.fps))", "-i", "-",
                    "-vf",
                    "scale=out_color_matrix=bt709:out_range=full,"
                        + "setparams=range=pc:colorspace=bt709:color_primaries=bt709:color_trc=iec61966-2-1",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", destination.clip,
                ], input: input)
            return (process, input)
        }

        let scaled = CGContext(
            data: nil, width: inner.width, height: inner.height, bitsPerComponent: 8, bytesPerRow: inner.width * 4,
            space: sRGB, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!
        scaled.interpolationQuality = .high
        let frame = CGContext(
            data: nil, width: size.width, height: size.height, bitsPerComponent: 8, bytesPerRow: size.width * 4,
            space: sRGB, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        let frameBytes = UnsafeRawBufferPointer(start: frame.data, count: size.width * size.height * 4)

        var raw = [UInt8](repeating: 0, count: window.width * window.height * 3)
        var current: CGImage?
        var index = -1
        for (number, shot) in frames(at: times).enumerated() {
            let t = shot.t
            // Variable frame rate source: look frames up by time, not by index.
            while index < Int((t * Self.fps).rounded(.toNearestOrEven)), decoded.fileHandleForReading.read(into: &raw) {
                current = CGImage(
                    width: window.width, height: window.height, bitsPerComponent: 8, bitsPerPixel: 24,
                    bytesPerRow: window.width * 3, space: sRGB, bitmapInfo: CGBitmapInfo(rawValue: 0),
                    provider: CGDataProvider(data: Data(raw) as CFData)!, decode: nil, shouldInterpolate: true,
                    intent: .defaultIntent)
                index += 1
            }
            guard let current else { throw Failure(description: "\(recording) has no frames") }

            // Scale the part of the window the camera shows onto the inner frame.
            let camera = camera(at: shot.camera, in: clusters)
            let (cropWidth, cropHeight) = (width / camera.factor, height / camera.factor)
            let x = min(max(camera.x - cropWidth / 2, 0), width - cropWidth)
            let y = min(max(camera.y - cropHeight / 2, 0), height - cropHeight)
            let (scaleX, scaleY) = (Double(inner.width) / cropWidth, Double(inner.height) / cropHeight)
            scaled.draw(
                current,
                in: CGRect(
                    x: -x * scaleX, y: Double(inner.height) - (height - y) * scaleY, width: width * scaleX,
                    height: height * scaleY))
            if let pointer = shot.pointer {
                drawPointer(
                    in: scaled,
                    at: CGPoint(x: (pointer.x - x) * scaleX, y: Double(inner.height) - (pointer.y - y) * scaleY),
                    size: scale * scaleX * Self.pointerSize, press: pointer.press)
            }
            let shown = scaled.makeImage()!

            for (destination, (background, (_, input))) in zip(destinations, zip(backgrounds, encoders)) {
                frame.draw(background, in: CGRect(x: 0, y: 0, width: size.width, height: size.height))
                frame.saveGState()
                frame.addPath(corners)
                frame.clip()
                frame.draw(shown, in: innerRect)
                frame.restoreGState()
                try input.fileHandleForWriting.write(contentsOf: frameBytes)
                if number == 0 { try frame.makeImage()!.write(to: destination.poster) }
            }
        }
        for (process, input) in encoders {
            try input.fileHandleForWriting.close()
            process.waitUntilExit()
            guard process.terminationStatus == 0 else { throw Failure(description: "encoding failed") }
        }
        // The rest of the recording is not needed; stop decoding without a broken-pipe complaint.
        kill(decoder.processIdentifier, SIGKILL)
        decoder.waitUntilExit()
        for destination in destinations {
            let bytes = (try FileManager.default.attributesOfItem(atPath: destination.clip)[.size] as? Int) ?? 0
            print(
                String(format: "    %@: %.2f MB", (destination.clip as NSString).lastPathComponent, Double(bytes) / 1e6)
            )
        }
    }

    /// The page background with the window's soft shadow below the frame.
    private func background(_ destination: Destination, behind frame: CGRect, radius: Double) -> CGImage {
        let bounds = CGRect(x: 0, y: 0, width: size.width, height: size.height)
        let shape = CGContext(
            data: nil, width: size.width, height: size.height, bitsPerComponent: 8, bytesPerRow: size.width,
            space: CGColorSpaceCreateDeviceGray(), bitmapInfo: CGImageAlphaInfo.alphaOnly.rawValue)!
        shape.addPath(CGPath(roundedRect: frame, cornerWidth: radius, cornerHeight: radius, transform: nil))
        shape.fillPath()
        let colour = destination.background
        let page = CIImage(
            color: CIColor(
                red: Double(colour.red) / 255, green: Double(colour.green) / 255, blue: Double(colour.blue) / 255,
                colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)!)
        let shadow = Framing.shadow(of: CIImage(cgImage: shape.makeImage()!), width: frame.width)
        // Blend in sRGB values, as the page's own CSS colour is given.
        let context = CIContext(options: [.workingColorSpace: NSNull(), .outputColorSpace: NSNull()])
        return context.createCGImage(
            shadow.composited(over: page).cropped(to: bounds), from: bounds, format: .RGBA8,
            colorSpace: CGColorSpace(name: CGColorSpace.sRGB))!
    }
}

// MARK: - Command line

signal(SIGPIPE, SIG_IGN)
let arguments = Array(CommandLine.arguments.dropFirst())
do {
    switch arguments.first {
    case "record" where arguments.count == 2:
        let recorder = Recorder(output: arguments[1])
        signal(SIGINT, SIG_IGN)
        let interrupt = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
        interrupt.setEventHandler {
            Task {
                await recorder.stop()
                exit(0)
            }
        }
        interrupt.resume()
        Task {
            do {
                try await recorder.start()
            } catch {
                FileHandle.standardError.write(Data("media: \(error)\n".utf8))
                exit(1)
            }
        }
        dispatchMain()
    case "glide" where arguments.count == 3:
        guard let x = Double(arguments[1]), let y = Double(arguments[2]) else {
            throw Failure(description: "bad point \(arguments[1]) \(arguments[2])")
        }
        glide(to: CGPoint(x: x, y: y))
    case "capture" where [3, 7].contains(arguments.count):
        guard let pid = pid_t(arguments[1]) else { throw Failure(description: "bad process ID \(arguments[1])") }
        let box = arguments.dropFirst(3).compactMap(Double.init)
        let crop = box.count == 4 ? CGRect(x: box[0], y: box[1], width: box[2], height: box[3]) : nil
        try Window(largestOf: pid).capture(to: arguments[2], crop: crop)
    case "compare" where arguments.count == 3:
        try compare(published: arguments[1], new: arguments[2])
    case "polish" where arguments.count >= 7 && (arguments.count - 4) % 3 == 0:
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let log = try decoder.decode(RunLog.self, from: Data(contentsOf: URL(fileURLWithPath: arguments[2])))
        guard let zoom = Double(arguments[3]) else { throw Failure(description: "bad zoom \(arguments[3])") }
        let destinations = try stride(from: 4, to: arguments.count, by: 3).map { index in
            let hex = arguments[index + 2].dropFirst()
            guard hex.count == 6, let value = UInt32(hex, radix: 16) else {
                throw Failure(description: "bad colour \(arguments[index + 2])")
            }
            return Clip.Destination(
                clip: arguments[index], poster: arguments[index + 1],
                background: (UInt8(value >> 16), UInt8(value >> 8 & 0xFF), UInt8(value & 0xFF)))
        }
        try Clip(recording: arguments[1], log: log, zoom: zoom).render(to: destinations)
    default:
        throw Failure(description: "usage: see the top of Scripts/helpdocs/media.swift")
    }
} catch {
    FileHandle.standardError.write(Data("media: \(error)\n".utf8))
    exit(1)
}
