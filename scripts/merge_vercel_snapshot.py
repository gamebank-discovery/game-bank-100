#!/usr/bin/env python3
"""Non-destructively merge a staged Vercel public snapshot into GAME BANK.

Current Cloudflare/GitHub files always win; incoming-only static files are added
in an isolated output directory. Catalog and homepage conflicts require review.
No private Vercel APIs, databases, or secrets are migrated by this script.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

PROTECTED = {"index.html", "data/games.json", "migration-report.json"}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def static_files(folder: Path) -> dict[str, Path]:
    found = {}
    for file in folder.rglob("*"):
        if file.is_symlink():
            raise ValueError(f"Refusing symlink: {file}")
        if file.is_file():
            found[file.relative_to(folder).as_posix()] = file
    return found


def catalog_diff(existing: Path, incoming: Path) -> dict:
    a = existing / "data/games.json"
    b = incoming / "data/games.json"
    if not (a.is_file() and b.is_file()):
        return {"status": "missing_catalog", "incoming_only": [], "id_collisions": []}
    current = json.loads(a.read_text(encoding="utf-8"))
    old = json.loads(b.read_text(encoding="utf-8"))
    if not isinstance(current, list) or not isinstance(old, list):
        raise ValueError("Unexpected catalog structure")
    by_id = {str(x.get("id")): x for x in current}
    by_url = {str(x.get("url")): x for x in current}
    missing, collisions = [], []
    for game in old:
        key, url = str(game.get("id")), str(game.get("url"))
        same_id = by_id.get(key)
        same_url = by_url.get(url)
        if same_id is None and same_url is None:
            missing.append({"id": game.get("id"), "title": game.get("title"), "url": game.get("url")})
        elif same_id is not None and same_id.get("url") != game.get("url"):
            collisions.append({"id": game.get("id"), "incoming_url": game.get("url"), "existing_url": same_id.get("url")})
    return {"status": "compared", "incoming_count": len(old), "existing_count": len(current),
            "incoming_only": missing, "id_collisions": collisions}


def merge(existing: Path, incoming: Path, output: Path, report_path: Path) -> dict:
    existing, incoming, output = existing.resolve(), incoming.resolve(), output.resolve()
    if not (existing / "index.html").is_file() or not (incoming / "index.html").is_file():
        raise ValueError("Both snapshots must have an index.html")
    if output == existing or output == incoming or output.is_relative_to(existing) or output.is_relative_to(incoming):
        raise ValueError("Output must not overlap an input directory")
    if output.exists():
        raise ValueError(f"Output already exists: {output}")
    current = static_files(existing)
    old = static_files(incoming)
    comparison = catalog_diff(existing, incoming)
    shutil.copytree(existing, output, symlinks=False)
    added, conflicts, preserved = [], [], []
    for rel, origin in sorted(old.items()):
        if rel in PROTECTED:
            if rel in current and digest(origin) != digest(current[rel]):
                conflicts.append({"path": rel, "reason": "protected_source_of_truth"})
            continue
        if rel in current:
            if digest(origin) != digest(current[rel]):
                conflicts.append({"path": rel, "reason": "keep_newer_cloudflare_version"})
            else:
                preserved.append(rel)
            continue
        dest = output / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origin, dest)
        added.append(rel)
    report = {"policy": "Cloudflare/GitHub wins; missing Vercel files only; do not auto-replace homepage/catalog",
              "existing_files": len(current), "incoming_files": len(old),
              "files_added": added, "conflicts_kept_existing": conflicts,
              "identical_files": len(preserved), "catalog": comparison,
              "limitations": "Does not migrate Worker code, Cloudflare KV/D1, Vercel API functions, Blob, private data, or domain settings."}
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--existing", required=True, type=Path)
    p.add_argument("--incoming", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    p.add_argument("--report", required=True, type=Path)
    args = p.parse_args()
    result = merge(args.existing, args.incoming, args.output, args.report)
    print(json.dumps({"added": len(result["files_added"]), "preserved_conflicts": len(result["conflicts_kept_existing"]),
                      "incoming_only_games_pending_review": len(result["catalog"]["incoming_only"])}, ensure_ascii=False))


if __name__ == "__main__":
    main()
