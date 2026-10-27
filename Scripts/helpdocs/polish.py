"""Turn a raw screen recording and its run log into a short framed clip.

Crops to the Crest window, eases a zoom in around each group of clicks and
back out, speeds up idle stretches, and frames the result with rounded
corners on a plain background.
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT_W, OUT_H, PAD, RADIUS = 1280, 900, 56, 22


def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def polish(recording: Path, log: dict, destination: Path, lag=0.25, zoom=1.7, target=13.0, fps=30):
    """`lag` is how far the run log trails the recording, measured once by eye."""
    offset = log["started"] - log["recording_started"] + lag
    probe = json.loads(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height:format=duration",
             "-of", "json", str(recording)]
        )
    )
    video_width = probe["streams"][0]["width"]
    duration = float(probe["format"]["duration"])
    scale = video_width / log["screen_points"][0]
    window = log["window"]
    left, top_edge = round(window["X"] * scale), round(window["Y"] * scale)
    W, H = round(window["Width"] * scale) // 2 * 2, round(window["Height"] * scale) // 2 * 2

    # Clicks in video seconds and window pixels; every step marks activity.
    clicks = [(c["t"] + offset, (c["x"] - window["X"]) * scale, (c["y"] - window["Y"]) * scale) for c in log["clicks"]]
    activity = sorted({s["t"] + offset for s in log["steps"]} | {c[0] for c in clicks})
    # Play these at 1x: half a second around each click, and all of the typing.
    active_spans = [(c[0] - 0.45, c[0] + 0.5) for c in clicks] + [
        (s["t"] + offset, s["t"] + offset + s["seconds"]) for s in log["steps"] if s["action"] == "type"
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
    first, last = max(activity[0] - 0.5, 0), min(activity[-1] + 2.6, duration)
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
    background = Image.new("RGB", (OUT_W, OUT_H), (236, 238, 243))
    mask = Image.new("L", (inner_w, inner_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, inner_w - 1, inner_h - 1), RADIUS, fill=255)
    shadow = Image.new("L", (OUT_W, OUT_H), 0)
    ImageDraw.Draw(shadow).rounded_rectangle((PAD, top + 8, PAD + inner_w, top + 8 + inner_h), RADIUS, fill=70)
    background.paste((40, 44, 60), (0, 0), shadow.filter(ImageFilter.GaussianBlur(18)))

    decode = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", str(recording), "-vf", f"fps={fps},crop={W}:{H}:{left}:{top_edge}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE,
    )
    encode = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OUT_W}x{OUT_H}", "-r", str(fps),
         "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", str(destination)],
        stdin=subprocess.PIPE,
    )
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
        frame = background.copy()
        frame.paste(image, (PAD, top), mask)
        encode.stdin.write(frame.tobytes())
    encode.stdin.close()
    encode.wait()
    decode.kill()
    print(f"    {destination.name}: {destination.stat().st_size / 1e6:.2f} MB")
