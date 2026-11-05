# RetroCloset — Cloudflare Pages 720 LOOKS

Independent fashion project. This folder is separate from GAME BANK game source.

## Build
`python3 retrocloset/build_site.py` (from repository root)

The build downloads public pages and reference images from the existing approved
RetroCloset Vercel release, expands outfit recipes from 360 to 720 unique IDs,
self-hosts the image assets, rewrites canonical URLs for Cloudflare, and writes
static output to `retrocloset/dist/`.

Existing GAME BANK games, Workers, routes, and deployment configurations are
not changed. Only the dedicated Cloudflare Pages project
`retrocloset-discovery-720` is published by the separate workflow.

## Deployment
`.github/workflows/deploy-retrocloset-cloudflare.yml` runs automatically on
changes in `retrocloset/**` or by manual workflow_dispatch.

Existing repository Actions secrets required:
- `CLOUDFLARE_API_TOKEN`: Account-level Cloudflare Pages Edit
- `CLOUDFLARE_ACCOUNT_ID`: account ID

Cloudflare Pages project will be `retrocloset-discovery-720`.
Public address after a verified successful deployment:
`https://retrocloset-discovery-720.pages.dev/`.

Do not assume the URL is live until the workflow ends successfully and
HTTP verification passes. Repo secrets may not yet be configured.

## Commerce API
The Cloudflare Pages Functions are in `retrocloset/functions/api/`:
- `rakuten.js`: requires RAKUTEN_APPLICATION_ID, RAKUTEN_ACCESS_KEY,
  optional RAKUTEN_AFFILIATE_ID configured as **Cloudflare Pages secrets**.
- `base-stock.js`: requires BASE_API_TOKEN (read-only), BASE_SHOP_URL
  configured as **Cloudflare Pages secrets**.
- `health.js`: reports readiness booleans, not secrets.
- `events.js`: accepts minimal outbound click-event details; no revenue reporting.

Without production credentials, no affiliate payout links or own-stock product
listing is fabricated; users can still use standard Rakuten search links.

## Quality
- 720 *distinct outfit recipes*, not 720 different clothing photographs.
- Six locally mirrored style photographs are reused where appropriate.
- Generated imagery is labeled as styling reference, not sales inventory.
- Search filters, favorites, responsive layout, article pages and shop guide
  are copied from the reviewed Vercel site.
- Run local checks for mobile width, image routes and API status before promotion.
