# JOCstudio Lead Magnets

## NYC HHC Fire Protection UPB Quick Reference

A professional 3-page cheat sheet for fire protection contractors bidding NYC Health + Hospitals JOC contracts.

### Files

- `nyc-hhc-fp-cheat-sheet.html` - Source file (print-ready)
- `nyc-hhc-fp-cheat-sheet.pdf` - Final PDF (generate from HTML)

### Generating the PDF

**Option 1: Browser Print (Recommended)**
1. Open `nyc-hhc-fp-cheat-sheet.html` in Chrome, Firefox, or Safari
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
3. Select "Save as PDF" as the destination
4. Set margins to "None" or "Minimum"
5. Enable "Background graphics"
6. Save

**Option 2: Command Line (if Chrome available)**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless \
  --disable-gpu \
  --print-to-pdf=nyc-hhc-fp-cheat-sheet.pdf \
  --no-margins \
  nyc-hhc-fp-cheat-sheet.html
```

**Option 3: Node.js Puppeteer**
```bash
npm install puppeteer
node generate-pdf.js
```

### Content Overview

**Page 1: Division 21 Line Items**
- 21 05 00 - Common Work Results
- 21 10 00 - Water-Based Systems (sprinklers, pipe, valves)
- 21 20 00 - Fire Extinguishing (standpipes, cabinets)

**Page 2: Borough Coefficients**
- Manhattan: 1.25
- Bronx: 1.15
- Brooklyn: 1.10
- Queens: 1.10
- Staten Island: 1.05
- Plus formula and calculation example

**Page 3: Tips & Common Pitfalls**
- How to read HHC schedules
- Mistakes to avoid
- Quick reference formulas
- CTA to JOCstudio

### Customization

To update line item prices or add items:
1. Edit the HTML tables in `nyc-hhc-fp-cheat-sheet.html`
2. Re-generate the PDF

To add a QR code:
1. Generate a QR code for `https://jocstudio.com`
2. Replace the `[QR Code]` placeholder in the CTA section with an `<img>` tag
