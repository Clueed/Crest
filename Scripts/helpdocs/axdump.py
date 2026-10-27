"""Print the accessibility tree of a running app, to choose scenario targets.

Scripts/helpdocs/axdump [process] [max depth]
"""

import subprocess
import sys

from driver import attr, frame


def walk(element, depth, max_depth):
    if depth > max_depth:
        return
    parts = [str(attr(element, "AXRole"))]
    for key in ("AXIdentifier", "AXTitle", "AXDescription", "AXValue", "AXHelp"):
        value = attr(element, key)
        if value not in (None, ""):
            parts.append(f"{key[2:]}={str(value)[:60]!r}")
    try:
        bounds = tuple(round(v) for v in frame(element) or ())
    except (OverflowError, ValueError):
        bounds = ()
    print("  " * depth + " ".join(parts), bounds)
    for child in attr(element, "AXChildren") or []:
        walk(child, depth + 1, max_depth)


if __name__ == "__main__":
    from ApplicationServices import AXUIElementCreateApplication

    process = sys.argv[1] if len(sys.argv) > 1 else "Crest"
    pid = int(subprocess.check_output(["pgrep", "-nx", process]).split()[0])
    for window in attr(AXUIElementCreateApplication(pid), "AXWindows") or []:
        walk(window, 0, int(sys.argv[2]) if len(sys.argv) > 2 else 40)
