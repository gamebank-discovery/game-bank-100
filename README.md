# GAME BANK — 公開サイト移行

移行元: https://game-bank-100.vercel.app/

このリポジトリはGAME BANKの公開サイトをGitHub経由でCloudflare Pagesへ移すための移行先です。

## 進捗 (2026-11-01)
- [x] GitHubアカウント `gamebank-discovery` の接続・書き込み権限確認
- [x] 移行先リポジトリを初期化
- [ ] 旧Vercelの公開コンテンツの完全回収・検証
- [ ] 全ゲームの起動/音声/画像/スマホ動作検証
- [ ] Cloudflare Pages連携・プレビュー検証
- [ ] 本番切替

公開用スナップショットは `public-mirror/`、取得スクリプトは `scripts/` に配置します。公開サイトから取得できる配信済みHTML/CSS/JS等はオリジナルの開発ソースやプライベートAPIとは限りません。

既存Vercelサイトは削除せず保持します。秘密鍵、環境変数、運用管理用データを公開しないでください。

## 追加ゲーム: KEIBA EDGE PRO v4
- 新作: `public-mirror/games/keiba-edge-pro/index.html`（予想・レース・育成の単体HTML）
- 画像: `public-mirror/games/keiba-edge-pro/cover.svg`
- 登録情報: `public-mirror/games/keiba-edge-pro/game.json`
- ゲーム一覧への安全な追加: `node scripts/register-keiba-edge-pro.mjs .`
- 注意: 既存の `data/games.json` を完全回収した後でのみマージ可能。スクリプトは100件未満のカタログを拒否。現時点でVercel本番への反映・Cloudflare公開は未確認。
