# JOCHero Division Build Framework 🏗️

## Overview
This document defines the standard process for building out each CSI division in JOCHero. Follow this framework to ensure consistency across all divisions.

---

## Phase 1: Catalogue Analysis

### Step 1.1: Identify Task Code Prefixes
```bash
# Find all unique prefixes for Division XX
cat nyc-hh-ctc-full.json | jq -r '.[] | select(.taskCode | startswith("XX")) | .taskCode[:8]' | sort -u
```

### Step 1.2: Categorize Items
For each prefix, identify:
- **Line items (LF)** - Measured by length (pipe, cable, etc.)
- **Count items (EA)** - Individual items (heads, fixtures, etc.)
- **Area items (SF)** - Measured by area
- **Assemblies** - Pre-priced complete systems

### Step 1.3: Document Price Ranges
Create a quick reference table:
| Category | Task Code Range | Unit | Price Range |
|----------|-----------------|------|-------------|
| Pipe 3/4" | XXXXXXXX-0003 | LF | $X.XX |
| ... | ... | ... | ... |

---

## Phase 2: Search Synonyms

### Step 2.1: Identify Trade Language
Interview estimators or review drawings to understand:
- What terms do they use? (e.g., "pendant" vs catalogue "pendent")
- Common abbreviations (FDC, ACT, VCT, CMU)
- Size formats ("3 inch", "3"", "three inch")

### Step 2.2: Add to KEYWORD_SYNONYMS
Location: `src/data/jocCatalogue.ts`

```typescript
// Template for new division
// Division XX - [DIVISION NAME]
'term estimator uses': ['catalogue term', 'related term'],
'abbreviation': ['full name'],
'common misspelling': ['correct spelling'],
```

### Step 2.3: Add Division Keywords
```typescript
// In DIVISION_KEYWORDS object
'term': 'XX',  // Maps search term to division code
```

### Step 2.4: Handle Special Cases
- **Size extraction**: If division uses sizes (pipe, conduit), ensure `extractPipeSize()` handles the formats
- **Unit conversion**: Flag items where measurement unit differs from catalogue unit

---

## Phase 3: Assemblies with Companion Items

There are **TWO** assembly systems to update:

### A. Simple Assemblies (`src/data/assemblies.ts`)
Used for quick suggestions in the measurement panel dropdown.

### B. Full Assembly Configurator (`src/components/AssemblyConfigurator.tsx`)
Shows the rich UI with checkboxes, categories, and search.

---

### Step 3.1: Identify Common Workflows
What does an estimator typically price together?
- Pipe + fittings + hangers
- Fixture + trim + connection
- Demo + disposal + patching

### Step 3.2: Create Simple Assembly (assemblies.ts)
Location: `src/data/assemblies.ts`

```typescript
{
  id: 'div-XX-item-name',           // Unique ID
  name: 'User-Friendly Name',       // What user sees
  description: 'Detailed description with scope',
  category: 'category-name',        // Must be in AssemblyCategory type
  keywords: ['search', 'terms'],    // For matching
  applicableTo: ['line', 'polyline', 'count', 'area'], // Measurement types
  createdBy: 'system',
  items: [
    {
      jocItem: {
        taskCode: 'XXXXXXXX-XXXX',
        description: 'Full H+H description',
        unit: 'XX',
        unitCost: XX.XX,
      },
      quantityFactor: 1.0,          // 1.0 = same as measurement
      notes: 'Optional explanation',
    },
  ],
}
```

### Step 3.3: Create Full Configurator Assembly (AssemblyConfigurator.tsx)
Location: `src/components/AssemblyConfigurator.tsx` → `ASSEMBLY_CONFIGS` array

```typescript
{
  id: 'div-XX-item-name',
  name: 'User-Friendly Name',
  matchPatterns: ['pattern 1', 'pattern 2'],  // Triggers configurator
  measurementTypes: ['line', 'polyline', 'count', 'area'],
  items: [
    {
      id: 'primary-item',
      jocItem: { taskCode: 'XX', description: '...', unit: 'XX', unitCost: XX },
      category: 'primary',        // Always included, can't uncheck
      quantityFactor: 1.0,
    },
    {
      id: 'typical-item',
      jocItem: { ... },
      category: 'typical',        // Pre-checked, recommended
      quantityFactor: 0.05,
      note: 'Fitting allowance: 1 per 20 LF',
    },
    {
      id: 'optional-item',
      jocItem: { ... },
      category: 'optional',       // Unchecked, available to add
      quantityFactor: 0.02,
      note: 'Add for special conditions',
    },
  ],
}
```

### Item Categories Explained
| Category | Behavior | Example |
|----------|----------|---------|
| `primary` | Always included, cannot uncheck | Main pipe, fixture |
| `typical` | Pre-checked, can uncheck | Fittings, escutcheons |
| `optional` | Unchecked, can add | Guards, special fittings |

### Step 3.4: Add Pattern Matching (assemblies.ts)
```typescript
// In ASSEMBLY_PATTERNS array
{ pattern: /\bsearch pattern/i, assemblyIds: ['assembly-id'], boost: 90 },
```

### Step 3.5: Add Category to Types (if new)
Location: `src/types/index.ts`
```typescript
export type AssemblyCategory = 
  | 'existing-categories'
  | 'new-category';  // Add new category
```

### Step 3.6: Update applicableTo Types (if needed)
Ensure measurement types are in the Assembly type:
```typescript
applicableTo: ('line' | 'polyline' | 'area' | 'count' | 'space')[];
```

---

## Phase 4: Cross-Division References

### Step 4.1: Identify Cross-Division Items
Some items in one division are commonly used with another:
- Division 22 galvanized pipe → used in Division 21 fire protection
- Division 26 conduit → used with Division 27 communications

### Step 4.2: Document in DIVISION-MAPPING-NOTES.md
Note these relationships for future integration.

---

## Phase 5: Testing Checklist

### Search Tests
- [ ] Size + item type (e.g., "3 inch sprinkler pipe")
- [ ] Abbreviation (e.g., "FDC")
- [ ] Misspelling (e.g., "pendant" for "pendent")
- [ ] Generic term (e.g., "sprinkler head")
- [ ] Division code prefix (e.g., "21134100")

### Assembly Tests
- [ ] Assembly appears when naming measurement
- [ ] All companion items included
- [ ] Quantity factors calculate correctly
- [ ] Pattern matching triggers correctly

### Results Quality
- [ ] Top results are from correct division
- [ ] Division badges display correctly
- [ ] Full descriptions visible
- [ ] Prices accurate

---

## Division Status Tracker

| Division | Name | Status | Notes |
|----------|------|--------|-------|
| 01 | General Requirements | ⬜ TODO | |
| 02 | Existing Conditions | ⬜ TODO | |
| 03 | Concrete | ✅ DONE | Basic assemblies |
| 04 | Masonry | ✅ DONE | CMU assemblies |
| 05 | Metals | ⬜ TODO | |
| 06 | Wood/Plastics | ⬜ TODO | |
| 07 | Thermal/Moisture | ⬜ TODO | |
| 08 | Openings | ✅ DONE | Doors, storefront |
| 09 | Finishes | ✅ DONE | Drywall, flooring, paint |
| 10 | Specialties | ⬜ TODO | |
| 11 | Equipment | ⬜ TODO | |
| 12 | Furnishings | ⬜ TODO | |
| 21 | Fire Suppression | ✅ DONE | Full mapping + assemblies |
| 22 | Plumbing | 🔄 NEXT | Contractor specialty |
| 23 | HVAC | ⬜ TODO | |
| 26 | Electrical | ⬜ TODO | |
| 27 | Communications | ⬜ TODO | |
| 28 | Electronic Safety | ⬜ TODO | |

---

## Quick Commands

### Check items in a division
```bash
cat nyc-hh-ctc-full.json | jq '[.[] | select(.taskCode | startswith("XX"))] | length'
```

### Find items by description
```bash
cat nyc-hh-ctc-full.json | jq '.[] | select(.description | test("keyword"; "i"))'
```

### List unique units in division
```bash
cat nyc-hh-ctc-full.json | jq -r '.[] | select(.taskCode | startswith("XX")) | .unit' | sort -u
```

### Price range for a category
```bash
cat nyc-hh-ctc-full.json | jq '[.[] | select(.taskCode | startswith("XXXXXXXX")) | .unitCost] | {min: min, max: max, avg: (add/length)}'
```

---

## Files Modified Per Division

| File | What to Add |
|------|-------------|
| `src/data/jocCatalogue.ts` | KEYWORD_SYNONYMS + DIVISION_KEYWORDS |
| `src/data/assemblies.ts` | ASSEMBLY_LIBRARY + ASSEMBLY_PATTERNS |
| `src/components/AssemblyConfigurator.tsx` | ASSEMBLY_CONFIGS (full UI) |
| `src/types/index.ts` | AssemblyCategory (if new category) |
| `src/data/DIVISION-MAPPING-NOTES.md` | Cross-division notes |
| `src/data/division{XX}-mapping.ts` | Optional detailed reference |

### Checklist Per Division
- [ ] Add synonyms to `KEYWORD_SYNONYMS`
- [ ] Add division to `DIVISION_KEYWORDS`  
- [ ] Add assemblies to `ASSEMBLY_LIBRARY`
- [ ] Add patterns to `ASSEMBLY_PATTERNS`
- [ ] Add configs to `ASSEMBLY_CONFIGS` (AssemblyConfigurator.tsx)
- [ ] Add category to `AssemblyCategory` type (if new)
- [ ] Test search with all synonym variations
- [ ] Test assembly configurator triggers
- [ ] Verify item descriptions not truncated

---

*Framework Version 1.0 - Division 21 as reference implementation*
