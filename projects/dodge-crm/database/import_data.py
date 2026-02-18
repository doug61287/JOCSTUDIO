#!/usr/bin/env python3
"""
Dodge Construction Network - Data Import Script
Imports scraped contractor data into Supabase PostgreSQL database.

Usage:
    export SUPABASE_URL="https://your-project.supabase.co"
    export SUPABASE_KEY="your-service-role-key"
    python import_data.py

Or with connection string:
    export DATABASE_URL="postgresql://..."
    python import_data.py
"""

import json
import os
import re
import sys
from glob import glob
from datetime import datetime
from typing import Optional, List, Dict, Any
import hashlib

# Check for required packages
try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("Installing psycopg2-binary...")
    os.system("pip install psycopg2-binary")
    import psycopg2
    from psycopg2.extras import execute_values

try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase...")
    os.system("pip install supabase")
    from supabase import create_client, Client


# Configuration
DATA_DIR = "/Users/baibureh/.openclaw/workspace-a/dodge-scraper/data"
BATCH_SIZE = 500


def get_database_connection():
    """Get PostgreSQL connection - tries multiple methods."""
    
    # Method 1: Direct PostgreSQL connection
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url)
    
    # Method 2: Supabase credentials
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_KEY")
    
    if supabase_url and supabase_key:
        # Extract project ref from URL
        project_ref = supabase_url.replace("https://", "").split(".")[0]
        
        # Construct PostgreSQL connection string
        # Supabase uses pooled connections on port 6543
        host = f"aws-0-us-east-1.pooler.supabase.com"  # Adjust region if needed
        db_url = f"postgresql://postgres.{project_ref}:{supabase_key}@{host}:6543/postgres"
        
        return psycopg2.connect(db_url)
    
    raise ValueError(
        "No database credentials found. Set either:\n"
        "  - DATABASE_URL (full PostgreSQL connection string)\n"
        "  - SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_KEY)"
    )


def extract_csi_divisions(csi_codes: List[str]) -> List[int]:
    """Extract CSI division numbers from CSI codes."""
    divisions = set()
    for code in csi_codes or []:
        # Extract first 2 digits (e.g., "03 00 00 - Concrete" -> 3)
        match = re.match(r'^(\d{2})', code.strip())
        if match:
            divisions.add(int(match.group(1)))
    return sorted(list(divisions))


def parse_address(address_raw: str) -> Dict[str, Optional[str]]:
    """Parse raw address string into components."""
    result = {
        "address_line1": None,
        "address_line2": None,
        "city": None,
        "state": None,
        "postal_code": None,
    }
    
    if not address_raw:
        return result
    
    # Clean up the address
    address = address_raw.replace("Headquarters:", "").strip()
    
    # Try to extract state and zip from the end
    # Pattern: City, ST 12345
    state_zip_pattern = r'([A-Z]{2})\s+(\d{5}(?:-\d{4})?)'
    match = re.search(state_zip_pattern, address)
    if match:
        result["state"] = match.group(1)
        result["postal_code"] = match.group(2)
    
    return result


def parse_phone(phone: str) -> Optional[str]:
    """Clean phone number."""
    if not phone or phone == "#":
        return None
    # Remove non-digit characters
    digits = re.sub(r'\D', '', phone)
    if len(digits) >= 10:
        return digits
    return None


def parse_company(data: Dict[str, Any]) -> Dict[str, Any]:
    """Parse raw scraped data into company record."""
    
    # Extract JSON-LD data if available
    json_ld = {}
    if data.get("json_ld"):
        for ld_list in data["json_ld"]:
            for ld in ld_list:
                if ld.get("@type") in ["HomeAndConstructionBusiness", "LocalBusiness", "Organization"]:
                    json_ld = ld
                    break
    
    # Get address from JSON-LD
    ld_address = json_ld.get("address", {})
    
    # Extract CSI codes and divisions
    csi_codes = data.get("csi_codes", [])
    csi_divisions = extract_csi_divisions(csi_codes)
    
    # Parse meta keywords into array
    keywords_str = data.get("meta", {}).get("keywords", "")
    keywords = [k.strip() for k in keywords_str.split(",") if k.strip()] if keywords_str else None
    
    # Clean website URL (remove tracking params)
    website = data.get("website", "")
    if website:
        website = website.split("?")[0]  # Remove query params
    
    return {
        "external_id": data.get("id"),
        "slug": data.get("slug"),
        "name": data.get("company_name") or json_ld.get("name"),
        "type": data.get("type"),
        "phone": parse_phone(json_ld.get("telephone") or data.get("phone")),
        "email": None,  # Not in scraped data, will be enriched later
        "website": website or None,
        "address_line1": None,  # Would need more parsing
        "city": ld_address.get("addressLocality") or None,
        "state": ld_address.get("addressRegion") or None,
        "postal_code": ld_address.get("postalCode") or None,
        "country": ld_address.get("addressCountry", "US"),
        "address_raw": data.get("address"),
        "description": data.get("meta", {}).get("description", "").strip() or None,
        "keywords": keywords,
        "logo_url": json_ld.get("image"),
        "csi_codes": csi_codes if csi_codes else None,
        "csi_divisions": csi_divisions if csi_divisions else None,
        "source": "bluebook",
        "source_url": data.get("url"),
        "scraped_at": data.get("scraped_at"),
    }


def import_batch(conn, companies: List[Dict[str, Any]]) -> int:
    """Import a batch of companies to the database."""
    
    cursor = conn.cursor()
    
    # Prepare data for insert
    columns = [
        "external_id", "slug", "name", "type", "phone", "email", "website",
        "address_line1", "city", "state", "postal_code", "country", "address_raw",
        "description", "keywords", "logo_url", "csi_codes", "csi_divisions",
        "source", "source_url", "scraped_at"
    ]
    
    values = []
    for c in companies:
        if not c.get("name"):
            continue  # Skip records without name
            
        values.append((
            c.get("external_id"),
            c.get("slug"),
            c.get("name"),
            c.get("type"),
            c.get("phone"),
            c.get("email"),
            c.get("website"),
            c.get("address_line1"),
            c.get("city"),
            c.get("state"),
            c.get("postal_code"),
            c.get("country"),
            c.get("address_raw"),
            c.get("description"),
            c.get("keywords"),
            c.get("logo_url"),
            c.get("csi_codes"),
            c.get("csi_divisions"),
            c.get("source"),
            c.get("source_url"),
            c.get("scraped_at"),
        ))
    
    if not values:
        return 0
    
    # Build insert query with ON CONFLICT
    insert_sql = f"""
        INSERT INTO companies ({', '.join(columns)})
        VALUES %s
        ON CONFLICT (external_id) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            phone = EXCLUDED.phone,
            website = EXCLUDED.website,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            postal_code = EXCLUDED.postal_code,
            description = EXCLUDED.description,
            keywords = EXCLUDED.keywords,
            logo_url = EXCLUDED.logo_url,
            csi_codes = EXCLUDED.csi_codes,
            csi_divisions = EXCLUDED.csi_divisions,
            source_url = EXCLUDED.source_url,
            scraped_at = EXCLUDED.scraped_at,
            updated_at = NOW()
    """
    
    execute_values(cursor, insert_sql, values)
    conn.commit()
    cursor.close()
    
    return len(values)


def main():
    """Main import process."""
    print("=" * 60)
    print("Dodge Construction Network - Data Import")
    print("=" * 60)
    
    # Connect to database
    print("\nConnecting to database...")
    try:
        conn = get_database_connection()
        print("✓ Connected successfully")
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        sys.exit(1)
    
    # Find all profile JSON files
    profile_files = sorted(glob(f"{DATA_DIR}/profiles/*.json"))
    print(f"\nFound {len(profile_files)} profile batch files")
    
    total_imported = 0
    total_files = len(profile_files)
    
    for idx, filepath in enumerate(profile_files, 1):
        filename = os.path.basename(filepath)
        
        try:
            with open(filepath, 'r') as f:
                records = json.load(f)
            
            if not records:
                continue
            
            # Parse records
            companies = [parse_company(r) for r in records]
            
            # Import batch
            imported = import_batch(conn, companies)
            total_imported += imported
            
            print(f"[{idx}/{total_files}] {filename}: {imported} companies imported (total: {total_imported})")
            
        except Exception as e:
            print(f"[{idx}/{total_files}] {filename}: ERROR - {e}")
            continue
    
    # Final stats
    print("\n" + "=" * 60)
    print(f"Import complete!")
    print(f"Total companies imported/updated: {total_imported}")
    
    # Get counts by type
    cursor = conn.cursor()
    cursor.execute("""
        SELECT type, COUNT(*) as count 
        FROM companies 
        GROUP BY type 
        ORDER BY count DESC
    """)
    print("\nCompanies by type:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]:,}")
    
    cursor.execute("SELECT COUNT(*) FROM companies")
    print(f"\nTotal in database: {cursor.fetchone()[0]:,}")
    
    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
