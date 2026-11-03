#!/usr/bin/env python3
"""Non-destructive quality gate for the recovered GAME BANK static website.

This checks catalog integrity and flagship files. It is NOT a substitute for
manual gameplay or device testing: the legacy mirror may have unresolved links.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import unquote, urlsplit


FLAGSHIPS = {
    "duck-river": 30000,
    "pig-jump-evolution": 3500,
    "gyoza-master-3d": 30000,
    "gyoza-merge-3d": 18000,
}


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--root", type=Path, default=Path("dist"))
    args = p.parse_args()
    root = args.root.resolve()
    errors: list[str] = []
    warnings: list[str] = []

    def require(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    catalog = root / "data/games.json"
    require((root / "index.html").is_file(), "index.html is missing")
    require(catalog.is_file(), "data/games.json is missing")
    if not catalog.is_file():
        print("\n".join(errors), file=sys.stderr)
        return 1

    try:
        games = json.loads(catalog.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        print(f"Invalid JSON catalog: {exc}", file=sys.stderr)
        return 1

    require(isinstance(games, list), "Game catalog must be a JSON array")
    if not isinstance(games, list):
        return 1
    require(len(games) >= 160, f"Catalog shrank to {len(games)} entries (minimum 160)")

    ids: set[str] = set()
    missing_visible = []
    public_visible = 0
    for index, item in enumerate(games):
        if not isinstance(item, dict):
            errors.append(f"Non-object catalog entry at {index}")
            continue
        identifier = str(item.get("id", ""))
        if not identifier or identifier in ids:
            errors.append(f"Missing or duplicate game ID: {identifier!r}")
        ids.add(identifier)
        url = str(item.get("url", ""))
        visible = item.get("listed") is True and item.get("playable") is True and item.get("hidden") is not True
        if visible:
            public_visible += 1
        if not url.startswith("/games/"):
            continue  # Some catalog URLs are external or non-game experiences.
        parsed = urlsplit(url)
        parts = Path(unquote(parsed.path).lstrip("/")).parts
        if ".." in parts:
            errors.append(f"Unsafe path traversal in game URL: {url}")
            continue
        target = root.joinpath(*parts)
        if visible and not target.is_file():
            missing_visible.append(url)

    if missing_visible:
        # Known mirror gaps are reported without misrepresenting a new PR as their source.
        warnings.append(f"{len(missing_visible)} visible game URLs missing in recovered static mirror")
        warnings.extend(f"  NOT MIRRORED: {url}" for url in missing_visible[:15])

    for slug, minimum_bytes in FLAGSHIPS.items():
        entry = root / "games" / slug / "index.html"
        require(entry.is_file(), f"Flagship missing: {entry}")
        if entry.is_file():
            require(entry.stat().st_size >= minimum_bytes,
                    f"Flagship appears truncated: {entry} ({entry.stat().st_size} bytes)")

    duck = root / "games/duck-river/index.html"
    if duck.is_file():
        html = duck.read_text(encoding="utf-8")
        for marker in ('id="mission"', "function checkMission(g)", "visibilitychange", "function drawDuck("):
            require(marker in html, f"Duck River feature missing: {marker}")
        require(not re.search(r"</html>\s*<script", html, re.I),
                "Duck River has script tags injected after </html>")
        inline_scripts = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, re.S | re.I)
        require(bool(inline_scripts), "Duck River inline game script missing")
        node = shutil.which("node")
        if node and inline_scripts:
            checked = subprocess.run([node, "--check"], input=inline_scripts[0],
                                     text=True, capture_output=True, check=False)
            require(checked.returncode == 0,
                    f"Duck River JavaScript syntax failed: {checked.stderr.strip()}")
        elif not node:
            warnings.append("Node.js not installed; Duck River JavaScript syntax was not checked")

    print(f"GAME BANK quality gate: {len(games)} catalog entries; {public_visible} visible/playable")
    print(f"Flagships checked: {len(FLAGSHIPS)}; unresolved mirrored links: {len(missing_visible)}")
    for warning in warnings:
        print("WARN:", warning)
    for error in errors:
        print("FAIL:", error, file=sys.stderr)
    if errors:
        return 1
    print("PASS: static integrity and Duck River script syntax")
    print("NOTE: actual gameplay, audio, iPhone controls, and publication remain unverified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
