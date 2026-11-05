#!/usr/bin/env python3
"""Build independent RetroCloset Cloudflare Pages assets from approved public Vercel release.

The GAME BANK source, game assets, and Cloudflare projects are never modified.
"""
from __future__ import annotations

import os
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
SOURCE = "https://retro-closet-discovery.vercel.app"
CLOUDFLARE = "https://retrocloset-discovery-720.pages.dev"
OLD_LOOK06 = "https://retro-closet-discovery-cz69tcoct-maverick11041-7939s-projects.vercel.app/looks/look-06.avif"

ASSETS = [
    "assets/hero-desktop.avif",
    "assets/hero-desktop.webp",
    "assets/hero-mobile.avif",
    "assets/hero-mobile.webp",
    *[f"looks/look-{i:02d}.avif" for i in range(1, 7)],
]
PAGES = [
    ("journal/", "journal/index.html"),
    *[(f"journal/{s}.html", f"journal/{s}.html") for s in
      ["start", "denim", "knit", "womens", "care", "shopping"]],
    ("owner-tools.html", "owner-tools.html"),
    ("privacy.html", "privacy.html"),
    ("robots.txt", "robots.txt"),
    ("sitemap.xml", "sitemap.xml"),
    ("affiliate-official.html", "affiliate-official.html"),
]

MORE_COORDINATES = r"""
/* RETROCLOSET_720: 360 additional outfit recipes, not 360 distinct new photos.
   Photos are style references; merchandise is never represented as live inventory. */
const RC_720_VARIANTS=[
 ["春の白シャツ","春","ペール","70s","薄手リネンシャツ","生成りのワイドチノ","キャンバスローカット","細いレザーベルト"],
 ["藍色レイヤード","春","ネイビー","80s","インディゴのバンドカラーシャツ","濃紺ストレートパンツ","白のレトロスニーカー","キャンバストート"],
 ["夏のクラシック","夏","アース","90s","オープンカラーシャツ","ベージュのリネンパンツ","スエードローファー","麦わらハット"],
 ["レトロスポーツ","夏","ビビッド","00s","古着のカレッジT","ネイビーのイージーパンツ","レトロランニングシューズ","色柄バンダナ"],
 ["フレンチワーク","秋","ネイビー","70s","モールスキンのワークシャツ","生成りの2タックパンツ","レザーのデッキシューズ","レザーショルダーバッグ"],
 ["アースカラー","秋","アース","80s","ウールチェックシャツ","オリーブのワイドチノ","ブラウンのワークブーツ","古着の革ベルト"],
 ["モノトーン","冬","モノトーン","90s","チャコールのタートルネック","ブラックのウールスラックス","黒のサイドゴアブーツ","ウールマフラー"],
 ["ウールの休日","冬","アース","00s","ざっくりケーブルニット","グレーのコーデュロイパンツ","スエードチャッカブーツ","ニットキャップ"],
 ["軽やかなマリン","春","ネイビー","90s","ボーダーのコットンカットソー","オフホワイトのワイドデニム","ブラウンのデッキシューズ","ライトブルーのスカーフ"],
 ["都会のミニマル","秋","モノトーン","00s","グレーのハイゲージニット","チャコールのタックパンツ","黒のレザースニーカー","シルバーの腕時計"],
 ["ウォームプレッピー","冬","ビビッド","80s","ボルドーのニットベスト","ベージュのストレートチノ","バーガンディのローファー","チェックのマフラー"],
 ["ナチュラルライト","夏","ペール","70s","生成りのリネンベスト","サンドベージュのイージーパンツ","白のキャンバスシューズ","小さな帆布バッグ"]
];
const RC_720_NEW=data.slice(0,360).map((v,i)=>{
 const edit=RC_720_VARIANTS[(i*7+Math.floor(i/12))%RC_720_VARIANTS.length];
 const recipe=[v.recipe[0],edit[4],edit[5],edit[6],edit[7]];
 return {id:361+i,name:v.name+" / "+edit[0],cat:v.cat,gender:v.gender,
  desc:v.cat+"スタイルをベースに、"+v.recipe[0]+"と"+edit[4]+"を重ね、"+edit[5]+"で仕上げる"+edit[1]+"の古着コーデ。",
  image:v.image,recipe,season:edit[1],color:edit[2],era:edit[3]};
});
data.push(...RC_720_NEW);
if(data.length!==720||new Set(data.map(x=>x.id)).size!==720)throw new Error("RetroCloset 720 unique look IDs validation failed");
"""

NEW_EDITORIAL = """
<section class="rc-new-edition" aria-label="720コーデ特集">
 <div class="container rc-new-row">
   <div><span class="kicker">DISCOVERY VINTAGE / NEW EDITION</span>
     <h2 class="serif">720 ways to wear vintage<span style="color:#c8a57f">.</span></h2>
     <p>気分も季節も、好きな形も。古着の着こなしアイデアを720種類に拡張。
     好きなコーデを見つけて、似た服を探そう。</p>
     <a href="#styling" class="rc-new-button">720コーデを見てみる ↗</a>
   </div><div class="rc-new-number">720<span>LOOK IDEAS</span></div>
 </div>
</section>
"""

NEW_CSS = """
.rc-new-edition{background:linear-gradient(125deg,#30231b,#5a4431);color:#fff8ee;padding:52px 0}
.rc-new-row{display:flex;align-items:center;justify-content:space-between;gap:25px}
.rc-new-row h2{font-size:clamp(32px,5vw,65px);line-height:1.1;margin:13px 0}
.rc-new-row p{color:#f3e5d5;line-height:1.9;font-size:13px;max-width:55ch}
.rc-new-button{display:inline-block;background:#f1dbbd;color:#38281b;text-decoration:none;padding:13px 20px;border-radius:7px;font-weight:700;font-size:13px;margin-top:10px}
.rc-new-number{flex:none;font:italic clamp(65px,12vw,160px) Georgia,serif;color:#f4e3cc;letter-spacing:-.07em}
.rc-new-number span{display:block;text-align:center;letter-spacing:.2em;font:10px sans-serif}
@media(max-width:600px){.rc-new-edition{padding:33px 0}.rc-new-number{font-size:70px}.rc-new-row h2{font-size:29px}.rc-new-row p{font-size:11px}}
"""

def grab(url: str, attempts: int = 3) -> bytes:
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": "RetroCloset-Cloudflare-Build/1.0", "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=35) as response:
                data = response.read()
                if not data:
                    raise RuntimeError(f"Empty HTTP body: {url}")
                return data
        except Exception as exc:
            if attempt == attempts - 1:
                raise RuntimeError(f"Cannot fetch {url}: {exc}") from exc
            time.sleep(2 * (attempt + 1))
    raise AssertionError("unreachable")

def write(relative: str, content: bytes | str) -> None:
    path = DIST / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content if isinstance(content, bytes) else content.encode("utf-8"))

def build() -> None:
    DIST.mkdir(parents=True, exist_ok=True)
    html = grab(SOURCE + "/").decode("utf-8")
    if 'data.push(...additions);' not in html or 'id="shop20"' not in html:
        raise RuntimeError("Unexpected Vercel source: missing 360-look dataset or shopping section")
    if "RC_720_NEW" in html:
        raise RuntimeError("Source already contains 720-look expansion")
    html = html.replace('data.push(...additions);', 'data.push(...additions);\n' + MORE_COORDINATES, 1)
    # Original 360-look assertion must now validate the complete 720-look catalog.
    html = html.replace('if(data.length!==360 || new Set(data.map(v=>v.id)).size!==360)',
                        'if(data.length!==720 || new Set(data.map(v=>v.id)).size!==720)', 1)
    if 'if(data.length!==360' in html:
        raise RuntimeError('Stale 360-look runtime guard remains')
    # The earlier Vercel build borrowed look-06 from its previous deployment;
    # restore the image as a local, self-hosted asset for the Pages copy.
    html = html.replace(OLD_LOOK06, "/looks/look-06.avif")
    html = html.replace('360の', '720の').replace('360コーデ', '720コーデ')
    html = html.replace('360種類', '720種類').replace("' / 360'", "' / 720'")
    html = html.replace('<=360', '<=720')
    html = html.replace('id="styling"', 'id="styling"')
    if '</style>' not in html or '<section id="styling"' not in html:
        raise RuntimeError("Cannot insert visual upgrade")
    html = html.replace('</style>', NEW_CSS + '\n</style>', 1)
    html = html.replace('<section id="styling"', NEW_EDITORIAL + '\n<section id="styling"', 1)
    html = html.replace(SOURCE, CLOUDFLARE)
    assert "RC_720_NEW" in html and "' / 720'" in html
    assert html.count("RC_720_NEW") == 2  # declaration and data.push
    write("index.html", html)

    for relative in ASSETS:
        url = OLD_LOOK06 if relative == "looks/look-06.avif" else SOURCE + "/" + relative
        blob = grab(url)
        if len(blob) < 500:
            raise RuntimeError(f"Asset too small: {relative}")
        write(relative, blob)
    for remote, local in PAGES:
        content = grab(SOURCE + "/" + remote)
        # SEO canonical, sitemap and internal links point to the actual Pages domain.
        if local.endswith((".html", ".txt", ".xml")):
            content = content.decode("utf-8").replace(SOURCE, CLOUDFLARE).encode("utf-8")
        write(local, content)
    write("_headers", """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  X-Frame-Options: SAMEORIGIN

/assets/*
  Cache-Control: public, max-age=604800

/looks/*
  Cache-Control: public, max-age=604800
""")
    print(f"OK: 720 outfits, {len(ASSETS)} self-hosted media files, {len(PAGES)} support pages")
    print("Cloudflare preview root:", DIST)
    print("Total output files:", len(list(DIST.rglob("*"))))

if __name__ == "__main__":
    build()
