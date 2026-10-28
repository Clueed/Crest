#!/usr/bin/env python3
"""Regenerate and check Crest Help articles by replaying their scenarios.

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


REPOSITORY_ROOT = Path(__file__).resolve().parent.parent.parent
WEBSITE = REPOSITORY_ROOT / "Website"
SCENARIOS = WEBSITE / "helpdocs"
STAGES = ("build", "capture", "polish", "check", "verify")
LSREGISTER = (
    "/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
)


def site_backgrounds() -> dict[str, str]:
    """The docs page background for each site theme, as Website/app/app.css declares it, in hex."""
    css = (WEBSITE / "app/app.css").read_text()
    pattern = r"(@theme|\.dark)\s*\{[^}]*?--color-fd-background:\s*hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)"
    backgrounds = {}
    for selector, hue, saturation, lightness in re.findall(pattern, css):
        rgb = colorsys.hls_to_rgb(float(hue) / 360, float(lightness) / 100, float(saturation) / 100)
        backgrounds["dark" if selector == ".dark" else "light"] = "#" + "".join(f"{round(c * 255):02x}" for c in rgb)
    if "light" not in backgrounds:
        raise SystemExit("Website/app/app.css declares no --color-fd-background in @theme")
    return backgrounds


def poster_path(clip: Path) -> Path:
    """Where a clip's first frame is saved: `name.mp4` -> `name.poster.png`."""
    return clip.with_suffix(".poster.png")


class StepFailed(Exception):
    """A stage could not run as written."""


class Media:
    """The Swift helper for captures and clips, `media.swift`, built into the work folder on first use."""

    SOURCE = Path(__file__).resolve().with_name("media.swift")

    def __init__(self, work: Path):
        self.path = work.resolve() / "media"

    def __call__(self, *arguments, capture_output: bool = False) -> str:
        if not self.path.exists() or self.path.stat().st_mtime < self.SOURCE.stat().st_mtime:
            subprocess.run(["xcrun", "swiftc", "-O", str(self.SOURCE), "-o", str(self.path)], check=True)
        result = subprocess.run(
            [str(self.path), *map(str, arguments)], stdout=subprocess.PIPE if capture_output else None, text=True
        )
        if result.returncode != 0:
            raise StepFailed(f"media {arguments[0]} failed")
        return result.stdout or ""


# MARK: - Scenarios


class Scenario:
    """One help article, the steps that show it, and the files it depends on."""

    def __init__(self, path: Path):
        self.path = path
        self.slug = path.stem
        self.data = json.loads(path.read_text())
        self.article = WEBSITE / self.data["article"]
        self.labels: dict[str, str] = self.data.get("labels", {})
        self.assets: dict[str, str] = self.data.get("assets", {})

    @classmethod
    def all(cls) -> list[Scenario]:
        return [cls(path) for path in sorted(SCENARIOS.glob("*.json"))]

    def sources(self) -> list[str]:
        own = [
            str(self.path.relative_to(REPOSITORY_ROOT)), str(self.article.relative_to(REPOSITORY_ROOT)),
            f"CrestHelpDocs/{self.data['test']}.swift", "CrestHelpDocs/HelpArticleCase.swift",
        ]
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
        return json.loads(result.stdout).get("labels", {}) if result.returncode == 0 else {}


# MARK: - Test app


class TestApp:
    """An unsigned Debug build launched in an isolated, seeded session."""

    def __init__(self, work: Path):
        self.derived_data = (work / "DerivedData").resolve()
        self.path = self.derived_data / "Build/Products/Debug/Crest.app"
        self.executable = self.path / "Contents/MacOS/Crest"
        self.runner = self.derived_data / "Build/Products/Debug/CrestHelpDocs-Runner.app"
        self.media = Media(work)

    def build(self):
        entitlements = Path(
            os.environ.get("CREST_MAC_ENTITLEMENTS", Path.home() / ".config/crest/Crest-adhoc.entitlements")
        )
        command = [
            *self.xcodebuild(), "-configuration", "Debug", "CODE_SIGN_IDENTITY=-", "build-for-testing",
        ]
        if entitlements.exists():
            command.insert(-1, f"CREST_MAC_ENTITLEMENTS={entitlements}")
        started = time.time()
        with open(self.derived_data.parent / "build.log", "w") as log:
            if subprocess.run(command, stdout=log, stderr=subprocess.STDOUT).returncode != 0:
                raise StepFailed(f"build failed; see {log.name}")
        print(f"ok  build ({time.time() - started:.0f} s)")

    def xcodebuild(self) -> list[str]:
        """The CrestHelpDocs scheme builds Crest and the runner that replays Swift scenarios."""
        return [
            "xcodebuild", "-project", str(REPOSITORY_ROOT / "Crest.xcodeproj"), "-scheme", "CrestHelpDocs",
            "-destination", "platform=macOS", "-derivedDataPath", str(self.derived_data),
        ]

    def run_test(self, test: str, input: dict, out: Path):
        """Run one test of the CrestHelpDocs target, handing it `input` as HELPDOCS_RUN."""
        if not self.runner.exists():
            raise StepFailed("no test build; run the build stage first")
        self.quit()
        (out / "input.json").write_text(json.dumps(input))
        results = out / "results.xcresult"
        shutil.rmtree(results, ignore_errors=True)
        env = os.environ | {"TEST_RUNNER_HELPDOCS_RUN": str(out / "input.json")}
        command = [*self.xcodebuild(), "-resultBundlePath", str(results), f"-only-testing:CrestHelpDocs/{test}",
                   "test-without-building"]
        with open(out / "test.log", "w") as log:
            process = subprocess.Popen(command, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            failure = None
            for line in process.stdout:
                log.write(line)
                if line.startswith("helpdocs-capture "):
                    self.capture(json.loads(line.split(" ", 1)[1]), out)
                elif line.startswith(("ok  ", "    ")) and " t = " not in line:
                    print(line, end="")
                elif " error: " in line and failure is None:
                    failure = line.split(" error: ", 1)[1].strip()
            if process.wait() != 0:
                raise StepFailed(failure or f"{test} failed; see {log.name}")
        self.export_attachments(results, out)

    def export_attachments(self, results: Path, out: Path):
        """Copy the files a test attached, such as run.json, into `out` under their names."""
        exported = out / "attachments"
        shutil.rmtree(exported, ignore_errors=True)
        subprocess.run(["xcrun", "xcresulttool", "export", "attachments", "--path", str(results),
                        "--output-path", str(exported)], check=True, capture_output=True)
        for test in json.loads((exported / "manifest.json").read_text()):
            for attachment in test["attachments"]:
                # Xcode appends "_<index>_<UUID>" to the attachment's name.
                name = re.sub(r"_\d+_[0-9A-F-]{36}(?=\.)", "", attachment["suggestedHumanReadableName"])
                shutil.copyfile(exported / attachment["exportedFileName"], out / name)

    def quit(self):
        # Match this build's executable only, never the person's own Crest.
        subprocess.run(["pkill", "-f", str(self.executable)], capture_output=True)
        time.sleep(1)

    def capture(self, request: dict, out: Path):
        """Screenshot the test copy's window for a test, which waits for the file.

        A `crop` keeps only that frame, in screen points."""
        pid = int(subprocess.check_output(["pgrep", "-nf", str(self.executable)]).split()[0])
        partial = out / f"{request['name']}.partial.png"
        self.media("capture", pid, partial, *(request.get("crop") or []))
        # Renamed whole, so the test never reads a half-written file.
        partial.rename(out / f"{request['name']}.png")

    def remove(self):
        """Quit, unregister every bundle inside the build, then delete it."""
        self.quit()
        if not self.path.exists():
            return
        bundles = [self.path] + sorted(self.path.rglob("*.app"))
        if self.runner.exists():
            bundles.append(self.runner)
        for bundle in bundles:
            subprocess.run([LSREGISTER, "-u", str(bundle)], capture_output=True)
        shutil.rmtree(self.path)
        shutil.rmtree(self.runner, ignore_errors=True)
        print(f"ok  removed test build ({len(bundles)} bundles unregistered)")


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

    def test(self, name: str) -> str:
        return f"{self.scenario.data['test']}/{name}"

    def test_input(self, variables: dict[str, str]) -> dict:
        window = self.scenario.data.get("launch", {}).get("window", [1280, 800])
        return {"server": variables.get("server"), "labels": self.scenario.labels, "window": window}

    def capture(self):
        """Record the screen while the scenario's `testCapture` runs.

        The test logs its steps on the same clock, so the clip lines up however
        long the launch and setup took."""
        out = self.out / "capture"
        shutil.rmtree(out, ignore_errors=True)
        out.mkdir(parents=True)
        with self.scenario.fixture_server() as variables:
            recording_started = time.time()
            recorder = subprocess.Popen(["screencapture", "-v", "-k", "-x", str(out / "raw.mov")])
            try:
                self.app.run_test(self.test("testCapture"), self.test_input(variables), out)
            finally:
                time.sleep(1.5)
                recorder.send_signal(2)
                recorder.wait()
        log = json.loads((out / "run.json").read_text()) | {"recording_started": recording_started}
        self.run_log.write_text(json.dumps(log, indent=2))
        self.compare_captures(out)

    def compare_captures(self, out: Path):
        for name in self.scenario.assets:
            new = out / f"{name}.png"
            if not new.exists():
                continue
            published = self.scenario.asset_path(name)
            if not published.exists():
                self.notes.append(f"{name}: new image, not yet published")
                continue
            change = self.app.media("compare", published, new, capture_output=True).strip()
            if change:
                self.notes.append(f"{name}: {change}")

    def polish(self):
        if "clip" not in self.scenario.data:
            return
        backgrounds = site_backgrounds()
        destinations = [
            (self.clip_capture(theme), poster_path(self.clip_capture(theme)), backgrounds[theme])
            for theme in self.scenario.clips()
        ]
        self.app.media(
            "polish", self.out / "capture/raw.mov", self.run_log, self.scenario.data.get("clip_zoom", 1.7),
            *(part for destination in destinations for part in destination),
        )

    def clip_capture(self, theme: str) -> Path:
        return self.out / f"capture/clip.{theme}.mp4"

    def publish(self):
        """Copy the fresh captures, clips and clip posters next to the article."""
        sources = {self.out / f"capture/{name}.png": relative for name, relative in self.scenario.assets.items()}
        for theme, relative in self.scenario.clips().items():
            sources[self.clip_capture(theme)] = relative
            sources[poster_path(self.clip_capture(theme))] = str(poster_path(Path(relative)))
        for source, relative in sources.items():
            target = self.scenario.article.parent / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
            print(f"ok  published {target.relative_to(REPOSITORY_ROOT)}")

    def check(self):
        """Every UI string the reader sees must have been seen in the app."""
        seen = set(json.loads(self.run_log.read_text())["seen"])
        # An element that combines its children, such as a palette row, joins their labels with ", ".
        seen |= {part for text in seen for part in text.split(", ")}
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
        clips = self.scenario.clips().values()
        for relative in [*self.scenario.assets.values(), *clips, *(str(poster_path(Path(c))) for c in clips)]:
            if f"./{relative}" not in self.scenario.article.read_text():
                self.problems.append(f"article does not show {relative}")
        print(f"ok  check ({len(self.problems)} problems)")

    def verify(self):
        """Follow the article from a fresh session, then prove the outcome."""
        out = self.out / "verify"
        shutil.rmtree(out, ignore_errors=True)
        out.mkdir(parents=True)
        with self.scenario.fixture_server() as variables:
            self.app.run_test(self.test("testVerify"), self.test_input(variables), out)

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
