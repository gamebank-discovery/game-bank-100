# GAME BANK on Cloudflare Pages — operations guide (2026-11-01)

## Intended deployment and account
- Primary operator: `daioku76@gmail.com` (must be verified in Cloudflare dashboard separately).
- Source: `gamebank-discovery/game-bank-100` GitHub public repo.
- Vercel: existing legacy/QA environment remains untouched until the migration is verified.
- Cloudflare Pages: production deploy from `main` only; `develop` is for verification.
- Source recovery: `.github/workflows/mirror-public-site.yml` copies the **public static snapshot** into `public-mirror/`. It does **not** recover private apps, original source, databases, secrets or all dynamic endpoints.

## Phase 1: Recover & validate before deployment
1. In GitHub Actions, manually run `Recover public GAME BANK site` on main.
2. Check `public-mirror/migration-report.json`, missing files and `public-mirror/index.html`.
3. Test games, audio, assets, iPhone responsiveness, internal links, 404s, and source/content rights.
4. Merge approved monetization adapter from `develop` to `main` after review.
5. Run `python3 scripts/build_cloudflare.py`; it **fails** if the recovered homepage is absent.

## Phase 2: Connect Cloudflare
1. Sign into the intended Cloudflare account, open Workers & Pages > Create > Pages > Connect to Git.
2. Authorize the **gamebank-discovery** GitHub account/repository.
3. Select `gamebank-discovery/game-bank-100`, production branch `main`.
4. Build command: `python3 scripts/build_cloudflare.py`
5. Build output directory: `dist`.
6. Deploy. If build fails due to a missing `public-mirror/index.html`, do not publish an empty placeholder.
7. Verify the pages.dev preview, then configure a custom domain and HTTPS. Confirm every important game's URL before retiring old Vercel.
8. Use Settings > Builds > Branch control to keep production branch `main`. Preview builds may be restricted to `develop`. Do not point old production domain to preview.

## Phase 3: Ads and affiliate
1. Google AdSense: register and verify **the production site**, finish review until Ready; obtain the real publisher ID and ad unit IDs.
2. Publish `ads.txt` at domain root after the real line is provided by AdSense, never with a placeholder publisher ID.
3. Add only owner-generated Rakuten and A8 approved URLs in `monetization/config.js`.
4. Keep `adsense.enabled = false` and `affiliate.enabled = false` until approved.
5. Place visible PR/ad disclosure, privacy policy and suitable consent mechanisms as applicable.
6. Keep ad placements away from gameplay controls and avoid accidental/invalid clicks. Do not show ads on pages with insufficient original content.
7. Enable Cloudflare Web Analytics or another privacy-compliant measurement tool after verifying consent/privacy requirements.
8. Compare affiliate network confirmed commissions + AdSense actual earnings; raw clicks/PV are not revenue.

## Safety/rollback
- Do not add passwords, service-account tokens or private analytics secrets to public GitHub.
- Use branch PR review, game launch checks and a reversible Cloudflare deployment.
- Preserve existing Vercel public site until all core games work on Cloudflare.
- This file documents the target process; it does **not** imply a Cloudflare connection or active monetization.
