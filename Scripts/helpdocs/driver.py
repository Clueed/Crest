"""Drive a running Crest through the accessibility tree.

Targets are found by accessibility identifier, role and label; no step uses
screen coordinates. Clicks and keys are real events, so a screen recording
shows the pointer, and every click is logged with its screen position.
"""

from __future__ import annotations

import re
import subprocess
import time
from pathlib import Path

import Quartz
from ApplicationServices import (
    AXUIElementCopyAttributeValue,
    AXUIElementCreateApplication,
    AXUIElementPerformAction,
    AXUIElementSetAttributeValue,
    AXValueGetValue,
    kAXValueCGPointType,
    kAXValueCGSizeType,
)

TEXT_ATTRIBUTES = ("AXTitle", "AXDescription", "AXValue")
# A System Events keystroke of plain text, which arrives all at once.
TEXT_KEYSTROKE = re.compile(r'keystroke "[^"]*"')


class StepFailed(Exception):
    """A scenario step could not run as written."""


# MARK: - Accessibility


def attr(element, name):
    error, value = AXUIElementCopyAttributeValue(element, name, None)
    return value if error == 0 else None


def frame(element):
    position, size = attr(element, "AXPosition"), attr(element, "AXSize")
    if position is None or size is None:
        return None
    _, point = AXValueGetValue(position, kAXValueCGPointType, None)
    _, extent = AXValueGetValue(size, kAXValueCGSizeType, None)
    return point.x, point.y, extent.width, extent.height


def texts(element):
    return {str(value) for key in TEXT_ATTRIBUTES if (value := attr(element, key)) not in (None, "")}


def descendants(root):
    queue = [root]
    while queue:
        element = queue.pop(0)
        yield element
        queue.extend(attr(element, "AXChildren") or [])


# MARK: - Driver


class Driver:
    """Replays scenario steps against one process and keeps the run log."""

    def __init__(self, app: Path, process: str, labels: dict[str, str], out: Path):
        self.app = app
        self.process = process
        self.labels = labels
        self.out = out
        self.started = time.time()
        self.log = {"started": self.started, "clicks": [], "captures": [], "steps": [], "observed": {}}
        self.seen: set[str] = set()
        self.variables: dict[str, str] = {}

    # MARK: - Targets

    def pid(self) -> int:
        return int(subprocess.check_output(["pgrep", "-nx", self.process]).split()[0])

    def label(self, value: str) -> str:
        """Expand a `$name` reference to its declared label, and `{name}` to a run variable."""
        if not isinstance(value, str):
            return value
        if value.startswith("$"):
            if value[1:] not in self.labels:
                raise StepFailed(f"undeclared label {value}")
            return self.labels[value[1:]]
        for name, replacement in self.variables.items():
            value = value.replace(f"{{{name}}}", replacement)
        return value

    def matches(self, element, target) -> bool:
        for key, name in (("identifier", "AXIdentifier"), ("role", "AXRole")):
            if key in target and attr(element, name) != target[key]:
                return False
        if "identifier_prefix" in target and not str(attr(element, "AXIdentifier") or "").startswith(
            target["identifier_prefix"]
        ):
            return False
        return "label" not in target or self.label(target["label"]) in texts(element)

    def resolve(self, target, timeout: float = 5.0):
        """Search the focused window, or inside `within` (an open popup's menu),
        so a label such as "Work" never matches the menu bar's Spaces menu."""
        deadline = time.time() + timeout
        plain = {key: value for key, value in target.items() if key != "within"}
        while time.time() < deadline:
            if "within" in target:
                root = self.resolve(target["within"], timeout)
            else:
                root = attr(AXUIElementCreateApplication(self.pid()), "AXFocusedWindow")
            if root is not None:
                for element in descendants(root):
                    if self.matches(element, plain):
                        return element
            time.sleep(0.25)
        shown = {key: self.label(value) if key == "label" else value for key, value in plain.items()}
        raise StepFailed(f"target not found: {shown}")

    def wait_gone(self, target, name, timeout: float):
        """Wait until nothing matches `target`, such as a group that was taken apart."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            try:
                self.resolve(target, 0.3)
            except StepFailed:
                return
            time.sleep(0.25)
        raise StepFailed(f"{name}: {target} still shows")

    def collect_texts(self):
        """Record every string the focused window shows, for the label check."""
        window = attr(AXUIElementCreateApplication(self.pid()), "AXFocusedWindow")
        if window is not None:
            for element in descendants(window):
                self.seen |= texts(element)

    # MARK: - Input

    def mouse(self, kind, x, y, button=Quartz.kCGMouseButtonLeft):
        Quartz.CGEventPost(Quartz.kCGHIDEventTap, Quartz.CGEventCreateMouseEvent(None, kind, (x, y), button))

    def move_to(self, x, y):
        """Glide the pointer at a steady, readable speed; returns the seconds it took."""
        start = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
        distance = ((x - start.x) ** 2 + (y - start.y) ** 2) ** 0.5
        duration = min(max(distance / 600, 0.35), 1.0)
        moves = int(duration / 0.01)
        for index in range(1, moves + 1):
            t = index / moves
            t = t * t * (3 - 2 * t)
            self.mouse(Quartz.kCGEventMouseMoved, start.x + (x - start.x) * t, start.y + (y - start.y) * t)
            time.sleep(0.01)
        return duration

    def click(self, element, name, button="left"):
        AXUIElementPerformAction(element, "AXScrollToVisible")
        time.sleep(0.3)
        x, y, width, height = frame(element)
        cx, cy = x + width / 2, y + height / 2
        moved = self.move_to(cx, cy)
        self.log["clicks"].append({"t": time.time() - self.started, "x": cx, "y": cy, "step": name, "move": moved})
        if button == "right":
            down, up, number = Quartz.kCGEventRightMouseDown, Quartz.kCGEventRightMouseUp, Quartz.kCGMouseButtonRight
        else:
            down, up, number = Quartz.kCGEventLeftMouseDown, Quartz.kCGEventLeftMouseUp, Quartz.kCGMouseButtonLeft
        self.mouse(down, cx, cy, number)
        time.sleep(0.05)
        self.mouse(up, cx, cy, number)
        self.refresh_cursor(cx, cy)

    def type_text(self, text):
        for character in text:
            for down in (True, False):
                event = Quartz.CGEventCreateKeyboardEvent(None, 0, down)
                Quartz.CGEventKeyboardSetUnicodeString(event, len(character), character)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, event)
            time.sleep(0.06)

    def type_into(self, element, name, text):
        self.click(element, name)
        time.sleep(0.3)
        if not attr(element, "AXFocused"):
            # Keystrokes without focus go to whatever list has it (type-select).
            print(f"    {name}: click did not focus the field; setting AXFocused")
            AXUIElementSetAttributeValue(element, "AXFocused", True)
            time.sleep(0.3)
        if not attr(element, "AXFocused"):
            raise StepFailed(f"{name}: field never took focus; refusing to type")
        self.type_text(text)
        time.sleep(0.3)
        if attr(element, "AXValue") != text:
            raise StepFailed(f"{name}: field holds {attr(element, 'AXValue')!r}, expected {text!r}")

    def refresh_cursor(self, x, y):
        """The cursor's shape updates only as the pointer moves, so a release
        that changes the UI underneath would leave a stale cursor. Drift a
        little, as a hand does after clicking; tiny moves are coalesced away."""
        time.sleep(0.1)
        self.move_to(x + 8, y + 6)

    def drag(self, element, step):
        """Press on the element, move the pointer smoothly by `by` points, or onto
        the `to` target at the fraction `at` of its frame, pause, and release."""
        x, y, width, height = frame(element)
        sx, sy = x + width / 2, y + height / 2
        if "to" in step:
            tx, ty, tw, th = frame(self.resolve(step["to"]))
            fx, fy = step.get("at", [0.5, 0.5])
            ex, ey = tx + tw * fx, ty + th * fy
        else:
            ex, ey = sx + step["by"][0], sy + step["by"][1]
        moved = self.move_to(sx, sy)
        self.log["clicks"].append({"t": time.time() - self.started, "x": sx, "y": sy, "step": step["name"], "move": moved})
        self.mouse(Quartz.kCGEventLeftMouseDown, sx, sy)
        time.sleep(0.25)
        moves = max(int(step.get("duration", 1.2) / 0.02), 1)
        for index in range(1, moves + 1):
            t = index / moves
            t = t * t * (3 - 2 * t)
            self.mouse(Quartz.kCGEventLeftMouseDragged, sx + (ex - sx) * t, sy + (ey - sy) * t)
            time.sleep(0.02)
        time.sleep(step.get("hold", 0.8))
        self.log["clicks"].append({"t": time.time() - self.started, "x": ex, "y": ey, "step": step["name"]})
        self.mouse(Quartz.kCGEventLeftMouseUp, ex, ey)
        self.refresh_cursor(ex, ey)

    def scroll(self, element, lines):
        x, y, width, height = frame(element)
        self.move_to(x + width / 2, y + height / 2)
        for _ in range(abs(lines)):
            wheel = Quartz.CGEventCreateScrollWheelEvent(None, Quartz.kCGScrollEventUnitLine, 1, -1 if lines > 0 else 1)
            Quartz.CGEventPost(Quartz.kCGHIDEventTap, wheel)
            time.sleep(0.03)

    # MARK: - Capture

    def window(self):
        pid = self.pid()
        windows = Quartz.CGWindowListCopyWindowInfo(
            Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements,
            Quartz.kCGNullWindowID,
        )
        candidates = [w for w in windows if w["kCGWindowOwnerPID"] == pid and w["kCGWindowLayer"] == 0]
        return max(candidates, key=lambda w: w["kCGWindowBounds"]["Width"] * w["kCGWindowBounds"]["Height"])

    def capture(self, name, crop=None):
        """Screenshot the window, or with `crop`, only the frame its targets share and `pad` points around it."""
        info = self.window()
        path = self.out / f"{name}.png"
        subprocess.run(["screencapture", "-x", "-o", f"-l{info['kCGWindowNumber']}", str(path)], check=True)
        if crop is not None:
            self.crop(path, info["kCGWindowBounds"], crop)
        self.log["captures"].append({"t": time.time() - self.started, "name": name})
        self.collect_texts()

    def crop(self, path, bounds, crop):
        from PIL import Image

        frames = [frame(self.resolve(target)) for target in crop["around"]]
        left, top = min(f[0] for f in frames), min(f[1] for f in frames)
        right, bottom = max(f[0] + f[2] for f in frames), max(f[1] + f[3] for f in frames)
        pad = crop.get("pad", 16)
        image = Image.open(path)
        scale = image.width / bounds["Width"]
        box = (
            max(round((left - pad - bounds["X"]) * scale), 0),
            max(round((top - pad - bounds["Y"]) * scale), 0),
            min(round((right + pad - bounds["X"]) * scale), image.width),
            min(round((bottom + pad - bounds["Y"]) * scale), image.height),
        )
        image.crop(box).save(path)

    # MARK: - Steps

    def run(self, steps, collect=False):
        """`collect` records the window's text after each step, for unrecorded setup."""
        for step in steps:
            self.step(step)
            if collect:
                self.collect_texts()

    def step(self, step):
        name, action = step["name"], step["action"]
        started = time.time()
        if action == "key":
            if TEXT_KEYSTROKE.fullmatch(step["keys"].strip()):
                raise StepFailed(f"{name}: enter text with a type step, which types at a person's pace")
            subprocess.run(["osascript", "-e", f'tell application "System Events" to {step["keys"]}'], check=True)
        elif action == "click":
            self.click(self.resolve(step["target"]), name, step.get("button", "left"))
        elif action == "move":
            # Rest the pointer at a fraction of the target's frame, such as blank page space.
            x, y, width, height = frame(self.resolve(step["target"]))
            fx, fy = step.get("at", [0.5, 0.5])
            self.move_to(x + width * fx, y + height * fy)
        elif action == "drag":
            self.drag(self.resolve(step["target"]), step)
        elif action == "scroll":
            self.scroll(self.resolve(step["target"]), step["lines"])
        elif action == "type" and "target" in step:
            self.type_into(self.resolve(step["target"]), name, self.label(step["text"]))
        elif action == "type":
            # Into the field that already has focus, such as the palette after ⌘L.
            self.type_text(self.label(step["text"]))
        elif action == "open_url":
            # Plain `open URL` goes to the default browser; this is still a link from another app.
            subprocess.run(["open", "-a", str(self.app), self.label(step["url"])], check=True)
        elif action == "expect" and step.get("absent"):
            self.wait_gone(step["target"], name, step.get("timeout", 5.0))
        elif action == "expect":
            element = self.resolve(step["target"], step.get("timeout", 5.0))
            value = str(attr(element, step.get("attribute", "AXValue")))
            if "contains" in step and self.label(step["contains"]) not in value:
                raise StepFailed(f"{name}: expected {step['contains']!r} in {value!r}")
        elif action == "wait":
            time.sleep(step["seconds"])
        else:
            raise StepFailed(f"{name}: unknown action {action}")
        time.sleep(step.get("settle", 0.6))
        if "observe" in step:
            self.observe(name, self.label(step["observe"]))
        if "capture" in step:
            self.capture(step["capture"], step.get("crop"))
        elif step.get("collect"):
            self.collect_texts()
        self.log["steps"].append(
            {"name": name, "action": action, "t": round(started - self.started, 3), "seconds": round(time.time() - started, 2)}
        )
        print(f"ok  {name}")

    def observe(self, name, popup_label):
        """Record the item titles of an open popup menu."""
        owner = self.resolve({"role": "AXPopUpButton", "label": popup_label})
        items = [attr(item, "AXTitle") for menu in attr(owner, "AXChildren") or [] for item in attr(menu, "AXChildren") or []]
        self.log["observed"][name] = items
        self.seen |= {item for item in items if item}
        print(f"    {name}: menu items {items}")

    def finish(self):
        self.collect_texts()
        self.log["window"] = dict(self.window()["kCGWindowBounds"])
        display = Quartz.CGDisplayBounds(Quartz.CGMainDisplayID())
        self.log["screen_points"] = [display.size.width, display.size.height]
        self.log["seen"] = sorted(self.seen)
        return self.log
