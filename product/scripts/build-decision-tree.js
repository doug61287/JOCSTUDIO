#!/usr/bin/env node
/**
 * Build Decision Tree from JOC Catalogue
 * Parses 65,331 items into a hierarchical tree structure
 */

const fs = require('fs');
const path = require('path');

// CSI Division names
const CSI_DIVISIONS = {
  '01': 'General Requirements',
  '02': 'Existing Conditions',
  '03': 'Concrete',
  '04': 'Masonry',
  '05': 'Metals',
  '06': 'Wood, Plastics & Composites',
  '07': 'Thermal & Moisture Protection',
  '08': 'Openings',
  '09': 'Finishes',
  '10': 'Specialties',
  '11': 'Equipment',
  '12': 'Furnishings',
  '13': 'Special Construction',
  '14': 'Conveying Equipment',
  '21': 'Fire Suppression',
  '22': 'Plumbing',
  '23': 'HVAC',
  '25': 'Integrated Automation',
  '26': 'Electrical',
  '27': 'Communications',
  '28': 'Electronic Safety & Security',
  '31': 'Earthwork',
  '32': 'Exterior Improvements',
  '33': 'Utilities',
  '34': 'Transportation',
  '35': 'Waterway & Marine',
};

// Common section names (we'll derive more from descriptions)
const SECTION_NAMES = {
  // Division 08 - Openings
  '0841': 'Entrances & Storefronts',
  '0842': 'Entrances',
  '0843': 'Storefronts',
  '0844': 'Curtain Wall',
  '0851': 'Metal Windows',
  '0852': 'Wood Windows',
  '0853': 'Plastic Windows',
  '0854': 'Composite Windows',
  '0871': 'Door Hardware',
  '0881': 'Glass Glazing',
  // Division 09 - Finishes
  '0921': 'Plaster & Gypsum Board',
  '0922': 'Supports for Plaster & Gypsum Board',
  '0929': 'Gypsum Board',
  '0930': 'Tiling',
  '0951': 'Ceilings',
  '0965': 'Resilient Flooring',
  '0966': 'Terrazzo Flooring',
  '0968': 'Carpeting',
  '0991': 'Painting',
  // Division 22 - Plumbing
  '2205': 'Common Work Results',
  '2207': 'Plumbing Insulation',
  '2211': 'Facility Water Distribution',
  '2213': 'Facility Sanitary Sewerage',
  '2214': 'Facility Storm Drainage',
  '2240': 'Plumbing Fixtures',
  // Division 23 - HVAC
  '2305': 'Common Work Results',
  '2307': 'HVAC Insulation',
  '2321': 'Hydronic Piping & Pumps',
  '2331': 'HVAC Ducts & Casings',
  '2334': 'HVAC Fans',
  '2337': 'Air Outlets & Inlets',
  '2338': 'Ventilation Hoods',
  // Division 26 - Electrical
  '2605': 'Common Work Results',
  '2609': 'Instrumentation & Control',
  '2624': 'Switchboards & Panelboards',
  '2627': 'Low-Voltage Distribution',
  '2628': 'Low-Voltage Circuit Protection',
  '2651': 'Interior Lighting',
  '2656': 'Exterior Lighting',
};

function parseTaskCode(taskCode) {
  // Format: DDSSSSNN-IIII
  // DD = Division (2 digits)
  // SSSS = Section (4 digits) - but really SS is section, SS is subsection
  // NN = Sub-subsection (2 digits)
  // IIII = Item number
  
  const parts = taskCode.split('-');
  const prefix = parts[0]; // DDSSSSNN
  const itemNum = parts[1]; // IIII
  
  return {
    division: prefix.substring(0, 2),
    section: prefix.substring(0, 4),
    subsection: prefix.substring(0, 6),
    fullSection: prefix.substring(0, 8),
    itemNum: itemNum,
    raw: taskCode
  };
}

function buildTree(items) {
  const tree = {
    id: 'root',
    code: 'root',
    name: 'JOC Catalogue',
    children: {}
  };
  
  // Group items by division -> section -> subsection
  items.forEach(item => {
    const parsed = parseTaskCode(item.taskCode);
    
    // Create division if not exists
    if (!tree.children[parsed.division]) {
      tree.children[parsed.division] = {
        id: parsed.division,
        code: parsed.division,
        name: CSI_DIVISIONS[parsed.division] || `Division ${parsed.division}`,
        children: {},
        itemCount: 0
      };
    }
    tree.children[parsed.division].itemCount++;
    
    // Create section if not exists
    const divNode = tree.children[parsed.division];
    if (!divNode.children[parsed.section]) {
      divNode.children[parsed.section] = {
        id: parsed.section,
        code: parsed.section,
        name: SECTION_NAMES[parsed.section] || `Section ${parsed.section}`,
        children: {},
        itemCount: 0
      };
    }
    divNode.children[parsed.section].itemCount++;
    
    // Create subsection if not exists
    const secNode = divNode.children[parsed.section];
    if (!secNode.children[parsed.subsection]) {
      // Try to derive name from first item description
      secNode.children[parsed.subsection] = {
        id: parsed.subsection,
        code: parsed.subsection,
        name: `${parsed.subsection}`,
        description: item.description, // Use first item as hint
        children: {},
        itemCount: 0
      };
    }
    secNode.children[parsed.subsection].itemCount++;
    
    // Add item to subsection
    const subNode = secNode.children[parsed.subsection];
    subNode.children[item.taskCode] = {
      id: item.taskCode,
      code: item.taskCode,
      name: item.description,
      unit: item.unit,
      unitCost: item.unitCost,
      isItem: true
    };
  });
  
  return tree;
}

function simplifyTree(tree, minItems = 1) {
  // Convert to array format and filter small branches
  const simplify = (node) => {
    if (node.isItem) {
      return {
        id: node.id,
        code: node.code,
        name: node.name,
        unit: node.unit,
        unitCost: node.unitCost,
        isItem: true
      };
    }
    
    const children = Object.values(node.children || {})
      .filter(child => child.isItem || (child.itemCount || 0) >= minItems)
      .map(simplify)
      .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    
    return {
      id: node.id,
      code: node.code,
      name: node.name,
      itemCount: node.itemCount,
      children: children.length > 0 ? children : undefined
    };
  };
  
  return simplify(tree);
}

function deriveNames(tree, items) {
  // Try to derive better names from item descriptions
  const itemsBySubsection = {};
  
  items.forEach(item => {
    const parsed = parseTaskCode(item.taskCode);
    if (!itemsBySubsection[parsed.subsection]) {
      itemsBySubsection[parsed.subsection] = [];
    }
    itemsBySubsection[parsed.subsection].push(item);
  });
  
  // Find common words in descriptions for each subsection
  Object.entries(itemsBySubsection).forEach(([subsection, subItems]) => {
    if (subItems.length === 1) {
      // Single item - use its description as the subsection name
      return;
    }
    
    // Find common prefix in descriptions
    const descriptions = subItems.map(i => i.description);
    let commonPrefix = '';
    
    if (descriptions.length > 0) {
      const first = descriptions[0];
      for (let i = 0; i < first.length; i++) {
        const char = first[i];
        if (descriptions.every(d => d[i] === char)) {
          commonPrefix += char;
        } else {
          break;
        }
      }
    }
    
    if (commonPrefix.length > 10) {
      // Use common prefix as name
      itemsBySubsection[subsection].derivedName = commonPrefix.trim().replace(/[,\-\s]+$/, '');
    }
  });
  
  return itemsBySubsection;
}

// Main execution
const cataloguePath = path.join(__dirname, '../data/nyc-hh-ctc-2024.json');
const outputPath = path.join(__dirname, '../app/src/data/catalogueTree.ts');

console.log('📚 Loading catalogue...');
const items = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
console.log(`   Loaded ${items.length.toLocaleString()} items`);

console.log('🌳 Building decision tree...');
const tree = buildTree(items);

console.log('✨ Simplifying tree...');
const simplified = simplifyTree(tree);

// Count stats
const divisions = Object.keys(tree.children).length;
let sections = 0;
let subsections = 0;
Object.values(tree.children).forEach(div => {
  sections += Object.keys(div.children).length;
  Object.values(div.children).forEach(sec => {
    subsections += Object.keys(sec.children).length;
  });
});

console.log(`   ${divisions} divisions`);
console.log(`   ${sections} sections`);
console.log(`   ${subsections} subsections`);
console.log(`   ${items.length.toLocaleString()} items`);

// Generate TypeScript output
const tsOutput = `// Auto-generated from JOC Catalogue (${items.length.toLocaleString()} items)
// Generated: ${new Date().toISOString()}

export interface TreeNode {
  id: string;
  code: string;
  name: string;
  itemCount?: number;
  unit?: string;
  unitCost?: number;
  isItem?: boolean;
  children?: TreeNode[];
}

export const CSI_DIVISIONS: Record<string, string> = ${JSON.stringify(CSI_DIVISIONS, null, 2)};

export const catalogueTree: TreeNode = ${JSON.stringify(simplified, null, 2)};

export function findNodeByCode(code: string, node: TreeNode = catalogueTree): TreeNode | null {
  if (node.code === code || node.id === code) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeByCode(code, child);
      if (found) return found;
    }
  }
  return null;
}

export function getPathToNode(targetCode: string, node: TreeNode = catalogueTree, path: TreeNode[] = []): TreeNode[] | null {
  const currentPath = [...path, node];
  if (node.code === targetCode || node.id === targetCode) return currentPath;
  if (node.children) {
    for (const child of node.children) {
      const found = getPathToNode(targetCode, child, currentPath);
      if (found) return found;
    }
  }
  return null;
}
`;

console.log(`💾 Writing to ${outputPath}...`);
fs.writeFileSync(outputPath, tsOutput);
console.log('✅ Done!');
