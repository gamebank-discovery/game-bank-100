# GAME BANK NEXT — deployment connections checklist

Verified at 2026-11-01.

## GitHub source
- Repository: `gamebank-discovery/game-bank-100`
- `develop`: test/QA (Cloudflare-capable build test **passed** in GitHub Actions).
- `main`: production (Cloudflare build **passed**, artifact `gamebank-cloudflare-dist`).
- Source mirror: `public-mirror/` contains game pages and assets; original Vercel website remains live.
- Monetization build: `python3 scripts/build_cloudflare.py`, output `dist`; AdSense and affiliate links disabled pending real IDs and consent/policy checks.

## Vercel (test)
- Existing Vercel login on connected team: `maverick11041-7939` (`team_M00dwk6FHyiXZHJcZFAr4bDx`). This is NOT evidence that a different account has been connected.
- An attempt to create a Git-linked project returned `You need to add a Login Connection to your GitHub account first`.
- A direct Git-source deployment attempt created `game-bank-next-git-test`, project `prj_vllBgeaxz8j71ig9AXeFjtFgrjV9`, but deployment `dpl_GYYQxc8WFHSF1GQBtHCyuSP5Ji1m` failed with `git_info_fail` and is NOT a live preview.
- **Required owner authentication**: In Vercel Account Settings → Login Connections, connect GitHub as `gamebank-discovery`. Ensure Vercel GitHub app is granted repository access. The ChatGPT GitHub integration alone does not grant the Vercel application access.
- Link test project to `gamebank-discovery/game-bank-100`; set Vercel production branch `develop`, Framework Other, Root Directory root, Build command `python3 scripts/build_cloudflare.py`, Output Directory `dist`. If preferring a static no-build setup, choose Root Directory `public-mirror` and no build command (do not mix the two configurations).
- Run deploy, check READY, then iPhone Safari + desktop tests.

## Cloudflare Pages (production)
- Cloudflare account/project ownership and domain are **not verified** in this chat. The user stated the Cloudflare account and project were created.
- In Cloudflare Dashboard → Workers & Pages → Pages → Connect to Git: authorize `gamebank-discovery/game-bank-100`.
- Production branch: `main`; Build command: `python3 scripts/build_cloudflare.py`; Output Directory: `dist`; Framework: None.
- Use only a domain verified from Cloudflare production deployment; do not guess `*.pages.dev` hostnames.
- Wait for READY/Success, verify HTTPS and all key games before retiring legacy Vercel.

## Revenue
- AdSense publisher ID and ad slot IDs: missing/approval not verified; keep disabled.
- Rakuten and A8.net approved campaign URLs: not verified; keep disabled.
- Legal PR disclosure, privacy/Cookie consent and placement QA required before enabling.

## CI evidence
- develop QA: https://github.com/gamebank-discovery/game-bank-100/actions/runs/41277698057
- main bundle: https://github.com/gamebank-discovery/game-bank-100/actions/runs/41278758184
- game asset problems: https://github.com/gamebank-discovery/game-bank-100/issues/2

No claim of automatic Vercel/Cloudflare deployment or ad revenue is made by this checklist.
