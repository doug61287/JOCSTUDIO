# Import Guide - Dodge CRM

## Step 1: Set Up Supabase (One Time)
```bash
# 1. Go to https://supabase.com/dashboard
# 2. Create project: "dodge-crm"
# 3. Get connection string from Settings → Database
```

## Step 2: Run Schema
```bash
cd /Users/baibureh/clawd/projects/dodge-crm/database
# Open Supabase SQL Editor
# Paste: 001_initial_schema.sql
# Run it
```

## Step 3: Import Data
```bash
# Set database URL
export DATABASE_URL='postgresql://postgres.[ref]:[pass]@aws-0-us-east-1.pooler.supabase.com:6543/postgres'

# Run import
cd /Users/baibureh/clawd/projects/dodge-crm/database
python3 import_profiles.py
```

## What Gets Imported
- ~3,300 contractor profiles
- Company names, phones, websites
- CSI codes and divisions (for trade filtering)
- Addresses (city, state, postal code)
- Descriptions and keywords

## Verification
After import, check Supabase Table Editor:
- `companies` table should show 3,300+ rows
- Run sample query to verify data quality

## Next Steps
1. Set up Resend for email campaigns
2. Segment by trade (CSI division) and location
3. Launch first campaign
