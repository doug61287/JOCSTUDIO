#!/usr/bin/env node
/**
 * Parse H+H CTC PDF to extract quantity tier multipliers
 * 
 * Structure:
 * TASK_CODE  UNIT  DESCRIPTION ... BASE_PRICE  DEMO_COST
 *            For >X To Y, (Add|Deduct)  VALUE
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../product/data');

function parsePdfText(pdfPath) {
  console.log(`Parsing ${path.basename(pdfPath)}...`);
  const text = execSync(`pdftotext -layout "${pdfPath}" -`, { 
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024 // 50MB buffer
  });
  return text;
}

function extractMultipliers(text) {
  const lines = text.split('\n');
  const multipliers = {};
  
  let currentTaskCode = null;
  let currentItem = null;
  
  // Regex patterns
  const taskCodePattern = /^\s*(\d{2}\s*\d{2}\s*\d{2}\s*\d{2}-\d{4})\s+(EA|LF|SF|CY|HR|GAL|LB|CF|SY|MO|TON|CWT|MBF|MSF|CLF|CSF|NTE)\s+(.+?)\s+([\d,]+\.\d{2})/;
  const modifierPattern = /For\s+(>?\d[\d,]*(?:\s*To\s*[\d,]+)?),?\s*(Add|Deduct)\s+(-?[\d,]+\.\d{2})/i;
  const qtyTierPattern = /For\s+(?:Up\s+To\s+)?(\d[\d,]*)|For\s+>(\d[\d,]*)\s+To\s+(\d[\d,]*)|For\s+>(\d[\d,]*),/i;
  
  for (const line of lines) {
    // Check for new task code
    const taskMatch = line.match(taskCodePattern);
    if (taskMatch) {
      const rawCode = taskMatch[1].replace(/\s+/g, '').replace(/-/g, '');
      currentTaskCode = rawCode.slice(0, 8) + '-' + rawCode.slice(8);
      const basePrice = parseFloat(taskMatch[4].replace(/,/g, ''));
      
      currentItem = {
        taskCode: currentTaskCode,
        unit: taskMatch[2],
        description: taskMatch[3].trim(),
        basePrice: basePrice,
        tiers: []
      };
      
      multipliers[currentTaskCode] = currentItem;
      continue;
    }
    
    // Check for quantity tier modifier
    if (currentTaskCode && line.includes('For ') && (line.includes('Add') || line.includes('Deduct'))) {
      // Parse the tier range and value
      const tierMatch = line.match(/For\s+(Up\s+To\s+\d[\d,]*|>\d[\d,]*\s+To\s+[\d,]+|>\d[\d,]*),?\s*(Add|Deduct)\s+(-?[\d,]+\.\d{2})/i);
      
      if (tierMatch) {
        const rangeStr = tierMatch[1];
        const operation = tierMatch[2].toLowerCase();
        const value = parseFloat(tierMatch[3].replace(/,/g, ''));
        
        // Parse the range
        let minQty = 1;
        let maxQty = null;
        
        if (rangeStr.toLowerCase().startsWith('up to')) {
          minQty = 1;
          maxQty = parseInt(rangeStr.replace(/up to\s*/i, '').replace(/,/g, ''));
        } else if (rangeStr.includes('To')) {
          const parts = rangeStr.match(/>(\d[\d,]*)\s+To\s+([\d,]+)/i);
          if (parts) {
            minQty = parseInt(parts[1].replace(/,/g, '')) + 1;
            maxQty = parseInt(parts[2].replace(/,/g, ''));
          }
        } else if (rangeStr.startsWith('>')) {
          minQty = parseInt(rangeStr.replace(/>/g, '').replace(/,/g, '')) + 1;
          maxQty = null; // Open-ended
        }
        
        // Skip non-quantity modifiers (labor, material options)
        const isQuantityTier = /^\d|^Up\s+To\s+\d|^>\d/.test(rangeStr.trim()) && 
                              !rangeStr.includes('Hour') && 
                              !rangeStr.includes('Day') && 
                              !rangeStr.includes('Week') &&
                              !rangeStr.includes('Month');
        
        if (isQuantityTier) {
          currentItem.tiers.push({
            minQty,
            maxQty,
            operation,
            adjustment: operation === 'deduct' ? -Math.abs(value) : value
          });
        }
      }
    }
  }
  
  return multipliers;
}

function main() {
  const pdf1 = path.join(DATA_DIR, 'hh-ctc-part1.pdf');
  const pdf2 = path.join(DATA_DIR, 'hh-ctc-part2.pdf');
  
  let allMultipliers = {};
  
  // Parse Part 1
  if (fs.existsSync(pdf1)) {
    const text1 = parsePdfText(pdf1);
    const mult1 = extractMultipliers(text1);
    allMultipliers = { ...allMultipliers, ...mult1 };
    console.log(`Part 1: Found ${Object.keys(mult1).length} items with data`);
  }
  
  // Parse Part 2
  if (fs.existsSync(pdf2)) {
    const text2 = parsePdfText(pdf2);
    const mult2 = extractMultipliers(text2);
    allMultipliers = { ...allMultipliers, ...mult2 };
    console.log(`Part 2: Found ${Object.keys(mult2).length} items with data`);
  }
  
  // Filter to only items with quantity tiers
  const itemsWithTiers = Object.values(allMultipliers).filter(item => item.tiers.length > 0);
  console.log(`\nTotal items with quantity tiers: ${itemsWithTiers.length}`);
  
  // Show sample
  console.log('\n--- Sample Items with Quantity Tiers ---');
  const sample = itemsWithTiers.filter(i => i.taskCode.startsWith('21131300')).slice(0, 3);
  sample.forEach(item => {
    console.log(`\n${item.taskCode}: ${item.description.slice(0, 50)}...`);
    console.log(`  Base: $${item.basePrice}`);
    item.tiers.forEach(t => {
      const range = t.maxQty ? `${t.minQty}-${t.maxQty}` : `${t.minQty}+`;
      console.log(`  Qty ${range}: ${t.adjustment >= 0 ? '+' : ''}$${t.adjustment.toFixed(2)}`);
    });
  });
  
  // Save to JSON
  const outputPath = path.join(DATA_DIR, 'quantity-tiers.json');
  fs.writeFileSync(outputPath, JSON.stringify(itemsWithTiers, null, 2));
  console.log(`\nSaved to ${outputPath}`);
  
  // Also create a lookup map for easy integration
  const tierMap = {};
  itemsWithTiers.forEach(item => {
    tierMap[item.taskCode] = item.tiers;
  });
  const mapPath = path.join(DATA_DIR, 'tier-map.json');
  fs.writeFileSync(mapPath, JSON.stringify(tierMap, null, 2));
  console.log(`Saved tier map to ${mapPath}`);
}

main();
