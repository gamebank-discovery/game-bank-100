# GAME BANK CLOUD (isolated preview)

This is a **new** Cloudflare Worker, not the legacy `game-bank-100next` Worker.
The existing production URL and deployment settings remain untouched.

## Local build and smoke test

From repository root:

```bash
python3 scripts/build_cloudflare.py
test -s dist/index.html
test -s dist/games/pig-jump-evolution/index.html
npx --yes wrangler@4 dev --config cloud/game-bank-cloud/wrangler.jsonc
```

Open the local preview and `/api/health`. Confirm games, touch controls, audio, and navigation before deploying.

## Cloudflare preview deployment

1. Connect GitHub Actions to Cloudflare using repository secrets `CLOUDFLARE_API_TOKEN` (scoped Workers Scripts Edit) and `CLOUDFLARE_ACCOUNT_ID`.
2. Manually trigger **GAME BANK CLOUD preview** in GitHub Actions.
3. Confirm the separate preview URL `game-bank-cloud-preview.<your-subdomain>.workers.dev`.
4. Only after acceptance, plan a separate production cutover with rollback; do **not** rename or deploy over the legacy Worker yet.

The workflow intentionally uses `workflow_dispatch` only, to prevent unreviewed changes from going live.
