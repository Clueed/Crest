"""Regenerate and check Crest Help articles by replaying their scenarios.

Run through `Scripts/helpdocs/run`, which supplies the Python dependencies.
See Scripts/helpdocs/README.md for the scenario format and the stages.
"""

from __future__ import annotations

import argparse
import colorsys
import contextlib
import fnmatch
import json
import os
import re
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path

import yaml

from driver import Driver, StepFailed

REPOSITORY_ROOT = Path(__file__).resolve().parent.parent.parent
WEBSITE = REPOSITORY_ROOT / "Website"
SCENARIOS = WEBSITE / "helpdocs"
STAGES = ("build", "capture", "polish", "check", "verify")
LSREGISTER = (
    "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
)
MENU_BAR, DOCK = 33, 55


def site_backgrounds() -> dict[str, tuple[int, int, int]]:
    """The docs page background for each site theme, as Website/app/app.css declares it."""
    css = (WEBSITE / "app/app.css").read_text()
    pattern = r"(@theme|\.dark)\s*\{[^}]*?--color-fd-background:\s*hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)"
    backgrounds = {}
    for selector, hue, saturation, lightness in re.findall(pattern, css):
        rgb = colorsys.hls_to_rgb(float(hue) / 360, float(lightness) / 100, float(saturation) / 100)
        backgrounds["dark" if selector == ".dark" else "light"] = tuple(round(c * 255) for c in rgb)
    if "light" not in backgrounds:
        raise SystemExit("Website/app/app.css declares no --color-fd-background in @theme")
    return backgrounds


# MARK: - Scenarios


class Scenario:
    """One help article, the steps that show it, and the files it depends on."""

    def __init__(self, path: Path):
        self.path = path
        self.slug = path.stem
        self.data = yaml.safe_load(path.read_text())
        self.article = WEBSITE / self.data["article"]
        self.labels: dict[str, str] = self.data.get("labels", {})
        self.assets: dict[str, str] = self.data.get("assets", {})

    @classmethod
    def all(cls) -> list[Scenario]:
        return [cls(path) for path in sorted(SCENARIOS.glob("*.yaml"))]

    def sources(self) -> list[str]:
        own = [str(self.path.relative_to(REPOSITORY_ROOT)), str(self.article.relative_to(REPOSITORY_ROOT))]
        return own + self.data.get("sources", [])

    def affected_by(self, changed: list[str]) -> bool:
        return any(fnmatch.fnmatch(path, pattern) for path in changed for pattern in self.sources())

    def article_text(self) -> str:
        """The article, or only its `section` when the scenario covers one heading."""
        text = self.article.read_text()
        if "section" not in self.data:
            return text
        match = re.search(rf"^(#+) {re.escape(self.data['section'])}\s*$", text, re.MULTILINE)
        if match is None:
            raise StepFailed(f"article has no heading {self.data['section']!r}")
        end = re.compile(rf"^#{{1,{len(match.group(1))}}} ", re.MULTILINE).search(text, match.end())
        return text[match.start() : end.start() if end else len(text)]

    @contextlib.contextmanager
    def fixture_server(self):
        """Serve `serve` (a folder next to the scenario) on a free local port as `{server}`."""
        if "serve" not in self.data:
            yield {}
            return
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            port = probe.getsockname()[1]
        server = subprocess.Popen(
            [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1",
             "--directory", str(self.path.parent / self.data["serve"])],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        time.sleep(0.5)
        try:
            yield {"server": f"http://127.0.0.1:{port}"}
        finally:
            server.terminate()
            server.wait()

    def clips(self) -> dict[str, str]:
        """The clip for each site theme, relative to the article's folder.

        The light clip is `clip`; another theme adds its name before the extension.
        """
        if "clip" not in self.data:
            return {}
        clip = Path(self.data["clip"])
        return {
            theme: str(clip if theme == "light" else clip.with_suffix(f".{theme}{clip.suffix}"))
            for theme in site_backgrounds()
        }

    def asset_path(self, name: str) -> Path:
        return self.article.parent / self.assets[name]

    def committed_labels(self, ref: str) -> dict[str, str]:
        relative = self.path.relative_to(REPOSITORY_ROOT)
        result = subprocess.run(
            ["git", "-C", str(REPOSITORY_ROOT), "show", f"{ref}:{relative}"], capture_output=True, text=True
        )
        return (yaml.safe_load(result.stdout) or {}).get("labels", {}) if result.returncode == 0 else {}


# MARK: - Test app


class TestApp:
    """An unsigned Debug build launched in an isolated, seeded session."""

    def __init__(self, work: Path):
        self.derived_data = work / "DerivedData"
        self.path = self.derived_data / "Build/Products/Debug/Crest.app"
        self.executable = self.path / "Contents/MacOS/Crest"
        self.log = work / "crest.log"

    def build(self):
        entitlements = Path(
            os.environ.get("CREST_MAC_ENTITLEMENTS", Path.home() / ".config/crest/Crest-adhoc.entitlements")
        )
        command = [
            "xcodebuild", "-project", str(REPOSITORY_ROOT / "Crest.xcodeproj"), "-scheme", "Crest",
            "-configuration", "Debug", "-destination", "platform=macOS", "-derivedDataPath", str(self.derived_data),
            "CODE_SIGN_IDENTITY=-", "build",
        ]
        if entitlements.exists():
            command.insert(-1, f"CREST_MAC_ENTITLEMENTS={entitlements}")
        started = time.time()
        with open(self.derived_data.parent / "build.log", "w") as log:
            if subprocess.run(command, stdout=log, stderr=subprocess.STDOUT).returncode != 0:
                raise StepFailed(f"build failed; see {log.name}")
        print(f"ok  build ({time.time() - started:.0f} s)")

    def quit(self):
        # Match this build's executable only, never the person's own Crest.
        subprocess.run(["pkill", "-f", str(self.executable)], capture_output=True)
        time.sleep(1)

    def launch(self, scenario: Scenario):
        if not self.executable.exists():
            raise StepFailed("no test build; run the build stage first")
        self.quit()
        launch = scenario.data.get("launch", {})
        env = os.environ | {key: str(value) for key, value in launch.get("env", {}).items()}
        with open(self.log, "w") as log:
            subprocess.Popen([str(self.executable)], env=env, stdout=log, stderr=subprocess.STDOUT)
        width, height = self.fit(launch.get("window", [1280, 800]))
        for _ in range(60):
            count = osascript('tell application "System Events" to count windows of process "Crest"')
            if count not in ("", "0"):
                break
            time.sleep(0.5)
        osascript(
            f"""tell application "System Events" to tell process "Crest"
                set frontmost to true
                set position of window 1 to {{0, {MENU_BAR}}}
                set size of window 1 to {{{width}, {height}}}
            end tell"""
        )
        time.sleep(2)

    def fit(self, requested):
        import Quartz

        display = Quartz.CGDisplayBounds(Quartz.CGMainDisplayID())
        width = min(requested[0], int(display.size.width) - 24)
        height = min(requested[1], int(display.size.height) - MENU_BAR - DOCK)
        if (width, height) != tuple(requested):
            print(f"    display is {display.size.width:.0f}x{display.size.height:.0f}; window {width}x{height}"
                  f" instead of {requested[0]}x{requested[1]}")
        return width, height

    def remove(self):
        """Quit, unregister every bundle inside the build, then delete it."""
        self.quit()
        if not self.path.exists():
            return
        bundles = [self.path] + sorted(self.path.rglob("*.app"))
        for bundle in bundles:
            subprocess.run([LSREGISTER, "-u", str(bundle)], capture_output=True)
        shutil.rmtree(self.path)
        print(f"ok  removed test build ({len(bundles)} bundles unregistered)")


def osascript(script: str) -> str:
    return subprocess.run(["osascript", "-e", script], capture_output=True, text=True).stdout.strip()


# MARK: - Stages


class Run:
    """One scenario's pass through the stages, collecting its report."""

    def __init__(self, scenario: Scenario, app: TestApp, work: Path, base: str):
        self.scenario = scenario
        self.app = app
        self.out = work / scenario.slug
        self.base = base
        self.problems: list[str] = []
        self.notes: list[str] = []

    @property
    def run_log(self) -> Path:
        return self.out / "run.json"

    def driver(self, out: Path, variables: dict[str, str]) -> Driver:
        driver = Driver(self.app.path, "Crest", self.scenario.labels, out)
        driver.variables = variables
        return driver

    def capture(self):
        """Replay `steps` while recording the screen, after an unrecorded `setup`."""
        out = self.out / "capture"
        shutil.rmtree(out, ignore_errors=True)
        out.mkdir(parents=True)
        with self.scenario.fixture_server() as variables:
            self.app.launch(self.scenario)
            driver = self.driver(out, variables)
            driver.run(self.scenario.data.get("setup", []), collect=True)
            self.record(driver, out)
        self.compare_captures(out)

    def record(self, driver: Driver, out: Path):
        recording_started = time.time()
        recorder = subprocess.Popen(["screencapture", "-v", "-k", "-x", str(out / "raw.mov")])
        time.sleep(1.5)
        # The recording starts here; setup steps belong to no clip.
        driver.started = time.time()
        driver.log |= {"started": driver.started, "steps": [], "clicks": []}
        try:
            driver.run(self.scenario.data["steps"])
        finally:
            time.sleep(1.5)
            recorder.send_signal(2)
            recorder.wait()
        log = driver.finish() | {"recording_started": recording_started}
        self.run_log.write_text(json.dumps(log, indent=2))

    def compare_captures(self, out: Path):
        from PIL import Image, ImageChops

        for name in self.scenario.assets:
            new = out / f"{name}.png"
            if not new.exists():
                continue
            published = self.scenario.asset_path(name)
            if not published.exists():
                self.notes.append(f"{name}: new image, not yet published")
                continue
            old_image, new_image = Image.open(published).convert("L"), Image.open(new).convert("L")
            if old_image.size != new_image.size:
                self.notes.append(f"{name}: size changed {old_image.size} -> {new_image.size}")
                continue
            histogram = ImageChops.difference(old_image, new_image).histogram()
            changed = sum(histogram[16:]) / (old_image.size[0] * old_image.size[1])
            if changed > 0.002:
                self.notes.append(f"{name}: {changed:.1%} of pixels changed")

    def polish(self):
        if "clip" not in self.scenario.data:
            return
        from polish import polish

        backgrounds = site_backgrounds()
        polish(
            self.out / "capture/raw.mov", json.loads(self.run_log.read_text()),
            {self.clip_capture(theme): backgrounds[theme] for theme in self.scenario.clips()},
            zoom=self.scenario.data.get("clip_zoom", 1.7),
        )

    def clip_capture(self, theme: str) -> Path:
        return self.out / f"capture/clip.{theme}.mp4"

    def publish(self):
        """Copy the fresh captures and clip next to the article."""
        sources = {self.out / f"capture/{name}.png": relative for name, relative in self.scenario.assets.items()}
        sources |= {self.clip_capture(theme): relative for theme, relative in self.scenario.clips().items()}
        for source, relative in sources.items():
            target = self.scenario.article.parent / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            print(f"ok  published {target.relative_to(REPOSITORY_ROOT)}")

    def check(self):
        """Every UI string the reader sees must have been seen in the app."""
        seen = set(json.loads(self.run_log.read_text())["seen"])
        keys = set(self.scenario.data.get("keys", []))
        article = self.scenario.article_text()
        for name, value in self.scenario.labels.items():
            if value not in seen:
                self.problems.append(f"label {name} ({value!r}) was not shown in the app")
        bold = [part.strip() for text in re.findall(r"\*\*(.+?)\*\*", article) for part in text.split("→")]
        for text in dict.fromkeys(bold):
            if text not in seen and text not in keys:
                self.problems.append(f"article names **{text}**, which the app did not show")
        # A renamed label must not survive anywhere in the article, including alt text.
        for name, old in self.scenario.committed_labels(self.base).items():
            if self.scenario.labels.get(name) != old and old in article:
                self.problems.append(f"article still says {old!r}; label {name} is now {self.scenario.labels.get(name)!r}")
        for relative in [*self.scenario.assets.values(), *self.scenario.clips().values()]:
            if f"./{relative}" not in self.scenario.article.read_text():
                self.problems.append(f"article does not show {relative}")
        print(f"ok  check ({len(self.problems)} problems)")

    def verify(self):
        """Follow the article from a fresh session, then prove the outcome."""
        out = self.out / "verify"
        shutil.rmtree(out, ignore_errors=True)
        out.mkdir(parents=True)
        with self.scenario.fixture_server() as variables:
            self.app.launch(self.scenario)
            driver = self.driver(out, variables)
            driver.run(self.scenario.data.get("setup", []))
            driver.run(self.scenario.data["verify"])

    def report(self) -> bool:
        print(f"\n{self.scenario.slug}: {'FAILED' if self.problems else 'passed'}")
        for line in self.problems:
            print(f"  problem: {line}")
        for line in self.notes:
            print(f"  changed: {line}")
        (self.out / "report.json").write_text(json.dumps({"problems": self.problems, "changed": self.notes}, indent=2))
        return not self.problems


# MARK: - Command line


def build_site() -> bool:
    """The articles, with their images and clips, must still build."""
    if not (WEBSITE / "node_modules").exists():
        print("\nwebsite: build skipped; run `npm ci` in Website first")
        return True
    result = subprocess.run(["npm", "run", "build"], cwd=WEBSITE, capture_output=True, text=True)
    print(f"\nwebsite: {'built' if result.returncode == 0 else 'BUILD FAILED'}")
    if result.returncode != 0:
        print(result.stdout[-2000:], result.stderr[-2000:])
    return result.returncode == 0


def changed_files(base: str) -> list[str]:
    output = subprocess.check_output(["git", "-C", str(REPOSITORY_ROOT), "diff", "--name-only", base], text=True)
    return output.split()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("slugs", nargs="*", help="scenario names in Website/helpdocs; default all")
    parser.add_argument("--changed", action="store_true", help="only scenarios whose sources differ from --base")
    parser.add_argument("--base", default="HEAD", help="Git ref for --changed and for renamed labels")
    parser.add_argument("--stage", action="append", choices=STAGES, help="run only these stages; repeatable")
    parser.add_argument("--publish", action="store_true", help="copy fresh captures and clip next to the article")
    parser.add_argument("--keep", action="store_true", help="leave the test build installed afterwards")
    parser.add_argument("--work", type=Path, default=Path(os.environ.get("TMPDIR", "/tmp")) / "crest-helpdocs")
    args = parser.parse_args()

    scenarios = Scenario.all()
    if args.slugs:
        scenarios = [s for s in scenarios if s.slug in args.slugs]
    if args.changed:
        changed = changed_files(args.base)
        scenarios = [s for s in scenarios if s.affected_by(changed)]
    if not scenarios:
        print("no scenarios to run")
        return 0

    stages = args.stage or list(STAGES)
    args.work.mkdir(parents=True, exist_ok=True)
    app = TestApp(args.work)
    passed = True
    try:
        if "build" in stages:
            app.build()
        for scenario in scenarios:
            run = Run(scenario, app, args.work, args.base)
            run.out.mkdir(parents=True, exist_ok=True)
            print(f"\n== {scenario.slug}")
            try:
                for stage in ("capture", "polish"):
                    if stage in stages:
                        getattr(run, stage)()
                if args.publish:
                    run.publish()
                for stage in ("check", "verify"):
                    if stage in stages:
                        getattr(run, stage)()
            except StepFailed as failure:
                run.problems.append(str(failure))
            passed = run.report() and passed
        if "check" in stages:
            passed = build_site() and passed
    finally:
        if not args.keep:
            app.remove()
    print(f"\nwork files: {args.work}")
    return 0 if passed else 1


if __name__ == "__main__":
    sys.exit(main())
