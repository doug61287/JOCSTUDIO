# Estinator Figma Screens Reference

> Visual reference for key screens and components

---

## 🖥️ Screen 1: Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐  🔍 Search...                                    🔔    [+ New] │
│ │ 📐      │                                                                 │
│ │Estinator│  ┌─────────────────────────────────────────────────────────┐   │
│ ├─────────┤  │ 🏥 Bellevue Hospital Renovation         2 hours ago    │   │
│ │ 🏠      │  │ 15th Floor Cardiology Wing                              │   │
│ │ Overview│  └─────────────────────────────────────────────────────────┘   │
│ │         │                                                                 │
│ │ 🏢Rooms │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ │   4  🔴 │  │   25     │ │   48     │ │    7     │ │   12     │         │
│ │         │  │ Rooms  🏢│ │ Doors  🚪│ │ Issues ⚠️│ │ Docs   📄│         │
│ │ 📄Docs  │  │ ✓ All    │ │          │ │ ↑ 2 crit ││          │         │
│ │   3  🟡 │  │ analyzed │ │          │ │          ││          │         │
│ │         │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│ │ 📊Insig │     ▓▓▓ green    ▓▓▓ blue     ▓▓▓ red      ▓▓▓ gray         │
│ │   4     │                                                                 │
│ │         │  ┌─────────────────────────────┐ ┌──────────────────────────┐ │
│ ├─────────┤  │ ⚠️ Critical Issues     View │ │ 📄 Documents        View │ │
│ │ ⚙️      │  │ all 4                       │ │ all                      │ │
│ │ Settings│  │                             │ │                          │ │
│ └─────────┘  │ 🔴 MISSING HARDWARE         │ │ 📐 A-101 Plan        ✓   │ │
│              │ 3 Doors Missing...          │ │ 📋 A-102 Finish      ✓   │ │
│              │                             │ │ 🚪 A-103 Door        ⚠️  │ │
│              │ Rooms: 101, 103             │ │ 🔧 Door Hardware     ⚠️  │ │
│              │                             │ │ 📝 Addendum 2        ✓   │ │
│              │ [Generate RFI →]            │ │                          │ │
│              │                             │ │                          │ │
│              │ 🟡 CEILING TYPE CONFLICT    │ │                          │ │
│              │ Room 103 ceiling...         │ │                          │ │
│              │                             │ │                          │ │
│              │ [View Conflict →]           │ │                          │ │
│              └─────────────────────────────┘ └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specs:
- **Frame:** 1440×900
- **Background:** #FAFAF9
- **Sidebar:** #0F172A, 260px width
- **Top Bar:** #FFFFFF, 72px height

---

## 🖥️ Screen 2: Rooms List (Grid View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐  🔍 Search...                                    🔔    [+ New] │
│ │ 📐      │                                                                 │
│ │Estinator│  ┌─────────────────────────────────────────────────────────┐   │
│ ├─────────┤  │ Rooms                                          [⊞] [☰] │   │
│ │ 🏠      │  │ 6 rooms • 4 with issues                                 │   │
│ │ Overview│  └─────────────────────────────────────────────────────────┘   │
│ │         │                                                                 │
│ │ 🏢Rooms │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│ │      ✓  │  │ 🛏️          │ │ 🛏️          │ │ 👩‍⚕️          │           │
│ │    BLUE │  │  (120px)     │ │  (120px)     │ │  (120px)     │           │
│ │         │  │  gradient    │ │  gradient    │ │  gradient    │           │
│ │ 📄Docs  │  │  blue        │ │  blue        │ │  amber       │           │
│ │         │  ├──────────────┤ ├──────────────┤ ├──────────────┤           │
│ │ 📊Insig │  │ Room 101    2│ │ Room 102     │ │ Room 103    3│           │
│ │         │  │ Patient Room │ │ Patient Room │ │ Nurse Station│           │
│ │         │  │              │ │              │ │              │           │
│ │         │  │ 180 SF       │ │ 180 SF       │ │ 320 SF       │           │
│ │         │  │ 2 Doors      │ │ 2 Doors      │ │ 3 Doors      │           │
│ │         │  │              │ │              │ │              │           │
│ │         │  │ [VCT][Paint] │ │ [VCT][Paint] │ │ [Resilient]  │           │
│ │         │  └──────────────┘ └──────────────┘ └──────────────┘           │
│ │         │                                                                 │
│ │         │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│ │         │  │ 🩺          │ │ 📦          │ │ 🚻          │           │
│ │         │  │  (120px)     │ │  (120px)     │ │  (120px)     │           │
│ │         │  │  gradient    │ │  gradient    │ │  gradient    │           │
│ │         │  │  blue        │ │  blue        │ │  amber       │           │
│ │         │  ├──────────────┤ ├──────────────┤ ├──────────────┤           │
│ │         │  │ Room 104    1│ │ Room 105     │ │ Room 106    1│           │
│ │         │  │ Exam Room    │ │ Storage      │ │ Restroom     │           │
│ └─────────┘  └──────────────┘ └──────────────┘ └──────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specs:
- **Grid:** 3 columns, 20px gap
- **Card Width:** 300px
- **Thumbnail Height:** 120px
- **Card Padding:** 20px

---

## 🖥️ Screen 3: Rooms List (List View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ┌─────────┐  🔍 Search...                                    🔔    [+ New] │
│ │ 📐      │                                                                 │
│ │Estinator│  ┌─────────────────────────────────────────────────────────┐   │
│ ├─────────┤  │ Rooms                                          [⊞] [☰] │   │
│ │ ...     │  │ 6 rooms • 4 with issues                                 │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ │         │                                                                 │
│ │         │  ┌─────────────────────────────────────────────────────────┐   │
│ │         │  │ 🛏️  Room 101 ─ Patient Room     180 SF • 2 doors    2  │   │
│ │         │  │         [VCT][Painted GWB][ACT]                   🔴  │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ │         │  ┌─────────────────────────────────────────────────────────┐   │
│ │         │  │ 🛏️  Room 102 ─ Patient Room     180 SF • 2 doors    ✓  │   │
│ │         │  │         [VCT][Painted GWB][ACT]                   🟢  │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ │         │  ┌─────────────────────────────────────────────────────────┐   │
│ │         │  │ 👩‍⚕️ Room 103 ─ Nurse Station    320 SF • 3 doors    3  │   │
│ │         │  │         [Resilient][Painted GWB][ACT]             🔴  │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ │         │  ┌─────────────────────────────────────────────────────────┐   │
│ │         │  │ 🩺  Room 104 ─ Exam Room        120 SF • 1 door     1  │   │
│ │         │  │         [VCT][Painted GWB][ACT]                   🟡  │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ │         │  ┌─────────────────────────────────────────────────────────┐   │
│ │         │  │ 📦  Room 105 ─ Storage          80 SF • 1 door      ✓  │   │
│ │         │  │         [Concrete][Painted CMU][Exposed]          🟢  │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ │         │  ┌─────────────────────────────────────────────────────────┐   │
│ │         │  │ 🚻  Room 106 ─ Restroom         60 SF • 1 door      1  │   │
│ │         │  │         [Tile][Tile][GWB]                         🟡  │   │
│ │         │  └─────────────────────────────────────────────────────────┘   │
│ └─────────┘                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specs:
- **Row Padding:** 16px 20px
- **Row Gap:** 12px
- **Left Border:** 4px (colored if issues)
- **Hover:** translateX(4px)

---

## 🖥️ Screen 4: Room Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Back to Rooms         Room 101 ─ Patient Room        [Export] [RFI →]   │
│                                        180 SF                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────┐ ┌───────────────────────────┐  │
│  │ 🔨 Finishes                             │ │ Quick Actions             │  │
│  │                                         │ │                           │  │
│  │ ┌─────────────┐ ┌─────────────┐ ┌──────┐│ │ [Generate RFI       →]   │  │
│  │ │ Floor       │ │ Walls       │ │Ceilin││ │                           │  │
│  │ │             │ │             │ │      ││ │ [Add to Takeoff     →]   │  │
│  │ │ VCT         │ │ Painted GWB │ │ ACT  ││ │                           │  │
│  │ └─────────────┘ └─────────────┘ └──────┘│ │ [Export Room Data   →]   │  │
│  │                                         │ │                           │  │
│  └─────────────────────────────────────────┘ └───────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────┐                                │
│  │ 🚪 Doors (2)                            │                                │
│  │                                         │                                │
│  │ ┌─────────────────────────────────────┐ │                                │
│  │ │ 101-A                3'6"×7'0" HM  │ │                                │
│  │ │                      🔴 No Hardware │ │                                │
│  │ └─────────────────────────────────────┘ │                                │
│  │                                         │                                │
│  │ ┌─────────────────────────────────────┐ │                                │
│  │ │ 101-B                3'0"×7'0" HM  │ │                                │
│  │ │                      🔴 No Hardware │ │                                │
│  │ └─────────────────────────────────────┘ │                                │
│  │                                         │                                │
│  └─────────────────────────────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Specs:
- **Layout:** 2 columns (main + sidebar)
- **Main:** Fill container
- **Sidebar:** 320px fixed
- **Card Padding:** 24px

---

## 🎨 Component Detail: Stat Card

```
┌─────────────────────────────┐
│                             │ ← Top accent bar (4px)
│ Total Rooms           🏢    │
│                             │
│ 25                          │
│                             │
│ ✓ All analyzed              │
│                             │
└─────────────────────────────┘

Specs:
├── Size: auto × auto
├── Padding: 24px
├── Gap: 12px (vertical)
├── Border-radius: 16px
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
├── Shadow: 0 1px 3px rgba(0,0,0,0.05)
│
├── Top Bar:
│   ├── Height: 4px
│   ├── Fill: Linear gradient
│   └── Colors by variant:
│       ├── Default: #3B82F6 → #2563EB
│       ├── Success: #22C55E → #16A34A
│       ├── Warning: #F59E0B → #D97706
│       └── Critical: #EF4444 → #DC2626
│
└── Typography:
    ├── Label: 14px, 500, #78716C
    ├── Value: 36px, 800, #1C1917
    └── Trend: 13px, 500, variant color
```

---

## 🎨 Component Detail: Room Card

```
┌────────────────────┐
│ 🛏️                │ ← Thumbnail area
│    (120px height)  │
│  gradient blue     │
├────────────────────┤
│ Room 101        2  │ ← Header with badge
│ Patient Room       │
│                    │
│ 180 SF             │
│ 2 Doors            │
│                    │
│ [VCT] [Painted]    │ ← Finish tags
└────────────────────┘

Specs:
├── Size: 300px × auto
├── Border-radius: 16px
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
│
├── Thumbnail:
│   ├── Height: 120px
│   ├── Fill: Linear gradient 135deg
│   ├── Default: #60A5FA → #2563EB
│   └── Issues: #FBBF24 → #D97706
│
├── Body:
│   ├── Padding: 20px
│   └── Gap: 16px
│
├── Title Row:
│   ├── "Room {number}": 18px, 700, #1C1917
│   └── Badge (if issues): Error style
│
├── Stats Row:
│   ├── Gap: 24px
│   ├── Value: 20px, 700, #1C1917
│   └── Label: 12px, 500, #78716C (uppercase)
│
└── Finish Tags:
    ├── Padding: 6px 12px
    ├── Border-radius: 6px
    ├── Fill: #F5F5F4
    └── Text: 12px, 500, #57534E
```

---

## 🎨 Component Detail: Insight Card

```
┌──────────────────────────────┐
▓ 🔴 MISSING HARDWARE          │ ← Left border (4px)
│                              │
│ 3 Doors Missing Hardware     │
│ Specs                        │
│                              │
│ Doors 101-A, 101-B, and      │
│ 103-A have no hardware set   │
│ assigned...                  │
│                              │
│ Rooms: 101, 103              │
│                              │
│ ┌──────────────────────────┐ │
│ │ Generate RFI          →  │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘

Specs:
├── Size: fill × auto
├── Padding: 20px
├── Gap: 12px
├── Border-radius: 12px
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
├── Left Border: 4px (variant color)
│
├── Header:
│   ├── Icon: 16px emoji
│   └── Category: 12px, 600, #78716C (uppercase)
│
├── Title: 16px, 600, #1C1917
├── Description: 14px, 400, #57534E
├── Rooms: 13px, 500, #78716C
│
└── Action Button:
    ├── Padding: 10px 16px
    ├── Border-radius: 8px
    ├── Fill: #F5F5F4
    ├── Border: 1px solid #E7E5E4
    └── Text: 14px, 600, #2563EB
```

---

## 🎨 Component Detail: Sidebar Item

```
Default State:              Active State:
┌────────────────────┐      ┌────────────────────┐
│ 🏠 Overview        │      │▓🏠 Overview        │
└────────────────────┘      └────────────────────┘
                            ▓ = Blue left border

Specs:
├── Size: fill × auto
├── Padding: 12px 16px
├── Gap: 12px
├── Border-radius: 8px
│
├── States:
│   ├── Default:
│   │   ├── Fill: Transparent
│   │   ├── Text: rgba(255,255,255,0.7)
│   │   └── Icon: 20px, same color
│   │
│   ├── Hover:
│   │   └── Fill: rgba(255,255,255,0.05)
│   │
│   └── Active:
│       ├── Fill: rgba(59,130,246,0.15)
│       ├── Text: #FFFFFF
│       └── Box-shadow: inset 2px 0 0 #3B82F6
│
└── Badge (optional):
    ├── Position: right
    ├── Padding: 2px 8px
    ├── Border-radius: 9999px
    └── Variants:
        ├── Default: rgba(255,255,255,0.2)
        ├── Warning: #F59E0B
        └── Critical: #EF4444
```

---

## 📐 Spacing Reference

```
4px  ───────  space-1
8px  ───────  space-2
12px ───────  space-3
16px ───────  space-4
20px ───────  space-5
24px ───────  space-6
32px ───────  space-8
48px ───────  space-12
```

---

## 🎯 Shadow Reference

```
shadow-sm:  0 1px 2px rgba(0,0,0,0.04)
shadow-md:  0 4px 6px rgba(0,0,0,0.04)
shadow-lg:  0 10px 15px rgba(0,0,0,0.04)
shadow-xl:  0 20px 25px rgba(0,0,0,0.04)
```

---

## 🔤 Icon Set

Use these emojis for thumbnails:

| Room Type | Icon |
|-----------|------|
| Patient Room | 🛏️ |
| Nurse Station | 👩‍⚕️ |
| Exam Room | 🩺 |
| Restroom | 🚻 |
| Storage | 📦 |
| Office | 🖥️ |
| Conference | 👥 |
| Corridor | 🚶 |

| Document Type | Icon |
|---------------|------|
| Floor Plan | 📐 |
| Schedule | 📋 |
| Door Schedule | 🚪 |
| Spec | 🔧 |
| Addendum | 📝 |

---

Ready to build in Figma! 🎨
