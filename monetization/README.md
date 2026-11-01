# GAME BANK — 広告・アフィリエイト共通部品（検証用）
管理方針: daioku76@gmail.com。こちらの `develop` ブランチは開発・検証用。Cloudflareの本番は `main` のみとする。

## 現状
本部品は**配置済み・未公開**。既存 GAME BANK ゲーム本体の移行や Cloudflare Pages 接続、AdSense 審査完了を意味しない。
- AdSense publisher ID と広告ユニットID: 未設定。勝手な値を入れない。
- 楽天/A8: この管理者が発行したアフィリエイトURLのみを利用。未設定なら商品エリアは非表示。
- 個人情報・ログイン情報・APIキーをGitHubに書かない。

## 使い方
1. `config.example.js` を `config.js` にコピーし、認証済みのID/URLだけを設定。
2. 表示するHTMLに以下を追加（移行後のサイト構造に合わせてパス調整）。
   ```html
   <link rel="stylesheet" href="/monetization/gamebank-monetize.css">
   <div data-gb-affiliate-list></div>
   <div data-gb-ad-slot="catalog"></div>
   <script src="/monetization/config.js"></script>
   <script defer src="/monetization/gamebank-monetize.js"></script>
   ```
3. AdSenseでサイトを追加し、所有権確認とポリシー審査を完了した後のみ `approved: true`。`adsense.enabled` を有効にし実際の publisher/slot ID を設定する。
4. AdSenseの`ads.txt`はパブリッシャーID確定後に**配信ルート**に設置。例のIDやダミーを公開しない。
5. プライバシーポリシー、Cookie/CMP対応（適用地域に応じて）、広告明示を確認する。
6. ゲーム操作中やジャンプボタン付近に広告を置かない。ゲーム一覧・結果画面など誤クリックを招かない場所に配置する。
7. アフィリエイトは`rel="sponsored nofollow"`を付与し、PR表記を見やすく表示。
8. `develop`でテストし、機能・表示・規約を確認してから`main`へPRマージする。

## 監視と拡張
- Cloudflare Web Analytics（PV/参照元、設定と同意は運用方針に合わせる）。
- `gb:affiliate-click`イベントを計測基盤に接続可能。現時点では外部送信しない。
- 売上は楽天/A8の確定報酬とAdSenseの管理画面で照合する。クリック数を売上と混同しない。
- 今後は公開/非公開ファイル分離、ランキング、ゲーム内イベントを追加。

公式参考:
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://support.google.com/adsense/answer/12131223?hl=ja
- https://support.google.com/adsense/answer/12171612?hl=ja
- https://www.caa.go.jp/policies/policy/representation/fair_labeling/faq/stealth_marketing
