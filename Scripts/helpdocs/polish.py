"""Turn a raw screen recording and its run log into a short framed clip.

Crops to the Crest window, eases a zoom in around each group of clicks and
back out, speeds up idle stretches, and frames the result with rounded
corners on the docs page background, once for each site theme. Each clip's
first frame is also saved beside it as its poster.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT_W, OUT_H, PAD = 1280, 900, 56
# The corner radius of a Crest window, in points; the frame masks the window
# to it so no desktop shows at the corners.
WINDOW_RADIUS = 26


def poster_path(clip: Path) -> Path:
    """Where a clip's first frame is saved: `name.mp4` -> `name.poster.png`."""
    return clip.with_suffix(".poster.png")


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def polish(recording: Path, log: dict, destinations: dict[Path, tuple[int, int, int]], lag=0.25, zoom=1.7, target=13.0,
           fps=30):
    """Write one clip per destination, framed on its background colour, and
    its first frame as `poster_path(destination)`.

    `lag` is how far the run log trails the recording, measured once by eye.
    """
    offset = log["started"] - log["recording_started"] + lag
    probe = json.loads(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width",
             "-of", "json", str(recording)]
        )
    )
    video_width = probe["streams"][0]["width"]
    scale = video_width / log["screen_points"][0]
    window = log["window"]
    left, top_edge = round(window["X"] * scale), round(window["Y"] * scale)
    W, H = round(window["Width"] * scale) // 2 * 2, round(window["Height"] * scale) // 2 * 2

    # Clicks in video seconds and window pixels; every step marks activity.
    clicks = [(c["t"] + offset, (c["x"] - window["X"]) * scale, (c["y"] - window["Y"]) * scale) for c in log["clicks"]]
    approaches = [c.get("move", 0.35) for c in log["clicks"]]
    activity = sorted({s["t"] + offset for s in log["steps"]} | {c[0] for c in clicks})
    # Play these at 1x: the pointer's approach to each click and half a second
    # after it, all typing, dragging and pointer moves, and the final hold.
    active_spans = [(c[0] - move - 0.15, c[0] + 0.5) for c, move in zip(clicks, approaches)] + [
        (s["t"] + offset, s["t"] + offset + s["seconds"])
        for s in log["steps"]
        if s["action"] in ("type", "drag", "move")
    ]

    # Group clicks closer than 2.5 s so the camera stays in and pans between them.
    clusters = []
    for click in clicks:
        if clusters and click[0] - clusters[-1][-1][0] < 2.5:
            clusters[-1].append(click)
        else:
            clusters.append([click])

    def camera(t):
        """Zoom factor and centre (window pixels) at video time t."""
        for group in clusters:
            start, end = group[0][0] - 0.6, group[-1][0] + 0.9
            if start <= t <= end + 0.6:
                envelope = smooth((t - start) / 0.6) * (1 - smooth((t - end) / 0.6))
                px, py = group[0][1], group[0][2]
                for bt, bx, by in group[1:]:  # pan to each next click in the half second before it
                    k = smooth((t - (bt - 0.5)) / 0.5)
                    px, py = px + (bx - px) * k, py + (by - py) * k
                    if k < 1:
                        break
                factor = 1 + (zoom - 1) * envelope
                return factor, W / 2 + (px - W / 2) * envelope, H / 2 + (py - H / 2) * envelope
        return 1.0, W / 2, H / 2

    def is_active(t):
        return any(a <= t <= b for a, b in active_spans)

    # Active time plays at 1x; idle time is sped up so the clip lands near the target length.
    # The clip ends when the last step's settle does, so a scenario sets its
    # final hold, which plays at 1x.
    # The recording only has frames while the screen changes, so a still
    # ending may lie past its end; the last frame is held to fill it.
    ending = max(s["t"] + offset + s["seconds"] for s in log["steps"])
    first, last = max(activity[0] - 0.5, 0), ending
    active_spans.append((activity[-1], last))
    grid = np.arange(first, last, 1 / fps)
    active = sum(is_active(t) for t in grid) / fps
    idle = (last - first) - active
    idle_speed = min(max(idle / max(target - active, 1.0), 2.0), 8.0)
    times, t = [], first
    while t < last:
        times.append(t)
        t += (1.0 if is_active(t) else idle_speed) / fps
    print(f"    source {last - first:.1f}s, active {active:.1f}s, idle x{idle_speed:.1f} -> {len(times) / fps:.1f}s")

    inner_w = OUT_W - 2 * PAD
    inner_h = round(inner_w * H / W) // 2 * 2
    top = (OUT_H - inner_h) // 2
    radius = round(WINDOW_RADIUS * scale * inner_w / W)
    mask = Image.new("L", (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, inner_w - 1, inner_h - 1), radius, fill=255)
    shadow = Image.new("L", (OUT_W, OUT_H), 0)
    ImageDraw.Draw(shadow).rounded_rectangle((PAD, top + 8, PAD + inner_w, top + 8 + inner_h), radius, fill=70)
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    backgrounds = []
    for colour in destinations.values():
        background = Image.new("RGB", (OUT_W, OUT_H), colour)
        background.paste((0, 0, 0), (0, 0), shadow)
        backgrounds.append(background)

    decode = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", str(recording), "-vf", f"fps={fps},crop={W}:{H}:{left}:{top_edge}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    # Full range with sRGB tags, so browsers show the background exactly as
    # the page's own CSS colour.
    encoders = [
        subprocess.Popen(
            ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H}",
             "-r", str(fps), "-i", "-",
             "-vf", "scale=out_color_matrix=bt709:out_range=full,"
             "setparams=range=pc:colorspace=bt709:color_primaries=bt709:color_trc=iec61966-2-1",
             "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", str(destination)],
            stdin=subprocess.PIPE,
        )
        for destination in destinations
    ]
    frame_bytes, index, current = W * H * 3, -1, None
    for t in times:
        # Variable frame rate source: look frames up by time, not by index.
        while index < round(t * fps):
            raw = decode.stdout.read(frame_bytes)
            if len(raw) < frame_bytes:
                break
            current, index = raw, index + 1
        factor, cx, cy = camera(t)
        cw, ch = W / factor, H / factor
        x = min(max(cx - cw / 2, 0), W - cw)
        y = min(max(cy - ch / 2, 0), H - ch)
        image = Image.frombuffer("RGB", (W, H), current).resize(
            (inner_w, inner_h), Image.Resampling.LANCZOS, box=(x, y, x + cw, y + ch)
        )
        for background, encode, destination in zip(backgrounds, encoders, destinations):
            frame = background.copy()
            frame.paste(image, (PAD, top), mask)
            encode.stdin.write(frame.tobytes())
            if t == times[0]:
                frame.save(poster_path(destination))
    for encode in encoders:
        encode.stdin.close()
        encode.wait()
    decode.kill()
    for destination in destinations:
        print(f"    {destination.name}: {destination.stat().st_size / 1e6:.2f} MB")
