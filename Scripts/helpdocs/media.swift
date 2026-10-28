import CoreGraphics
import CoreImage
import Foundation
import ImageIO
import UniformTypeIdentifiers

// The image and video work of Scripts/helpdocs/helpdocs.py, which compiles
// this file with `xcrun swiftc` into its work folder and runs:
//
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

    /// Takes the window into `path`, keeping only `crop`, in screen points, when given.
    func capture(to path: String, crop: CGRect?) throws {
        try Process.output(["screencapture", "-x", "-o", "-l\(number)", path])
        guard let crop else { return }
        let image = try CGImage.load(path)
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

/// The run log a recording test attaches, with the time the runner started
/// recording added.
struct RunLog: Decodable {
    struct Step: Decodable {
        let action: String
        let t: Double
        let seconds: Double
    }

    struct Click: Decodable {
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
/// Crops to the Crest window, eases a zoom in around each group of clicks and
/// back out, speeds up idle stretches, and frames the result with rounded
/// corners on the docs page background, once for each site theme.
struct Clip {

    // MARK: - Types

    /// One rendering of the clip and its first frame, on a page background.
    struct Destination {
        let clip: String
        let poster: String
        let background: (red: UInt8, green: UInt8, blue: UInt8)
    }

    /// A click in video seconds and window pixels.
    struct Click {
        let t: Double
        let x: Double
        let y: Double
    }

    // MARK: - Static Variables

    /// The clip's width; its height follows the window's shape, so the
    /// frame is the same on every side.
    static let width = 1280
    static let pad = 56
    /// The corner radius of a Crest window, in points; the frame masks the
    /// window to it so no desktop shows at the corners.
    static let windowRadius = 26.0
    static let fps = 30.0
    /// How far the run log trails the recording, measured once by eye.
    static let lag = 0.25
    /// The length idle stretches are sped up towards.
    static let target = 13.0

    // MARK: - Variables

    let recording: String
    /// The window in recording pixels; its size is even, as the encoder needs.
    let window: (left: Int, top: Int, width: Int, height: Int)
    /// The clip's size in pixels, with the window `pad` in from each edge.
    let size: (width: Int, height: Int)
    /// Recording pixels per screen point.
    let scale: Double
    let zoom: Double
    let clusters: [[Click]]
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
        let offset = log.started - log.recordingStarted + Self.lag
        let scale = videoWidth / log.screenPoints[0]
        let frame = log.window
        let (x, y, width, height) = (frame["X"] ?? 0, frame["Y"] ?? 0, frame["Width"] ?? 0, frame["Height"] ?? 0)
        self.recording = recording
        self.scale = scale
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

        // Group clicks closer than 2.5 s so the camera stays in and pans between them.
        var clusters: [[Click]] = []
        for click in clicks {
            if let previous = clusters.last?.last, click.t - previous.t < 2.5 {
                clusters[clusters.count - 1].append(click)
            } else {
                clusters.append([click])
            }
        }
        self.clusters = clusters

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
    }

    // MARK: - Actions - Timing

    private static func smooth(_ x: Double) -> Double {
        let x = min(max(x, 0), 1)
        return x * x * (3 - 2 * x)
    }

    /// Zoom factor and centre, in window pixels, at video time `t`.
    func camera(at t: Double) -> (factor: Double, x: Double, y: Double) {
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

    func isActive(_ t: Double) -> Bool {
        activeSpans.contains { $0.start <= t && t <= $0.end }
    }

    /// The recording time of each clip frame. Active time plays at 1x; idle
    /// time is sped up so the clip lands near the target length.
    func frameTimes() -> [Double] {
        let count = Int(((last - first) * Self.fps).rounded(.up))
        let active = Double((0..<count).filter { isActive(first + Double($0) / Self.fps) }.count) / Self.fps
        let idle = (last - first) - active
        let idleSpeed = min(max(idle / max(Self.target - active, 1), 2), 8)
        var times: [Double] = []
        var t = first
        while t < last {
            times.append(t)
            t += (isActive(t) ? 1 : idleSpeed) / Self.fps
        }
        print(
            String(
                format: "    source %.1fs, active %.1fs, idle x%.1f -> %.1fs", last - first, active, idleSpeed,
                Double(times.count) / Self.fps))
        return times
    }

    // MARK: - Actions - Rendering

    /// Writes one clip per destination, and its first frame as the poster.
    func render(to destinations: [Destination]) throws {
        let times = frameTimes()
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
        for (number, t) in times.enumerated() {
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
            let camera = camera(at: t)
            let (cropWidth, cropHeight) = (width / camera.factor, height / camera.factor)
            let x = min(max(camera.x - cropWidth / 2, 0), width - cropWidth)
            let y = min(max(camera.y - cropHeight / 2, 0), height - cropHeight)
            let (scaleX, scaleY) = (Double(inner.width) / cropWidth, Double(inner.height) / cropHeight)
            scaled.draw(
                current,
                in: CGRect(
                    x: -x * scaleX, y: Double(inner.height) - (height - y) * scaleY, width: width * scaleX,
                    height: height * scaleY))
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
        let shadow = CGContext(
            data: nil, width: size.width, height: size.height, bitsPerComponent: 8, bytesPerRow: size.width,
            space: CGColorSpaceCreateDeviceGray(),
            bitmapInfo: CGImageAlphaInfo.none.rawValue)!
        shadow.setFillColor(gray: 70 / 255, alpha: 1)
        shadow.addPath(
            CGPath(
                roundedRect: frame.offsetBy(dx: 0, dy: -8), cornerWidth: radius, cornerHeight: radius, transform: nil))
        shadow.fillPath()
        let colour = destination.background
        let page = CIImage(
            color: CIColor(
                red: Double(colour.red) / 255, green: Double(colour.green) / 255, blue: Double(colour.blue) / 255,
                colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)!)
        let mask = CIImage(cgImage: shadow.makeImage()!).clampedToExtent()
            .applyingGaussianBlur(sigma: 18).cropped(to: bounds)
        let blended = CIImage(color: .black).applyingFilter(
            "CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: page, kCIInputMaskImageKey: mask]
        ).cropped(to: bounds)
        // Blend in sRGB values, as the page's own CSS colour is given.
        let context = CIContext(options: [.workingColorSpace: NSNull(), .outputColorSpace: NSNull()])
        return context.createCGImage(
            blended, from: bounds, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB))!
    }
}

// MARK: - Command line

signal(SIGPIPE, SIG_IGN)
let arguments = Array(CommandLine.arguments.dropFirst())
do {
    switch arguments.first {
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
