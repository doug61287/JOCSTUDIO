#!/usr/bin/env python3
"""
POD Trend Scout — Module 1
Scrapes Etsy + Pinterest for trending keywords in the active niche.
Uses Crawl4AI for fast, LLM-friendly extraction.
"""

import asyncio
import json
import sys
import os
from datetime import datetime
from pathlib import Path

# Crawl4AI
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy

STATE_FILE = Path(__file__).parent.parent / "assets" / "state.json"
OUTPUT_DIR = Path(__file__).parent.parent / "generated"

def load_state() -> dict:
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {"niche": "cat-mom"}

def save_state(state: dict):
    STATE_FILE.parent.mkdir(exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

ETSY_SEARCH_SCHEMA = {
    "name": "EtsyListings",
    "baseSelector": "[data-search-results] .v2-listing-card",
    "fields": [
        {"name": "title", "selector": ".v2-listing-card__info h3", "type": "text"},
        {"name": "price", "selector": ".currency-value", "type": "text"},
        {"name": "reviews", "selector": ".wt-text-caption", "type": "text"},
    ]
}

async def scrape_etsy_trends(niche: str) -> list[dict]:
    """Scrape Etsy search results for trending products in niche."""
    query = niche.replace("-", "+")
    url = f"https://www.etsy.com/search?q={query}+shirt&order=most_relevant"

    print(f"🔍 Scanning Etsy for: {niche}")

    async with AsyncWebCrawler() as crawler:
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            extraction_strategy=JsonCssExtractionStrategy(ETSY_SEARCH_SCHEMA),
            wait_for="[data-search-results]",
            page_timeout=15000,
        )
        result = await crawler.arun(url=url, config=config)

    if not result.success:
        print(f"⚠️  Etsy crawl failed: {result.error_message}")
        return []

    try:
        listings = json.loads(result.extracted_content or "[]")
        return listings[:20]  # top 20
    except json.JSONDecodeError:
        return []

async def extract_keywords(listings: list[dict], niche: str) -> list[str]:
    """Extract high-frequency keywords from listing titles."""
    if not listings:
        return [niche, f"{niche} shirt", f"{niche} gift", f"funny {niche}"]

    # Collect all words from titles
    from collections import Counter
    import re

    words = []
    stop_words = {"the", "a", "an", "and", "or", "for", "to", "in", "of", "with", "is", "are"}

    for listing in listings:
        title = listing.get("title", "").lower()
        tokens = re.findall(r'\b[a-z]{3,}\b', title)
        words.extend([w for w in tokens if w not in stop_words])

    freq = Counter(words)
    top_keywords = [kw for kw, _ in freq.most_common(20)]
    return top_keywords

async def main():
    state = load_state()
    niche = sys.argv[1] if len(sys.argv) > 1 else state.get("niche", "cat-mom")

    print(f"\n🐾 POD Trend Scout — Niche: {niche}")
    print("=" * 50)

    listings = await scrape_etsy_trends(niche)
    keywords = await extract_keywords(listings, niche)

    # Build trend report
    report = {
        "niche": niche,
        "scannedAt": datetime.now().isoformat(),
        "topListings": listings[:5],
        "trendingKeywords": keywords,
        "designPrompts": [
            f"{kw} cat mom tshirt design, cute, minimal, white background" 
            for kw in keywords[:10]
        ],
        "etsyTags": keywords[:13],  # Etsy max 13 tags
    }

    # Save report
    OUTPUT_DIR.mkdir(exist_ok=True)
    report_path = OUTPUT_DIR / f"trends-{niche}-{datetime.now().strftime('%Y%m%d')}.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    # Update state
    state["lastTrendScan"] = datetime.now().isoformat()
    state["trendingKeywords"] = keywords
    state["designPrompts"] = report["designPrompts"]
    save_state(state)

    # Output summary
    print(f"\n✅ Found {len(listings)} listings, {len(keywords)} trending keywords")
    print(f"\n📊 Top Keywords:")
    for kw in keywords[:10]:
        print(f"  • {kw}")
    print(f"\n🎨 Design Prompts Generated: {len(report['designPrompts'])}")
    print(f"📁 Report saved: {report_path}")
    print(f"\n💡 Next: run design-gen.js to generate designs")

    return report

if __name__ == "__main__":
    asyncio.run(main())
