#!/usr/bin/env python3
"""Audit built GAME BANK game entrypoints and local resource references.

Read-only: never changes games or silently deletes assets.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit

class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        for key in ("src", "href"):
            if key in data and tag in ("script", "img", "audio", "video", "source", "link"):
                self.refs.append((tag, data[key]))

def audit(root: Path) -> dict:
    games = root / "games"
    if not games.is_dir():
        raise ValueError(f"Missing games directory: {games}")
    folders = sorted(p for p in games.iterdir() if p.is_dir())
    findings = []
    valid = 0
    for folder in folders:
        entry = folder / "index.html"
        if not entry.is_file() or entry.stat().st_size == 0:
            findings.append({"game": folder.name, "severity": "error", "issue": "missing_or_empty_index"})
            continue
        valid += 1
        parser = Resources()
        try:
            parser.feed(entry.read_text(encoding="utf-8"))
        except (UnicodeError, ValueError) as exc:
            findings.append({"game": folder.name, "severity": "error", "issue": "invalid_html_encoding", "detail": str(exc)})
            continue
        for tag, raw in parser.refs:
            value = (raw or "").strip()
            if not value or value.startswith(("#", "//", "data:", "blob:", "javascript:")):
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc:
                continue
            rel = unquote(url.path)
            if not rel:
                continue
            resolved = (root / rel.lstrip("/") if rel.startswith("/") else folder / rel).resolve()
            if not resolved.is_relative_to(root.resolve()):
                findings.append({"game": folder.name, "severity": "warning", "issue": "path_outside_build", "reference": value})
            elif not resolved.is_file():
                findings.append({"game": folder.name, "severity": "warning", "issue": "missing_local_resource", "tag": tag, "reference": value})
    return {"games_found": len(folders), "valid_entrypoints": valid, "errors": sum(x["severity"] == "error" for x in findings), "warnings": sum(x["severity"] == "warning" for x in findings), "findings": findings}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--root", default="dist")
    p.add_argument("--report", default="game-audit-report.json")
    args = p.parse_args()
    result = audit(Path(args.root))
    Path(args.report).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Audited {result['games_found']} game directories: {result['valid_entrypoints']} entrypoints, {result['errors']} errors, {result['warnings']} warnings")
    for item in result["findings"][:25]:
        print(f"{item['severity'].upper()}: {item['game']}: {item['issue']} {item.get('reference', '')}")
    raise SystemExit(1 if result["errors"] else 0)

if __name__ == "__main__":
    main()
