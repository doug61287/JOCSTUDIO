#!/opt/homebrew/bin/python3.11
"""
Hobart JobSpy Integration

Uses python-jobspy for structured job data from multiple sites.
Called by job-search.js for enriched results.

Usage:
    python jobspy-search.py --search "product manager" --location "New York" --sites indeed,glassdoor
    python jobspy-search.py --help
"""

import argparse
import json
import sys
from datetime import datetime

try:
    from jobspy import scrape_jobs
    JOBSPY_AVAILABLE = True
except ImportError:
    JOBSPY_AVAILABLE = False


def search_jobs(
    search_term: str,
    location: str = "United States",
    sites: list = None,
    results_wanted: int = 10,
    hours_old: int = 72,
    remote_only: bool = False,
    job_type: str = None,
    country: str = "USA"
) -> dict:
    """
    Search for jobs using JobSpy.
    
    Returns structured JSON with job listings.
    """
    if not JOBSPY_AVAILABLE:
        return {
            "success": False,
            "error": "python-jobspy not installed. Run: pip install python-jobspy",
            "jobs": []
        }
    
    # Default to Indeed + Glassdoor (most reliable, skip LinkedIn scraping)
    if sites is None:
        sites = ["indeed", "glassdoor"]
    
    try:
        # Scrape jobs
        jobs_df = scrape_jobs(
            site_name=sites,
            search_term=search_term,
            location=location,
            results_wanted=results_wanted,
            hours_old=hours_old,
            country_indeed=country,
            is_remote=remote_only,
            job_type=job_type,
            description_format="markdown"
        )
        
        # Convert to list of dicts
        jobs = []
        for _, row in jobs_df.iterrows():
            job = {
                "id": str(row.get("id", "")),
                "site": str(row.get("site", "")),
                "title": str(row.get("title", "")),
                "company": str(row.get("company", "")),
                "location": {
                    "city": str(row.get("city", "")),
                    "state": str(row.get("state", "")),
                },
                "jobType": str(row.get("job_type", "")),
                "salary": {
                    "min": row.get("min_amount"),
                    "max": row.get("max_amount"),
                    "interval": str(row.get("interval", ""))
                },
                "url": str(row.get("job_url", "")),
                "description": str(row.get("description", ""))[:500],  # Truncate for WhatsApp
                "isRemote": bool(row.get("is_remote", False)),
                "postedDate": str(row.get("date_posted", "")),
                "companyUrl": str(row.get("company_url", "")),
                # Direct URL is the job_url for Indeed/Glassdoor
                "directUrl": str(row.get("job_url", "")),
                "verified": True  # JobSpy scrapes directly, so it's verified
            }
            
            # Clean up None values
            if job["salary"]["min"] is None or str(job["salary"]["min"]) == "nan":
                job["salary"]["min"] = None
            if job["salary"]["max"] is None or str(job["salary"]["max"]) == "nan":
                job["salary"]["max"] = None
                
            jobs.append(job)
        
        return {
            "success": True,
            "query": {
                "searchTerm": search_term,
                "location": location,
                "sites": sites,
                "hoursOld": hours_old
            },
            "count": len(jobs),
            "jobs": jobs,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "jobs": []
        }


def format_salary(job: dict) -> str:
    """Format salary for display."""
    sal = job.get("salary", {})
    min_amt = sal.get("min")
    max_amt = sal.get("max")
    interval = sal.get("interval", "yearly")
    
    # Handle None/nan
    import math
    if min_amt is None or (isinstance(min_amt, float) and math.isnan(min_amt)):
        min_amt = None
    if max_amt is None or (isinstance(max_amt, float) and math.isnan(max_amt)):
        max_amt = None
    
    if not min_amt and not max_amt:
        return None
    
    def fmt(amt, is_hourly=False):
        if is_hourly:
            return f"${amt:.0f}/hr"
        elif amt >= 1000:
            return f"${amt/1000:.0f}k"
        return f"${amt:.0f}"
    
    is_hourly = interval == "hourly"
    
    if min_amt and max_amt:
        if is_hourly:
            return f"${min_amt:.0f}-${max_amt:.0f}/hr"
        return f"{fmt(min_amt)}-{fmt(max_amt)}"
    elif max_amt:
        return f"Up to {fmt(max_amt, is_hourly)}"
    elif min_amt:
        return f"{fmt(min_amt, is_hourly)}+"
    
    return None


def format_for_whatsapp(jobs: list, max_jobs: int = 5) -> str:
    """Format jobs for WhatsApp digest."""
    if not jobs:
        return "No jobs found matching your criteria."
    
    emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    lines = []
    
    for i, job in enumerate(jobs[:max_jobs]):
        emoji = emojis[i] if i < len(emojis) else f"{i+1}."
        
        # Title & Company
        line = f"{emoji} *{job['title']}*"
        if job['company']:
            line += f" @ {job['company']}"
        lines.append(line)
        
        # Details
        details = []
        loc = job.get('location', {})
        if loc.get('city') or loc.get('state'):
            loc_str = ', '.join(filter(None, [loc.get('city'), loc.get('state')]))
            details.append(f"📍 {loc_str}")
        if job.get('isRemote'):
            details.append("🏠 Remote")
        salary = format_salary(job)
        if salary:
            details.append(f"💰 {salary}")
        
        if details:
            lines.append(f"   {' | '.join(details)}")
        
        # Snippet (skip if empty or nan)
        desc = job.get('description', '')
        if desc and desc != 'nan' and str(desc).lower() != 'nan':
            snippet = desc[:100].replace('\n', ' ').strip()
            if len(desc) > 100:
                snippet += "..."
            lines.append(f"   _{snippet}_")
        
        # Link
        url = job.get('directUrl') or job.get('url')
        source = job.get('site', 'Apply').title()
        lines.append(f"   ✅ Apply: {url}")
        lines.append("")  # Empty line between jobs
    
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Search jobs using JobSpy')
    parser.add_argument('--search', '-s', required=True, help='Search term (job title, skills)')
    parser.add_argument('--location', '-l', default='United States', help='Location')
    parser.add_argument('--sites', default='indeed,glassdoor', help='Comma-separated sites')
    parser.add_argument('--results', '-n', type=int, default=10, help='Number of results')
    parser.add_argument('--hours', type=int, default=72, help='Max hours since posted')
    parser.add_argument('--remote', action='store_true', help='Remote only')
    parser.add_argument('--type', choices=['fulltime', 'parttime', 'contract', 'internship'], help='Job type')
    parser.add_argument('--format', choices=['json', 'whatsapp'], default='json', help='Output format')
    parser.add_argument('--country', default='USA', help='Country for Indeed')
    
    args = parser.parse_args()
    
    # Parse sites
    sites = [s.strip().lower() for s in args.sites.split(',')]
    
    # Search
    result = search_jobs(
        search_term=args.search,
        location=args.location,
        sites=sites,
        results_wanted=args.results,
        hours_old=args.hours,
        remote_only=args.remote,
        job_type=args.type,
        country=args.country
    )
    
    # Output
    if args.format == 'whatsapp':
        if result['success']:
            print(format_for_whatsapp(result['jobs']))
        else:
            print(f"Error: {result['error']}")
    else:
        print(json.dumps(result, indent=2, default=str))


if __name__ == '__main__':
    main()
