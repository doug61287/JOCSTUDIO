# Dodge CRM - Maryland Edition

Focused database of Maryland contractors for local outreach and business development.

## Why Separate Database?

- **Local Focus**: Maryland is your primary market
- **Performance**: Smaller dataset = faster queries
- **Customization**: MD-specific fields, tags, campaigns
- **Data Ownership**: Independent from national dataset

## Structure

```
dodge-crm-maryland/
├── database/
│   ├── 001_initial_schema.sql    # Same schema as main CRM
│   ├── import_maryland.py        # Filters to MD-only contractors
│   └── README.md                 # This file
└── data/ -> symlink to main data
```

## Setup

### 1. Create Supabase Project

```bash
# Go to https://supabase.com/dashboard
# Create project: "dodge-crm-maryland"
# Get connection string
```

### 2. Run Schema

```bash
cd /Users/baibureh/clawd/projects/dodge-crm-maryland/database
# Open Supabase SQL Editor
# Paste: 001_initial_schema.sql
# Run it
```

### 3. Import Maryland Contractors

```bash
export DATABASE_URL_MD='postgresql://postgres.[ref]:[pass]@.../postgres'

cd /Users/baibureh/clawd/projects/dodge-crm-maryland/database
python3 import_maryland.py
```

This will:
- Scan all 33 scraped batches (~3,300 profiles)
- Filter to Maryland-only contractors
- Import with city/trade breakdown

## Expected Results

Based on the full dataset, Maryland should have approximately:
- **150-300 contractors** (MD is ~3% of national market)
- **Top cities**: Baltimore, Rockville, Bethesda, Columbia, Annapolis
- **Top trades**: Electrical, Plumbing, HVAC, Concrete, General Contracting

## Maryland-Specific Campaigns

Once imported, you can run targeted campaigns:

```sql
-- Baltimore-area electricians
SELECT name, city, phone, email
FROM companies
WHERE state = 'MD'
  AND city = 'Baltimore'
  AND 26 = ANY(csi_divisions);

-- All MD subcontractors
SELECT name, city, type, csi_codes
FROM companies
WHERE state = 'MD'
  AND type = 'subcontractors';
```

## Next Steps

1. Set up Resend for MD campaigns
2. Create MD-specific email templates
3. Segment by metro area (Baltimore, DC suburbs, Eastern Shore)
4. Cross-reference with your existing network

## Notes

- Uses same schema as main `dodge-crm` for compatibility
- Can merge with national database later if needed
- Perfect for testing campaigns before scaling nationally
