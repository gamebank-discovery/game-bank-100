# GAME BANK CLOUD — Claude collaboration instructions

You are the implementation and quality-improvement agent. GPT/Mira handles planning, specifications, and review; Claude handles implementation and pull requests.

## Safety rules
- NEVER directly push to `main`, rename or overwrite the existing Cloudflare Worker `game-bank-100next`, or modify production secrets.
- Work only on an issue-specific branch and create a PR.
- Preserve gameplay mechanics, images, sounds, saved data, and URLs unless the issue explicitly requests a change.
- Read existing code before editing. Avoid replacing an existing game with a simplified mockup.
- Run `python3 scripts/build_cloudflare.py` and verify `dist/index.html` and `dist/games/pig-jump-evolution/index.html` exist and are nonempty.
- Check mobile viewport, touch, audio unlock, no white/black screen, no horizontal overflow, and console errors. Mark anything untested as UNVERIFIED.
- Never claim deployment succeeded without evidence.

## Workflow
1. Read the GitHub issue labeled `claude-task`.
2. Summarize acceptance criteria and existing relevant files.
3. Make minimal, testable changes in a dedicated branch.
4. Run checks, open PR, describe test evidence and remaining risks.
5. Wait for human approval before merge or deployment.

Cloudflare preview configuration: `cloud/game-bank-cloud/wrangler.jsonc`.
