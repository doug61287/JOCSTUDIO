# Dodge CRM / Lead Generation System

Complete lead generation platform for Dodge Construction Network data.

## Structure

```
dodge-crm/
├── database/           # Schema, migrations, import scripts
│   ├── database_schema.csv      # Excel-ready schema doc
│   ├── 001_initial_schema.sql   # PostgreSQL schema
│   ├── import_data.py           # Data import script
│   └── README.md                # Database setup guide
│
├── email-campaigns/    # Email infrastructure
│   ├── emails/                  # React Email templates
│   ├── scripts/                 # Send scripts
│   ├── webhooks/                # Tracking handlers
│   └── .env.example             # Config template
│
├── data/               # Contractor data
│   └── scraped/                 # Symlink to 998K profiles
│
└── README.md           # This file
```

## Quick Start

1. **Database**: See `database/README.md`
2. **Email**: See `email-campaigns/README.md`
3. **Data**: 998K contractor URLs + ~3,300 detailed profiles (scraping continues)

## Stats
- URLs discovered: 998,315
- Detailed profiles: ~3,300 (in progress)
- Data size: ~700 MB
