# JOCHero Demos

Interactive animated demos showcasing JOCHero's capabilities. Built with HTML/CSS/JavaScript + GSAP for smooth 60fps animations.

## Available Demos

### Demo 1: The Translation (PDF-to-Proposal)
**Duration:** 15 seconds, seamless loop  
**Focus:** Visual takeoff workflow from PDF drawing to cost proposal

Files:
- `demo-translation.html` - Standalone demo page
- `demo-translation.css` - Styles
- `demo-translation.js` - GSAP animations

| Time | Scene | Content |
|------|-------|---------|
| 0-2s | PDF Upload | Drawing fades in with floating effect |
| 2-5s | Count Mode | Toolbar appears, cursor counts 47 sprinkler heads |
| 5-8s | Length Mode | Pipe drawing animates, 234 feet measured |
| 8-11s | Processing | JOCHero logo pulses, progress bar fills |
| 11-15s | Proposal | Table slides in with animated row population |

---

### Demo 2: The Translation Engine (Takeoff-to-JOC)
**Duration:** 20 seconds, seamless loop  
**Focus:** Transforming messy quantity takeoffs into agency-ready JOC line items  
**Hook:** "Your estimator already did the work. JOCHero just translates it."

Files:
- `demo-translation-engine.html` - Standalone demo page
- `demo-translation-engine.css` - Styles
- `demo-translation-engine.js` - GSAP animations

| Time | Scene | Content |
|------|-------|---------|
| 0-3s | The Upload | File drag-drop, metadata detection: "247 lines, Non-JOC format" |
| 3-8s | The Analysis | Split screen with OCR scanning, AI bubbles showing pattern matching |
| 8-13s | The Catalog Match | Three-column view with connection lines, sequential matching |
| 13-16s | The Cross-Check | Validation dashboard, confidence meter fills to 97.2% |
| 16-20s | The Output | Side-by-side comparison, proposal table populates, badges appear |

---

## Quick Preview

Open any demo HTML file in a browser:

```bash
open demo-translation-engine.html   # macOS
# or
xdg-open demo-translation-engine.html  # Linux
```

## Embedding in Landing Page

### Option 1: Iframe (Simplest)

```html
<section class="demo-section">
    <div class="demo-container" style="width: 100%; max-width: 1000px; aspect-ratio: 16/9; margin: 0 auto;">
        <iframe 
            src="demo/demo-translation-engine.html" 
            style="width: 100%; height: 100%; border: none; border-radius: 16px;"
            loading="lazy"
        ></iframe>
    </div>
</section>
```

### Option 2: Inline Integration

For better performance and control, embed directly:

```html
<head>
    <!-- Add to your CSS -->
    <link rel="stylesheet" href="demo/demo-translation-engine.css">
</head>

<body>
    <!-- Add demo container where you want it -->
    <section id="demo-translation-engine">
        <!-- Copy contents of demo-translation-engine.html body here -->
        <!-- Add class "embedded" to demo-container for constrained height -->
        <div class="demo-container embedded">
            ...
        </div>
    </section>
    
    <!-- Add before closing body tag -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="demo/demo-translation-engine.js"></script>
</body>
```

### Option 3: Video Export (for Hero Backgrounds)

1. Open demo in Chrome at 1920×1080
2. Use screen recording (QuickTime, OBS, or Chrome DevTools)
3. Record full loop (15s or 20s depending on demo)
4. Export as:
   - `.mp4` (H.264, ~1-2MB)
   - `.webm` (VP9, ~800KB-1.5MB)

```html
<video autoplay muted loop playsinline class="demo-video">
    <source src="demo/demo-translation-engine.webm" type="video/webm">
    <source src="demo/demo-translation-engine.mp4" type="video/mp4">
</video>
```

---

## JavaScript API

Both demos expose a public API for programmatic control:

### Demo 1: The Translation
```javascript
// After page load
DemoTranslation.play();
DemoTranslation.pause();
DemoTranslation.restart();
```

### Demo 2: The Translation Engine
```javascript
// After page load
TranslationEngineDemo.play();
TranslationEngineDemo.pause();
TranslationEngineDemo.restart();
TranslationEngineDemo.seek(10); // Jump to 10 seconds
```

---

## Customization

### Color Variables

Edit CSS variables in the respective CSS files:

```css
:root {
    /* Brand Colors */
    --bg-dark: #0F172A;
    --bg-card: #1E293B;
    --trust-blue: #1E40AF;
    --trust-blue-light: #3B82F6;
    --gold: #FFD700;
    --cyan: #22D3EE;
    --success: #10B981;
    --warning: #F59E0B;
    --error: #EF4444;
    
    /* Text Colors */
    --text-primary: #F1F5F9;
    --text-secondary: #94A3B8;
    --text-muted: #64748B;
}
```

### Timing Adjustment

Modify the CONFIG object in JS files:

```javascript
const CONFIG = {
    duration: 20, // Total demo duration in seconds
};
```

### Speed Control

For presentations, use GSAP's timeScale:

```javascript
// Half speed
TranslationEngineDemo.masterTimeline.timeScale(0.5);

// Double speed
TranslationEngineDemo.masterTimeline.timeScale(2);
```

---

## Performance

- Uses only `transform` and `opacity` (GPU-accelerated)
- Targets consistent 60fps
- Single external dependency (GSAP via CDN)
- Demo 1: ~40KB total
- Demo 2: ~70KB total

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Mobile Responsive

Both demos automatically adapt for viewport sizes:
- Desktop: Full layout with side-by-side panels
- Tablet: Scaled proportionally
- Mobile: Stacked layout, simplified animations

---

## Dependencies

- **GSAP 3.12.2** - Animation library (CDN-loaded)
- **Google Fonts** - Inter, JetBrains Mono (Demo 2 only)
- No other dependencies

---

*Part of JOCHero Landing Page - [jochero.com](https://jochero.com)*
