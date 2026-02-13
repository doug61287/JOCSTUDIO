#!/usr/bin/env node
/**
 * Assembly Generator Script
 * 
 * Usage:
 *   node generate.js --division 22 --output plumbing-assemblies.json
 *   node generate.js --search "copper pipe" --limit 10
 *   node generate.js --category plumbing --batch
 * 
 * This script searches the H+H catalogue and generates assembly templates.
 */

const fs = require('fs');
const path = require('path');

// Paths
const CATALOGUE_PATH = path.join(__dirname, '../../..', 'projects/jocstudio/product/app/public/data/nyc-hh-ctc-full.json');
const TRADE_FACTORS_PATH = path.join(__dirname, '..', 'trade-factors.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'generated');

// Load data
let catalogue = [];
let tradeFactors = {};

function loadData() {
  try {
    catalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf8'));
    console.log(`Loaded ${catalogue.length} catalogue items`);
  } catch (e) {
    console.error('Failed to load catalogue:', e.message);
    process.exit(1);
  }
  
  try {
    tradeFactors = JSON.parse(fs.readFileSync(TRADE_FACTORS_PATH, 'utf8'));
    console.log('Loaded trade factors');
  } catch (e) {
    console.error('Failed to load trade factors:', e.message);
    process.exit(1);
  }
}

// Search catalogue
function searchCatalogue(query, options = {}) {
  const { division, limit = 50 } = options;
  const terms = query.toLowerCase().split(/\s+/);
  
  let results = catalogue.filter(item => {
    // Division filter
    if (division && !item.taskCode?.startsWith(String(division).padStart(2, '0'))) {
      return false;
    }
    
    // Text search
    const text = `${item.taskCode} ${item.description}`.toLowerCase();
    return terms.every(term => text.includes(term));
  });
  
  return results.slice(0, limit);
}

// Find related items (fittings, supports, etc.)
function findRelatedItems(baseItem, itemType) {
  const taskCode = baseItem.taskCode;
  const division = taskCode.substring(0, 2);
  
  // Extract size from description (e.g., "2 inch", "1-1/2\"")
  const sizeMatch = baseItem.description.match(/(\d+[-\/\d]*)\s*(inch|"|'')/i);
  const size = sizeMatch ? sizeMatch[1] : null;
  
  const relatedTerms = {
    coupling: ['coupling', 'coupl'],
    elbow: ['elbow', '90', '45'],
    tee: ['tee', 'branch'],
    valve: ['valve', 'gate', 'ball'],
    hanger: ['hanger', 'support', 'clamp'],
    insulation: ['insulation', 'insul', 'cover'],
  };
  
  const terms = relatedTerms[itemType] || [itemType];
  
  return catalogue.filter(item => {
    if (!item.taskCode?.startsWith(division)) return false;
    
    const desc = item.description.toLowerCase();
    const hasType = terms.some(t => desc.includes(t));
    const hasSize = !size || desc.includes(size);
    
    return hasType && hasSize;
  });
}

// Generate assembly from a base item
function generateAssembly(baseItem, type = 'pipe') {
  const assembly = {
    id: generateId(baseItem.description),
    name: cleanName(baseItem.description),
    description: `Install ${baseItem.description}`,
    category: getCategoryFromDivision(baseItem.taskCode),
    keywords: extractKeywords(baseItem.description),
    applicableTo: getApplicableTo(baseItem.unit),
    createdBy: 'ai-generated',
    items: [
      {
        jocItem: {
          taskCode: baseItem.taskCode,
          description: baseItem.description,
          unit: baseItem.unit,
          unitCost: baseItem.unitCost || 0,
        },
        quantityFactor: 1.0,
      }
    ],
  };
  
  // Add related items based on type
  if (type === 'pipe') {
    addPipeFittings(assembly, baseItem);
    addSupports(assembly, baseItem);
  }
  
  return assembly;
}

// Add fittings to pipe assembly
function addPipeFittings(assembly, baseItem) {
  const division = baseItem.taskCode.substring(0, 2);
  const factors = division === '21' ? tradeFactors.fire_protection : tradeFactors.plumbing;
  
  if (!factors?.fittings) return;
  
  const fittingTypes = ['coupling', 'elbow_90', 'tee'];
  
  for (const fType of fittingTypes) {
    const factor = factors.fittings[fType];
    if (!factor) continue;
    
    const related = findRelatedItems(baseItem, fType.replace('_90', ''));
    if (related.length > 0) {
      const item = related[0]; // Take first match
      assembly.items.push({
        jocItem: {
          taskCode: item.taskCode,
          description: item.description,
          unit: item.unit,
          unitCost: item.unitCost || 0,
        },
        quantityFactor: factor.factor,
        notes: factor.rationale,
      });
    }
  }
}

// Add supports to assembly
function addSupports(assembly, baseItem) {
  const division = baseItem.taskCode.substring(0, 2);
  const factors = division === '21' ? tradeFactors.fire_protection : tradeFactors.plumbing;
  
  if (!factors?.supports?.pipe_hanger) return;
  
  const hangerFactor = factors.supports.pipe_hanger;
  const hangers = findRelatedItems(baseItem, 'hanger');
  
  if (hangers.length > 0) {
    assembly.items.push({
      jocItem: {
        taskCode: hangers[0].taskCode,
        description: hangers[0].description,
        unit: hangers[0].unit,
        unitCost: hangers[0].unitCost || 0,
      },
      quantityFactor: hangerFactor.factor,
      notes: hangerFactor.rationale,
    });
  }
}

// Helper functions
function generateId(description) {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function cleanName(description) {
  return description
    .replace(/,\s*$/, '')
    .substring(0, 80);
}

function getCategoryFromDivision(taskCode) {
  const div = taskCode?.substring(0, 2);
  const categories = {
    '02': 'demolition',
    '03': 'concrete',
    '09': 'drywall',
    '21': 'fire-protection',
    '22': 'plumbing',
    '23': 'hvac',
    '26': 'electrical',
  };
  return categories[div] || 'general';
}

function extractKeywords(description) {
  const words = description.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
  return [...new Set(words)].slice(0, 10);
}

function getApplicableTo(unit) {
  if (['LF', 'FT', 'LFT'].includes(unit)) return ['length'];
  if (['SF', 'SFT', 'SY'].includes(unit)) return ['area'];
  if (['EA', 'EACH'].includes(unit)) return ['count'];
  return ['count'];
}

// Batch generation
function batchGenerate(division) {
  // Find all pipe items in division
  const pipeItems = searchCatalogue('pipe', { division, limit: 100 });
  
  console.log(`Found ${pipeItems.length} pipe items in Division ${division}`);
  
  const assemblies = pipeItems.map(item => generateAssembly(item, 'pipe'));
  
  return assemblies;
}

// CLI
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
Assembly Generator

Usage:
  node generate.js --search "copper pipe" [--division 22] [--limit 10]
  node generate.js --batch --division 22 --output assemblies.json
  node generate.js --related "22 11 16 13-1080"

Options:
  --search <query>    Search catalogue
  --division <num>    Filter by CSI division
  --limit <num>       Max results (default: 50)
  --batch             Generate all assemblies for division
  --output <file>     Output file path
  --related <code>    Find items related to task code
`);
    return;
  }
  
  loadData();
  
  const searchIdx = args.indexOf('--search');
  const divisionIdx = args.indexOf('--division');
  const limitIdx = args.indexOf('--limit');
  const outputIdx = args.indexOf('--output');
  const isBatch = args.includes('--batch');
  
  const division = divisionIdx >= 0 ? args[divisionIdx + 1] : null;
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : 50;
  const outputFile = outputIdx >= 0 ? args[outputIdx + 1] : null;
  
  let results;
  
  if (isBatch && division) {
    results = batchGenerate(division);
    console.log(`Generated ${results.length} assemblies`);
  } else if (searchIdx >= 0) {
    const query = args[searchIdx + 1];
    const items = searchCatalogue(query, { division, limit });
    console.log(`Found ${items.length} items:`);
    items.forEach(item => {
      console.log(`  ${item.taskCode}: ${item.description} (${item.unit})`);
    });
    results = items;
  }
  
  if (outputFile && results) {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    const outPath = path.join(OUTPUT_DIR, outputFile);
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`Saved to ${outPath}`);
  }
}

main();
