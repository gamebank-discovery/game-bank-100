#!/usr/bin/env python3
"""Restore the tested PIG LOVE STORY static game from checked-in source archive.

Pure standard library; no Vercel fetch, secrets or network required.
"""
from __future__ import annotations

import base64
import hashlib
import io
from pathlib import Path
import re
import tarfile

SOURCE_FILES = {
    "index.html": "2240c287d8521bc54be4dcd099a56ca5056238357e73b137b3e01cbc7bc2327f",
    "engine.js": "2e6505fcdfa4ed9315673599ce6fc650364211afb9b93885df17a68bac59d1f0",
    "pig.js": "2a8944d2a763cef02699a1e378ddf40795a5761c64d9818daface972a9db95aa",
}
ARCHIVE_SHA256 = "2efd7f5c89576b7651a8d7ddddb44ad25ad887a6db386be67160e25c06f82227"


def restore_pig_love(root: Path, dest: Path | None = None) -> list[Path]:
    root = root.resolve()
    dest = (dest or root / "public-mirror/games/pig-jump-evolution").resolve()
    parts = sorted((root / "pig-source").glob("pig-love-v2.part*.b64"))
    if len(parts) != 6:
        raise RuntimeError(f"Expected 6 source archive parts, found {len(parts)}")
    b64 = "".join(part.read_text(encoding="ascii").strip() for part in parts)
    archive = base64.b64decode(b64, validate=True)
    if hashlib.sha256(archive).hexdigest() != ARCHIVE_SHA256:
        raise RuntimeError("PIG source archive SHA256 mismatch")
    payload = {}
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as tar:
        for member in tar.getmembers():
            if not member.isfile() or member.name not in SOURCE_FILES:
                raise RuntimeError(f"Unsafe or unexpected archive member: {member.name}")
            stream = tar.extractfile(member)
            if stream is None:
                raise RuntimeError(f"Cannot read {member.name}")
            data = stream.read()
            if hashlib.sha256(data).hexdigest() != SOURCE_FILES[member.name]:
                raise RuntimeError(f"Asset checksum mismatch: {member.name}")
            payload[member.name] = data

    if set(payload) != set(SOURCE_FILES):
        raise RuntimeError("Static game is missing an expected asset")

    index = payload["index.html"].decode("utf-8")
    index, replacements = re.subn(
        r'\./pig\.js\?v=[^"]+',
        './pig.js?v=20261101-loveplay-cloudflare-v2',
        index,
        count=1
    )
    if replacements != 1:
        raise RuntimeError("Cannot update PIG game script version")
    index = re.sub(r'<script[^>]*vercel\.live[^>]*></script>', '', index)
    if "pig-jump-evolution.vercel.app" in index:
        raise RuntimeError("Game HTML still references Vercel")

    js = payload["pig.js"].decode("utf-8")
    for token in (
        "__PIG_LOVE_PLAY_V2__", "__PIG_HUMAN_MEMORY_10__",
        "__PIG_WORLD_ALL15__", "__PIG_SLOW_GROW_V1__",
        "function activateDuo()", "function memoryFlightCleared(distance)"
    ):
        if token not in js:
            raise RuntimeError(f"Game regression: {token}")

    payload["index.html"] = index.encode("utf-8")
    dest.mkdir(parents=True, exist_ok=True)
    outputs = []
    for name, contents in payload.items():
        path = dest / name
        path.write_bytes(contents)
        outputs.append(path)
        print(f"Restored {path.relative_to(root)} ({len(contents)} bytes)")
    return outputs


if __name__ == "__main__":
    here = Path(__file__).resolve().parent.parent
    restore_pig_love(here)
