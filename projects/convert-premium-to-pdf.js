const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Read the HTML file
  const htmlPath = path.join(__dirname, 'jocstudio-business-plan-premium.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Add custom styles for PDF
  const styledHtml = htmlContent.replace('</head>', `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #333;
        max-width: 100%;
      }
      h1 { color: #1a365d; page-break-before: always; font-size: 24pt; margin-top: 0; }
      h1:first-of-type { page-break-before: avoid; }
      h2 { color: #2c5282; font-size: 18pt; margin-top: 20pt; }
      h3 { color: #2b6cb0; font-size: 14pt; }
      h4 { color: #3182ce; font-size: 12pt; }
      table { border-collapse: collapse; width: 100%; margin: 15pt 0; font-size: 10pt; }
      th, td { border: 1px solid #cbd5e0; padding: 8px 10px; text-align: left; }
      th { background-color: #edf2f7; font-weight: 600; }
      tr:nth-child(even) { background-color: #f7fafc; }
      code { background-color: #edf2f7; padding: 2px 6px; border-radius: 3px; font-size: 9pt; }
      pre { background-color: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px; overflow-x: auto; }
      blockquote { border-left: 4px solid #4299e1; padding-left: 15px; margin-left: 0; color: #4a5568; font-style: italic; }
      strong { color: #1a202c; }
      a { color: #3182ce; }
      hr { border: none; border-top: 2px solid #e2e8f0; margin: 30pt 0; }
      .pagebreak { page-break-before: always; }
      @media print {
        h1 { page-break-before: always; }
        h1:first-of-type { page-break-before: avoid; }
        table { page-break-inside: avoid; }
      }
    </style>
  </head>`);
  
  // Set content
  await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  await page.pdf({
    path: path.join(__dirname, 'jocstudio-business-plan-premium.pdf'),
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 9pt; color: #718096; width: 100%; text-align: center; padding: 10px 20px;">
        <span style="color: #c53030; font-weight: bold;">CONFIDENTIAL</span> — JOCstudio Business Plan — Premium Pricing Model
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 9pt; color: #a0aec0; width: 100%; text-align: center; padding: 10px 20px;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> — February 2026
      </div>
    `,
    margin: {
      top: '25mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  console.log('✅ PDF generated: jocstudio-business-plan-premium.pdf');
})();
