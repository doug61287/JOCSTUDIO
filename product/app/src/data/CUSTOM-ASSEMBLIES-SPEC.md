# Custom Assemblies Feature Spec

## Overview
Allow users to create, save, and reuse assemblies across projects.

---

## Data Model

```typescript
interface CustomAssembly {
  id: string;                    // UUID
  name: string;                  // "Bathroom Rough-In Package"
  description?: string;          // Optional notes
  category: 'plumbing' | 'fire' | 'electrical' | 'general' | 'custom';
  createdAt: string;             // ISO date
  updatedAt: string;
  createdBy: 'user' | 'system' | 'shared';
  
  // Source tracking (for pre-built from drawings)
  source?: {
    project: string;             // "Bellevue ED"
    drawingRef?: string;         // "P-101"
  };
  
  items: CustomAssemblyItem[];
  
  // Matching
  keywords: string[];            // For search/auto-suggest
  applicableTo: ('count' | 'line' | 'area')[];
}

interface CustomAssemblyItem {
  id: string;
  taskCode: string;              // "22131300-0003"
  description: string;           // "WC Rough-In"
  unit: string;
  unitCost: number;
  
  // Quantity relationship
  quantityFactor: number;        // 1.0 = same as measurement
  quantityType: 'factor' | 'fixed' | 'input';
  fixedQty?: number;             // For quantityType: 'fixed'
  
  // Categorization
  role: 'primary' | 'typical' | 'optional' | 'companion';
  notes?: string;
}
```

---

## Storage

### Local Storage (MVP)
```typescript
// Key: 'jochero-custom-assemblies'
// Value: CustomAssembly[]

const STORAGE_KEY = 'jochero-custom-assemblies';

function saveAssemblies(assemblies: CustomAssembly[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assemblies));
}

function loadAssemblies(): CustomAssembly[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}
```

### Future: Cloud Storage
- Sync across devices
- Team sharing
- Version history

---

## UI Components

### 1. Assembly Manager (New Panel)
```
┌─────────────────────────────────────┐
│ 📦 My Assemblies                    │
├─────────────────────────────────────┤
│ 🔍 Search assemblies...             │
├─────────────────────────────────────┤
│ ⭐ Favorites                        │
│   └─ Bathroom Rough-In Package      │
│   └─ Sprinkler Head + Escutcheon    │
├─────────────────────────────────────┤
│ 📁 Plumbing                         │
│   └─ Lavatory Complete              │
│   └─ WC Rough-In                    │
├─────────────────────────────────────┤
│ 📁 Fire Protection                  │
│   └─ 3" CPVC Run + Fittings         │
├─────────────────────────────────────┤
│ [+ Create New Assembly]             │
│ [↑ Import from JSON]                │
└─────────────────────────────────────┘
```

### 2. Assembly Creator Dialog
```
┌─────────────────────────────────────┐
│ Create New Assembly                 │
├─────────────────────────────────────┤
│ Name: [Bathroom Rough-In Package  ] │
│ Category: [Plumbing ▼]              │
│ Keywords: [bathroom, bath, rough  ] │
├─────────────────────────────────────┤
│ Items:                              │
│ ┌─────────────────────────────────┐ │
│ │ + Add from Catalogue            │ │
│ │ + Add from Current Measurement  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 1. 22131300-0003 WC Rough-In        │
│    Qty: [1.0x] Role: [Primary ▼]    │
│                                     │
│ 2. 22421613-0005 Lavatory           │
│    Qty: [1.0x] Role: [Primary ▼]    │
│                                     │
│ 3. 22014081-0018 P-Trap             │
│    Qty: [1.0x] Role: [Typical ▼]    │
├─────────────────────────────────────┤
│ [Cancel]              [Save Assembly]│
└─────────────────────────────────────┘
```

### 3. Quick Create from Measurement
When user has a measurement with items, show:
```
[💾 Save as Assembly]
```

---

## Pre-Built from Real Drawings

### Process
1. Load existing takeoff package (Bellevue, etc.)
2. Analyze which items appear together
3. Identify patterns (e.g., WC always has flush valve)
4. Generate suggested assemblies
5. User reviews and saves

### Analysis Script
```typescript
interface TakeoffData {
  measurements: {
    name: string;
    items: { taskCode: string; quantity: number }[];
  }[];
}

function analyzePatterns(takeoff: TakeoffData): SuggestedAssembly[] {
  // Group items that appear together
  // Calculate frequency
  // Suggest assemblies
}
```

### Example Output
```
Suggested Assemblies from "Bellevue ED":

1. "Bathroom Package" (appears 12 times)
   - WC Rough-In (22131300-0003)
   - Lavatory (22421613-0005)
   - Floor Drain (22131913-0003)
   - Supply Lines (22014081-0004) x2
   
2. "Sprinkler Coverage" (appears 47 times)
   - Pendent Head (21131300-0074)
   - Escutcheon (21131300-0211)
   
3. "Corridor Fire Protection" (appears 8 times)
   - 1.5" CPVC Pipe (21134100-0005)
   - 1.5" Elbow (21134100-0013)
   - 1.5" Tee (21134100-0021)
```

---

## Integration Points

### 1. MeasurementPanel
- Show custom assemblies in dropdown
- "Save as Assembly" button

### 2. AssemblyConfigurator
- Load custom assemblies
- Allow editing

### 3. Project Store
- Track which assemblies used per project
- Analytics on most-used

---

## Import/Export

### Export Format (JSON)
```json
{
  "version": "1.0",
  "exportedAt": "2026-02-12T22:00:00Z",
  "assemblies": [
    {
      "id": "uuid",
      "name": "Bathroom Rough-In",
      "items": [...]
    }
  ]
}
```

### Import
- Drag & drop JSON file
- Merge or replace options
- Conflict resolution

---

## MVP Scope

### Phase 1 (Now)
- [ ] CustomAssembly data model
- [ ] localStorage persistence
- [ ] Create assembly from scratch
- [ ] Create from current measurement ("Save as Assembly")
- [ ] List/search custom assemblies
- [ ] Use custom assembly on new measurement

### Phase 2 (Later)
- [ ] Edit existing assemblies
- [ ] Delete assemblies
- [ ] Import/export JSON
- [ ] Categories and favorites
- [ ] Pre-built from drawing analysis

### Phase 3 (Future)
- [ ] Cloud sync
- [ ] Team sharing
- [ ] Assembly marketplace
- [ ] AI-suggested assemblies based on measurement name
