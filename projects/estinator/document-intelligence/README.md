# Document Intelligence for Estinator

**The core moat:** Understanding construction documents better than any generic AI.

## 🎯 Capabilities

### 1. Schedule Extraction
Automatically extracts structured data from:
- **Finish Schedules** - Room-by-room finish specifications
- **Door Schedules** - Door types, sizes, hardware
- **Window Schedules** - Window specifications
- **Equipment Schedules** - Mechanical, electrical, plumbing equipment
- **Wall Type Schedules** - Wall assemblies
- **Hardware Schedules** - Door hardware sets

### 2. Room Scope Aggregation
Builds complete picture of each room:
```
Room 101 (Office):
  ├─ Finishes: Carpet floor, painted GWB walls, ACT ceiling
  ├─ Doors: 101-A (3'x7' HM), 101-B (3'x7' HM)
  ├─ Windows: None
  ├─ Plumbing: None
  ├─ Mechanical: VAV box, 2 diffusers
  └─ Electrical: Panel A, circuits 1-4
```

### 3. Conflict Detection
Finds issues across documents:
- Room has doors but no finish schedule entry
- Equipment in schedule but not on drawings
- Wall type defined but never used
- Door missing hardware specification

### 4. Natural Language Q&A
Ask questions in plain English:
- "How many rooms are there?"
- "What doors are in room 101?"
- "What are the finishes in the conference room?"
- "Show me all rooms with VCT flooring"

### 5. Document Comparison
Compare versions:
- Original drawings vs Addendum 1
- Track what changed, what was added/deleted
- Flag cost-impacting changes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│        Document Intelligence Engine         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐   ┌──────────────────┐   │
│  │   Schedule   │   │   Room Scope     │   │
│  │  Extractor   │──▶│   Aggregator     │   │
│  └──────────────┘   └──────────────────┘   │
│          │                    │             │
│          ▼                    ▼             │
│  ┌──────────────┐   ┌──────────────────┐   │
│  │   Conflict   │   │   Natural Lang   │   │
│  │   Detector   │   │      Q&A         │   │
│  └──────────────┘   └──────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
                    │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │  PDF   │ │  Spec  │ │  RFIs  │
   │ Sheets │ │  Docs  │ │Addenda │
   └────────┘ └────────┘ └────────┘
```

## 📁 Files

```
document-intelligence/
├── engine.py                    # Core Python engine
└── README.md                    # This file

server/src/routes/
└── documents-intel.ts           # API routes

app/src/components/
└── DocumentIntelligenceDashboard.tsx  # React UI
```

## 🔌 API Endpoints

### Analyze Document
```bash
POST /api/documents/:projectId/analyze
{
  "documentId": "A-101",
  "content": "...document text...",
  "docType": "drawing",
  "metadata": { "sheet": "A-101", "discipline": "architectural" }
}
```

### Get Room Scope
```bash
GET /api/documents/:projectId/rooms
→ {
  "roomCount": 25,
  "rooms": { "101": { ... }, "102": { ... } }
}
```

### Get Specific Room
```bash
GET /api/documents/:projectId/rooms/101
→ Room details with finishes, doors, equipment
```

### Natural Language Query
```bash
POST /api/documents/:projectId/query
{
  "question": "How many rooms have VCT flooring?"
}
→ {
  "answer": "5 rooms have VCT flooring",
  "data": { ... },
  "sources": ["finish schedule"]
}
```

### Get Insights
```bash
GET /api/documents/:projectId/insights
→ {
  "count": 12,
  "bySeverity": { "critical": 2, "high": 3, ... },
  "insights": [ ... ]
}
```

### Project Summary
```bash
GET /api/documents/:projectId/summary
→ Complete project overview with stats
```

## 💡 Use Cases

### Pre-Bid Review
```
Estimator uploads drawings
↓
System extracts all schedules
↓
Shows: "Found 25 rooms, 45 doors, 12 equipment items"
↓
Highlights: "⚠️ 3 rooms have doors but no finish spec"
↓
Action: Request clarification before bidding
```

### Scope Validation
```
PM asks: "Does room 105 have plumbing?"
↓
System checks: Finish schedule + Plumbing schedule
↓
Answer: "No plumbing fixtures scheduled for room 105"
↓
But: "Note: Room 105 is a restroom per room name"
↓
Action: Flag potential missing plumbing spec
```

### Change Order Analysis
```
Addendum 2 issued
↓
System compares: Original vs Addendum
↓
Finds: "Window quantity changed: 25 → 30"
↓
Calculates: "Impact: +$12,000 estimated"
↓
Action: Prepare change order pricing
```

## 🚀 Roadmap

### Phase 1 (Current)
- ✅ Schedule extraction (text-based)
- ✅ Room scope aggregation
- ✅ Conflict detection
- ✅ Basic Q&A

### Phase 2 (Next)
- 🔄 Vision-based schedule extraction (from PDF images)
- 🔄 Spec document parsing
- 🔄 Equipment tag recognition
- 🔄 Dimension extraction

### Phase 3 (Future)
- 🤖 Auto-generate RFIs for missing info
- 🤖 Compare drawings vs specs automatically
- 🤖 Estimate preparation from aggregated scope
- 🤖 Code compliance checking

## 🎁 Value Proposition

**vs. Manual Review:**
- Human: 4-6 hours to review schedules manually
- Estinator: 30 seconds to extract and analyze

**vs. Generic AI (ChatGPT):**
- Generic: "I see tables with room numbers and finishes"
- Estinator: "Room 101 has 2 doors but the hardware schedule only lists 1 set"

**vs. Traditional Software:**
- Traditional: Separate tools for takeoff, estimating, project management
- Estinator: Unified document understanding + takeoff + pricing

## 🔑 Key Differentiators

1. **Construction-Specific** - Understands schedules, sheets, disciplines
2. **Relationship-Aware** - Connects doors to rooms to hardware
3. **Conflict-Detecting** - Finds what humans miss
4. **Conversational** - Ask questions, get answers
5. **Integrated** - Connected to takeoff and pricing

---

**Bottom Line:** We don't just read documents. We *understand* them.
