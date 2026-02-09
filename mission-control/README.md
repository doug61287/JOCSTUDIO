# JOCstudio Mission Control 🚀

A comprehensive single-page dashboard that brings together all JOCstudio project aspects in one place. NASA mission control meets startup dashboard.

## Quick Start

```bash
# Open in browser
open index.html

# Or serve locally
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## Features

### Real-Time Elements
- **Live Clock** - Updates every second
- **Rotating Quotes** - Inspirational messages cycle every 8 seconds
- **Pulse Animations** - Status indicators animate to show live state

### Dashboard Sections

| Section | Description |
|---------|-------------|
| **Header** | Logo, live clock, system status indicator |
| **Project Health** | 4 cards: Product, Marketing, Business, Hero Strategy |
| **Content Calendar** | Visual week view with color-coded items |
| **Quick Links** | Icon grid organized by category |
| **Active Tasks** | Kanban-style columns (Urgent/In Progress/This Week/Upcoming) |
| **Metrics & Charts** | Progress bars, content pipeline stats, hero journey |
| **Social Media** | LinkedIn, YouTube, Discord status monitors |
| **Backend Status** | Server health, response time, uptime indicators |
| **Financial Snapshot** | Capital, burn rate, runway, revenue, goals |
| **Inspiration** | Rotating motivational quotes |

## Customization

### Update Status Values

Edit the HTML directly. Key patterns:

```html
<!-- Change status indicator -->
<span class="status-dot online"></span>  <!-- Green - operational -->
<span class="status-dot pending"></span> <!-- Yellow - pending -->
<span class="status-dot offline"></span> <!-- Red - issues -->

<!-- Update progress bar -->
<div class="progress-fill bg-blue-500" style="width: 75%"></div>
```

### Add Quick Links

Find the Quick Links section and add:

```html
<a href="YOUR_URL_HERE" class="quick-link">
    <span class="text-xl">🔗</span>
    <span class="text-xs">Label</span>
</a>
```

### Add Tasks

Find the Kanban section and add tasks:

```html
<div class="task-item" style="border-color: #EF4444;">Task name here</div>
```

Border colors:
- `#EF4444` - Red (Urgent)
- `#F59E0B` - Yellow (In Progress)  
- `#10B981` - Green (This Week)
- `#6B7280` - Gray (Upcoming)

### Update Calendar

Find the calendar grid and update day content:

```html
<div class="calendar-day scheduled">  <!-- or "done" or "pending" -->
    <div class="font-bold text-xs mb-1">MON</div>
    <div class="text-xs">10</div>
    <div class="mt-2 text-xs">Your content here</div>
</div>
```

### Add Quotes

Edit the JavaScript array:

```javascript
const quotes = [
    "Make them heroes.",
    "Your new quote here.",
    // Add more...
];
```

## Color Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0F172A` | Main page background |
| Card BG | `#1E293B` | Card backgrounds |
| Primary | `#1E40AF` | Trust Blue - buttons, accents |
| Success | `#10B981` | Green - operational, complete |
| Warning | `#F59E0B` | Amber - pending, in progress |
| Danger | `#EF4444` | Red - urgent, issues |
| Text | `#F1F5F9` | Light text on dark |

## Tech Stack

- **HTML5** - Single file, no build process
- **Tailwind CSS** - Via CDN for rapid styling
- **Vanilla JavaScript** - No framework dependencies
- **Lucide Icons** - Via CDN for consistent iconography

## Browser Support

Works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Mobile Responsive

The dashboard automatically adapts to different screen sizes:
- **Desktop** (1280px+): Full 4-column grid
- **Tablet** (768-1279px): 2-column grid
- **Mobile** (<768px): Single column stack

## Future Enhancements

Potential additions:
- [ ] Connect to real backend API for live data
- [ ] Add click-to-expand cards with details
- [ ] Integrate with Supabase for persistence
- [ ] Add keyboard navigation
- [ ] Dark/light theme toggle
- [ ] Export dashboard as PDF
- [ ] Slack/Discord webhook notifications

## File Structure

```
mission-control/
├── index.html     # Complete dashboard (single file)
└── README.md      # This documentation
```

---

**JOCstudio Mission Control v1.0**  
Built with 💙 for Job Order Contractors

*"Make them heroes."*
