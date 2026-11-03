# GAME BANK — Claude Code / AI game-quality rules

## Mission
Improve the **existing** HTML5 games in `gamebank-discovery/game-bank-100`; do not replace them with generic demos. The current GAME BANK is a recovered static mirror, not necessarily the original source. Treat `public-mirror/` as the source for this repository, `scripts/build_cloudflare.py` as its build step, and `public-mirror/data/games.json` as the catalog. The separate private `game-bank-100Next` is not an automatic source of truth.

## Safety rules
- Work on a new feature branch and submit a pull request. Never force-push or delete games, URLs, artwork, user data, catalog entries, or monetization behavior without a specific approval.
- Preserve each game's distinctive mechanics, story, character, original title, game ID, and bookmarkable `/games/<slug>/index.html` path. **Do not silently substitute another game or a placeholder**; especially protect `duck-river`.
- Never claim an item was played on iPhone or deployed to Vercel/Cloudflare unless there is actual evidence. Passing syntax checks is not browser gameplay testing.
- Avoid remote CDN dependencies for the basic game loop and do not commit credentials, API keys, Claude access tokens, player information, or copyrighted external assets without permission.
- Existing advertised revenue links must remain off by default unless the operator explicitly enables and reviews them.
- Prefer performance and reliability over additional games. The goal is **a game worth playing twice**.

## Review and improvement order
1. **Release blockers:** blank screen, crashes, broken assets/URLs, unresponsive controls, inability to start/restart or exit, audible sound before user gesture.
2. **Gameplay:** a clear goal in the first 10 seconds, responsive feel, meaningful challenge progression, fair collision and feedback, a satisfying failure/clear loop.
3. **Art direction:** consistent polished character silhouettes, layered backgrounds, clear obstacles, coherent palette, legible text and HUD.
4. **Juice:** particles, hit feedback, transitions, animation, sound and mute, achievements, progression, best-score persistence.
5. **Mobile:** 375×667, 390×844 and 430×932 touch; notch safe areas, no horizontal scrolling, working buttons, loss-of-focus pause, 30/60fps budget.
6. **Desktop and accessibility:** 1440×900, keyboard, visible states, labelled buttons, reduced-motion considerations.
7. **Release readiness:** catalog completeness, no replacement of old gameplay, syntax/build QA, browser smoke test, before/after evidence.

## First-wave priority
1. `public-mirror/games/duck-river/index.html`: preserve the original water/duck survival game; improve goals and input/resume stability.
2. `public-mirror/games/pig-jump-evolution/`: preserve story/evolution; fix audio, collision, mountain/course and iPhone usability without discarding game assets.
3. `public-mirror/games/gyoza-master-3d/` and `gyoza-merge-3d/`: tactile feedback, clarity and pacing; use existing gameplay, not shared tap-game skeletons.
4. Audit the rest of the catalog by severity A (unplayable), B (misleading/broken), C (polish). Publish an evidence-backed table with paths and reproduction steps.

## Commands for review
```bash
python3 scripts/build_cloudflare.py --source public-mirror --output dist
python3 scripts/qa_gamebank_quality.py --root dist
python3 -m http.server 8765 --directory dist
```
In a real browser, open `http://localhost:8765/games/duck-river/index.html` and test launch, 30 seconds of play, touch drag, mouse/keyboard, dash, shield, mute, pause/resume, background tab pause, game over/restart, and reload/best score.

## Required output for every Claude Code improvement PR
- Exact files modified and *why*; no cosmetic-only inflated claims.
- Evidence: 1 before/after screenshot each at phone width and desktop width when a browser is available.
- Reproduction steps for bugs fixed, verification commands and actual results, known remaining issues.
- 17-point gameplay QA checklist with pass/fail/not-tested (launch, load, controls, audio, pause, resume, restart, responsive width, safe-area, collisions, scoring, difficulty, progression, win/fail, persistence, performance, no console errors).
- Suggested next improvement for **only one game**, not a mass rewrite.
