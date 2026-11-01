# GAME BANK — GitHub移行（公開版）

移行元: https://game-bank-100.vercel.app/

## 現在の状態（2026-11-01）

- ✅ GitHubアカウント `gamebank-discovery` の書き込み権限確認
- ✅ 旧Vercelサイトの公開配信ファイルを回収し `public-mirror/` に保存
- ✅ 148ゲームページ、カタログ162件（うち非表示106件）、公開用ファイル207種を保存（回収HTTP応答208件）
- ⚠️ 回収時に51件の404、1件の外部リダイレクト。元サイトから回収できないURLがある
- ⏳ ゲームの全件起動、音声、画像、iPhone表示、外部APIの機能テストは未実施
- ⏳ Cloudflare Pagesへの接続、本番公開は未実施

## ディレクトリ

- `public-mirror/`: 元Vercelサイトから取得できたHTML/CSS/JS/画像等。ゲーム一覧は `public-mirror/data/games.json`。
- `public-mirror/migration-report.json`: 保存ファイルと取得失敗URL（要修復）
- `scripts/mirror_site.py`: 公開ページの再取得用スクリプト
- `.github/workflows/mirror-public-site.yml`: GitHub Actionsで再取得を実行

**重要:** これは公開済みサイトの静的スナップショットです。元の開発リポジトリ、Vercel Functions、Blob、DB、ユーザー記録、環境変数、Git履歴まで復元したものではありません。

## Cloudflare Pagesの予定設定

| 項目 | 値 |
|---|---|
| GitHubリポジトリ | `gamebank-discovery/game-bank-100` |
| プロダクションブランチ | `main` |
| フレームワーク | None / 静的サイト |
| ビルドコマンド | 空欄 |
| 出力ディレクトリ | `public-mirror` |

公開前に必ずプレビューで確認。既存Vercelサイトは削除せず、段階的に切り替えます。

非公開バックアップ・関連ゲーム: `gamebank-discovery/game-bank-100Next`。
