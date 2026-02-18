# POD Agent Skill

Automated print-on-demand side hustle agent. Runs trend research, generates designs, creates mockups, writes listings, and publishes to Etsy — all from Telegram.

## Trigger Phrases

- "pod scan trends" → run trend scout for current niche
- "pod generate [theme]" → generate designs for a theme
- "pod publish [design-id]" → create mockups + publish to Etsy
- "pod report" → daily performance report
- "pod set niche [niche]" → set active niche
- "pod status" → show pipeline status

## Architecture

```
skills/pod-agent/
├── SKILL.md              ← this file
├── scripts/
│   ├── trend-scout.py    ← Crawl4AI trend research
│   ├── design-gen.js     ← Ideogram/DALL-E image gen
│   ├── mockup-engine.js  ← Printify API mockup creation
│   ├── listing-writer.js ← Claude SEO listing copy
│   ├── publisher.js      ← Etsy API listing publish
│   └── tracker.js        ← Performance analytics
├── generated/            ← output designs + listings
└── assets/
    └── state.json        ← active niche, shop IDs, etc.
```

## Config (assets/state.json)

```json
{
  "niche": "cat-mom",
  "printifyShopId": "YOUR_SHOP_ID",
  "etsyShopId": "YOUR_ETSY_SHOP_ID",
  "activeProducts": [],
  "performance": {}
}
```

## Required API Keys (add to OpenClaw config or .env)

- `PRINTIFY_API_KEY` — from Printify account → Connections → API
- `ETSY_API_KEY` + `ETSY_ACCESS_TOKEN` — from developer.etsy.com
- `IDEOGRAM_API_KEY` — from ideogram.ai (best for POD designs)
- `ANTHROPIC_API_KEY` — already configured ✅

## Workflow

1. **Trend Scout** (daily) — scrapes Etsy/Pinterest for trending keywords in niche
2. **Design Gen** (per trend) — generates 5 design variants via Ideogram
3. **Mockup Engine** (per design) — places designs on products via Printify
4. **Listing Writer** (per product) — writes SEO title/desc/tags via Claude
5. **Publisher** (auto) — creates Etsy draft listing with mockup images
6. **Tracker** (daily) — reports views/sales/CVR, flags winners + losers

## Money Math

- 10 designs/day × 30 days = 300/month
- 10% winners = 30 active listings
- 30 listings × 20 sales × $8 profit = **$4,800/mo**

## Notes

- Start with **cat-mom** niche (evergreen, high buyer intent)
- Etsy listings only at MVP — expand to Shopify/TikTok Shop later
- Kill listings with <1% CVR after 1,000 views
- Double down on 3%+ CVR listings
