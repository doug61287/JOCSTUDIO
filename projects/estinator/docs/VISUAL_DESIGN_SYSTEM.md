# Estinator Visual Design System

## Design Philosophy

**Professional. Trustworthy. Efficient.**

The visual design communicates competence and reliability—essential qualities for construction professionals who need to trust the AI's analysis.

---

## Color System

### Primary Palette - Professional Blue
```css
--primary-50: #eff6ff   /* Lightest - backgrounds */
--primary-100: #dbeafe  /* Light - hover states */
--primary-500: #3b82f6  /* Primary - buttons, links */
--primary-600: #2563eb  /* Primary hover */
--primary-700: #1d4ed8  /* Active states */
--primary-900: #1e3a8a  /* Text emphasis */
```

**Usage:**
- Primary actions (buttons, links)
- Active states
- Brand elements
- Navigation highlights

### Semantic Colors

**Success (Green)**
```css
--success-500: #22c55e  /* Completed, success states */
--success-600: #16a34a
```
**Usage:** Documents analyzed, resolved issues, positive trends

**Warning (Amber)**
```css
--warning-500: #f59e0b  /* Caution, attention needed */
--warning-600: #d97706
```
**Usage:** Processing states, medium severity issues

**Error (Red)**
```css
--error-500: #ef4444    /* Critical issues, errors */
--error-600: #dc2626
```
**Usage:** Critical conflicts, missing specs, violations

**Info (Sky Blue)**
```css
--info-500: #0ea5e9     /* Information, tips */
--info-600: #0284c7
```
**Usage:** Helpful context, addenda notifications

### Neutral Palette - Warm Gray

```css
--gray-0: #ffffff       /* Pure white */
--gray-50: #fafaf9      /* Page background */
--gray-100: #f5f5f4     /* Card backgrounds */
--gray-200: #e7e5e4     /* Borders, dividers */
--gray-300: #d6d3d1     /* Disabled states */
--gray-500: #78716c     /* Secondary text */
--gray-700: #44403c     /* Primary text */
--gray-900: #1c1917     /* Headings, emphasis */
```

**Why warm gray?** 
- Feels more approachable than cool blue-gray
- Better for long reading sessions (construction specs)
- Pairs well with construction material colors (concrete, wood)

---

## Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Inter** - Modern, highly legible, excellent for data-heavy interfaces

### Type Scale

| Size | Usage |
|------|-------|
| text-4xl (36px) | Hero headlines |
| text-3xl (30px) | Page titles |
| text-2xl (24px) | Section headers |
| text-xl (20px) | Card titles |
| text-lg (18px) | Subsection headers |
| text-base (16px) | Body text |
| text-sm (14px) | Labels, metadata |
| text-xs (12px) | Captions, badges |

### Font Weights
- **400 (Normal)** - Body text
- **500 (Medium)** - Labels, buttons
- **600 (Semibold)** - Headings, emphasis
- **700 (Bold)** - Stats, key numbers
- **800 (Extrabold)** - Hero numbers

---

## Spacing System

Based on 4px grid (0.25rem increments)

```
space-1: 4px    - Tight spacing (icons, compact)
space-2: 8px    - Related elements
space-3: 12px   - Default padding
space-4: 16px   - Cards, sections
space-5: 20px   - Large components
space-6: 24px   - Section gaps
space-8: 32px   - Major sections
space-10: 40px  - Page sections
space-12: 48px  - Large separations
```

---

## Shadows

Soft, layered shadows for depth without harshness:

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04)     /* Subtle elevation */
--shadow-md: 0 4px 6px rgba(0,0,0,0.04)     /* Cards, buttons */
--shadow-lg: 0 10px 15px rgba(0,0,0,0.04)   /* Modals, dropdowns */
--shadow-xl: 0 20px 25px rgba(0,0,0,0.04)   /* Overlays */
```

---

## Border Radius

```css
--radius-md: 8px    /* Buttons, inputs */
--radius-lg: 12px   /* Cards, containers */
--radius-xl: 16px   /* Large cards, modals */
--radius-full: 9999px /* Pills, badges */
```

---

## Components

### Buttons

**Primary Button**
- Background: Gradient from primary-600 to primary-700
- Text: White
- Shadow: Subtle with inner highlight
- Hover: Darker gradient, lift effect
- Active: Scale down slightly

**Secondary Button**
- Background: White
- Border: 1px gray-300
- Text: Gray-700
- Hover: Gray-50 background

**Ghost Button**
- Background: Transparent
- Text: Gray-600
- Hover: Gray-100 background

### Cards

**Standard Card**
- Background: White
- Border: 1px gray-200
- Radius: 12px (radius-xl)
- Shadow: shadow-sm
- Padding: 20px

**Interactive Card**
- Hover: shadow-md, border-primary-300
- Transform: translateY(-3px)
- Transition: 200ms ease

**Insight Cards**
- Left border accent: 4px solid (color by severity)
- Gradient background: subtle tint to white

### Stats Cards

- Top accent bar: 3px gradient
- Value: 30px, extrabold
- Label: 14px, medium, gray-500
- Change indicator: colored arrow + text

### Badges

```
Small pill shape (radius-full)
Padding: 4px 8px
Font: 12px semibold uppercase

Variants:
- Primary: Blue background, blue text
- Success: Green background, green text
- Warning: Amber background, amber text
- Error: Red background, red text
- Info: Sky background, sky text
- Gray: Gray background, gray text
```

---

## Animations

### Micro-interactions

**Hover Lift**
```css
transform: translateY(-3px);
box-shadow: var(--shadow-lg);
transition: all 200ms ease;
```

**Button Press**
```css
transform: scale(0.98);
```

**Slide In**
```css
animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
```

**Stagger Children**
- Delay: 50ms increments
- Creates cascading reveal effect

### Focus States

- Ring: 3px solid with 15% opacity
- Offset: 2px from element
- No default outline

---

## Icon System

**Style:** Outline (not filled)
**Weight:** 2px stroke
**Size:** 16px (small), 20px (default), 24px (large)

**Categories:**
- Navigation (home, search, settings)
- Actions (upload, export, edit)
- Status (check, alert, info)
- Construction-specific (door, room, document)

---

## Layout Principles

### Container
- Max-width: 1440px
- Padding: 24px (desktop), 16px (mobile)
- Center aligned

### Grid
- CSS Grid with auto-fit
- Min column width: 280px
- Gap: 24px

### Responsive Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

---

## Visual Hierarchy

### 1. Primary Actions
- Blue buttons
- High contrast
- Top-right or prominent position

### 2. Key Information
- Stats cards
- Large numbers
- Color-coded severity

### 3. Supporting Details
- Gray text
- Smaller font
- Secondary position

### 4. Interactive Elements
- Clear hover states
- Cursor: pointer
- Visual feedback

---

## Dark Mode (Planned)

```css
@media (prefers-color-scheme: dark) {
  --gray-0: #0c0a09;
  --gray-50: #1c1917;
  --gray-100: #292524;
  /* ... etc */
}
```

**Principles:**
- Background: Near-black (not pure black)
- Cards: Slightly lighter
- Text: High contrast (WCAG AAA)
- Accents: Same colors, adjusted brightness

---

## Usage Examples

### Project Dashboard
```
[Nav: Logo + Search + Upload]

[Query Bar: "Ask anything..."]

[Stats Row: 4 cards with top accent]

[Two Column Layout]
  ├─ Documents Card
  └─ Issues Card
```

### Room Detail
```
[Header: Room 101 - Office]

[Finishes Card]
  ├─ Floor: Carpet
  ├─ Walls: Painted GWB
  └─ Ceiling: ACT

[Doors Card]
  ├─ Door 101-A [No Hardware Badge]
  └─ Door 101-B [No Hardware Badge]

[Action Buttons]
```

---

## Accessibility

- **Contrast Ratio:** 4.5:1 minimum for text
- **Focus Visible:** Clear focus indicators
- **Motion:** Respect prefers-reduced-motion
- **Touch Targets:** Minimum 44px
- **Screen Readers:** Semantic HTML, ARIA labels

---

## Files

| File | Purpose |
|------|---------|
| `design-system.css` | Core tokens and base styles |
| `PolishedDashboard.tsx` | Main dashboard component |
| `PolishedDashboard.css` | Component-specific styles |

---

## Implementation Notes

1. **Import Order:**
   ```tsx
   import '../styles/design-system.css';
   import './PolishedDashboard.css';
   ```

2. **Inter Font:** Load from Google Fonts or include locally

3. **Icons:** Use Lucide React or similar icon library

4. **CSS Variables:** All customizable via CSS custom properties

---

**Version:** 2.0  
**Last Updated:** February 16, 2026
