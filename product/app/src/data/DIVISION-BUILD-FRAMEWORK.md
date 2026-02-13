# JOCHero Division Build Framework 🏗️

## Overview
This document defines the standard process for building out each CSI division in JOCHero. Division 21 (Fire Protection) is the reference implementation.

---

## Phase 1: Catalogue Analysis

### Step 1.1: Identify Task Code Prefixes
```bash
# Find all unique prefixes for Division XX
cat nyc-hh-ctc-full.json | jq -r '.[] | select(.taskCode | startswith("XX")) | .taskCode[:8]' | sort -u
```

### Step 1.2: Categorize by Prefix
For each prefix, document:
- **Count**: How many items
- **Sample**: Representative item description
- **Keywords**: What estimators call it
- **Workflow**: `measure` (LF/SF) or `count` (EA) or `lump`

Example from Division 21:
```
21131300: 209 items - Wet Pipe Sprinkler (heads, assemblies) - COUNT
21134100:  60 items - CPVC Sprinkler Pipe - MEASURE (has fittings)
21011091:  28 items - Relocation Work - COUNT
```

### Step 1.3: Check for Quantity Multipliers 💰
```bash
# Check tier-map.json for division multipliers
python3 -c "
import json
with open('tier-map.json') as f:
    tiers = json.load(f)
divXX = {k:v for k,v in tiers.items() if k.startswith('XX')}
print(f'Items with multipliers: {len(divXX)}')
# Group by prefix
prefixes = {}
for k in divXX:
    p = k[:8]
    if p not in prefixes: prefixes[p] = 0
    prefixes[p] += 1
for p in sorted(prefixes.keys()):
    print(f'{p}: {prefixes[p]} items')
"
```

**Division 21 Results:**
- 21051900: 5 items (Gauges)
- 21131300: 196 items (Wet pipe) ← 💰 THE BIG ONE
- 21131600: 34 items (Dry pipe)
- 21131900: 2 items (Preaction)

---

## Phase 2: Division Mapping File

Create a dedicated mapping file: `src/data/divisionXX-mapping.ts`

### Step 2.1: Define Interface
```typescript
export interface DivisionXXMapping {
  searchTerms: string[];      // What estimators type
  taskCodePrefix: string;     // H+H prefix (8 chars)
  category: string;           // Logical grouping
  unit: 'LF' | 'EA' | 'SF' | 'HR';
  workflow: 'measure' | 'count' | 'lump';
  description: string;
}
```

### Step 2.2: Map Each Prefix
```typescript
export const divisionXXMappings: DivisionXXMapping[] = [
  {
    searchTerms: [
      'primary term', 'alternate term', 'abbreviation',
      'common misspelling', 'trade slang'
    ],
    taskCodePrefix: 'XXXXXXXX',
    category: 'Category Name',
    unit: 'EA',
    workflow: 'count',
    description: 'What this category contains'
  },
  // ... more mappings
];
```

### Step 2.3: Add Size Synonyms (if applicable)
```typescript
export const pipeSizeSynonyms: Record<string, string> = {
  '3/4': '3/4"',
  '1-1/2': '1-1/2"',
  '1.5': '1-1/2"',
  'inch and a half': '1-1/2"',
};
```

### Step 2.4: Add Type Synonyms (if applicable)
```typescript
export const headTypeSynonyms: Record<string, string[]> = {
  'pendent': ['pendent', 'pendant', 'hanging', 'drop', 'ceiling'],
  'upright': ['upright', 'up', 'standing'],
};
```

---

## Phase 3: Search Configuration

### Step 3.1: Add KEYWORD_SYNONYMS
Location: `src/data/jocCatalogue.ts`

```typescript
// Division XX - [NAME]
'term estimator uses': ['catalogue term', 'related term'],
'abbreviation': ['full expansion'],
'misspelling': ['correct spelling'],
```

### Step 3.2: Add DIVISION_KEYWORDS
```typescript
'search term': 'XX',  // Maps term to division code
```

### ⚠️ Step 3.3: Product vs Service Disambiguation
**CRITICAL LESSON**: Some searches return services before products.

Example: "sprinkler head" returned:
- ❌ 21011091 (Relocate head - SERVICE) 
- ✅ 21131300 (Actual head - PRODUCT)

**Solution**: Add to `PRODUCT_SEARCH_BOOSTS`:
```typescript
export const PRODUCT_SEARCH_BOOSTS: Record<string, string[]> = {
  'sprinkler head': ['21131300'],  // Boost products over services
  'floor drain': ['22131913'],
};
```

### Step 3.4: Handle Inch/Size Formats
H+H catalogue uses `3"` not `3 inch`. The search engine automatically:
- Removes "inch" when pipe size detected
- Normalizes sizes to catalogue format

---

## Phase 4: Assemblies with Companion Items

### The One Rule: Fittings Always Belong to a Parent
No orphan fittings. Every fitting measurement has a `parentMeasurementId`.

### Step 4.1: Identify Pipe → Fitting Relationships
When user measures pipe, auto-create fitting children:
```typescript
{
  id: 'fp-pipe-3',
  name: '3" CPVC Fire Pipe',
  items: [
    { id: 'pipe', category: 'primary', quantityFactor: 1.0 },
    { 
      id: 'elbow', 
      category: 'companion',  // ← Fitting
      quantityFactor: 0.05,   // 1 per 20 LF
      fittingType: 'elbow',
      note: 'Elbow allowance: ~1 per 20 LF'
    },
    { 
      id: 'tee', 
      category: 'companion',
      quantityFactor: 0.03,   // 1 per 33 LF
      fittingType: 'tee',
    },
  ]
}
```

### Step 4.2: Identify Head → Accessory Relationships
```typescript
{
  id: 'fp-head-pendent',
  name: 'Pendent Sprinkler Head',
  items: [
    { id: 'head', category: 'primary', quantityFactor: 1.0 },
    { 
      id: 'escutcheon', 
      category: 'companion',
      quantityFactor: 1.0,  // 1:1 with head
      note: 'Escutcheon (cover plate)'
    },
  ]
}
```

### Step 4.3: Fitting Workflow (Simplified)
Previous: 3-button UI (Use Estimate / Count Now / Later) ← TOO COMPLEX

Current: **Auto-create with estimates**
1. User measures pipe (e.g., 350 LF)
2. System auto-creates fitting children with `Math.ceil()` estimates
3. Fittings appear grouped under parent in MeasurementPanel
4. **Hard Count button** (🖱️) on hover → reset to 0 for precise counting

```typescript
// Fittings auto-populate with Math.ceil
const estimatedQty = Math.ceil(parentValue * quantityFactor);
```

### Step 4.4: Assembly Categories
| Category | Behavior | Checkbox | Example |
|----------|----------|----------|---------|
| `primary` | Always included | Locked ✓ | Main pipe, fixture |
| `typical` | Pre-checked | Can uncheck | Standard fittings |
| `companion` | Auto-creates child measurement | N/A | Elbows, escutcheons |
| `optional` | Unchecked | Can check | Special items |

---

## Phase 5: UI Enhancements

### Step 5.1: Clean Item Names
H+H descriptions are verbose:
> "FIRE PROTECTION - SPRINKLER HEAD - PENDENT - CHROME - 1/2" ORIFICE"

Use `getCleanItemName()` to extract:
> "Sprinkler Head"

```typescript
function getCleanItemName(description: string): string {
  // Extract meaningful type from verbose H+H description
  // See MeasurementPanel.tsx for implementation
}
```

### Step 5.2: Multiplier Indicator
When item has quantity tiers, show in UI:
```
💰 Multiplier: Qty 26-50 • Save $158.86
```

Implementation in MeasurementPanel.tsx:
- Check `hasAddDeductTiers(taskCode)`
- Calculate with `calculateAdjustedPrice(taskCode, quantity, basePrice)`
- Show TrendingDown icon for deductions

### Step 5.3: Grouped Measurements
Fittings render under their parent pipe:
```
📏 3" CPVC Fire Pipe — 350 LF — $10,041.50
   └─ 🔧 3" Elbow — 18 EA — $2,120.76
   └─ 🔧 3" Tee — 11 EA — $1,898.82
```

---

## Phase 6: Brain Visualization

Update `fire-plumbing-brain.html` (or create division-specific):

### Data Structure for Visualization
```javascript
const divXXCategories = [
  { 
    prefix: 'XXXXXXXX', 
    name: 'Category Name', 
    shortName: 'Short',
    count: 123,              // Items in catalogue
    multiplierCount: 45,     // Items with qty tiers
    description: 'User-friendly description',
    keywords: ['search', 'terms'],
    hasFittings: true/false
  },
];
```

---

## Phase 7: Testing Checklist

### Search Tests
- [ ] Primary term returns correct items
- [ ] Size + type (e.g., "3 inch sprinkler pipe")
- [ ] Abbreviation (e.g., "FDC", "WC")
- [ ] Misspelling (e.g., "pendant" for "pendent")
- [ ] **Products rank above services** (the disambiguation test)
- [ ] Division filter works

### Assembly Tests
- [ ] Assembly triggers on measurement name match
- [ ] Primary items always included
- [ ] Companion items auto-create as children
- [ ] Quantity factors calculate correctly with Math.ceil()
- [ ] Fittings grouped under parent in panel

### Multiplier Tests
- [ ] Items with tiers show multiplier indicator
- [ ] Correct tier selected based on quantity
- [ ] Savings calculated and displayed
- [ ] Price adjusts with quantity changes

### UI Tests
- [ ] Clean names display (not verbose H+H)
- [ ] Hard Count button works (resets to 0)
- [ ] Count tool auto-selects for continuing
- [ ] Visibility filter respects `m.visible`

---

## Files Modified Per Division

| File | What to Add |
|------|-------------|
| `src/data/divisionXX-mapping.ts` | **NEW** - Full division reference |
| `src/data/jocCatalogue.ts` | KEYWORD_SYNONYMS, DIVISION_KEYWORDS, PRODUCT_SEARCH_BOOSTS |
| `src/data/assemblies.ts` | ASSEMBLY_LIBRARY + ASSEMBLY_PATTERNS |
| `src/components/AssemblyConfigurator.tsx` | ASSEMBLY_CONFIGS with companion items |
| `src/components/MeasurementPanel.tsx` | Any division-specific display logic |
| `fire-plumbing-brain.html` | Visualization data |
| `src/types/index.ts` | AssemblyCategory (if new category) |

---

## Division Status Tracker

| Division | Name | Items | Multipliers | Status | Notes |
|----------|------|-------|-------------|--------|-------|
| 03 | Concrete | 2,847 | ? | ✅ Basic | Slab assemblies |
| 04 | Masonry | 1,523 | ? | ✅ Basic | CMU assemblies |
| 08 | Openings | ~2,000 | ? | ✅ Basic | Doors, storefront |
| 09 | Finishes | 8,234 | ? | ✅ Basic | Flooring, drywall, paint |
| **21** | **Fire Suppression** | **1,073** | **237** | ✅ **COMPLETE** | Reference implementation |
| **22** | **Plumbing** | **6,093** | **233** | 🔄 NEXT | Contractor specialty |
| 23 | HVAC | 7,823 | ? | ⬜ TODO | |
| 26 | Electrical | 9,234 | ? | ⬜ TODO | |

---

## Key Lessons from Division 21

### 1. Products vs Services
Search must disambiguate. "Sprinkler head" should return the physical head (21131300), not the relocation service (21011091).

### 2. One Rule for Fittings
Every fitting belongs to a parent. No orphans. No 3-button UI confusion. Auto-create with estimates, let user refine.

### 3. Quantity Tiers = Hidden Money
196 sprinkler items have volume discounts most estimators don't apply. Make this visible and automatic.

### 4. Search Scoring Matters
- Skip items with score ≤ 0 (not just === 0)
- Require ALL words to match for multi-word searches
- Boost products over services

### 5. Clean Names for Humans
Verbose H+H descriptions hurt UX. Extract the meaningful part for display.

### 6. Grouped Display
Fittings nested under parent pipe is intuitive. Users immediately understand the relationship.

---

## Quick Reference: Division 21 Structure

```
Division 21 - Fire Protection (1,073 items)
├── 21131300 - Wet Pipe Sprinkler (209 items, 196 multipliers) 💰
│   ├── Assembly: fp-head-pendent
│   │   ├── Primary: Head
│   │   └── Companion: Escutcheon
│   ├── Assembly: fp-head-upright
│   └── Assembly: fp-head-sidewall
├── 21134100 - Sprinkler Pipe (60 items)
│   ├── Assembly: fp-pipe-3
│   │   ├── Primary: 3" CPVC Pipe
│   │   ├── Companion: 3" Elbow (0.05 factor)
│   │   └── Companion: 3" Tee (0.03 factor)
│   ├── Assembly: fp-pipe-1.5
│   └── Assembly: fp-pipe-1.25
├── 21131600 - Dry Pipe Systems (58 items, 34 multipliers) 💰
├── 21011091 - Relocation Work (28 items)
├── 21122300 - FD Valves (20 items)
├── 21121300 - Fire Hose (19 items)
├── 21122900 - Flow Detection (11 items)
├── 21111900 - Siamese/FDC (8 items)
└── ... 12 more categories
```

---

*Framework Version 2.0 - Updated with Division 21 lessons learned*
*Last updated: 2026-02-12*
