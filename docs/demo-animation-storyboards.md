# JOCHero Silent Demo Animations — Detailed Storyboards

## Demo 1: The Translation (Hero Section)
**Duration:** 15 seconds  
**Format:** Full-width background video  
**Loop:** Seamless  
**Resolution:** 1920×1080 (desktop), 1080×1920 (mobile)

---

### FRAME 0-2s: Setup

**Visual:**
- Dark gradient background (#0F172A to #1E293B)
- Subtle grid pattern overlay (10% opacity)
- Center: PDF drawing fades in (Jacobi FP Floor Plan)
- PDF has slight shadow (floating effect)

**Animation:**
- Background: Subtle breathing animation (scale 1.0 to 1.02, 4s loop)
- PDF: Fades in with slight scale up (0.95 → 1.0)
- Easing: ease-out

**Notes:**
- PDF should be recognizable but not detailed (slightly blurred)
- Title on PDF: "JACOBI MEDICAL CENTER - FIRE PROTECTION"
- Floor indicator: "15TH FLOOR"

---

### FRAME 2-5s: Measurement Mode Activation

**Visual:**
- Toolbar slides down from top (glassmorphism effect)
- Tools: Count | Length | Area | Space
- "Count" tool highlights (gold border glow)

**Animation:**
- Toolbar: Slides down from -100px to 0, opacity 0→1
- Duration: 0.5s, ease-out
- Gold glow pulses on active tool (infinite loop, 2s)

**Cursor:**
- Yellow circle (#FFD700) appears from bottom-left
- Moves to first sprinkler head location
- Smooth path: cubic-bezier(0.4, 0, 0.2, 1)

---

### FRAME 5-8s: Click-to-Count Sequence

**Visual:**
- **Click 1:** Cursor clicks sprinkler head
  - Ripple effect (gold circle expands and fades)
 - Number "1" pops above head (bounce animation)
  - Counter in top-right: "1"

- **Click 2:** Cursor moves to next head (smooth, 0.3s)
  - Ripple effect
  - Number "2" pops
  - Counter: "2"

- **Click 3-6:** Rapid succession (0.2s between)
  - Numbers 3, 4, 5, 6 appear
  - Counter updates instantly

- **Fast Forward:** Numbers 7-46 appear rapidly (0.05s each)
  - Motion blur effect on cursor
  - Numbers create "trail" effect
  - Counter ticks up: 10... 20... 30... 40...

- **Final Click:** Click 47
  - Slow motion emphasis
  - Large ripple
  - Number "47" (larger, gold color)
  - Counter: "47 Sprinkler Heads"

**Side Panel Animation:**
- Slides in from right (0.5s)
- Shows:
  ```
  MEASUREMENTS
  ─────────────
  🚿 Sprinkler Heads
     Count: 47
     UPB: 21 10 00
     Status: ✓ Mapped
  ```

**Animation Details:**
- Each click: 0.1s ripple expand (scale 0→2, opacity 1→0)
- Numbers: Pop in with spring physics (overshoot 1.2, settle 1.0)
- Counter: Numbers roll up (slot machine effect)
- Panel: Slide in with slight bounce

---

### FRAME 8-11s: Length Measurement

**Visual:**
- Cursor moves to toolbar
- "Length" tool highlights (others dim)
- Cursor returns to PDF

**Drawing Animation:**
- Click start point (mechanical room)
- Line draws smoothly along pipe path
- Length counter updates in real-time
  - Starts: "0 ft"
  - Updates every 10ft: "10... 20... 30..."
  - Final: "234 Linear Feet"

**Path Details:**
- Line color: #10B981 (green)
- Line thickness: 3px
- Glow effect while drawing
- Dash pattern animates (marching ants)

**End Animation:**
- Click endpoint
- Measurement label appears:
  ```
  ┌─────────────────┐
  │ 234 LINEAR FT   │
  │ 21 10 00 - PIPE │
  └─────────────────┘
  ```
- Label floats slightly above line

**Side Panel Update:**
- New row slides in:
  ```
  📏 Main Run Pipe
     Length: 234 ft
     UPB: 21 10 00
     Cost: $X,XXX
  ```

---

### FRAME 11-13s: Processing Magic

**Visual:**
- Screen dims slightly (dark overlay, 50% opacity)
- JOCHero logo appears center (pulsing glow)
- Progress bar below logo

**Progress Steps:**
1. "Analyzing measurements..." (0.5s)
   - Bar: 0% → 30%
   - Numbers fly from measurements to center

2. "Mapping to UPB..." (0.5s)
   - Bar: 30% → 60%
   - Line item codes appear (21 10 00, 21 20 00, etc.)

3. "Calculating pricing..." (0.5s)
   - Bar: 60% → 90%
   - Dollar amounts flash rapidly

4. "Generating proposal..." (0.5s)
   - Bar: 90% → 100%
   - Checkmark animation

**Particles:**
- Gold particles float upward during processing
- Subtle, not distracting
- 20-30 particles max

---

### FRAME 13-15s: Proposal Reveal

**Visual:**
- Overlay fades out
- Proposal table slides in from right
- PDF slides left (40% width)
- Table takes 60% width

**Table Animation:**
- Rows populate sequentially (stagger 0.1s)
- Each row:
  1. UPB Code slides in from left
  2. Description fades in
  3. Quantity numbers roll up
  4. Unit price appears with $ sign
  5. Total calculates (rolling counter)

**Table Content:**
```
LINE ITEM          | QTY  | UNIT  | PRICE  | TOTAL
───────────────────┼──────┼───────┼────────┼────────
21 10 00 Sprinkler |  47  |  EA   | $45.00 | $2,115
21 10 00 Pipe      | 234  |  LF   | $8.50  | $1,989
21 20 00 Alarm     |  12  |  EA   | $120   | $1,440
───────────────────┼──────┼───────┼────────┼────────
                                    SUBTOTAL | $5,544
                                    TAX      | $498
                                    TOTAL    | $6,042
```

**Final Elements:**
- "Ready to Submit" badge (gold, glows)
- Export buttons slide up (Excel, PDF, Print)
- Smooth transition back to start (fade out)

**Loop Reset:**
- Everything fades out (1s)
- Back to frame 0
- Seamless loop

---

## Demo 2: Trade-Specific Toggles
**Duration:** 10 seconds per trade, auto-rotate  
**Format:** Interactive web component (CSS/JS)  
**Resolution:** 800×600 container

---

### TRADE 1: Fire Protection (Div 21)

**Tab:** 🔥 Fire Protection (active, gold underline)

**Visual:**
- Fire sprinkler plan (red lines on white)
- Riser diagram (corner)

**Animation Sequence:**

**0-2s: PDF Appears**
- Plan fades in
- "FP-15" sheet label visible
- Scale: 1/8" = 1'-0"

**2-6s: Measurements**
- **Sprinkler Heads:**
  - Cursor clicks 5 heads rapidly
  - Counter: "47 Heads"
  - Badge: "Auto-detected"

- **Pipe Lengths:**
  - Line draws main run
  - Counter: "1,240 LF"
  - Breakdown: Main (234) + Branch (1,006)

- **Valves:**
  - Click: OS&Y, Butterfly, Inspector's Test
  - Counter: "8 Valves"

**6-8s: UPB Mapping**
- Line items populate:
  - 21 10 00 - Sprinkler System
  - 21 10 00 - Pipe & Fittings
  - 21 20 00 - Fire Alarm Devices
  - 21 20 00 - Valve Assemblies

**8-10s: Coefficient Applied**
- Map pin drops (Manhattan)
- "1.25×" badge appears
- Prices multiply
- Total: $XX,XXX

---

### TRADE 2: Electrical (Div 26)

**Tab:** ⚡ Electrical (active, gold underline)

**Visual:**
- Panel schedule
- Conduit routing plan
- Lighting layout

**Animation Sequence:**

**0-2s: PDF Appears**
- Electrical plan fades in
- Single-line diagram visible

**2-6s: Measurements**
- **Devices:**
  - Receptacles: 45 count
  - Switches: 23 count
  - Light fixtures: 67 count

- **Conduit:**
  - 3/4" EMT: 340 LF
  - 1" EMT: 280 LF
  - Wire: 1,240 LF

- **Panels:**
  - Main: 1
  - Sub-panels: 3

**6-8s: UPB Mapping**
- 26 05 00 - Basic Electrical
- 26 27 00 - Devices
- 26 28 00 - Lighting
- 26 29 00 - Conduit & Wire

**8-10s: Coefficient Applied**
- Map pin (Manhattan)
- 1.25×
- Total: $XX,XXX

---

### TRADE 3: Architectural (Div 08)

**Tab:** 🏗️ Architectural (active, gold underline)

**Visual:**
- Floor plan
- Room finishes legend
- Door/window schedule

**Animation Sequence:**

**0-2s: PDF Appears**
- Floor plan with room names
- Finish schedule

**2-6s: Measurements**
- **Areas:**
  - Patient rooms: 12 @ 180 SF each
  - Corridors: 2,400 SF
  - Nurse stations: 3 @ 240 SF

- **Doors:**
  - Patient room: 12
  - Corridor: 8
  - Exit: 4

- **Windows:**
  - Interior: 6
  - Exterior: 14

**6-8s: UPB Mapping**
- 08 11 00 - Metal Doors & Frames
- 08 14 00 - Wood Doors
- 08 50 00 - Windows
- 09 21 00 - Wall Finishes
- 09 51 00 - Ceiling Finishes

**8-10s: Coefficient Applied**
- Total calculated

---

### TRADE 4: Glazing (Div 08)

**Tab:** 🪟 Glazing (active, gold underline)

**Visual:**
- Window elevations
- Curtain wall sections
- Glass types schedule

**Animation:**
- Window area calculations
- Curtain wall linear feet
- Glass type specifications
- UPB mapping to 08 80 00

---

### TRADE 5: HVAC (Div 23)

**Tab:** 🌡️ HVAC (active, gold underline)

**Visual:**
- Ductwork plan
- Equipment schedule
- Diffuser layout

**Animation:**
- Ductwork linear feet (by size)
- Diffuser counts
- Equipment units
- UPB mapping to 23 00 00

---

## Demo 3: Before/After Split
**Duration:** 12 seconds  
**Format:** Side-by-side comparison  
**Split:** 50/50 vertical divider

---

### FRAME 0-2s: Setup

**Screen:**
- Center line divides screen
- Left label: "OLD WAY" (red, uppercase)
- Right label: "JOCHERO" (blue, gold accent)

**Animation:**
- Divider line draws from top to bottom (1s)
- Labels fade in

---

### FRAME 2-6s: Before (Left Side)

**Visual Chaos:**
```
┌─────────────────────────────────┐
│  EXCEL     PDF     CALC   BOOK  │
│  [messy]  [scroll] [#]    [UPB] │
│                                 │
│  ⏰ 8:00:00                     │
│                                 │
│  ❌ Broken formulas             │
│  ❌ Manual entry                │
│  ❌ Switching apps              │
└─────────────────────────────────┘
```

**Animation:**
- Apps jitter/shake slightly (stress)
- Clock spins rapidly (8+ hours)
- Cursor frantically jumps between windows
- Red overlay tint (10%)
- "ERROR" popup flashes

**Metrics:**
- Time: 8:00:00 (spinning)
- Errors: 3
- Apps open: 5

---

### FRAME 6-8s: The Transition

**Visual:**
- Center divider pulses (gold glow)
- Numbers fly from left to right:
  - "8:00:00" → "1:30:00"
  - "5 apps" → "1 platform"
  - "3 errors" → "0 errors"

**Particles:**
- Numbers dissolve into gold particles
- Particles flow right through divider
- Reform on right side

---

### FRAME 8-12s: After (Right Side)

**Visual Success:**
```
┌─────────────────────────────────┐
│         JOCHERO                 │
│  ┌─────────────────────────┐    │
│  │  PDF + Measurements     │    │
│  │  + Proposal             │    │
│  │      (all in one)       │    │
│  └─────────────────────────┘    │
│                                 │
│  ⏱️ 1:30:00                     │
│                                 │
│  ✅ Auto-mapped                 │
│  ✅ Zero errors                 │
│  ✅ Ready to submit             │
└─────────────────────────────────┘
```

**Animation:**
- Clean interface (no jitter)
- Clock ticks slowly (90 minutes)
- Cursor moves smoothly
- Green checkmarks pop in (staggered)
- Blue overlay tint (calm)
- Proposal generates automatically

**Metrics Comparison:**
| Metric | Before | After |
|--------|--------|-------|
| Time | 8 hrs | 1.5 hrs |
| Apps | 5 | 1 |
| Errors | 3 | 0 |
| Stress | High | Low |

**Final Frame:**
- "6.5 HOURS SAVED" (gold, large)
- "Per proposal"
- Calculations fly in:
  - "× 3 proposals/week"
  - "= 20 hours/week"
  - "= 80 hours/month"

---

### FRAME 12s: Loop

- Fade to black (0.5s)
- Fade back to frame 0
- Seamless loop

---

## Demo 4: The Coefficient Magic
**Duration:** 8 seconds  
**Format:** Small widget, embeddable  
**Size:** 400×300px

---

### FRAME 0-2s: Base Price

**Visual:**
- Card shows:
```
BASE PRICE
──────────
Sprinkler System
$45.00 / EA
──────────
Quantity: 47
Subtotal: $2,115
```

**Animation:**
- Card slides up from bottom
- Numbers roll in

---

### FRAME 2-4s: Location Detection

**Visual:**
- NYC map silhouette appears (background)
- Map pin drops (Manhattan)
- Pin pulses (gold glow)
- Label: "Manhattan, NYC"

**Animation:**
- Pin bounces on drop
- Concentric circles ripple from pin
- Map highlights Manhattan borough

---

### FRAME 4-6s: Coefficient Application

**Visual:**
- Coefficient badge slides in:
```
┌─────────────────┐
│  NYC HHC COEFF  │
│                 │
│  Manhattan:     │
│     1.25×       │
│                 │
│  Auto-applied ✓ │
└─────────────────┘
```

**Animation:**
- Badge rotates in (3D flip)
- "1.25×" grows slightly (pulse)
- Glow effect behind badge

**Math Animation:**
- Price: $2,115
- Multiply symbol appears
- Coefficient: 1.25×
- Line draws under
- Result calculates: $2,643.75

---

### FRAME 6-8s: Final Price

**Visual:**
- Card updates:
```
FINAL PRICE (NYC HHC)
─────────────────────
Sprinkler System
Manhattan Coefficient

$2,643.75
─────────────────────
✓ Agency-ready pricing
```

**Animation:**
- Old price fades (greyed out)
- New price fades in (gold)
- Checkmark draws (SVG stroke animation)
- "Agency-ready" badge slides in

**Final Flourish:**
- Confetti burst (subtle, 10-15 pieces)
- Gold glow around final number

---

## Technical Notes for Implementation

### Timing Functions
```css
/* Smooth cursor */
cursor-move: cubic-bezier(0.4, 0, 0.2, 1)

/* Pop/bounce */
number-pop: cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Standard UI */
ui-transition: cubic-bezier(0.25, 0.1, 0.25, 1)
```

### Color Values
```css
--bg-dark: #0F172A
--bg-card: #1E293B
--primary: #1E40AF
--accent-gold: #FFD700
--text-light: #F1F5F9
--success: #10B981
--error: #EF4444
```

### Animation Durations
- Micro (clicks): 150-200ms
- Standard (transitions): 300-500ms
- Major (screen changes): 600-800ms
- Ambient (loops): 3-5s

### Performance Tips
- Use `transform` and `opacity` only (GPU accelerated)
- Limit simultaneous animations to 5-7 elements
- Use `will-change` sparingly
- Preload assets
- Provide poster frame for video

---

*Ready to animate!* 🎬🚀
