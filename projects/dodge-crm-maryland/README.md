# Dodge CRM - Maryland Edition

Maryland-focused contractor database for local lead generation.

## Quick Start

```bash
# 1. Set up database
cd database
# Follow README.md for Supabase setup

# 2. Import MD contractors
export DATABASE_URL_MD='your-supabase-url'
python3 import_maryland.py

# 3. Start campaigning!
```

## What's Included

- Same schema as national Dodge CRM
- ~150-300 Maryland contractors (filtered from 3,300 national)
- Import script with city/trade analytics
- Ready for email campaigns

See `database/README.md` for full setup instructions.
