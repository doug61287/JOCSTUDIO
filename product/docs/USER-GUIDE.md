# JOCHero User Guide

Welcome to JOCHero - the AI-powered JOC takeoff tool that makes estimating faster and smarter.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Takeoff Tool](#the-takeoff-tool)
3. [Translation Machine](#translation-machine)
4. [Guided Estimation Assistant](#guided-estimation-assistant)
5. [Learning Insights Dashboard](#learning-insights-dashboard)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Time Setup

1. **Upload a PDF** - Click "Upload PDF" or drag-and-drop your construction drawing
2. **Calibrate Scale** - Click the ruler icon and draw a line on a known dimension
3. **Start Measuring** - Use the toolbar to select measurement tools
4. **Assign JOC Items** - Click "Guide Me" to find the right line items

### The Interface

```
┌─────────────────────────────────────────────────────────────┐
│ 📐 JOCHero  [BETA]     🔮 Translate  📄 Upload  📊  ☀️  👤 │
├─────────────────────────────────────────────────────────────┤
│ [V Select] [📏 Line] [🔢 Count] [⬛ Area] [🏠 Space] [📐]  │
├────────────────────────────────────┬────────────────────────┤
│                                    │  📏 Measurements       │
│                                    │  ├─ 📏 Line: 45.2 LF   │
│         PDF VIEWER                 │  ├─ 🔢 Count: 12 EA    │
│                                    │  └─ ⬛ Area: 340 SF    │
│                                    │                        │
│                                    │  📊 Summary            │
│                                    │  Total: $12,450.00     │
└────────────────────────────────────┴────────────────────────┘
```

---

## The Takeoff Tool

### Measurement Types

| Tool | Shortcut | Use For | Unit |
|------|----------|---------|------|
| 📏 **Line** | `L` | Walls, pipes, conduit, linear items | LF |
| 🔢 **Count** | `C` | Fixtures, outlets, sprinklers | EA |
| ⬛ **Area** | `A` | Flooring, painting, ceilings | SF |
| 🏠 **Space** | `S` | Rooms with finishes | SF + LF perimeter |

### How to Measure

**Lines:**
1. Select the Line tool (or press `L`)
2. Click the start point
3. Click the end point
4. Line measurement appears in the panel

**Counts:**
1. Select the Count tool (or press `C`)
2. Click on each item to count
3. Each click adds +1 to the count

**Areas:**
1. Select the Area tool (or press `A`)
2. Click to place polygon points
3. Double-click or press `Enter` to close the shape
4. Area is calculated automatically

**Spaces (Rooms):**
1. Select the Space tool (or press `S`)
2. Draw the room boundary (like Area)
3. Enter the room name when prompted
4. Both area AND perimeter are calculated

### Calibration

Accurate measurements require proper calibration:

1. Click the **📐 Calibrate** button in the toolbar
2. Draw a line on a known dimension (e.g., a door that's 3'0")
3. Enter the real-world length
4. All measurements will now be accurate!

---

## Translation Machine

The Translation Machine converts plain English descriptions into JOC line items.

### How to Access

Click the **🔮 Translate** button in the header.

### Three Modes

#### 1. ✨ Translate Mode (Default)
Describe work in plain English and get matching JOC items.

**Example:**
```
Input: "install 10 sprinkler heads in corridor"

Output:
├─ Keywords: sprinkler, heads, corridor
├─ Quantity Detected: 10
├─ Suggested Division: 21 (Fire Suppression)
└─ Top Matches:
   1. 21131113-0001 - Pendant Sprinkler Head ($45.20/EA)
   2. 21131113-0002 - Upright Sprinkler Head ($42.80/EA)
```

#### 2. 🔍 Search Mode
Search by task code or keywords.

**Examples:**
- `21131113` - Find all items starting with this code
- `sprinkler` - Find all items containing "sprinkler"
- `5/8 drywall` - Find 5/8" drywall items

#### 3. 📁 Browse Mode
Explore the catalogue by CSI Division.

- Click a division to see its items
- 25 divisions available
- 65,331 total line items

### Smart Features

- **Synonym Expansion**: "AC" finds "air conditioning", "HVAC"
- **Quantity Extraction**: "100 LF of pipe" extracts qty: 100
- **Unit Detection**: "50 square feet" detects unit: SF
- **Division Hints**: Keywords suggest relevant CSI divisions

---

## Guided Estimation Assistant

The AI assistant that helps you find the exact JOC line item through conversation.

### How to Access

1. Create a measurement (line, count, area, or space)
2. In the Measurements panel, click **🤖 Guide Me**

### The Flow

```
🤖: What are you measuring?
    [🧱 Wall] [⬜ Ceiling] [🟫 Floor] [🚿 Plumbing] ...

You: *clicks Wall*

🤖: What type of wall work?
    [📋 Drywall] [🔩 Framing] [🔨 Demo] [🎨 Paint]

You: *clicks Drywall*

🤖: What drywall specification?
    [1/2" Regular] [5/8" Regular] [5/8" Fire-Rated] ...

You: *clicks 5/8" Fire-Rated*

🤖: Found 3 matching items:
    ⭐ 09290513-0045 - 5/8" Type X Gypsum Board - $2.14/SF
    • 09290513-0046 - 5/8" Type X with Finishing - $3.87/SF

You: *clicks to select*

✅ Item assigned to measurement!
```

### Available Categories

| Icon | Category | Subcategories |
|------|----------|---------------|
| 🧱 | Wall | Drywall, Framing, Demo, Paint |
| ⬜ | Ceiling | ACT, Grid, Drywall, Demo |
| 🟫 | Flooring | VCT, LVT, Carpet, Epoxy, Tile |
| 🚿 | Plumbing | Copper Pipe, PVC, Fixtures |
| 🔥 | Fire Protection | Sprinklers, Pipe, Alarms |
| ⚡ | Electrical | Outlets, Switches, Conduit, Wire, Lighting |
| ❄️ | HVAC | Duct, Diffusers, VAV |
| 🚪 | Doors | Hollow Metal, Wood, Hardware |
| 🔨 | Demolition | Interior, Masonry, Concrete, Hazmat |
| 🪨 | Concrete | Slab, Elevated, Curb, Repair |
| 🧱 | Masonry | CMU, Brick, Repair |
| 🚿 | Specialties | Toilet Accessories, Lockers, Signage |
| 🧊 | Insulation | Batt, Rigid, Spray Foam |
| 🪟 | Windows | Punched, Storefront, Interior |
| 🏗️ | Site Work | Paving, Curb, Fencing |

### Free-Text Search

Can't find what you need in the categories? Type to search!

```
🤖: What are you measuring?
You: *types* "rooftop unit replacement"
🤖: Found 5 items matching "rooftop unit replacement":
    1. 23741300-0045 - RTU Replacement, 10 Ton
    ...
```

---

## Learning Insights Dashboard

Track how the AI learns from your selections and get recommendations.

### How to Access

Click the **📊** icon in the header, or go to `/insights`.

### Dashboard Tabs

#### Overview
- **Stats Cards**: Total selections, sessions, avg time, conversion
- **Top Paths**: Most common navigation patterns
- **Top Items**: Most frequently selected JOC items
- **Learning Progress**: Visual progress toward training goals
- **AI Recommendations**: Smart suggestions based on your data

#### Paths
Full breakdown of navigation paths with usage percentages.

#### Items
Complete table of all selected items, ranked by frequency.

#### Keywords
Shows what keywords lead to what items - this trains the Translation Machine!

#### Timeline
Chronological view of recent selections with timing and path data.

### AI Recommendations

The system analyzes your data and suggests improvements:

| Type | What It Means |
|------|---------------|
| ⚡ **Shortcut** | An item is selected frequently - add to favorites |
| 🐢 **Slow Path** | A navigation path takes too long - simplify it |
| 🎯 **Keyword Match** | A keyword strongly predicts an item - auto-suggest it |
| 📏 **Popular by Type** | An item is popular for a measurement type - show first |
| 🔧 **Deep Path** | A path requires many clicks - add a shortcut |
| ➕ **Missing Category** | Items found via search should be in the tree |

### Learning Health Score

```
Health Score: 73%
├─ Selections:     30/50 points
├─ Sessions:       20/20 points
├─ Path Diversity: 15/20 points
├─ Keyword Data:   5/15 points
└─ Timing Data:    3/15 points
```

---

## Keyboard Shortcuts

### Measurement Tools
| Key | Action |
|-----|--------|
| `V` | Select tool |
| `L` | Line tool |
| `C` | Count tool |
| `A` | Area tool |
| `S` | Space tool |
| `H` | Pan/Hand tool |

### Navigation
| Key | Action |
|-----|--------|
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |
| `Esc` | Cancel current action |

### Editing
| Key | Action |
|-----|--------|
| `Delete` | Delete selected measurement |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |

---

## Tips & Best Practices

### For Faster Takeoffs

1. **Calibrate First** - Always calibrate before measuring
2. **Use Keyboard Shortcuts** - Much faster than clicking
3. **Use Guide Me** - Faster than searching 65k items
4. **Group Similar Work** - Measure all walls, then all ceilings

### For Better AI Learning

1. **Complete the Flow** - Don't cancel mid-selection
2. **Use Keywords** - Type specific terms when searching
3. **Be Consistent** - Use the same paths for similar items
4. **Check Recommendations** - Act on AI suggestions

### For Accurate Estimates

1. **Double-Check Scale** - Verify calibration on multiple dimensions
2. **Apply Coefficient** - Set the location factor (Bronx = 1.20)
3. **Review Before Export** - Check all line items before exporting
4. **Export to CSV** - Import into your proposal system

---

## Need Help?

- **In-App**: Click the Help icon or press `H`
- **Email**: support@jochero.com
- **Feedback**: Use the feedback widget in the app

---

*JOCHero v1.0 Beta - Making JOC estimating faster for NYC H+H contractors*
