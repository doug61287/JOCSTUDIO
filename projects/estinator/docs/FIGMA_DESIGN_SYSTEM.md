# Estinator Figma Design System

> Design system specification for Figma implementation

---

## 📐 Frame Structure

### Main Dashboard Frame
```
Frame: Dashboard
├── Size: 1440×900
├── Fill: #F9FAFB (gray-50)
└── Layout: Auto-layout, vertical, 0 gap
```

### Component Hierarchy
```
Dashboard
├── Sidebar (fixed left, 260px)
├── Main Content (fill container)
│   ├── Top Bar (72px height)
│   └── Content Area (scrollable)
│       ├── Project Header
│       ├── Stats Row
│       └── Dashboard Grid
```

---

## 🎨 Color Styles (Figma)

Create these as **Figma Color Styles**:

### Primary Colors
```
primary-50:  #EFF6FF
primary-100: #DBEAFE
primary-200: #BFDBFE
primary-300: #93C5FD
primary-400: #60A5FA
primary-500: #3B82F6
primary-600: #2563EB
primary-700: #1D4ED8
primary-800: #1E40AF
primary-900: #1E3A8A
```

### Semantic Colors
```
success-50:  #F0FDF4
success-500: #22C55E
success-600: #16A34A

warning-50:  #FFFBEB
warning-500: #F59E0B
warning-600: #D97706

error-50:    #FEF2F2
error-500:   #EF4444
error-600:   #DC2626

info-50:     #F0F9FF
info-500:    #0EA5E9
info-600:    #0284C7
```

### Neutral Colors (Warm Gray)
```
gray-0:   #FFFFFF
gray-50:  #FAFAF9
gray-100: #F5F5F4
gray-200: #E7E5E4
gray-300: #D6D3D1
gray-400: #A8A29E
gray-500: #78716C
gray-600: #57534E
gray-700: #44403C
gray-800: #292524
gray-900: #1C1917
```

### Special Colors
```
sidebar-bg:      #0F172A (navy)
sidebar-text:    rgba(255,255,255,0.7)
sidebar-active:  rgba(59,130,246,0.15)
```

---

## 🔤 Text Styles (Figma)

Create these as **Figma Text Styles** (Font: Inter):

### Headings
```
heading-3xl:  30px / 700 / -0.025em / #1C1917
heading-2xl:  24px / 700 / -0.025em / #1C1917
heading-xl:   20px / 600 / -0.025em / #1C1917
heading-lg:   18px / 600 / -0.02em / #1C1917
```

### Body
```
body-lg:  16px / 400 / 0 / #44403C
body:     15px / 400 / 0 / #44403C
body-sm:  14px / 400 / 0 / #57534E
body-xs:  13px / 400 / 0 / #78716C
```

### Labels
```
label:       14px / 500 / 0 / #78716C
label-sm:    12px / 600 / 0.05em / #78716C (uppercase)
label-badge: 12px / 600 / 0 / #FFFFFF
```

### Stats
```
stat-value:  36px / 800 / -0.02em / #1C1917
stat-label:  14px / 500 / 0 / #78716C
```

---

## 🧩 Component Library

### 1. Sidebar Item Component

**Structure:**
```
Auto-layout Frame: Sidebar Item
├── Direction: Horizontal
├── Padding: 12px 16px
├── Gap: 12px
├── Fill: Transparent (default) / #rgba(59,130,246,0.15) (active)
├── Border-radius: 8px
└── Children:
    ├── Icon (20×20, color: sidebar-text)
    ├── Label (body-sm, flex: 1)
    └── Badge (optional)
```

**Variants:**
- State: Default / Hover / Active
- With Badge: True / False
- Badge Type: None / Warning / Critical

**Prototype:**
- Hover: Fill → rgba(255,255,255,0.05)
- Active: Box-shadow inset 2px 0 0 #3B82F6

---

### 2. Stat Card Component

**Structure:**
```
Auto-layout Frame: Stat Card
├── Direction: Vertical
├── Padding: 24px
├── Gap: 12px
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
├── Border-radius: 16px
├── Shadow: 0 1px 3px rgba(0,0,0,0.05)
└── Children:
    ├── Header (horizontal, space-between)
    │   ├── Label (stat-label)
    │   └── Icon (20px emoji/icon)
    ├── Value (stat-value)
    └── Trend (body-xs, optional)
```

**Top Accent Bar:**
```
Rectangle: 100% width × 4px height
├── Position: Absolute, top: 0
├── Border-radius: 16px top corners
└── Fill: Linear gradient (variant color)
```

**Variants:**
- Type: Default / Success / Warning / Critical
- With Trend: True / False

---

### 3. Room Card Component

**Structure:**
```
Auto-layout Frame: Room Card
├── Direction: Vertical
├── Width: 300px (fixed)
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
├── Border-radius: 16px
├── Shadow: 0 1px 3px rgba(0,0,0,0.05)
└── Children:
    ├── Thumbnail Frame
    │   ├── Height: 120px
    │   ├── Fill: Linear gradient #60A5FA → #2563EB
    │   └── Icon: 48px centered
    └── Body (padding: 20px, gap: 16px)
        ├── Header (horizontal)
        │   ├── Title Stack
        │   │   ├── "Room {number}" (heading-lg)
        │   │   └── "{name}" (body-sm, muted)
        │   └── Issue Badge (if issues > 0)
        ├── Stats Row (horizontal, gap: 24px)
        │   └── Stat (vertical)
        │       ├── Value (heading-lg)
        │       └── Label (label-sm)
        └── Finishes (horizontal wrap, gap: 8px)
```

**Thumbnail Gradient (Default):**
```
Gradient: 135deg
├── Stop 1: #60A5FA at 0%
└── Stop 2: #2563EB at 100%
```

**Thumbnail Gradient (Issues):**
```
Gradient: 135deg
├── Stop 1: #FBBF24 at 0%
└── Stop 2: #D97706 at 100%
```

**Variants:**
- State: Default / Hover / Has Issues
- View: Card / List

**Prototype:**
- Hover: Y: -4px, Shadow: 0 12px 32px rgba(0,0,0,0.12)

---

### 4. Insight Card Component

**Structure:**
```
Auto-layout Frame: Insight Card
├── Direction: Vertical
├── Padding: 20px
├── Gap: 12px
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
├── Border-radius: 12px
├── Shadow: 0 1px 3px rgba(0,0,0,0.05)
└── Children:
    ├── Header (horizontal, gap: 8px)
    │   ├── Icon (16px emoji: 🔴🟡🔵🟢)
    │   └── Category (label-sm, uppercase)
    ├── Title (heading-lg)
    ├── Description (body-sm, muted)
    ├── Rooms (body-xs, muted, optional)
    └── Action Button (full width)
```

**Left Border Accent:**
```
Rectangle: 4px width × 100% height
├── Position: Absolute, left: 0
├── Border-radius: 12px left corners
└── Fill: Variant color
```

**Variants:**
- Severity: Critical / Warning / Info / Success

**Prototype:**
- Hover: Y: -2px, Shadow: 0 8px 24px rgba(0,0,0,0.08)

---

### 5. Document Card Component

**Structure:**
```
Auto-layout Frame: Document Card
├── Direction: Horizontal
├── Padding: 16px
├── Gap: 16px
├── Fill: #FFFFFF
├── Border: 1px solid #E7E5E4
├── Border-radius: 12px
├── Shadow: 0 1px 3px rgba(0,0,0,0.05)
└── Children:
    ├── Thumbnail (48×48, gray-100 bg, 24px emoji)
    ├── Info (vertical, flex: 1)
    │   ├── Name (body, truncate)
    │   └── Meta (body-xs, muted)
    └── Status Badge
```

**Variants:**
- Status: Verified / Has Issues / Processing
- Type: Drawing / Spec / Addendum

---

### 6. Badge Component

**Structure:**
```
Auto-layout Frame: Badge
├── Direction: Horizontal
├── Padding: 6px 12px (4px 8px for small)
├── Gap: 4px
├── Border-radius: 9999px
└── Text: label-badge
```

**Variants:**
- Type: Error / Warning / Success / Info / Gray
- Size: Default / Small

---

### 7. Button Component

**Structure:**
```
Auto-layout Frame: Button
├── Direction: Horizontal
├── Padding: 10px 20px (12px for icon-only)
├── Gap: 8px
├── Border-radius: 10px
├── Center: Yes
└── Children: Icon (optional) + Text
```

**Primary Button:**
```
Fill: Linear gradient 180deg #2563EB → #1D4ED8
Shadow: 0 1px 2px rgba(37,99,235,0.2), 
        inset 0 1px 0 rgba(255,255,255,0.15)
Text: #FFFFFF, 14px, 600 weight
```

**Secondary Button:**
```
Fill: #FFFFFF
Border: 1px solid #D6D3D1
Shadow: 0 1px 2px rgba(0,0,0,0.03)
Text: #57534E, 14px, 600 weight
```

**Ghost Button:**
```
Fill: Transparent
Text: #57534E, 14px, 500 weight
Hover: Fill #F5F5F4
```

**Variants:**
- Type: Primary / Secondary / Ghost
- Size: Default / Small / Large / Icon
- State: Default / Hover / Active / Disabled

---

## 📱 Responsive Breakpoints

Create these **Figma Frames** for responsive testing:

### Desktop (1440px)
- Sidebar: 260px fixed
- Content: Fill container
- Stats: 4 columns
- Rooms: 3 columns grid

### Tablet (1024px)
- Sidebar: Collapsed to icons only (72px)
- Stats: 2 columns
- Rooms: 2 columns grid

### Mobile (768px)
- Sidebar: Hidden (hamburger menu)
- Stats: 1 column
- Rooms: 1 column stack

---

## 🎬 Prototype Interactions

### Page: Dashboard Overview

**Interactions:**
1. **Sidebar Items**
   - Click → Navigate to respective page
   - Active state: Blue left border

2. **Stat Cards**
   - Hover: Lift 2px, shadow increase
   - Click: Filter content by metric

3. **Room Cards**
   - Hover: Lift 4px, shadow increase, border color change
   - Click → Navigate to Room Detail page

4. **Insight Cards**
   - Hover: Lift 2px
   - Action Button Click → Open RFI modal

5. **View Toggle**
   - Grid/List buttons: Toggle room display mode
   - Smooth transition between layouts

### Page: Room Detail

**Interactions:**
1. **Back Button** → Return to Dashboard
2. **Quick Action Buttons** → Open respective modals
3. **Door Items** → Highlight on hover

---

## 🖼️ Asset Export Settings

### Icons (SVG)
- Size: 24×24px
- Stroke: 2px
- Color: CurrentColor

### Thumbnails (PNG/SVG)
- Room icons: 48×48px
- Document icons: 24×24px
- Background gradients: CSS-ready

### Illustrations
- Format: SVG or PNG @2x
- Style: Flat, minimal

---

## 🔧 Figma Plugins Recommended

1. **Unsplash** - Placeholder images
2. **Iconify** - Icon library
3. **Content Reel** - Realistic placeholder data
4. **Stark** - Accessibility checking
5. **Autoflow** - User flow diagrams
6. **Tokens Studio** - Design token management

---

## 📋 Design Token Export

For **Tokens Studio** or similar:

```json
{
  "colors": {
    "primary": {
      "50": { "value": "#EFF6FF", "type": "color" },
      "500": { "value": "#3B82F6", "type": "color" },
      "600": { "value": "#2563EB", "type": "color" }
    },
    "semantic": {
      "success": { "value": "#22C55E", "type": "color" },
      "warning": { "value": "#F59E0B", "type": "color" },
      "error": { "value": "#EF4444", "type": "color" }
    }
  },
  "typography": {
    "fontFamily": { "value": "Inter", "type": "fontFamilies" },
    "heading": {
      "3xl": { "value": { "fontSize": "30", "fontWeight": "700" }, "type": "typography" }
    }
  },
  "spacing": {
    "1": { "value": "4px", "type": "spacing" },
    "4": { "value": "16px", "type": "spacing" }
  }
}
```

---

## ✅ Pre-Flight Checklist

Before handing off to development:

- [ ] All colors are defined as styles
- [ ] All text styles are defined
- [ ] Components have proper variants
- [ ] Auto-layout is used everywhere
- [ ] Constraints are set correctly
- [ ] Prototype links are working
- [ ] Responsive frames created
- [ ] Assets are export-ready
- [ ] Design tokens are exported
- [ ] Accessibility contrast checked

---

**Ready for Figma!** 🎨
