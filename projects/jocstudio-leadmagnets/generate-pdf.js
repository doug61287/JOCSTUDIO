#!/usr/bin/env node

/**
 * PDF Generator for JOCstudio Lead Magnet
 * 
 * Usage:
 *   npm install puppeteer
 *   node generate-pdf.js
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF() {
  const htmlPath = path.join(__dirname, 'nyc-hhc-fp-cheat-sheet.html');
  const pdfPath = path.join(__dirname, 'nyc-hhc-fp-cheat-sheet.pdf');
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new'
  });
  
  const page = await browser.newPage();
  
  console.log('Loading HTML...');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0'
  });
  
  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0',
      right: '0',
      bottom: '0',
      left: '0'
    }
  });
  
  await browser.close();
  
  console.log(`PDF saved to: ${pdfPath}`);
}

generatePDF().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
