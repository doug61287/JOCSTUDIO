# Estinator UX Strategy

## The Core User Journey

### Persona: Mike, Electrical Estimator
- 15 years experience
- Bids 3-5 projects/month
- Uses Excel for takeoffs
- **Pain:** Misses scope gaps, spends hours reviewing specs
- **Goal:** Submit accurate bids faster

### The Workflow

```
1. DOCUMENT UPLOAD (30 seconds)
   ├─ Drag & drop PDFs
   ├─ Auto-classify (drawings, specs, addenda)
   └─ Processing indicator with progress

2. AI ANALYSIS (2-3 minutes)
   ├─ Extract schedules
   ├─ Build room scope
   ├─ Detect conflicts
   └─ Generate insights

3. REVIEW & ACT (5-10 minutes)
   ├─ Room-by-room scope view
   ├─ Conflict alerts with severity
   ├─ One-click RFI generation
   └─ Export to takeoff

4. TAKEOFF (ongoing)
   ├─ Draw measurements on PDF
   ├─ AI suggests assemblies from scope
   └─ Real-time pricing
```

---

## Key UX Principles

### 1. **Show, Don't Tell**
❌ Bad: "Found 5 conflicts"
✅ Good: "Room 101 has 2 doors but hardware schedule lists 1"

### 2. **Source Everything**
❌ Bad: "Gypsum board required"
✅ Good: "092900-2.1.A: Gypsum Board ASTM C1396 [Drawing A-501]"

### 3. **Action-Oriented**
❌ Bad: "Missing information detected"
✅ Good: "Generate RFI →" (one click)

### 4. **Progressive Disclosure**
- Default: High-level summary
- Click: Detailed view
- Deep click: Source document with highlight

### 5. **Trust but Verify**
- Show confidence scores
- Allow manual override
- Learn from corrections

---

## Screen-by-Screen Design

### Screen 1: Project Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  Bellevue Hospital Renovation          [Upload] [Share]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 PROJECT HEALTH                           🔍 QUICK ACTIONS│
│  ┌──────────────────────────────┐        ┌────────────────┐│
│  │  5 Documents Processed       │        │  Ask a question ││
│  │  25 Rooms Identified         │        │  about scope   ││
│  │  ⚠️  3 Issues Found          │        └────────────────┘│
│  │     (2 Critical)             │                          │
│  └──────────────────────────────┘        ┌────────────────┐│
│                                          │  Generate RFIs  ││
│  📁 DOCUMENTS (5)                        └────────────────┘│
│  ├── 📄 A-101 First Floor Plan    ✓ Analyzed              │
│  ├── 📄 A-102 Finish Schedule     ✓ Analyzed              │
│  ├── 📄 A-103 Door Schedule       ✓ Analyzed              │
│  ├── 📄 260000 Electrical Spec    ✓ Analyzed              │
│  └── 📄 Addendum 1                ⚠️  Changes detected     │
│                                                             │
│  🏢 ROOMS (25)                    ⚠️  INSIGHTS (3)         │
│  ┌────────────────────────┐      ┌──────────────────────┐  │
│  │ 101 - Office           │      │ 🔴 Door 101-A        │  │
│  │ 102 - Office           │      │    No hardware spec  │  │
│  │ 103 - Conference       │      ├──────────────────────┤  │
│  │ 104 - Restroom         │      │ 🟡 Room 102          │  │
│  │ + 21 more...           │      │    No floor finish   │  │
│  └────────────────────────┘      └──────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: Room Detail View
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Project          Room 101 - Office               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📐 AREA: 120 SF              🔨 FINISHES                   │
│                               ┌────────────────────────────┐│
│  🚪 DOORS (2)                 │ Floor:     Carpet         ││
│  ┌─────────────────────────┐  │ Base:      Vinyl          ││
│  │ 101-A  3'0"×7'0"  HM   │  │ Walls:     Painted GWB    ││
│  │ ⚠️ No hardware set      │  │ Ceiling:   ACT            ││
│  ├─────────────────────────┤  └────────────────────────────┘│
│  │ 101-B  3'0"×7'0"  HM   │                               │
│  │ ⚠️ No hardware set      │  ⚡ ELECTRICAL                │
│  └─────────────────────────┘  ┌────────────────────────────┐│
│                               │ Panel:     A              ││
│  💡 LIGHTING                  │ Circuits:  1, 2, 3, 4     ││
│  ┌─────────────────────────┐  │ Switches: 2-gang by door  ││
│  │ Type: LED 2×4 troffer   │  └────────────────────────────┘│
│  │ Quantity: 4             │                               │
│  └─────────────────────────┘  🔥 FIRE PROTECTION            │
│                               ┌────────────────────────────┐│
│  🌡️  HVAC                     │ Sprinkler: Yes            ││
│  ┌─────────────────────────┐  │ Coverage:  Complete       ││
│  │ VAV-1 (Ceiling)         │  │ Type:      Pendant        ││
│  │ CFM: 250                │  └────────────────────────────┘│
│  └─────────────────────────┘                                │
│                                                             │
│  [Generate RFI for this room]  [Add to Takeoff]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 3: Conflict/Insight Detail
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                      Conflict Details               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 CRITICAL: Missing Hardware Specification                │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Element:    Door 101-A                                  ││
│  │ Location:   Room 101 (Office)                           ││
│  │ Impact:     Cannot price door hardware                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  📋 EVIDENCE                                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Door Schedule A-102 shows:                              ││
│  │   Door 101-A | 3'0"×7'0" | HM | [blank]               ││
│  │                                                         ││
│  │ Hardware Schedule A-201 shows:                          ││
│  │   Set 1: Entry function                                 ││
│  │   Set 2: Office function                                ││
│  │   (No assignment for 101-A)                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  💡 RECOMMENDATION                                          │
│  Door 101-A likely needs Set 2 (Office function) based on   │
│  room type. Confirm with architect.                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ✏️ SUGGESTED RFI TEXT                                   ││
│  │                                                         ││
│  │ What hardware set is assigned to Door 101-A in Room 101?││
│  │                                                         ││
│  │ Door 101-A appears on Door Schedule A-102 but has no    ││
│  │ hardware set reference. Please assign hardware set per  ││
│  │ Hardware Schedule A-201.                                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  [📋 Copy RFI Text]  [📧 Email Architect]  [✓ Mark Resolved]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 4: Natural Language Query
```
┌─────────────────────────────────────────────────────────────┐
│  Ask Estinator about this project                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ How many rooms have VCT flooring?              [Ask]    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  💬 CONVERSATION                                            │
│                                                             │
│  You: "How many rooms have VCT flooring?"                   │
│                                                             │
│  Estinator:                                                 │
│  3 rooms have VCT flooring:                                 │
│                                                             │
│  • Room 103 (Conference) - Finish Schedule A-102           │
│  • Room 205 (Break Room) - Finish Schedule A-102           │
│  • Room 301 (Storage) - Finish Schedule A-102              │
│                                                             │
│  📊 Would you like to:                                      │
│  [Add all to takeoff]  [View room details]  [Export list]   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  You: "What doors are missing hardware specs?"              │
│                                                             │
│  Estinator:                                                 │
│  I found 4 doors without hardware specifications:           │
│                                                             │
│  • Door 101-A (Room 101)                                    │
│  • Door 101-B (Room 101)                                    │
│  • Door 103-A (Room 103)                                    │
│  • Door 205-A (Room 205)                                    │
│                                                             │
│  [Generate RFIs for all 4]                                  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Suggested questions:                                       │
│  • "Show me all restrooms"                                  │
│  • "What fire-rated doors are required?"                    │
│  • "Which rooms have the most equipment?"                   │
│  • "Compare room 101 vs room 102"                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Micro-Interactions

### Upload Success
```
Before: [Spinner] "Processing..."
After:  [✓] "Found 25 rooms, 45 doors, 12 issues"
        [View Dashboard] [Ask Questions]
```

### Insight Alert
```
┌────────────────────────────────────────┐
│ ⚠️ New Issue Detected                  │
│ Room 105 has doors but no finish spec  │
│ [View] [Dismiss] [Generate RFI]        │
└────────────────────────────────────────┘
```

### Confidence Indicators
```
Room 101 - Office
├─ Floor: Carpet (95% confident)
├─ Walls: Painted GWB (98% confident)
└─ Ceiling: ACT (87% confident) [Verify?]
```

---

## Mobile Considerations

Estimators are often on-site or in the field:

### Mobile-First Features
- **Photo upload:** Snap equipment tags, upload for analysis
- **Voice queries:** "How many VAV boxes in this project?"
- **Offline mode:** View cached project data
- **Quick actions:** One-tap RFI generation

### Responsive Breakpoints
```
Desktop (1200px+): Full 3-column layout
Tablet (768px):   2-column, collapsible sidebar
Mobile (<768px):  Single column, tabbed navigation
```

---

## Onboarding Flow

### First-Time User
```
1. Welcome Screen
   "Estinator reads construction documents so you don't have to"

2. Demo Project
   "Try it with a sample project"
   [Upload Demo Project]

3. First Analysis
   "We've analyzed your project. Here's what we found..."
   ├─ 25 rooms identified
   ├─ 3 potential issues
   └─ 1 missing specification

4. Value Demonstration
   "We found an issue that could have cost you $5,000"
   [See How]

5. First Action
   "Generate your first RFI"
   [Create RFI]
```

---

## Error States

### Document Upload Failed
```
❌ Couldn't process A-101.pdf

Possible reasons:
• File is password protected
• File is corrupted
• Unsupported format (try PDF, not DWG)

[Retry] [Skip] [Contact Support]
```

### Low Confidence Analysis
```
⚠️ Low confidence on Room 103 finishes

The document quality is poor. We recommend:
• Requesting a clearer scan
• Manually verifying this room
• Contacting support for help

[Manual Entry] [Request New Scan]
```

---

## Success Metrics

### User Adoption
- Time to first project: < 5 minutes
- Documents uploaded per user: > 3
- Questions asked per project: > 5

### Value Delivery
- Issues found per project: Avg 5-10
- RFIs generated: Avg 3-5
- Time saved vs manual: 4-6 hours

### User Satisfaction
- NPS: > 50
- Daily active users: > 30%
- Feature usage: 80% use Q&A, 60% use RFIs

---

## Next Steps

1. **Build wireframes** in Figma
2. **User testing** with 5 real estimators
3. **Component library** (React + Tailwind)
4. **Design system** documentation
