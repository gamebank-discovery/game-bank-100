#!/usr/bin/env python3
"""Inject opt-in visual polish only into the Gyoza Merge built page.

Duck River and all other games remain byte-for-byte unchanged by this step.
"""
from pathlib import Path

LINK = '<link rel="stylesheet" href="/assets/gyoza-depth.css">'

def apply(root: Path, dist: Path) -> None:
    page = dist / "games/gyoza-merge-3d/index.html"
    if not page.is_file():
        raise SystemExit("ERROR: Gyoza Merge entrypoint is missing")
    source = root / "assets/gyoza-depth.css"
    if not source.is_file():
        raise SystemExit("ERROR: Gyoza depth stylesheet is missing")
    target = dist / "assets/gyoza-depth.css"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())
    html = page.read_text(encoding="utf-8")
    if LINK not in html:
        if "</head>" not in html:
            raise SystemExit("ERROR: Gyoza Merge HTML has no head")
        page.write_text(html.replace("</head>", LINK + "\n</head>", 1), encoding="utf-8")

if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    apply(root, root / "dist")
