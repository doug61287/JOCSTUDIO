#!/usr/bin/env python3
"""
Import Maryland-only contractors from Dodge Construction Network data.
Filters the full dataset to MD state contractors.
"""
import json
import os
import glob
from datetime import datetime
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import execute_values

DATABASE_URL = os.getenv('DATABASE_URL_MD')  # Separate env var for MD database

def extract_csi_divisions(csi_codes: List[str]) -> List[int]:
    """Extract division numbers from CSI codes."""
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
    
    json_ld = profile.get('json_ld', [[]])[0] if profile.get('json_ld') else []
    business_data = {}
    if json_ld and len(json_ld) > 0:
        for item in json_ld:
            if isinstance(item, dict) and item.get('@type') == 'HomeAndConstructionBusiness':
                business_data = item
                break
    
    # Extract state from JSON-LD
    state = ''
    if business_data.get('address', {}).get('addressRegion'):
        state = business_data['address']['addressRegion']
    
    # Get postal code
    postal_code = ''
    if business_data.get('address', {}).get('postalCode'):
        postal_code = business_data['address']['postalCode']
    
    # Get city
    city = ''
    if business_data.get('address', {}).get('addressLocality'):
        city = business_data['address']['addressLocality']
    
    # Check if Maryland
    if state != 'MD':
        return None  # Skip non-MD
    
    csi_codes = profile.get('csi_codes', [])
    csi_divisions = extract_csi_divisions(csi_codes)
    
    # Get phone
    phone = ''
    if business_data.get('telephone'):
        phone = business_data['telephone']
    elif profile.get('phone') and profile['phone'] != '#':
        phone = profile['phone']
    
    # Get website
    website = ''
    if business_data.get('sameAs') and len(business_data['sameAs']) > 0:
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
    
    # Get keywords
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
        'email': profile.get('email', ''),
        'website': website,
        'address_line1': '',
        'address_line2': '',
        'city': city,
        'state': state,
        'postal_code': postal_code,
        'country': 'US',
        'address_raw': profile.get('address', ''),
        'description': description,
        'keywords': keywords,
        'logo_url': logo_url,
        'csi_codes': csi_codes,
        'csi_divisions': csi_divisions,
        'source': 'bluebook',
        'source_url': profile.get('url'),
        'scraped_at': profile.get('scraped_at')
    }

def load_md_profiles(data_dir: str) -> List[Dict]:
    """Load only Maryland profiles from all batches."""
    md_profiles = []
    pattern = os.path.join(data_dir, 'batch_*.json')
    batch_files = sorted(glob.glob(pattern))
    
    print(f"Scanning {len(batch_files)} batch files for Maryland contractors...")
    
    for batch_file in batch_files:
        try:
            with open(batch_file, 'r') as f:
                batch_profiles = json.load(f)
            
            md_in_batch = 0
            for profile in batch_profiles:
                parsed = parse_profile(profile)
                if parsed:  # Only MD profiles return non-None
                    md_profiles.append(parsed)
                    md_in_batch += 1
            
            if md_in_batch > 0:
                print(f"✓ {batch_file}: {md_in_batch} MD contractors")
        except Exception as e:
            print(f"✗ Error loading {batch_file}: {e}")
    
    print(f"\n🎯 Total Maryland contractors found: {len(md_profiles)}")
    return md_profiles

def import_to_database(companies: List[Dict], db_url: str):
    """Import MD companies to separate database."""
    
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print(f"\nImporting {len(companies)} Maryland companies...")
    
    values = []
    for company in companies:
        values.append((
            company['external_id'], company['slug'], company['name'], company['type'],
            company['phone'], company['email'], company['website'],
            company['address_line1'], company['address_line2'], company['city'],
            company['state'], company['postal_code'], company['country'],
            company['address_raw'], company['description'], company['keywords'],
            company['logo_url'], company['csi_codes'], company['csi_divisions'],
            company['source'], company['source_url'], company['scraped_at']
        ))
    
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
    
    # Get breakdown by city
    cur.execute("SELECT city, COUNT(*) FROM companies GROUP BY city ORDER BY count DESC")
    cities = cur.fetchall()
    
    # Get breakdown by trade
    cur.execute("""
        SELECT unnest(csi_divisions) as division, COUNT(*) 
        FROM companies 
        GROUP BY division 
        ORDER BY count DESC
    """)
    trades = cur.fetchall()
    
    cur.close()
    conn.close()
    
    print(f"✅ Import complete!")
    print(f"\n📊 By City:")
    for city, count in cities[:10]:
        print(f"  {city}: {count}")
    
    print(f"\n🔧 By Trade (CSI Division):")
    division_names = {
        3: 'Concrete', 8: 'Openings', 21: 'Fire Suppression', 22: 'Plumbing',
        23: 'HVAC', 26: 'Electrical', 31: 'Earthwork', 32: 'Exterior Improvements'
    }
    for div, count in trades[:10]:
        name = division_names.get(div, f'Division {div}')
        print(f"  {name}: {count}")

def main():
    DATA_DIR = '/Users/baibureh/clawd/projects/dodge-crm/data/scraped/profiles'
    
    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL_MD environment variable not set")
        print("\nSet it with:")
        print("export DATABASE_URL_MD='postgresql://postgres.[ref]:[pass]@.../postgres'")
        return
    
    print("🦀 Maryland Contractor Import")
    print("=" * 50)
    
    # Load MD profiles
    md_companies = load_md_profiles(DATA_DIR)
    
    if not md_companies:
        print("❌ No Maryland contractors found!")
        return
    
    # Show sample
    print("\n📍 Sample MD Contractor:")
    sample = md_companies[0]
    print(f"  Name: {sample['name']}")
    print(f"  City: {sample['city']}")
    print(f"  Trade: {sample['csi_divisions']}")
    
    # Confirm
    print(f"\n⚡ Ready to import {len(md_companies)} Maryland companies")
    confirm = input("Continue? [Y/n]: ").strip().lower()
    
    if confirm in ('', 'y', 'yes'):
        import_to_database(md_companies, DATABASE_URL)
    else:
        print("Import cancelled")

if __name__ == '__main__':
    main()
