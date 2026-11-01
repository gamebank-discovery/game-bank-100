#!/usr/bin/env python3
"""Build Cloudflare Pages output without silently publishing an empty skeleton."""
from __future__ import annotations
import argparse
from pathlib import Path
import shutil
from restore_pig_love import restore_pig_love
from patch_pig_course import patch_course
from patch_pig_fun import patch_fun

STYLE = '<link rel="stylesheet" href="/monetization/gamebank-monetize.css">'
SCRIPTS = ('<script src="/monetization/config.js"></script>'
           '<script defer src="/monetization/gamebank-monetize.js"></script>')
WIDGETS = ('<section aria-label="おすすめ商品" data-gb-affiliate-list></section>'
           '<div data-gb-ad-slot="catalog"></div>')

def build(source: Path, target: Path, root: Path) -> None:
    if not (source / "index.html").is_file():
        raise SystemExit("ERROR: public-mirror/index.html is missing. Run the mirror workflow and validate games first.")
    restore_pig_love(root, source / "games/pig-jump-evolution")
    patch_course(source / "games/pig-jump-evolution")
    patch_fun(source / "games/pig-jump-evolution")
    if source.resolve() == target.resolve():
        raise SystemExit("ERROR: source and output cannot be the same directory.")
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(source, target)
    # Publicly served adapter files only, excluding docs/source examples.
    monetization = target / "monetization"
    monetization.mkdir(parents=True, exist_ok=True)
    origin = root / "monetization"
    for filename in ("gamebank-monetize.js", "gamebank-monetize.css"):
        shutil.copy2(origin / filename, monetization / filename)
    # An explicit config takes priority; example has ads/affiliate OFF.
    cfg = origin / "config.js"
    shutil.copy2(cfg if cfg.exists() else origin / "config.example.js", monetization / "config.js")
    homepage = target / "index.html"
    html = homepage.read_text(encoding="utf-8")
    if 'gamebank-monetize.js' not in html:
        if "</head>" not in html.lower() or "</body>" not in html.lower():
            raise SystemExit("ERROR: unexpected homepage structure; refuse unsafe injection.")
        # This does not insert ads near in-game action buttons.
        html = html.replace("</head>", STYLE + "\n</head>", 1)
        html = html.replace("</body>", WIDGETS + SCRIPTS + "\n</body>", 1)
        homepage.write_text(html, encoding="utf-8")
    print(f"Built {target}/ (main catalog monetization hook ready, ads disabled by default).")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--source", default="public-mirror")
    p.add_argument("--output", default="dist")
    args = p.parse_args()
    root = Path(__file__).resolve().parent.parent
    build(root / args.source, root / args.output, root)
