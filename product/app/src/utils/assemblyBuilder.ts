/**
 * Assembly Builder Logic Module
 * 
 * Parses user search queries and finds matching materials from the H+H catalogue.
 * Powers the "smart assembly" feature for building pipe runs with associated fittings.
 */

import type { JOCItem } from '../types';

// ============================================
// TYPES
// ============================================

export interface ParsedAssemblyIntent {
  size: string | null;        // e.g., "3" or "1-1/2"
  sizeFormatted: string;      // e.g., "3\"" or "1-1/2\"" (empty string if no size)
  system: 'sprinkler' | 'plumbing' | 'hvac' | 'general';
  itemType: 'pipe' | 'head' | 'fitting' | 'fixture' | 'general';
  rawQuery: string;
}

export interface FittingRecommendation {
  jocItem: JOCItem;
  quantityFactor: number;
  label: string;
  defaultChecked: boolean;
}

// ============================================
// TRADE FACTORS
// Industry-standard quantities per linear foot
// ============================================

export const TRADE_FACTORS = {
  // Couplings: 1 per 10 feet (pipe comes in 10' sticks)
  coupling: 0.10,
  
  // Hangers: 1 per 8 feet (per code)
  hanger: 0.125,
  
  // Elbows: estimated ~1 per 20 feet (suggest manual count)
  elbow: 0.05,
  
  // Tees: estimated ~1 per 50 feet (suggest manual count)
  tee: 0.02,
  
  // Cleanouts: 1 per 100 feet (plumbing code)
  cleanout: 0.01,
} as const;

// ============================================
// MATERIAL DETECTION
// Maps keywords to normalized material names
// ============================================

const MATERIAL_KEYWORDS: Record<string, string[]> = {
  'black steel': ['black steel', 'schedule 40', 'sch 40', 'sch40', 'black pipe', 'blk stl', 'carbon steel'],
  'copper': ['copper', 'type l', 'type k', 'type m', 'cu'],
  'cpvc': ['cpvc', 'chlorinated'],
  'cast iron': ['cast iron', 'ci', 'no-hub', 'no hub', 'nohub', 'hubless'],
  'galvanized': ['galvanized', 'galv', 'galv.'],
  'pvc': ['pvc', 'schedule 40 pvc', 'sch 40 pvc'],
  'stainless': ['stainless', 'ss', '304', '316'],
  'ductile iron': ['ductile', 'ductile iron', 'di'],
};

// ============================================
// SYSTEM DETECTION
// Division prefixes and keyword patterns
// ============================================

const SYSTEM_KEYWORDS: Record<string, string[]> = {
  sprinkler: ['sprinkler', 'fire', 'fp', 'fire protection', 'suppression', 'wet pipe', 'dry pipe'],
  plumbing: ['waste', 'drain', 'vent', 'dwv', 'supply', 'sanitary', 'storm', 'domestic'],
  hvac: ['hvac', 'heating', 'cooling', 'refrigerant', 'chilled', 'hydronic'],
};

// Division code to system mapping
const DIVISION_TO_SYSTEM: Record<string, ParsedAssemblyIntent['system']> = {
  '21': 'sprinkler',
  '22': 'plumbing',
  '23': 'hvac',
};

// ============================================
// ITEM TYPE DETECTION
// ============================================

const ITEM_TYPE_KEYWORDS: Record<string, string[]> = {
  pipe: ['pipe', 'piping', 'main', 'branch', 'riser', 'line'],
  head: ['head', 'sprinkler head', 'pendant', 'pendent', 'upright', 'sidewall', 'concealed'],
  fitting: ['fitting', 'elbow', 'tee', 'coupling', 'reducer', 'cap', 'plug', 'union', 'flange'],
  fixture: ['fixture', 'lavatory', 'lav', 'toilet', 'wc', 'water closet', 'urinal', 'sink', 'faucet'],
};

// ============================================
// SIZE EXTRACTION
// ============================================

/**
 * Extract pipe size from a query string
 * Handles: 3", 3 inch, 1-1/2", 1/2", etc.
 */
function extractSize(query: string): string | null {
  const q = query.toLowerCase();
  
  // Patterns ordered by specificity (most specific first)
  const patterns = [
    // Compound fractions: 1-1/2", 2-1/2", "1 1/2 inch"
    /(\d+)[-\s](\d+\/\d+)\s*(?:"|"|''|inch|in\b)?/,
    // Simple fractions: 3/4", 1/2"
    /(\d+\/\d+)\s*(?:"|"|''|inch|in\b)?/,
    // Whole numbers with inch marker: 3", 4 inch (not part of compound)
    /(?<!\d[-\s])(\d+)\s*(?:"|"|''|inch|-inch|in\b)/,
  ];
  
  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match) {
      // Compound fraction: "1-1/2" format
      if (match[2]) {
        return `${match[1]}-${match[2]}`;
      }
      return match[1];
    }
  }
  
  return null;
}

/**
 * Format size with inch mark for display
 */
function formatSize(size: string | null): string {
  if (!size) return '';
  // Already has inch mark
  if (size.endsWith('"') || size.endsWith("''")) return size;
  return `${size}"`;
}

/**
 * Detect material type from query
 */
function detectMaterial(query: string): string | null {
  const q = query.toLowerCase();
  
  for (const [material, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (q.includes(keyword)) {
        return material;
      }
    }
  }
  
  return null;
}

/**
 * Detect system type from query or task code
 */
function detectSystem(query: string, taskCode?: string): ParsedAssemblyIntent['system'] {
  const q = query.toLowerCase();
  
  // Check task code division first (most reliable)
  if (taskCode) {
    const division = taskCode.substring(0, 2);
    if (DIVISION_TO_SYSTEM[division]) {
      return DIVISION_TO_SYSTEM[division];
    }
  }
  
  // Check keywords
  for (const [system, keywords] of Object.entries(SYSTEM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (q.includes(keyword)) {
        return system as ParsedAssemblyIntent['system'];
      }
    }
  }
  
  return 'general';
}

/**
 * Detect item type from query
 */
function detectItemType(query: string): ParsedAssemblyIntent['itemType'] {
  const q = query.toLowerCase();
  
  for (const [itemType, keywords] of Object.entries(ITEM_TYPE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (q.includes(keyword)) {
        return itemType as ParsedAssemblyIntent['itemType'];
      }
    }
  }
  
  return 'general';
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Parse a user query into a structured assembly intent
 * 
 * @example
 * parseAssemblyIntent('3" Sprinkler Main')
 * // → { size: "3", sizeFormatted: "3\"", system: "sprinkler", itemType: "pipe", ... }
 * 
 * parseAssemblyIntent('1-1/2" copper supply')
 * // → { size: "1-1/2", sizeFormatted: "1-1/2\"", system: "plumbing", itemType: "pipe", ... }
 */
export function parseAssemblyIntent(query: string): ParsedAssemblyIntent {
  const size = extractSize(query);
  const system = detectSystem(query);
  const itemType = detectItemType(query);
  
  return {
    size,
    sizeFormatted: formatSize(size),
    system,
    itemType,
    rawQuery: query,
  };
}

/**
 * Find all material options for a parsed intent
 * 
 * For a 3" sprinkler pipe search, returns options like:
 * - 3" Black Steel Schedule 40
 * - 3" Copper Type L
 * - 3" CPVC
 * 
 * @param intent - Parsed assembly intent
 * @param catalogue - JOC items to search
 * @returns Array of matching JOC items grouped by material
 */
export function findMaterialOptions(
  intent: ParsedAssemblyIntent, 
  catalogue: JOCItem[]
): JOCItem[] {
  const { size, system, itemType } = intent;
  
  // Build filter criteria
  const divisionPrefix = system === 'sprinkler' ? '21' : system === 'plumbing' ? '22' : system === 'hvac' ? '23' : '';
  
  // Filter catalogue
  const filtered = catalogue.filter(item => {
    const desc = item.description.toLowerCase();
    const taskCode = item.taskCode;
    
    // Division filter (if system is specified)
    if (divisionPrefix && !taskCode.startsWith(divisionPrefix)) {
      return false;
    }
    
    // Size filter
    if (size) {
      const sizeMatch = desc.startsWith(`${size}"`) || 
                        desc.includes(`, ${size}"`) ||
                        desc.includes(` ${size}"`);
      if (!sizeMatch) return false;
    }
    
    // Item type filter - must be pipe, not service
    if (itemType === 'pipe') {
      if (!desc.includes('pipe') && !desc.includes('tubing')) return false;
      // Exclude service items
      if (desc.includes('removal') || desc.includes('relocate') || desc.includes('demo')) return false;
    }
    
    return true;
  });
  
  // Deduplicate by material - return one representative item per material type
  const seen = new Set<string>();
  const results: JOCItem[] = [];
  
  for (const item of filtered) {
    const desc = item.description.toLowerCase();
    let material = 'other';
    
    // Detect material from description
    for (const [mat, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
      if (keywords.some(kw => desc.includes(kw))) {
        material = mat;
        break;
      }
    }
    
    // Deduplicate by material
    if (!seen.has(material)) {
      seen.add(material);
      results.push(item);
    }
    
    // Limit to reasonable number of options
    if (results.length >= 6) break;
  }
  
  return results;
}

/**
 * Get standard fittings for a pipe size and material
 * 
 * Returns items with recommended quantity factors based on trade standards.
 * Factors are per linear foot - multiply by pipe run length to get quantities.
 * 
 * @param size - Pipe size (e.g., "3" or "1-1/2")
 * @param material - Material type (e.g., "black steel", "copper")
 * @param system - System type for division targeting
 * @param catalogue - JOC items to search
 * @returns Array of fitting recommendations with quantity factors
 */
export function getStandardFittings(
  size: string,
  material: string,
  system: 'sprinkler' | 'plumbing',
  catalogue: JOCItem[]
): FittingRecommendation[] {
  const recommendations: FittingRecommendation[] = [];
  const divisionPrefix = system === 'sprinkler' ? '21' : '22';
  
  // Fitting types to search for
  const fittingTypes: Array<{
    type: string;
    searchTerms: string[];
    factor: number;
    label: string;
    defaultChecked: boolean;
  }> = [
    {
      type: 'coupling',
      searchTerms: ['coupling', 'coupler'],
      factor: TRADE_FACTORS.coupling,
      label: `Couplings (1 per 10' stick)`,
      defaultChecked: true,
    },
    {
      type: 'hanger',
      searchTerms: ['hanger', 'clevis', 'support'],
      factor: TRADE_FACTORS.hanger,
      label: `Hangers (1 per 8' per code)`,
      defaultChecked: true,
    },
    {
      type: 'elbow',
      searchTerms: ['elbow', '90'],
      factor: TRADE_FACTORS.elbow,
      label: `90° Elbows (estimated - verify count)`,
      defaultChecked: false, // User should verify
    },
    {
      type: 'tee',
      searchTerms: ['tee'],
      factor: TRADE_FACTORS.tee,
      label: `Tees (estimated - verify count)`,
      defaultChecked: false, // User should verify
    },
  ];
  
  // Add cleanouts for plumbing systems
  if (system === 'plumbing') {
    fittingTypes.push({
      type: 'cleanout',
      searchTerms: ['cleanout', 'clean-out', 'clean out'],
      factor: TRADE_FACTORS.cleanout,
      label: `Cleanouts (1 per 100')`,
      defaultChecked: true,
    });
  }
  
  // Search for each fitting type
  for (const fitting of fittingTypes) {
    // Build filter for this fitting type
    const matchedItems = catalogue.filter(item => {
      const desc = item.description.toLowerCase();
      const taskCode = item.taskCode;
      
      // Must be from correct division
      if (!taskCode.startsWith(divisionPrefix)) return false;
      
      // Must match size
      const sizeMatch = desc.startsWith(`${size}"`) || 
                        desc.includes(`, ${size}"`) ||
                        desc.includes(` ${size}"`);
      if (!sizeMatch) return false;
      
      // Must match one of the search terms
      if (!fitting.searchTerms.some(term => desc.includes(term))) return false;
      
      // Must match material (if specified)
      if (material && material !== 'other') {
        const materialKeywords = MATERIAL_KEYWORDS[material] || [material];
        if (!materialKeywords.some(kw => desc.includes(kw))) return false;
      }
      
      // Exclude service items
      if (desc.includes('removal') || desc.includes('relocate') || desc.includes('demo')) return false;
      
      return true;
    });
    
    // Take the best match (first one found)
    if (matchedItems.length > 0) {
      recommendations.push({
        jocItem: matchedItems[0],
        quantityFactor: fitting.factor,
        label: fitting.label,
        defaultChecked: fitting.defaultChecked,
      });
    }
  }
  
  return recommendations;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate quantities from linear feet and fitting recommendations
 * 
 * @param linearFeet - Total pipe run in linear feet
 * @param fittings - Fitting recommendations from getStandardFittings
 * @returns Fittings with calculated quantities (rounded up)
 */
export function calculateFittingQuantities(
  linearFeet: number,
  fittings: FittingRecommendation[]
): Array<FittingRecommendation & { calculatedQty: number }> {
  return fittings.map(fitting => ({
    ...fitting,
    calculatedQty: Math.ceil(linearFeet * fitting.quantityFactor),
  }));
}

/**
 * Get material-specific search suggestions
 * Returns common materials for a given system
 */
export function getMaterialSuggestions(
  system: 'sprinkler' | 'plumbing' | 'hvac' | 'general'
): string[] {
  switch (system) {
    case 'sprinkler':
      return ['black steel', 'cpvc', 'copper'];
    case 'plumbing':
      return ['copper', 'cast iron', 'pvc', 'galvanized', 'cpvc'];
    case 'hvac':
      return ['copper', 'black steel', 'stainless'];
    default:
      return ['copper', 'black steel', 'pvc'];
  }
}

/**
 * Normalize material name for consistent matching
 */
export function normalizeMaterial(material: string): string {
  const m = material.toLowerCase().trim();
  
  // Check each material type and return normalized name
  for (const [normalized, keywords] of Object.entries(MATERIAL_KEYWORDS)) {
    if (keywords.some(kw => m.includes(kw))) {
      return normalized;
    }
  }
  
  return material;
}

/**
 * Extract material from a JOC item description
 */
export function extractMaterialFromDescription(description: string): string | null {
  return detectMaterial(description);
}

/**
 * Build a complete assembly from a pipe query (convenience function)
 * Combines intent parsing, material finding, and fitting recommendations
 */
export function buildPipeAssembly(
  query: string,
  catalogue: JOCItem[]
): {
  intent: ParsedAssemblyIntent;
  pipeOptions: JOCItem[];
  fittings: FittingRecommendation[];
} {
  const intent = parseAssemblyIntent(query);
  const pipeOptions = findMaterialOptions(intent, catalogue);
  
  // Get fittings if we have enough info
  let fittings: FittingRecommendation[] = [];
  
  const materialFromQuery = detectMaterial(query);
  
  if (intent.size && (intent.system === 'sprinkler' || intent.system === 'plumbing')) {
    // Use material from query or infer from first pipe option
    let materialToUse = materialFromQuery;
    
    if (!materialToUse && pipeOptions.length > 0) {
      materialToUse = detectMaterial(pipeOptions[0].description) || 'black steel';
    }
    
    if (materialToUse) {
      fittings = getStandardFittings(
        intent.size,
        materialToUse,
        intent.system,
        catalogue
      );
    }
  }
  
  return { intent, pipeOptions, fittings };
}
