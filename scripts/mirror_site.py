#!/usr/bin/env python3
"""Recover publicly served static GAME BANK files. Does not recover private source or DBs."""
import argparse
import collections
import hashlib
import html.parser
import json
import pathlib
import re
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

MAX_FILE = 20_000_000
SKIP = re.compile(r"(^/api/|^/_vercel/|^/\.|\.map$|/node_modules/|/\.git/)", re.I)
ASSETS = re.compile(r"\.(?:html?|css|js|mjs|json|svg|png|webp|jpg|jpeg|gif|ico|woff2?|ttf|mp3|wav|ogg|mp4|webm|xml|txt|webmanifest)$", re.I)
CSS_URL = re.compile(r"url\(\s*['\"]?([^)'\"\s]+)", re.I)
TEXT_URL = re.compile(r"""(?:src|href|url|path|file|icon|thumbnail|image|audio|poster|playUrl|gameUrl)\s*[:=]\s*['"]([^'"]+)['"]""", re.I)
JS_IMPORT = re.compile(r"""(?:import\s*(?:[^'"]*?\s+from\s*)?|fetch\s*\(|new\s+URL\s*\()\s*['"]([^'"]+)['"]""", re.I)

class Links(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ("src", "href", "poster", "data-src") and value:
                self.urls.append(value)
            elif key == "srcset" and value:
                self.urls.extend(part.strip().split(" ")[0] for part in value.split(","))
    handle_startendtag = handle_starttag

def scan_json(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            if isinstance(value, str) and re.search(r"url|href|path|src|icon|image|thumb|file|audio|cover|route|link", key, re.I):
                yield value
            yield from scan_json(value)
    elif isinstance(obj, list):
        for value in obj:
            yield from scan_json(value)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--origin", default="https://game-bank-100.vercel.app")
    ap.add_argument("--dest", default="public-mirror")
    ap.add_argument("--max-files", type=int, default=4000)
    ap.add_argument("--max-total-mb", type=int, default=200)
    args = ap.parse_args()
    origin = args.origin.rstrip("/")
    host = urllib.parse.urlsplit(origin).netloc.lower()
    dest = pathlib.Path(args.dest)
    dest.mkdir(parents=True, exist_ok=True)
    queue = collections.deque()
    enqueued = set()
    checked = set()
    completed = []
    missing = []
    total = 0

    def add(link, base=origin + "/"):
        if not isinstance(link, str):
            return
        link = link.strip()
        if not link or link.startswith(("#", "data:", "blob:", "javascript:", "mailto:", "tel:", "//")):
            return
        try:
            parsed = urllib.parse.urlsplit(urllib.parse.urljoin(base, link))
            if parsed.scheme not in ("http", "https") or parsed.netloc.lower() != host:
                return
            path = urllib.parse.unquote(parsed.path or "/")
            if SKIP.search(path) or ".." in path.split("/") or "\x00" in path:
                return
            normalized = origin + urllib.parse.quote(path, safe="/:@!$&'()*+,;=-._~")
            if normalized not in enqueued:
                enqueued.add(normalized)
                queue.append(normalized)
        except (ValueError, UnicodeError):
            return

    for seed in ["/", "/index.html", "/data/games.json", "/games.json", "/sitemap.xml",
                 "/robots.txt", "/manifest.webmanifest", "/favicon.ico",
                 "/coorde-v8/", "/pose-motion-studio/"]:
        add(seed)
    opener = urllib.request.build_opener()
    while queue and len(checked) < args.max_files and total < args.max_total_mb * 1_000_000:
        url = queue.popleft()
        if url in checked:
            continue
        checked.add(url)
        try:
            req = urllib.request.Request(url, headers={
                "User-Agent": "GameBank-Migration/1.0 (owner-authorized archival)",
                "Accept": "*/*"
            })
            with opener.open(req, timeout=22) as response:
                final = urllib.parse.urlsplit(response.url)
                if final.netloc.lower() != host:
                    missing.append({"url": url, "status": "external redirect"})
                    continue
                kind = response.headers.get_content_type()
                content = response.read(MAX_FILE + 1)
                if len(content) > MAX_FILE:
                    missing.append({"url": url, "status": "over per-file size limit"})
                    continue
                if len(content) + total > args.max_total_mb * 1_000_000:
                    break
                path = urllib.parse.unquote(urllib.parse.urlsplit(url).path or "/")
                if path.endswith("/"):
                    path += "index.html"
                elif kind == "text/html" and not pathlib.PurePosixPath(path).suffix:
                    path += "/index.html"
                path = path.lstrip("/")
                if not path:
                    path = "index.html"
                target = dest / path
                if not target.resolve().is_relative_to(dest.resolve()):
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(content)
                total += len(content)
                completed.append({"path": path, "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()})
                if kind in ("text/html", "text/css", "text/javascript", "application/javascript",
                            "application/json", "application/xml", "text/xml", "image/svg+xml"):
                    data = content.decode("utf-8", errors="replace")
                    candidates = []
                    if kind == "text/html":
                        parser = Links()
                        parser.feed(data)
                        candidates += parser.urls
                    if kind == "text/css":
                        candidates += CSS_URL.findall(data)
                    if kind in ("text/javascript", "application/javascript", "text/html"):
                        candidates += TEXT_URL.findall(data)
                        candidates += JS_IMPORT.findall(data)
                    if kind == "application/json":
                        try:
                            candidates += list(scan_json(json.loads(data)))
                        except json.JSONDecodeError:
                            pass
                    if kind in ("application/xml", "text/xml"):
                        try:
                            root = ET.fromstring(data)
                            candidates += [e.text for e in root.iter() if e.tag.rsplit("}", 1)[-1] == "loc"]
                        except ET.ParseError:
                            pass
                    for c in candidates:
                        if not c or (not c.startswith(("/", ".", "http")) and not ASSETS.search(urllib.parse.urlsplit(c).path)):
                            continue
                        add(c, url)
        except urllib.error.HTTPError as e:
            missing.append({"url": url, "status": e.code})
        except Exception as e:
            missing.append({"url": url, "status": str(e)[:180]})
        if len(completed) % 100 == 0 and completed:
            print("Recovered", len(completed), "files,", round(total / 1e6, 2), "MB", flush=True)

    report = {
        "origin": origin,
        "generated_epoch": int(time.time()),
        "recovered_files": len(completed),
        "bytes": total,
        "attempted_urls": len(checked),
        "remaining_queued_urls": len(queue),
        "files": completed,
        "failed": missing,
        "limitations": "Public deployed static snapshot ONLY. Not original git history, backend functions, secrets, databases, Blob, or content hosted on other domains."
    }
    (dest / "migration-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("origin", "recovered_files", "bytes", "attempted_urls", "remaining_queued_urls")}, indent=2))

if __name__ == "__main__":
    main()
