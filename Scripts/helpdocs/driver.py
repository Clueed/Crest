"""Drive a running Crest through the accessibility tree.

Targets are found by accessibility identifier, role and label; no step uses
screen coordinates. Clicks and keys are real events, so a screen recording
shows the pointer, and every click is logged with its screen position.
"""

from __future__ import annotations

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

    # MARK: - Targets

    def pid(self) -> int:
        return int(subprocess.check_output(["pgrep", "-nx", self.process]).split()[0])

    def label(self, value: str) -> str:
        """Expand a `$name` reference to its declared label."""
        if isinstance(value, str) and value.startswith("$"):
            if value[1:] not in self.labels:
                raise StepFailed(f"undeclared label {value}")
            return self.labels[value[1:]]
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

    def collect_texts(self):
        """Record every string the focused window shows, for the label check."""
        window = attr(AXUIElementCreateApplication(self.pid()), "AXFocusedWindow")
        if window is not None:
            for element in descendants(window):
                self.seen |= texts(element)

    # MARK: - Input

    def mouse(self, kind, x, y):
        Quartz.CGEventPost(
            Quartz.kCGHIDEventTap, Quartz.CGEventCreateMouseEvent(None, kind, (x, y), Quartz.kCGMouseButtonLeft)
        )

    def move_to(self, x, y, duration=0.35):
        start = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
        for index in range(1, 21):
            t = index / 20
            t = t * t * (3 - 2 * t)
            self.mouse(Quartz.kCGEventMouseMoved, start.x + (x - start.x) * t, start.y + (y - start.y) * t)
            time.sleep(duration / 20)

    def click(self, element, name):
        AXUIElementPerformAction(element, "AXScrollToVisible")
        time.sleep(0.3)
        x, y, width, height = frame(element)
        cx, cy = x + width / 2, y + height / 2
        self.move_to(cx, cy)
        self.log["clicks"].append({"t": time.time() - self.started, "x": cx, "y": cy, "step": name})
        self.mouse(Quartz.kCGEventLeftMouseDown, cx, cy)
        time.sleep(0.05)
        self.mouse(Quartz.kCGEventLeftMouseUp, cx, cy)

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

    def capture(self, name):
        info = self.window()
        subprocess.run(
            ["screencapture", "-x", "-o", f"-l{info['kCGWindowNumber']}", str(self.out / f"{name}.png")], check=True
        )
        self.log["captures"].append({"t": time.time() - self.started, "name": name})
        self.collect_texts()

    # MARK: - Steps

    def run(self, steps):
        for step in steps:
            self.step(step)

    def step(self, step):
        name, action = step["name"], step["action"]
        started = time.time()
        if action == "key":
            subprocess.run(["osascript", "-e", f'tell application "System Events" to {step["keys"]}'], check=True)
        elif action == "click":
            self.click(self.resolve(step["target"]), name)
        elif action == "scroll":
            self.scroll(self.resolve(step["target"]), step["lines"])
        elif action == "type":
            self.type_into(self.resolve(step["target"]), name, self.label(step["text"]))
        elif action == "open_url":
            # Plain `open URL` goes to the default browser; this is still a link from another app.
            subprocess.run(["open", "-a", str(self.app), step["url"]], check=True)
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
            self.capture(step["capture"])
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
