# Estinator 🧠👷‍♂️

> "Your Project Brain - See Everything, Know Everything"

AI-powered project document intelligence for construction estimators. Upload specs AND drawings — then ask anything.

## ✨ Features

### 📄 Text Document Analysis
- **Specification parsing** with CSI section detection
- **Addendum tracking** and change detection
- **Requirement extraction** (shall/must/required)
- **Cross-reference linking** (Section A references Section B)

### 📐 Vision Drawing Analysis
- **Sheet classification** (plan, detail, section, schedule)
- **Discipline detection** (architectural, MEP, structural)
- **Room extraction** from floor plans
- **Equipment tag recognition**
- **Dimension and note extraction**
- **Cross-reference detection** (detail bubbles, spec callouts)

### 📊 Schedule Extraction
- **Finish Schedules** → Room finishes (floor, wall, ceiling)
- **Door Schedules** → Sizes, types, hardware, fire ratings
- **Equipment Schedules** → Tags, types, locations
- **Plumbing Fixtures** → Manufacturers, models
- **Window Schedules** → Types, sizes, glazing

### 🏠 Room Scope Aggregation
Combines data from ALL schedules to build complete room scope:
```
Room 101: OFFICE
├── Finishes: CPT-1 floor, PT-1 walls, ACT-1 ceiling @ 9'-0"
├── Doors: 101 (3'-0" x 7'-0", Type A, HW Set 1, 20-min rated)
├── Equipment: None
└── Related Sheets: A-101, A-301, A-501
```

### 🔍 Unified RAG Query
Ask natural language questions across ALL documents:
- "What are the finishes for Room 203?"
- "List all fire-rated doors"
- "What changed between Addendum 1 and 2?"
- "What's the warranty requirement for HVAC?"

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Text Extraction** | pdf-parse |
| **Vision Analysis** | Claude Sonnet (Anthropic) |
| **Embeddings** | text-embedding-3-small (OpenAI) |
| **Vector Store** | In-memory (LanceDB planned) |
| **PDF → Image** | poppler (pdftoppm) |
| **Backend** | Node.js + Express + TypeScript |
| **Frontend** | React + Vite + Tailwind |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- poppler-utils (for PDF to image conversion)

```bash
# macOS
brew install poppler

# Ubuntu/Debian
apt-get install poppler-utils
```

### Installation

```bash
# Clone and install
cd estinator

# Install server dependencies
cd server && npm install

# Install app dependencies
cd ../app && npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY and ANTHROPIC_API_KEY
```

### Running

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start frontend
cd app && npm run dev
```

## 📡 API Reference

### Upload Documents

```bash
# Upload specification (text extraction)
curl -X POST "http://localhost:3001/documents/upload?projectId=demo&type=specification" \
  -F "file=@specs.pdf"

# Upload drawings (vision analysis)
curl -X POST "http://localhost:3001/documents/upload?projectId=demo&type=drawing" \
  -F "file=@drawings.pdf"
```

### Query the Brain

```bash
# Ask a question
curl -X POST "http://localhost:3001/query" \
  -H "Content-Type: application/json" \
  -d '{"projectId": "demo", "question": "What are the finishes for Room 101?"}'
```

Response:
```json
{
  "success": true,
  "answer": "Room 101 (Office) has the following finishes:\n- Floor: CPT-1 (Carpet Tile)\n- Walls: PT-1 (Paint, Eggshell)\n- Ceiling: ACT-1 (Acoustic Ceiling Tile) at 9'-0\"\n- Base: RB-1 (Rubber Base)",
  "confidence": "high",
  "sources": [
    {
      "type": "schedule",
      "documentName": "A-601 - FINISH SCHEDULE",
      "location": "Sheet A-601",
      "excerpt": "Room 101: Office - CPT-1, PT-1, ACT-1..."
    }
  ],
  "relatedQuestions": [
    "What doors serve Room 101?",
    "What equipment is in Room 101?"
  ]
}
```

## 📁 Project Structure

```
estinator/
├── app/                          # React frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom hooks
│   │   └── api/                  # API client
│   └── package.json
├── server/                       # Node backend
│   ├── src/
│   │   ├── routes/               # API routes
│   │   │   ├── documents.ts      # Upload handling
│   │   │   └── query.ts          # Q&A endpoint
│   │   ├── services/
│   │   │   ├── pdfProcessor.ts   # Text extraction + chunking
│   │   │   ├── visionAnalyzer.ts # Drawing analysis
│   │   │   ├── roomScope.ts      # Room aggregation
│   │   │   ├── projectBrain.ts   # Unified brain
│   │   │   ├── embeddings.ts     # Vector embeddings
│   │   │   └── vectorStore.ts    # Search
│   │   └── lib/
│   │       └── pdfToImage.ts     # PDF conversion
│   └── package.json
└── README.md
```

## 🗺️ Roadmap

### Phase 1: Core Brain ✅
- [x] PDF text extraction
- [x] Vision drawing analysis
- [x] Schedule extraction
- [x] Room scope aggregation
- [x] RAG query engine

### Phase 2: Construction Intelligence
- [ ] Addendum diff ("What changed?")
- [ ] Spec requirement extraction
- [ ] Submittal checklist generation
- [ ] QTO assistance (quantities from schedules)

### Phase 3: Integration
- [ ] JOCHero integration (takeoff → brain)
- [ ] Browser extension
- [ ] Team sharing / multi-user
- [ ] Export to Excel/PDF

## 🤝 Built by the JOCHero Team

Part of the **AI Construction Workforce** — making estimators faster, not replaced.

---

*"Terminate the busywork."*
