#!/usr/bin/env python3
"""
Import scraped Dodge Construction Network profiles into Supabase database.
Transforms JSON profiles into database schema format.
"""
import json
import os
import glob
from datetime import datetime
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import execute_values

# Database connection (set via environment variable)
DATABASE_URL = os.getenv('DATABASE_URL')

def extract_csi_divisions(csi_codes: List[str]) -> List[int]:
    """Extract division numbers from CSI codes (e.g., '03 00 00' -> 3)"""
    divisions = set()
    for code in csi_codes:
        try:
            division = int(code[:2])
            divisions.add(division)
        except (ValueError, IndexError):
            continue
    return sorted(list(divisions))

def parse_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """Transform scraped profile into database format."""
    
    # Extract from JSON-LD if available
    json_ld = profile.get('json_ld', [[]])[0] if profile.get('json_ld') else []
    business_data = {}
    if json_ld and len(json_ld) > 0:
        for item in json_ld:
            if isinstance(item, dict) and item.get('@type') == 'HomeAndConstructionBusiness':
                business_data = item
                break
    
    # Parse address
    address = profile.get('address', '')
    address_parts = {
        'line1': '',
        'line2': '',
        'city': '',
        'state': '',
        'postal_code': '',
        'country': 'US'
    }
    
    # Extract postal code from JSON-LD or profile
    postal_code = ''
    if business_data.get('address', {}).get('postalCode'):
        postal_code = business_data['address']['postalCode']
    elif profile.get('postal_code'):
        postal_code = profile['postal_code']
    address_parts['postal_code'] = postal_code
    
    # Get state from JSON-LD if available
    if business_data.get('address', {}).get('addressRegion'):
        address_parts['state'] = business_data['address']['addressRegion']
    
    # Get city from JSON-LD if available  
    if business_data.get('address', {}).get('addressLocality'):
        address_parts['city'] = business_data['address']['addressLocality']
    
    # Extract CSI codes
    csi_codes = profile.get('csi_codes', [])
    csi_divisions = extract_csi_divisions(csi_codes)
    
    # Get phone from various sources
    phone = ''
    if business_data.get('telephone'):
        phone = business_data['telephone']
    elif profile.get('phone') and profile['phone'] != '#':
        phone = profile['phone']
    
    # Get email (often not available in Blue Book)
    email = profile.get('email', '')
    
    # Get website
    website = ''
    if business_data.get('sameAs') and len(business_data['sameAs']) > 0:
        # Filter out bluebook URLs, keep actual company sites
        for url in business_data['sameAs']:
            if 'thebluebook.com' not in url:
                website = url
                break
    if not website and profile.get('website'):
        website = profile['website']
    
    # Get description
    description = profile.get('description', '')
    if not description and profile.get('meta', {}).get('description'):
        description = profile['meta']['description'][:500]
    
    # Get keywords/services
    keywords = []
    if profile.get('meta', {}).get('keywords'):
        keywords = [k.strip() for k in profile['meta']['keywords'].split(',')]
    
    # Get logo
    logo_url = ''
    if business_data.get('image'):
        logo_url = business_data['image']
    
    return {
        'external_id': profile.get('id'),
        'slug': profile.get('slug'),
        'name': profile.get('company_name') or business_data.get('name', 'Unknown'),
        'type': profile.get('type', 'subcontractors'),
        'phone': phone,
        'email': email,
        'website': website,
        'address_line1': address_parts['line1'],
        'address_line2': address_parts['line2'],
        'city': address_parts['city'],
        'state': address_parts['state'],
        'postal_code': address_parts['postal_code'],
        'country': address_parts['country'],
        'address_raw': address,
        'description': description,
        'keywords': keywords,
        'logo_url': logo_url,
        'csi_codes': csi_codes,
        'csi_divisions': csi_divisions,
        'source': 'bluebook',
        'source_url': profile.get('url'),
        'scraped_at': profile.get('scraped_at')
    }

def load_all_profiles(data_dir: str) -> List[Dict]:
    """Load all scraped profile batches."""
    profiles = []
    pattern = os.path.join(data_dir, 'batch_*.json')
    
    batch_files = sorted(glob.glob(pattern))
    print(f"Found {len(batch_files)} batch files")
    
    for batch_file in batch_files:
        try:
            with open(batch_file, 'r') as f:
                batch_profiles = json.load(f)
                profiles.extend(batch_profiles)
            print(f"✓ Loaded {batch_file}: {len(batch_profiles)} profiles")
        except Exception as e:
            print(f"✗ Error loading {batch_file}: {e}")
    
    print(f"\nTotal profiles loaded: {len(profiles)}")
    return profiles

def import_to_database(companies: List[Dict], db_url: str):
    """Import companies to Supabase database."""
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print(f"\nImporting {len(companies)} companies...")
    
    # Prepare data for bulk insert
    values = []
    for company in companies:
        values.append((
            company['external_id'],
            company['slug'],
            company['name'],
            company['type'],
            company['phone'],
            company['email'],
            company['website'],
            company['address_line1'],
            company['address_line2'],
            company['city'],
            company['state'],
            company['postal_code'],
            company['country'],
            company['address_raw'],
            company['description'],
            company['keywords'],
            company['logo_url'],
            company['csi_codes'],
            company['csi_divisions'],
            company['source'],
            company['source_url'],
            company['scraped_at']
        ))
    
    # Bulk insert with ON CONFLICT (skip duplicates)
    insert_sql = """
        INSERT INTO companies (
            external_id, slug, name, type, phone, email, website,
            address_line1, address_line2, city, state, postal_code, country,
            address_raw, description, keywords, logo_url, csi_codes, csi_divisions,
            source, source_url, scraped_at
        ) VALUES %s
        ON CONFLICT (external_id) DO NOTHING
    """
    
    execute_values(cur, insert_sql, values, page_size=100)
    conn.commit()
    
    # Get count
    cur.execute("SELECT COUNT(*) FROM companies")
    count = cur.fetchone()[0]
    
    cur.close()
    conn.close()
    
    print(f"✅ Import complete! Total companies in database: {count}")

def main():
    """Main import function."""
    
    # Configuration
    DATA_DIR = '/Users/baibureh/clawd/projects/dodge-crm/data/scraped/profiles'
    
    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL environment variable not set")
        print("\nSet it with:")
        print("export DATABASE_URL='postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres'")
        return
    
    print("🚀 Dodge CRM Data Import")
    print("=" * 50)
    
    # Step 1: Load profiles
    print("\n📂 Loading profiles from JSON batches...")
    raw_profiles = load_all_profiles(DATA_DIR)
    
    if not raw_profiles:
        print("❌ No profiles found!")
        return
    
    # Step 2: Transform
    print("\n🔄 Transforming profiles to database format...")
    companies = [parse_profile(p) for p in raw_profiles]
    
    # Step 3: Filter out invalid entries
    companies = [c for c in companies if c['name'] and c['name'] != 'Unknown']
    print(f"✓ {len(companies)} valid companies ready for import")
    
    # Step 4: Show sample
    print("\n📊 Sample data:")
    sample = companies[0]
    print(f"  Name: {sample['name']}")
    print(f"  Type: {sample['type']}")
    print(f"  Phone: {sample['phone']}")
    print(f"  CSI Divisions: {sample['csi_divisions']}")
    print(f"  Codes: {len(sample['csi_codes'])} codes")
    
    # Step 5: Confirm
    print(f"\n⚡ Ready to import {len(companies)} companies to database")
    confirm = input("Continue? [Y/n]: ").strip().lower()
    
    if confirm in ('', 'y', 'yes'):
        import_to_database(companies, DATABASE_URL)
    else:
        print("Import cancelled")

if __name__ == '__main__':
    main()
