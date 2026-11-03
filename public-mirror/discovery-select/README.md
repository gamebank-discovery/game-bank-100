# DISCOVERY SELECT — comparison content funnel (MVP)

GAME BANK source: `public-mirror/discovery-select/`, public URL after deployment: `/discovery-select/`.

## Included
- Mobile-first, accessible comparison editorial site with 3 starter guides (type comparisons, not fabricated SKU reviews).
- Each guide: conclusion / reason / three alternatives / suitable and unsuitable users / buy-before checklist.
- Three copyable social-post drafts per guide, labelled PR.
- Browser-local editor at `/discovery-select/studio.html` — edit 3 product choices, official affiliate URLs, and publish via exported `content.js`.
- Browser-local manual KPI dashboard for PV, affiliate clicks, confirmed sales, commission and operating expenses.

## How to publish
1. Open `studio.html` and revise each article with genuinely researched claims, independent original content and any required disclosures.
2. In Amazon Associates, sign up and register the exact public URL you will use. Generate approved **special links** with Amazon's own SiteStripe / tools. Do not assume that ordinary Amazon URLs earn commission.
3. Paste those generated links into the 3 product fields. Use **only** permitted URLs; never paste credentials.
4. Save and click **Download content.js**. Replace `public-mirror/discovery-select/content.js` in this repo with your exported file (as a reviewed commit).
5. Existing `scripts/build_cloudflare.py` copies `public-mirror/` to `dist/` as static assets. Push + verify actual CI/deployment status before advertising the live path. GitHub edits alone do NOT guarantee production deployment.
6. Share articles from actual site. Social drafts are **not** auto-posted. For analytics, configure privacy-consistent site analytics and read verified affiliate sales from each partner's official reports.
7. Review and refresh product claims periodically; the default file has deliberately blank links and **will not earn commissions**.

## Guardrails
- **No fake prices, verified-buyer claims, performance rankings or copied Amazon images.**
- Do not use Amazon special links without registration/permission. Affiliate disclosure must be visible, including exact required statement when Amazon links go live. Social posts need conspicuous PR / disclosure.
- Do not ask yourself, family, or anyone you compensate for purchases to game qualification; refer to the policy for disallowed orders and inducements.
- Do not click on your own affiliate link to simulate conversions.
- Valid configured URL hosts: amazon.co.jp, www.amazon.co.jp, amzn.to, hb.afl.rakuten.co.jp, px.a8.net (https only). Individual partners' terms still apply.
- The studio is an unauthenticated **local-only drafting utility** served publicly; it does not update the server, or collect data from visitors. Browser clearing loses local drafts; export regularly.
- No personal analytics data collection or automatic clicks. Cloudflare Web Analytics and partner reports can be integrated later.

## Amazon official guidance checked 2026-11-03
- Eligibility / three qualifying sales within 180 days: https://affiliate.amazon.co.jp/help/node/topic/G7MJTPEP9NC3YKMG
- Commissions by category: https://affiliate.amazon.co.jp/help/node/topic/GRXPHT8U84RAYDXZ
- Disclosure: https://affiliate.amazon.co.jp/help/node/topic/GPXFHVYZMTGPUMPE
- Operating agreement: https://affiliate.amazon.co.jp/help/operating/agreement
- Policy / original content / link rules: https://affiliate.amazon.co.jp/help/operating/policies

## Suggested first real editorial batch
- Apartment setup / desk and home office / capsule wardrobe; choose based on real search demand rather than generic mass AI posting.
- For each: 3 carefully researched SKU candidates + original explanation of tradeoffs + actual affiliate link + 3 share drafts.
- Initial 30-day KPI = 10 worthwhile human-edited guides, 30 social posts, link CTR and real qualified sales; revenues not guaranteed.
