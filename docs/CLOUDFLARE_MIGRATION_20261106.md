# GAME BANK — Vercel / Cloudflare 統合移行記録 (2026-11-06)

## 確認できた現状（公開サイトへの切替は未実施）

| 系統 | 現状 | 扱い |
| --- | --- | --- |
| 旧Vercel | https://game-bank-100.vercel.app/ は稼働中。公開中のホームには旧版のゲームカードがある | バックアップ兼移行元。削除しない |
| Cloudflare Workers NEXT | https://game-bank-100next.daioku76.workers.dev/ は164作品を表示する現役ポータル | 維持。既存Workerを上書きしない |
| GitHub / Cloudflare Pages準備 | `gamebank-discovery/game-bank-100` の `public-mirror/` が静的サイトの正本 | Pagesのプレビューで十分に検査後に切替 |

### データの実測

- 変更前GitHubカタログ：166件、うち60件が一覧に表示される状態。旧アーカイブの回収は234ファイル、52件の失敗（主に404）。
- 2026-11-01のGitHub正常版（コミット `0c736cac0bcb071d6af5c504936a160b1b776fef`）とURLで比較。
- **競馬予想アプリ**：旧ID163が「係長昇進試験」に再使用された。既存アプリHTMLは残存。新ID **167** として復元。
- **COLOR BEAT 4**：旧ID164が「LOST QUEST」に再使用された。外部サービスURLを新ID **168** で復元。
- **LOOK MATCH旧URL `/look-match/`**：旧ID158が新LOOK MATCH版に再使用された。現存する旧ページを非表示ID **169** で維持。
- 修正後：**169件登録、62件が一覧表示対象**。旧データを削除せず後方互換とし、Cloudflare Workers NEXTへの導線も設置。
- Worker側164作品と静的サイト側169登録は重複し得る。単純合算して「333本のユニークゲーム」とは主張しない。

## 安全に統合する方式

1. 既存の `public-mirror/` はCloudflare移行先の正本として保護する。
2. Vercelの旧静的サイトを **別の一時ディレクトリ** に取得する。現行ソースへ直接ダウンロードしない。
3. `scripts/merge_vercel_snapshot.py` で欠落している静的ファイルだけ、別のプレビューディレクトリに追加する。**同名ファイルは現在版を優先**。
4. `index.html`、`data/games.json`、`migration-report.json` は自動上書き禁止。ID衝突・不足ゲームをJSON監査レポートに出力し、手作業とPRで解決する。
5. `scripts/check_catalog_integrity.py` でID重複・リスト漏れ・カードのリンク・配信ファイルの有無を確認する。
6. 作業はブランチ→PR→Claudeレビュー→Cloudflareプレビュー→本番の順。自動的にVercelサイトや現行Workersを消さない。

### 実行コマンド（プレビュー、ソース改変なし）

```bash
python3 -m unittest discover -s tests -p 'test_merge_vercel_snapshot.py' -v
python3 -m unittest discover -s tests -p 'test_catalog_integrity.py' -v
python3 scripts/check_catalog_integrity.py public-mirror
python3 scripts/build_cloudflare.py --source public-mirror --output dist
python3 scripts/check_catalog_integrity.py dist
```

公開済みの旧Vercelから再取得したい場合は、GitHub Actionsの「Audit Vercel snapshot for safe Cloudflare merge」を **手動実行**。新ファイルの候補・衝突一覧はArtifactsに出力し、ソースへはpushしない。

## Cloudflare移行の未完了部分

- Cloudflare Pagesへの**GitHub連携と本番URLはまだ確認されていない**。Cloudflareのログイン済み管理画面へのアクセスが必要。
- Pagesを使う場合、GitHub `gamebank-discovery/game-bank-100`、production `main`、build command `python3 scripts/build_cloudflare.py`、output `dist`。既存Workerは残す。
- VercelのサーバーAPI、ゲーム利用統計、Blob/DB、Cloudflare Workers側のKV/D1やユーザーデータは単純な静的HTMLのコピーでは移らない。データのエクスポート・権限・同意を個別に確認する。
- 外部配信に依存するCOLOR BEAT 4などは、そのリンクを復元しても**Cloudflareへ本体移行したことにはならない**。
- 配信確認：トップページ、カタログ169件、62カード、競馬ゲーム、COLOR BEAT 4、餃子2作、LOST QUEST、Cloudflare Workers NEXT 164作品の入口、iPhone/Safari・PC/Chromeの動作確認。
- 404が残る旧Vercel配信資産は、必要性・ゲーム依存関係を判断してから個別に修復する。
- 最後のカスタムドメイン切替はプレビュー／ロールバック確認後に実施。Vercelと既存Workerは引き続き温存。
