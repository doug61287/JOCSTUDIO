const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Load the HTML file
  await page.goto('http://localhost:3456/jocstudio-business-plan.html', {
    waitUntil: 'networkidle0'
  });
  
  // Generate PDF
  await page.pdf({
    path: '/Users/baibureh/clawd/projects/jocstudio-business-plan.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  console.log('PDF generated successfully!');
})();
