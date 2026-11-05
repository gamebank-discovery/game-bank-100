# 720コーデ版 — Cloudflare Pages Git連携（トークン不要）

すでに `retrocloset/build_site.py`、画像コピー、Pages Functions、
本番用の720コーデ検査が実装済みで、GitHub Actionsでビルド成功を確認しています。
残るのは初回のCloudflareへのGitHub接続だけです。

## 本人のCloudflareアカウントで初回設定する

https://dash.cloudflare.com/ を開く。
Workers & Pages → Create application → Pages → Connect to Git。
GitHubに接続し、レポジトリ **gamebank-discovery/game-bank-100** を選択。

設定：
- Project name: retrocloset-discovery-720
- Production branch: main
- Framework preset: None
- Root directory (advanced): retrocloset
- Build command: python3 build_site.py
- Build output directory: dist

Save and Deploy を実行。ログで成功を確認する。
完成後の推定URLは `https://retrocloset-discovery-720.pages.dev/` だが、
公開されたことはCloudflareダッシュボードとHTTP応答で必ず確認する。

この方法ならGitHub Actions secretsは不要。ゲーム本体は変更されない。
CloudflareがVercelの公開スナップショットから720コーデと写真を自動取得し、
CloudflareのPagesに保存して以後は独立配信します。

## アフィリエイトの正式有効化には別途接続が必要
Cloudflare Pages > Settings > Variables and Secrets に：
- RAKUTEN_APPLICATION_ID
- RAKUTEN_ACCESS_KEY
- RAKUTEN_AFFILIATE_ID（取得済みなら）
- BASE_API_TOKEN（読み取り専用）
- BASE_SHOP_URL

サイト上で検索する通常の楽天リンクは、報酬付きリンクではありません。
APIキーをGitHubリポジトリやチャットに貼らないでください。

## 本番確認
- /: 720コーデの実データがあること
- /looks/look-06.avif: Cloudflareから配信されること
- /journal/: SEO記事が表示されること
- /api/health: Cloudflare Functionsで接続状況が返ること
- /api/rakuten?q=古着%20ニット: キー未設定なら503 setupRequired
- /api/base-stock: BASE未設定なら connected:false

注：参考コーデ写真は一部共用。360個の追加コーデレシピは新しい商品画像360枚を意味しません。
