# EC2 Excavation Report 🏴‍☠️
*Extracted from 56 session files on 2026-02-12*

## 1. Sasha's Job Search → Hobart Template 🦞

### User Profile
```json
{
  "name": "Sasha Greenspan, PhD",
  "email": "sasha.greenspan@gmail.com", 
  "location": "Baltimore, MD",
  "currentRole": "Program Admin @ Kennedy Krieger / JHU",
  "summary": "Research operations leader with 20+ years building and scaling complex clinical and biological research programs. PhD Biology, deep experience in device-enabled clinical studies, GCP/ICH compliance, REDCap, IRB submissions, team leadership."
}
```

### Search Config (reusable pattern)
```json
{
  "keywords": [
    "Clinical Operations Support",
    "Clinical Project Assistant", 
    "Clinical Project Specialist",
    "Learning and Development",
    "Regulatory Specialist",
    "Regulatory Affairs",
    "Research Manager",
    "Hospital Administration"
  ],
  "jobTitles": [
    "Clinical Trial Manager",
    "Regulatory Specialist",
    "Research Manager", 
    "Clinical Operations Lead",
    "Hospital Administrator"
  ],
  "location": {
    "base": "Baltimore, MD",
    "radiusMiles": 30,
    "remote": true,
    "hybrid": true
  },
  "salary": {
    "floor": 85000,
    "ceiling": null
  },
  "exclude": [
    "Construction project management",
    "Facilities management",
    "IT infrastructure / IT project management",
    "Software engineering / DevOps",
    "Any role where 'clinical' or 'research' does NOT appear in actual job description"
  ]
}
```

### Cron Setup
- **Schedule:** Daily at 6AM ET (12:00 UTC)
- **Output:** Reports saved to `projects/sasha-job-search/reports/YYYY-MM-DD.md`
- **Template:** `projects/sasha-job-search/templates/daily-report.md`

### Key Lessons Learned
1. **JHU direct links fail** - session-gated, redirect to generic careers page
2. **LinkedIn links work better** - use as primary source
3. **Cloudflare blocks EC2 IP** - can't browser-verify JHU directly  
4. **Link verification critical** - "better to list 3 verified jobs than 10 broken"
5. **Do NOT fabricate LinkedIn job IDs** - only use actual search results
6. **Check exclude list strictly** - filter out irrelevant PM/IT/construction roles

### Anti-Bot Rules (apply to Hobart)
1. Use Brave Search API instead of direct scraping
2. Prioritize LinkedIn job links over direct career pages
3. Verify every link with web_fetch before including
4. If link redirects to generic search page → drop it

---

## 2. Blueprint (Construction Doc Intelligence)

### Status
- **Fully operational skill** rebuilt with 6 scripts
- First project tested end-to-end: USPS Greenwich CT

### Architecture
- **Pass 1:** Page-by-page ingestion  
- **Pass 2:** Room-by-room synthesis
- **Then:** Q&A ready

### Key Rules
- Room is atomic unit
- Partitions are shared two-faced objects
- **Flag don't assume** - completeness is mission
- Distinguish ceiling vs wall paint at high-bay
- Flag access/height impacts

### Scripts Built
- `split_pdf` - break apart large PDFs
- `classify_sheet` - identify drawing types
- `extract_content` - smart 2-stage extraction
- `parse_schedule` - door/window/finish schedules
- `parse_specs` - CSI division mapping
- `project_db` / `populate_db` - local knowledge base
- `qa_test` - verification suite

### HHC Brooklyn Dental Project (in progress)
- 86 drawing sheets, 1,058-page spec, 568-line bid breakdown
- 298 line items mapped
- 🔴 Found: GWB partition layer discrepancy + fire-rated door missing from bid

---

## 3. MedTech Bot (Biomed BorBor)

### What It Does
- WhatsApp bot for biomedical equipment technicians in low-resource settings
- Walks techs through troubleshooting conversationally
- Logs issues: equipment type, model, facility, failure, steps, resolution, parts
- Shares cross-facility learnings

### Launch Equipment
1. Oxygen concentrators
2. Edan patient monitors  
3. Infant incubators

### Knowledge Base Built
- 6 equipment types
- 399 troubleshooting nodes
- Krio + Liberian English language support

### Tech Stack
- Node.js + Express
- WhatsApp Cloud API (Meta)
- SQLite
- Baileys bridge for WhatsApp

### Status When Left
- WhatsApp Business registered via Numero eSIM
- Account restricted after ~6hrs - needs aging before re-link
- PM2 ready for deployment
- Concept note drafted for Grand Challenges / USAID / PIH grant

---

## 4. JOC Translator

### Status
- **Tabled but ranked #1 revenue potential**
- Revival confirmed - landing page, demo, test with 5 contacts
- Now lives as **JOCHero** with:
  - Landing: jochero.com
  - App: jocstudio.vercel.app
  - 65,331 NYC H+H CTC items loaded

---

## 5. Dashboard (Bureh Dashboard)

### Stack
- React + TypeScript + Vite + Tailwind
- PM2 for persistence

### Features Built
- Overview
- Memory viewer
- Projects list
- Investments (Silver/SILJ/GSVR.V live data)
- Cost Tracker
- Job Reports
- System health panel

---

## 6. Strategic Priorities (from EC2 era)

1. **JOC Translator** → Now JOCHero ✅
2. **MedTech Bot concept note** → Grant pitch drafted
3. **10x PM Automation** → L'Amore workflows (pending walkthrough)
4. Global health consulting positioning
5. Investment monitoring

---

## Files to Recreate for Hobart

Based on Sasha's Job Search structure:

```
projects/hobart/
├── HOBART.md          ✅ Created
├── AGENTS.md          ✅ Created  
├── SOUL.md            ✅ Created
├── search-config.json   # Per-user, stored in memory/users/
├── templates/
│   └── daily-report.md  # Digest format template
├── memory/
│   ├── users/           ✅ Created
│   │   └── {telegram_id}.json
│   └── resumes/         ✅ Created
└── scripts/
    ├── user-state.js    ✅ Created
    └── job-search.js    ✅ Created
```

---

## Key Insight

Sasha's Job Search was **single-user** (just Sasha). Hobart generalizes this to **any user** with:
- Onboarding interview to build search config
- Per-user profiles in memory/users/
- Daily cron that loops through all active users
- Open DM policy so anyone can start

The core job search logic (Brave API → filter → verify → format) stays the same!
