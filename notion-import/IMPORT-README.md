# 📥 Notion Import Instructions

## What You Got

5 files ready to import into Notion:

1. **content-calendar.csv** — All blog posts, videos, social media planned
2. **tasks.csv** — Master task list with priorities and due dates
3. **product-roadmap.csv** — Kanban-style feature roadmap
4. **customers.csv** — Empty template for beta testers (fill in)
5. **page-home.md** — Homepage content to copy-paste

---

## How to Import

### Step 1: Create Workspace
1. Go to https://notion.so
2. Create workspace: "JOCstudio"

### Step 2: Create Databases from CSV

**Content Calendar:**
1. Create new page: "📝 Content"
2. Type `/database` → "Table"
3. Click "..." (3 dots) → "Merge with CSV"
4. Upload `content-calendar.csv`
5. Customize views:
   - **Table View:** All content
   - **Board View:** Group by Status
   - **Calendar View:** Group by Due Date

**Tasks:**
1. Create new page: "✅ Tasks"
2. `/database` → "Table"
3. Merge with CSV → Upload `tasks.csv`
4. Views to create:
   - **My Tasks:** Filter Assigned To = You
   - **This Week:** Filter Due Date = This week
   - **By Priority:** Board view grouped by Priority
   - **Done:** Filter Status = Done

**Product Roadmap:**
1. Create new page: "🛠️ Product Roadmap"
2. `/database` → "Board"
3. Merge with CSV → Upload `product-roadmap.csv`
4. Group by: **Status** (Todo → In Progress → Done)

**Customers:**
1. Create new page: "👥 Customers" (PRIVATE)
2. `/database` → "Table"
3. Merge with CSV → Upload `customers.csv`
4. Fill in as you find beta testers

---

### Step 3: Create Static Pages

**Homepage:**
1. Create new page: "📊 HOME"
2. Copy-paste content from `page-home.md`
3. Set as workspace homepage (Settings → General → Home)

**Strategy Pages:**
Create these pages and copy content from your files:
- 🎯 **Business Plan** → Copy from `../business/plan-premium.md`
- 🎯 **GTM Strategy** → Copy from `memory/jocstudio-gtm-strategy.md`
- 🎯 **Competitive Analysis** → Copy from `memory/jocstudio-competitive-analysis.md`

---

### Step 4: Set Up Navigation

In your HOME page, add linked mentions:
```
→ [[📝 Content]]
→ [[✅ Tasks]]
→ [[🛠️ Product Roadmap]]
→ [[👥 Customers]]
→ [[🎯 Business Plan]]
```

---

### Step 5: Templates (Optional but Recommended)

Create templates for repeating tasks:

**Weekly Review Template:**
```
# Weekly Review: {{today}}

## Wins
- 

## Challenges
- 

## Metrics
- MRR: $
- New customers: 
- Content published: 

## Next Week Focus
1. 
2. 
3. 
```

**Blog Post Template:**
```
# {{Title}}

**Status:** Draft  
**Due:** {{date}}  
**SEO Keywords:** 

## Outline
1. 
2. 
3. 

## Draft
[Write here]

## CTA
[Download | Sign up | etc]
```

---

## Pro Tips

1. **Use @mentions** — Type @ to tag yourself in tasks
2. **Link pages** — Type [[ to link between pages
3. **Formulas** — Add formula property to calculate days until due
4. **Relations** — Link Content to Tasks (which tasks for which content)
5. **Rollups** — Count tasks per project
6. **Mobile app** — Download for iOS/Android

---

## Views to Create

### Content Calendar Views
- **Table:** Everything
- **Board:** By Status
- **Calendar:** By Due Date
- **Gallery:** Visual content cards

### Tasks Views
- **All Tasks:** Everything
- **My Tasks:** Just yours
- **This Week:** Filtered by date
- **High Priority:** Filtered
- **Done:** Completed

### Roadmap Views
- **Board:** By Status (Kanban)
- **Table:** All features
- **MVP Only:** Filter MVP = Yes
- **By Quarter:** Group by Target Date

---

## Sharing Settings

**Private (just you):**
- 👥 Customers database
- 💰 Financial details
- 🔬 Competitive research

**Team (when you hire):**
- ✅ Tasks
- 🛠️ Product Roadmap
- 📝 Content Calendar

**Public (never):**
- Keep workspace private until launch

---

## Next Steps After Import

1. ✅ Review all imported data
2. ✅ Add tomorrow's priorities to HOME page
3. ✅ Set up weekly review template
4. ✅ Download Notion mobile app
5. ✅ Bookmark Notion in your browser

---

## Need Help?

Notion templates used as inspiration:
- Startup OS by Notion
- Content Calendar by Notion
- Product Roadmap by Notion

---

**Time to complete:** 10-15 minutes  
**Result:** Professional startup workspace

