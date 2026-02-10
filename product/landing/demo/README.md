# JOCHero Demo: The Translation

A 15-second seamlessly looping animation demonstrating JOCHero's PDF-to-proposal workflow.

## Files

- `demo-translation.html` - Standalone demo page
- `demo-translation.css` - Styles (dark theme, responsive)
- `demo-translation.js` - GSAP-powered animations

## Quick Preview

Open `demo-translation.html` in a browser to see the demo.

```bash
open demo-translation.html   # macOS
# or
xdg-open demo-translation.html  # Linux
```

## Scene Breakdown

| Time | Scene | Content |
|------|-------|---------|
| 0-2s | PDF Upload | Drawing fades in with floating effect |
| 2-5s | Count Mode | Toolbar appears, cursor counts 47 sprinkler heads |
| 5-8s | Length Mode | Pipe drawing animates, 234 feet measured |
| 8-11s | Processing | JOCHero logo pulses, progress bar fills |
| 11-15s | Proposal | Table slides in with animated row population |

## Embedding in Landing Page

### Option 1: Iframe (Simplest)

```html
<div class="hero-demo-container" style="width: 100%; aspect-ratio: 16/9;">
    <iframe 
        src="demo/demo-translation.html" 
        style="width: 100%; height: 100%; border: none;"
        loading="lazy"
    ></iframe>
</div>
```

### Option 2: Inline Integration

Include the CSS and JS directly in your page:

```html
<head>
    <!-- Add to your CSS -->
    <link rel="stylesheet" href="demo/demo-translation.css">
</head>

<body>
    <!-- Add demo container where you want it -->
    <div id="hero-demo">
        <!-- Copy contents of demo-translation.html body here -->
    </div>
    
    <!-- Add before closing body tag -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="demo/demo-translation.js"></script>
</body>
```

### Option 3: Export to Video (for Background Video)

1. Open demo in Chrome at 1920×1080
2. Use screen recording (QuickTime, OBS, or Chrome DevTools)
3. Record 15-second loop
4. Export as:
   - `demo-translation.mp4` (H.264, ~1MB)
   - `demo-translation.webm` (VP9, ~800KB)

Then embed as:

```html
<video autoplay muted loop playsinline class="hero-video">
    <source src="demo/demo-translation.webm" type="video/webm">
    <source src="demo/demo-translation.mp4" type="video/mp4">
</video>
```

## Customization

### Colors

Edit CSS variables in `demo-translation.css`:

```css
:root {
    --bg-dark: #0F172A;
    --accent-gold: #FFD700;
    --primary: #1E40AF;
    --success: #10B981;
}
```

### Timing

Adjust animation timing in `demo-translation.js`:

```javascript
const CONFIG = {
    duration: 15000, // Total demo duration in ms
};
```

### Speed Adjustment

To slow down for presentations, modify the timeline:

```javascript
masterTimeline = gsap.timeline({
    repeat: -1,
    timeScale: 0.5  // Half speed
});
```

## Performance

- Uses only `transform` and `opacity` (GPU-accelerated)
- Targets 60fps
- Single external dependency (GSAP)
- ~40KB total (HTML + CSS + JS)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Mobile Responsive

Automatically adapts for viewport sizes:
- Desktop: 1920×1080
- Tablet: Scaled proportionally
- Mobile: Stacked layout, 1080×1920

## Dependencies

- **GSAP 3.12.2** - Animation library (CDN-loaded)
- No other dependencies

---

*Part of JOCHero Landing Page*
