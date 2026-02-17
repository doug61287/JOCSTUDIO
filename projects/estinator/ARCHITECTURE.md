# Estinator Architecture
## AI-Powered Construction Document Intelligence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ESTINATOR SYSTEM                                   │
│                    "Terminate the Busywork"                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                              USER INPUT
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌──────────────┐           ┌──────────────┐
            │   DRAWINGS   │           │    SPECS     │
            │  (PDF/DWG)   │           │  (PDF/DOCX)  │
            └──────────────┘           └──────────────┘
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │   VISION ENGINE   │       │   TEXT ENGINE     │
        │                   │       │                   │
        │  • Sheet classify │       │  • Chunk & embed  │
        │  • Schedule OCR   │       │  • Section parse  │
        │  • Symbol detect  │       │  • Spec extract   │
        │  • Dimension read │       │  • Addenda track  │
        └───────────────────┘       └───────────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                    ┌───────────────────────────┐
                    │      PROJECT BRAIN        │
                    │                           │
                    │  • Vector store (FAISS)   │
                    │  • Room scope aggregator  │
                    │  • Cross-reference engine │
                    │  • Conflict detector      │
                    └───────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │     REASONING ENGINE      │
                    │                           │
                    │  Claude/GPT + Domain RAG  │
                    │  (Future: Fine-tuned LLM) │
                    └───────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────────┐
                    │         OUTPUT            │
                    │                           │
                    │  • Answers with citations │
                    │  • Extracted schedules    │
                    │  • Scope summaries        │
                    │  • RFI suggestions        │
                    │  • Cost implications      │
                    └───────────────────────────┘
```

---

## 1. DATA LAYER

### Training Data Corpus (What We've Collected)

```
/training-data/                          ~2.1 GB
├── manufacturers/           678 MB      Submittals, cut sheets, IOMs
│   ├── hvac/               263 MB      Trane, Carrier, Daikin, York
│   ├── electrical/         254 MB      Eaton, Square D, ABB, Cummins
│   ├── plumbing-fp/        115 MB      Kohler, Viking, Victaulic
│   ├── envelope/            47 MB      GAF, Carlisle, Rockwool
│   ├── finishes/                       Armstrong, USG, Interface
│   └── openings/                       Ceco, Schlage, Kawneer
│
├── project-manuals/         306 MB      Complete project documentation
│   ├── university/                     UW, OSU, UC system
│   ├── hospital/                       VA, FGI guidelines
│   └── transit/                        BART, WMATA, MARTA
│
├── standard-drawings/       170 MB      DOT standard details
│   ├── tx-dot/
│   ├── ca-dot/
│   ├── fl-dot/
│   └── ...
│
├── mep-standards/           135 MB      Utility & code requirements
│   ├── ashrae/
│   ├── con-edison/
│   ├── fdny/
│   └── ...
│
├── spec-sections/            95 MB      CSI-format specifications
│   ├── dod-ufgs/            55 MB      Complete UFGS
│   ├── nps-denver/
│   └── state-specs/
│
├── floor-plans/             605 MB      ML training datasets
│   ├── CubiCasa5k/                     5,000 annotated floor plans
│   ├── FloorPlanCAD/                   CAD floor plans
│   ├── MLSTRUCT-FP/                    Structural annotations
│   └── RPLAN-Toolbox/                  Room segmentation
│
├── awarded-contracts/        11 MB      Real bid pricing
│   └── texas-smartbuy/                 754 bid tabulations
│
├── healthcare-drawings/      TBD        [IN PROGRESS]
│   ├── california-hcai/
│   ├── va-hospitals/
│   ├── university-medical/
│   └── county-health/
│
└── pid-diagrams/             95 MB      Process diagrams
```

### Data Usage Map

| Data Type | Phase 1 (RAG) | Phase 2 (Vision) | Phase 3 (Fine-tune) |
|-----------|---------------|------------------|---------------------|
| Manufacturer submittals | ✅ Retrieval | ✅ Product recognition | ✅ Training data |
| Project manuals | ✅ Retrieval | - | ✅ Training data |
| Spec sections | ✅ Retrieval | - | ✅ Training data |
| Floor plan datasets | - | ✅ Vision training | - |
| Standard drawings | ✅ Retrieval | ✅ Symbol training | - |
| Bid tabulations | ✅ Cost lookup | - | ✅ Pricing model |
| Healthcare drawings | ✅ Retrieval | ✅ Schedule extraction | ✅ Training data |

---

## 2. VISION ENGINE

### Purpose
Extract structured data from construction drawings (PDFs/images).

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VISION ENGINE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ PDF to Image │───▶│ Sheet        │───▶│ Deep         │   │
│  │ (poppler)    │    │ Classifier   │    │ Extraction   │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                             │                    │           │
│                             ▼                    ▼           │
│                    ┌─────────────────────────────────┐       │
│                    │       EXTRACTION ROUTES         │       │
│                    ├─────────────────────────────────┤       │
│                    │ A-sheets → Room layouts, areas  │       │
│                    │ Schedules → Tables, equipment   │       │
│                    │ M-sheets → Duct, pipe routes    │       │
│                    │ E-sheets → Panel schedules      │       │
│                    │ P-sheets → Fixture schedules    │       │
│                    │ Details → Assemblies, notes     │       │
│                    └─────────────────────────────────┘       │
│                                   │                          │
│                                   ▼                          │
│                    ┌─────────────────────────────────┐       │
│                    │      STRUCTURED OUTPUT          │       │
│                    │                                 │       │
│                    │  {                              │       │
│                    │    "rooms": [...],              │       │
│                    │    "schedules": {...},          │       │
│                    │    "equipment": [...],          │       │
│                    │    "finishes": {...}            │       │
│                    │  }                              │       │
│                    └─────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Current Implementation (Phase 1)
- **Model:** Claude Sonnet (via visionAnalyzer.ts)
- **Sheet Types:** 16 categories (finish, door, window, plumbing, etc.)
- **Output:** JSON schedules per sheet

### Future Vision Model (Phase 2)

**Option A: Fine-tune Florence-2 or PaLI**
- Lightweight vision-language model
- Train on floor plan datasets + standard drawings
- Output: Structured drawing interpretation

**Option B: Fine-tune Segment Anything (SAM)**
- For room/area segmentation
- Combine with OCR for schedule extraction
- Output: Polygons + labels

**Option C: Custom YOLO for Symbols**
- Train symbol detector on standard drawing symbols
- Plumbing fixtures, electrical symbols, etc.
- Output: Bounding boxes + classifications

**Recommended Stack:**
```
PaddleOCR (text extraction)
    +
SAM (room segmentation)
    +
Custom classifier (sheet type)
    +
Florence-2 (multimodal understanding)
```

### Training Data for Vision

| Dataset | Images | Use |
|---------|--------|-----|
| CubiCasa5k | 5,000 | Floor plan segmentation |
| FloorPlanCAD | 1,000+ | CAD drawing understanding |
| MLSTRUCT-FP | 1,000+ | Structural element detection |
| RPLAN-Toolbox | 1,000+ | Room type classification |
| Our standard drawings | 261 | Symbol vocabulary |
| Our healthcare drawings | TBD | Schedule extraction |

---

## 3. TEXT ENGINE (RAG)

### Purpose
Chunk, embed, and retrieve from specifications and documents.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       TEXT ENGINE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INGESTION                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ PDF/DOCX     │───▶│ Smart        │───▶│ Embedding    │   │
│  │ Parser       │    │ Chunker      │    │ Generator    │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                   │                    │           │
│         ▼                   ▼                    ▼           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   VECTOR STORE                        │   │
│  │                                                       │   │
│  │  FAISS Index                                         │   │
│  │  ├── Spec sections (by CSI division)                 │   │
│  │  ├── Project documents (by type)                     │   │
│  │  ├── Manufacturer data (by trade)                    │   │
│  │  └── Extracted schedules (by room)                   │   │
│  │                                                       │   │
│  │  Metadata: page, section, source, date, project      │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  RETRIEVAL                 ▼                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Query        │───▶│ Semantic     │───▶│ Rerank &     │   │
│  │ Processing   │    │ Search       │    │ Filter       │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                │             │
│                                                ▼             │
│                                    ┌──────────────────┐      │
│                                    │ Context Window   │      │
│                                    │ (Top K chunks)   │      │
│                                    └──────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Smart Chunking Strategy

```python
# Chunk by semantic boundaries, not arbitrary splits
CHUNKING_RULES = {
    "spec_section": {
        "split_on": ["PART 1", "PART 2", "PART 3", "1.0", "2.0", "3.0"],
        "chunk_size": 1500,
        "overlap": 200
    },
    "schedule": {
        "split_on": "row",  # Each row is a chunk
        "include_header": True
    },
    "drawing_note": {
        "split_on": "keynote_number",
        "include_context": True
    }
}
```

### Embedding Model Options

| Model | Dimensions | Speed | Quality | Cost |
|-------|------------|-------|---------|------|
| OpenAI text-embedding-3-large | 3072 | Fast | Excellent | $$$ |
| OpenAI text-embedding-3-small | 1536 | Fast | Good | $$ |
| Cohere embed-v3 | 1024 | Fast | Excellent | $$ |
| BGE-large-en-v1.5 | 1024 | Medium | Good | Free |
| **Nomic embed (recommended)** | 768 | Fast | Great | Free |

**Recommendation:** Start with Nomic (free, local) → upgrade to OpenAI for production.

---

## 4. PROJECT BRAIN

### Purpose
Aggregate extracted data into a unified project knowledge base.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PROJECT BRAIN                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 ROOM SCOPE AGGREGATOR               │    │
│  │                                                     │    │
│  │  Room 101 (Office)                                  │    │
│  │  ├── Finishes: VCT floor, ACT ceiling, painted GWB │    │
│  │  ├── Doors: 3070 HM door, lever hardware           │    │
│  │  ├── Plumbing: None                                │    │
│  │  ├── Mechanical: 2x 24x24 diffusers, 1 return      │    │
│  │  ├── Electrical: 6 outlets, 4 lights, 1 switch     │    │
│  │  ├── Fire Protection: 1 sprinkler head             │    │
│  │  └── Equipment: None                                │    │
│  │                                                     │    │
│  │  Room 102 (Exam Room)                               │    │
│  │  ├── Finishes: Sheet vinyl, ACT ceiling, FRP walls │    │
│  │  ├── Doors: 3070 HM door, privacy lock             │    │
│  │  ├── Plumbing: 1 lavatory, medical gas outlets     │    │
│  │  ├── Mechanical: 100% exhaust, neg pressure        │    │
│  │  ├── Electrical: Medical grade outlets, exam light │    │
│  │  ├── Fire Protection: 1 quick-response head        │    │
│  │  └── Equipment: Exam table, wall cabinet           │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              CROSS-REFERENCE ENGINE                  │    │
│  │                                                     │    │
│  │  "What's the finish for Room 101?"                  │    │
│  │       → Check finish schedule                       │    │
│  │       → Check room finish plan                      │    │
│  │       → Check spec section 09 65 00                 │    │
│  │       → Resolve conflicts if any                    │    │
│  │                                                     │    │
│  │  "What fixtures are in Exam Rooms?"                 │    │
│  │       → Query all rooms with type = "Exam"          │    │
│  │       → Aggregate plumbing schedules                │    │
│  │       → Return fixture list + quantities            │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               CONFLICT DETECTOR                      │    │
│  │                                                     │    │
│  │  ⚠️  Spec calls for VCT, drawing shows LVT         │    │
│  │  ⚠️  Door schedule shows 3070, floor plan shows 30 │    │
│  │  ⚠️  Addendum 3 changes Room 105 ceiling height    │    │
│  │                                                     │    │
│  │  → Flag for RFI or clarification                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Model

```typescript
interface ProjectBrain {
  project: {
    name: string;
    number: string;
    documents: Document[];
  };
  
  rooms: Map<string, RoomScope>;
  
  schedules: {
    door: DoorScheduleEntry[];
    finish: FinishScheduleEntry[];
    equipment: EquipmentScheduleEntry[];
    plumbing: PlumbingScheduleEntry[];
    // ... 16 schedule types
  };
  
  specs: {
    divisions: Map<string, SpecSection[]>;
    addenda: Addendum[];
  };
  
  conflicts: Conflict[];
  
  queries: {
    byRoom(roomId: string): RoomScope;
    byTrade(trade: string): TradeScope;
    bySpec(section: string): SpecSection[];
    search(query: string): SearchResult[];
  };
}
```

---

## 5. REASONING ENGINE

### Purpose
Answer questions using retrieved context + domain knowledge.

### Current Implementation (Phase 1)

```
User Question
     │
     ▼
┌──────────────┐
│ Query Router │ ← Determines: schedule lookup? spec question? cost query?
└──────────────┘
     │
     ├──────────────────────────────┐
     ▼                              ▼
┌──────────────┐            ┌──────────────┐
│ Vector Search │            │ Direct Lookup │
│ (semantic)    │            │ (structured)  │
└──────────────┘            └──────────────┘
     │                              │
     └──────────────┬───────────────┘
                    ▼
            ┌──────────────┐
            │ Context      │
            │ Assembly     │
            └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Claude/GPT   │ ← System prompt: "You are a construction expert..."
            │ + Context    │
            └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Response +   │
            │ Citations    │
            └──────────────┘
```

### Future Fine-tuned Model (Phase 3)

**Why fine-tune?**
- Faster responses (smaller model)
- Lower cost per query
- Better construction terminology
- Can run locally/on-prem

**Training Data Requirements:**
- ~10,000+ Q&A pairs (construction domain)
- Spec interpretation examples
- Drawing reading examples
- Conflict resolution examples

**Candidate Base Models:**

| Model | Size | Pros | Cons |
|-------|------|------|------|
| Llama 3 8B | 8B | Fast, good quality | Needs GPU |
| Mistral 7B | 7B | Excellent reasoning | Needs GPU |
| Phi-3 Mini | 3.8B | Runs on CPU | Lower quality |
| **Qwen2 7B** | 7B | Great at structured output | Needs GPU |

**Fine-tuning Approach:**
1. Generate synthetic Q&A from our spec corpus
2. Create "expert traces" showing reasoning steps
3. Fine-tune with LoRA (efficient, preserves base knowledge)
4. Evaluate on held-out construction questions

**Training Data Generation Pipeline:**
```
Spec Section
     │
     ▼
Claude generates 10-20 Q&A pairs
     │
     ▼
Human reviews & filters
     │
     ▼
Add to training set
     │
     ▼
Fine-tune model
```

---

## 6. INTEGRATION ARCHITECTURE

### Full System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ESTINATOR FULL STACK                             │
└─────────────────────────────────────────────────────────────────────────┘

DOCUMENT UPLOAD                           QUERY INTERFACE
      │                                          │
      ▼                                          ▼
┌──────────────┐                        ┌──────────────┐
│ File Router  │                        │ Query Parser │
│ PDF/DWG/DOCX │                        │              │
└──────────────┘                        └──────────────┘
      │                                          │
      ├─────────────┬─────────────┐              │
      ▼             ▼             ▼              │
┌─────────┐  ┌─────────┐  ┌─────────┐           │
│ Drawing │  │  Spec   │  │ Sched.  │           │
│ (image) │  │ (text)  │  │ (table) │           │
└─────────┘  └─────────┘  └─────────┘           │
      │             │             │              │
      ▼             ▼             ▼              │
┌─────────────────────────────────────┐         │
│          PROCESSING PIPELINE         │         │
├─────────────────────────────────────┤         │
│  Vision    │  Text     │  Schedule  │         │
│  Engine    │  Engine   │  Parser    │         │
└─────────────────────────────────────┘         │
                    │                            │
                    ▼                            │
         ┌───────────────────┐                   │
         │   PROJECT BRAIN   │◀──────────────────┘
         │                   │
         │  • Vector Store   │
         │  • Room Scopes    │
         │  • Schedules      │
         │  • Conflicts      │
         └───────────────────┘
                    │
                    ▼
         ┌───────────────────┐
         │ REASONING ENGINE  │
         │                   │
         │  RAG + Claude     │
         │  (or fine-tuned)  │
         └───────────────────┘
                    │
                    ▼
         ┌───────────────────┐
         │      OUTPUT       │
         │                   │
         │  • Natural lang.  │
         │  • Citations      │
         │  • JSON export    │
         │  • RFI drafts     │
         └───────────────────┘
```

### API Design

```typescript
// POST /documents/upload
{
  file: File,
  type: "drawing" | "spec" | "schedule" | "addendum",
  projectId: string
}

// POST /query
{
  question: string,
  projectId: string,
  options?: {
    includeVisual: boolean,    // Search drawings
    includeSpecs: boolean,     // Search specs
    citeSources: boolean,      // Include citations
    format: "text" | "json"
  }
}

// GET /project/:id/rooms
// Returns all room scopes

// GET /project/:id/schedule/:type
// Returns extracted schedule (door, finish, etc.)

// GET /project/:id/conflicts
// Returns detected conflicts/discrepancies
```

---

## 7. DEPLOYMENT ARCHITECTURE

### Phase 1: MVP (Current)

```
┌─────────────────────────────────────┐
│           LOCAL / DEV               │
├─────────────────────────────────────┤
│                                     │
│  Express Server (localhost:3001)    │
│  ├── /documents/upload              │
│  ├── /query                         │
│  └── /health                        │
│                                     │
│  Dependencies:                      │
│  • Claude API (vision + reasoning)  │
│  • OpenAI API (embeddings)          │
│  • FAISS (vector store)             │
│  • Poppler (PDF → images)           │
│                                     │
└─────────────────────────────────────┘
```

### Phase 2: Production

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUD DEPLOY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Frontend   │  │   API        │  │   Workers    │       │
│  │   (Vercel)   │  │   (Railway)  │  │   (Modal)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           │                                  │
│                    ┌──────────────┐                          │
│                    │   Postgres   │ (Supabase)               │
│                    │   + pgvector │                          │
│                    └──────────────┘                          │
│                           │                                  │
│                    ┌──────────────┐                          │
│                    │     S3       │ (Document storage)       │
│                    └──────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Enterprise / On-Prem

```
┌─────────────────────────────────────────────────────────────┐
│                     ENTERPRISE DEPLOY                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  KUBERNETES CLUSTER                   │   │
│  │                                                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │   │
│  │  │ API Pod │  │ Vision  │  │  RAG    │  │ Reason  │  │   │
│  │  │         │  │ Pod     │  │  Pod    │  │ Pod     │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │              FINE-TUNED MODELS                   │ │   │
│  │  │  • Vision model (Florence-2 fine-tuned)         │ │   │
│  │  │  • Language model (Qwen2 fine-tuned)            │ │   │
│  │  │  • Embedding model (Nomic)                       │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Benefits:                                                   │
│  • Data never leaves customer network                        │
│  • No API costs (own models)                                 │
│  • Full control                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. ROADMAP

### Phase 1: RAG MVP (NOW → 2 weeks)
- [x] PDF text extraction
- [x] Vision analyzer (sheet classification)
- [x] 16 schedule type extraction
- [x] Room scope aggregation
- [ ] Frontend upload UI
- [ ] Basic query interface
- [ ] Citation display

### Phase 2: Vision Enhancement (2-6 weeks)
- [ ] Fine-tune floor plan segmentation model
- [ ] Symbol detection for MEP drawings
- [ ] Automated schedule table extraction
- [ ] Drawing cross-reference (keynotes → details)

### Phase 3: Domain Fine-tuning (6-12 weeks)
- [ ] Generate Q&A training data from specs
- [ ] Fine-tune Qwen2 or Llama 3 on construction domain
- [ ] Build conflict detection model
- [ ] Cost estimation integration

### Phase 4: Production (3-6 months)
- [ ] Multi-tenant architecture
- [ ] Enterprise SSO
- [ ] Audit logging
- [ ] On-prem deployment option

---

## 9. SUCCESS METRICS

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Schedule extraction accuracy | >95% | Compare to manual extraction |
| Query answer accuracy | >90% | Human evaluation |
| Time to first answer | <5 seconds | API latency |
| Document processing time | <30s per sheet | Pipeline timing |
| Conflict detection precision | >85% | False positive rate |
| User satisfaction | >4.5/5 | Post-query rating |

---

## 10. COST MODEL

### Phase 1 (API-based)

| Component | Cost/month (1000 projects) |
|-----------|---------------------------|
| Claude Sonnet (vision) | ~$500 |
| Claude Sonnet (reasoning) | ~$300 |
| OpenAI embeddings | ~$50 |
| Infrastructure | ~$100 |
| **Total** | **~$950/month** |

### Phase 3 (Self-hosted)

| Component | Cost/month |
|-----------|-----------|
| GPU server (A100) | ~$2,000 |
| Storage (S3) | ~$100 |
| Compute (K8s) | ~$500 |
| **Total** | **~$2,600/month** |

Break-even: ~2,500 projects/month

---

*Last updated: 2026-02-15*
*Version: 1.0*
