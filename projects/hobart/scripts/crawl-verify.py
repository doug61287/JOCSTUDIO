#!/usr/bin/env python3.11
"""
Hobart Job Link Verifier — Powered by Crawl4AI
Verifies job listings are still active before sending to users.
Extracts full job description for better matching.

Usage:
  python3.11 crawl-verify.py --url "https://jobs.lever.co/stripe/abc123"
  python3.11 crawl-verify.py --urls jobs.json
"""

import asyncio
import json
import argparse
import sys
from datetime import datetime
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode

# Signals that a job is CLOSED
CLOSED_SIGNALS = [
    "this job is no longer available",
    "this position has been filled",
    "job not found",
    "position closed",
    "application period has ended",
    "no longer accepting",
    "404",
    "page not found",
    "job expired",
]

# Signals that a job is OPEN
OPEN_SIGNALS = [
    "apply now",
    "apply for this job",
    "submit application",
    "apply today",
    "job description",
    "responsibilities",
    "qualifications",
    "requirements",
    "what you'll do",
    "about the role",
]


async def verify_job(url: str) -> dict:
    """Check if a job listing URL is still active and extract key details."""
    
    async with AsyncWebCrawler() as crawler:
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=15000,
            word_count_threshold=30,
        )
        result = await crawler.arun(url=url, config=config)

    if not result.success:
        return {
            "url": url,
            "status": "error",
            "active": False,
            "reason": result.error_message or "Failed to load",
        }

    text = (result.markdown or "").lower()
    
    # Check for closed signals
    for signal in CLOSED_SIGNALS:
        if signal in text:
            return {
                "url": url,
                "status": "closed",
                "active": False,
                "reason": f"Found: '{signal}'",
            }

    # Check for open signals
    open_score = sum(1 for s in OPEN_SIGNALS if s in text)
    is_active = open_score >= 2

    # Extract key details from full text
    lines = [l.strip() for l in (result.markdown or "").split('\n') if l.strip()]
    
    # Find salary mention
    salary = None
    for line in lines:
        if '$' in line and any(k in line.lower() for k in ['salary', 'compensation', 'pay', 'k/yr', 'annually']):
            salary = line[:150]
            break

    # Find location mention
    location = None
    location_keywords = ['remote', 'new york', 'san francisco', 'chicago', 'austin', 'seattle', 'hybrid', 'onsite']
    for line in lines[:30]:
        if any(kw in line.lower() for kw in location_keywords):
            location = line[:100]
            break

    return {
        "url": url,
        "status": "active" if is_active else "uncertain",
        "active": is_active,
        "openSignals": open_score,
        "salary": salary,
        "location": location,
        "description": '\n'.join(lines[:30])[:1000],  # First 30 lines for matching
        "verifiedAt": datetime.now().isoformat(),
    }


async def verify_batch(urls: list[str]) -> list[dict]:
    """Verify multiple job URLs concurrently."""
    # Rate limit: 5 at a time
    results = []
    for i in range(0, len(urls), 5):
        batch = urls[i:i+5]
        batch_results = await asyncio.gather(
            *[verify_job(url) for url in batch],
            return_exceptions=True
        )
        for url, result in zip(batch, batch_results):
            if isinstance(result, Exception):
                results.append({"url": url, "status": "error", "active": False, "reason": str(result)})
            else:
                results.append(result)
    return results


async def main():
    parser = argparse.ArgumentParser(description='Hobart Job Link Verifier')
    parser.add_argument('--url', help='Single job URL to verify')
    parser.add_argument('--urls', help='JSON file with list of URLs')
    args = parser.parse_args()

    if args.url:
        result = await verify_job(args.url)
        print(json.dumps(result, indent=2))

    elif args.urls:
        with open(args.urls) as f:
            data = json.load(f)
        urls = data if isinstance(data, list) else [j['url'] for j in data if 'url' in j]
        
        print(f"Verifying {len(urls)} job links...")
        results = await verify_batch(urls)
        
        active = [r for r in results if r.get('active')]
        closed = [r for r in results if not r.get('active')]
        
        print(f"\n✅ Active: {len(active)}")
        print(f"❌ Closed/Error: {len(closed)}")
        print("\n---VERIFY_JSON---")
        print(json.dumps(results, indent=2))

    else:
        # Read from stdin (piped input)
        data = json.load(sys.stdin)
        urls = [j['url'] for j in data if 'url' in j]
        results = await verify_batch(urls)
        print(json.dumps(results, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
