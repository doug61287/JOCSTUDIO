#!/usr/bin/env python3.11
"""
Hobart Company Research Module — Powered by Crawl4AI
Scrapes company career pages, Glassdoor reviews, and news for deep research.

Usage:
  python3.11 crawl-company.py --company "Stripe" --mode careers
  python3.11 crawl-company.py --company "Stripe" --mode research
  python3.11 crawl-company.py --company "Stripe" --mode full
"""

import asyncio
import json
import sys
import argparse
from datetime import datetime
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode

# ─── Modes ────────────────────────────────────────────────────────────────────
# careers  → scrape direct job listings from company careers page
# research → glassdoor reviews + recent news + salary data
# full     → both (interview prep package)

async def scrape_careers_page(company: str, url: str | None = None) -> dict:
    """Scrape a company's careers page for open roles."""
    
    # Build URL to try
    candidates = [url] if url else [
        f"https://www.{company.lower().replace(' ', '')}.com/careers",
        f"https://www.{company.lower().replace(' ', '')}.com/jobs",
        f"https://jobs.{company.lower().replace(' ', '')}.com",
    ]

    jobs = []
    source_url = None

    async with AsyncWebCrawler() as crawler:
        for careers_url in candidates:
            config = CrawlerRunConfig(
                cache_mode=CacheMode.BYPASS,
                page_timeout=20000,
                word_count_threshold=50,
            )
            result = await crawler.arun(url=careers_url, config=config)
            
            if result.success and result.markdown and len(result.markdown) > 200:
                source_url = careers_url
                # Parse markdown for job listings
                lines = result.markdown.split('\n')
                for line in lines:
                    line = line.strip()
                    if len(line) > 15 and any(kw in line.lower() for kw in 
                        ['engineer', 'manager', 'designer', 'analyst', 'director',
                         'developer', 'lead', 'senior', 'associate', 'coordinator']):
                        jobs.append(line.lstrip('#- ').strip())
                break

    return {
        "company": company,
        "careersUrl": source_url,
        "jobs": jobs[:20],  # top 20 roles found
        "scrapedAt": datetime.now().isoformat(),
    }


async def scrape_glassdoor(company: str) -> dict:
    """Scrape Glassdoor for reviews, ratings, and interview insights."""
    query = company.replace(' ', '-').lower()
    url = f"https://www.glassdoor.com/Overview/Working-at-{query}-EI_IE.htm"

    async with AsyncWebCrawler() as crawler:
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=20000,
        )
        result = await crawler.arun(url=url, config=config)

    if not result.success or not result.markdown:
        return {"company": company, "glassdoor": None, "error": "Could not access Glassdoor"}

    # Extract key sections from markdown
    text = result.markdown[:5000]
    
    return {
        "company": company,
        "glassdoor": {
            "url": url,
            "rawContent": text[:2000],  # Will be summarized by Claude
            "scrapedAt": datetime.now().isoformat(),
        }
    }


async def scrape_company_news(company: str) -> dict:
    """Get recent news about a company via search."""
    query = company.replace(' ', '+')
    url = f"https://news.google.com/search?q={query}&hl=en-US&gl=US&ceid=US:en"

    async with AsyncWebCrawler() as crawler:
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=15000,
        )
        result = await crawler.arun(url=url, config=config)

    if not result.success or not result.markdown:
        return {"company": company, "news": []}

    # Extract headlines from markdown
    lines = [l.strip().lstrip('#- ') for l in result.markdown.split('\n') 
             if len(l.strip()) > 20 and not l.startswith('http')]
    headlines = [l for l in lines if company.lower() in l.lower()][:10]

    return {
        "company": company,
        "news": headlines,
        "scrapedAt": datetime.now().isoformat(),
    }


async def scrape_levels_salary(company: str, role: str = "Software Engineer") -> dict:
    """Scrape Levels.fyi for compensation data."""
    query = company.replace(' ', '-').lower()
    url = f"https://www.levels.fyi/companies/{query}/salaries/"

    async with AsyncWebCrawler() as crawler:
        config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            page_timeout=15000,
        )
        result = await crawler.arun(url=url, config=config)

    if not result.success or not result.markdown:
        return {"company": company, "salary": None}

    # Extract salary-related lines
    lines = result.markdown.split('\n')
    salary_lines = [l.strip() for l in lines if '$' in l and 'k' in l.lower()][:10]

    return {
        "company": company,
        "salary": {
            "url": url,
            "dataPoints": salary_lines,
        }
    }


async def full_research(company: str, careers_url: str | None = None) -> dict:
    """Run all scrapers in parallel for a complete company profile."""
    print(f"\n🔍 Researching {company}...")

    # Run all scrapers concurrently
    results = await asyncio.gather(
        scrape_careers_page(company, careers_url),
        scrape_glassdoor(company),
        scrape_company_news(company),
        scrape_levels_salary(company),
        return_exceptions=True
    )

    careers, glassdoor, news, salary = results

    return {
        "company": company,
        "researchedAt": datetime.now().isoformat(),
        "careers": careers if not isinstance(careers, Exception) else None,
        "glassdoor": glassdoor if not isinstance(glassdoor, Exception) else None,
        "news": news if not isinstance(news, Exception) else None,
        "salary": salary if not isinstance(salary, Exception) else None,
    }


async def main():
    parser = argparse.ArgumentParser(description='Hobart Company Research')
    parser.add_argument('--company', required=True, help='Company name')
    parser.add_argument('--mode', default='full',
                        choices=['careers', 'research', 'full'],
                        help='Research mode')
    parser.add_argument('--url', help='Direct careers page URL (optional)')
    args = parser.parse_args()

    if args.mode == 'careers':
        result = await scrape_careers_page(args.company, args.url)
    elif args.mode == 'research':
        glass, news, sal = await asyncio.gather(
            scrape_glassdoor(args.company),
            scrape_company_news(args.company),
            scrape_levels_salary(args.company),
        )
        result = {"company": args.company, "glassdoor": glass, "news": news, "salary": sal}
    else:
        result = await full_research(args.company, args.url)

    # Output JSON for Hobart to consume
    print("\n---RESEARCH_JSON---")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
