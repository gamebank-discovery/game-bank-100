# GAME BANK 集客改善 — 2026-11-17

## 目的
- トップページから実際に遊べる3本への入口を増やす
- 共有操作をスマートフォン標準共有 / URLコピーで簡単にする
- プライバシー未整理のまま解析送信や広告配信を開始しない

## 変更内容
- `monetization/gamebank-engagement.js`: 3作品カード・共有操作・匿名イベント
- `monetization/gamebank-engagement.css`: iPhone幅の縦1列を含むスタイル
- `scripts/build_cloudflare.py`: コピーとトップページ限定の読み込み
- 対象ゲーム: `/games/shuden-3sec/index.html` / `/games/neko-big-heist/index.html` / `/games/pig-impossible/index.html`

## 重要な制限
- 収益実績や人気ランキングを捏造しない。3本は編集部のおすすめ。
- `gb:engagement` は JavaScript CustomEvent のみ。計測サーバーには送信しない。
- 広告・アフィリエイトは既存の OFF 設定を維持。
- Cloudflare Pages の本番接続とスマホ実機検査は別途必要。
- 旧 Vercel Hobby は非商用限定。商用稼働には対応プランか商用利用可能な公開先が必要。

## 検証
Cloudflareビルド後に `dist/index.html` にスクリプト参照が1回だけあること、3つのゲームURLが `dist/games/` に存在することを確認する。Chrome/Safariで共有・戻る・ゲーム起動を実機検査する。
