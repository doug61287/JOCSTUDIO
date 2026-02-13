/**
 * JOCHero Search Rules Engine
 * 
 * Automatically categorizes H+H task codes as PRODUCT, SERVICE, or ACCESSORY
 * based on prefix patterns derived from catalogue analysis.
 * 
 * This replaces manual PRODUCT_SEARCH_BOOSTS with intelligent rules.
 */

// ============================================
// ITEM CATEGORY DEFINITIONS
// ============================================

export type ItemCategory = 'product' | 'service' | 'accessory' | 'mixed' | 'unknown';

interface CategoryRule {
  pattern: RegExp;
  category: ItemCategory;
  description: string;
  priority: number;  // Higher = checked first
}

// ============================================
// UNIVERSAL RULES (Apply to all divisions)
// ============================================

const UNIVERSAL_RULES: CategoryRule[] = [
  // XX01XXXX = Usually services, R&R, labor
  { pattern: /^\d{2}01[0-9]{2}/, category: 'service', description: 'General services (XX01XX)', priority: 100 },
  
  // XX0140XX = Definitely R&R/accessories
  { pattern: /^\d{2}0140/, category: 'accessory', description: 'R&R accessories (XX0140)', priority: 110 },
  
  // XX0130XX = Inspections, testing
  { pattern: /^\d{2}0130/, category: 'service', description: 'Inspection/testing (XX0130)', priority: 110 },
];

// ============================================
// DIVISION 21 - FIRE PROTECTION RULES
// ============================================

const DIVISION_21_RULES: CategoryRule[] = [
  // Services
  { pattern: /^210110/, category: 'service', description: 'Fire protection relocate/modify', priority: 90 },
  { pattern: /^210130/, category: 'service', description: 'Fire protection inspections', priority: 90 },
  
  // Products - Sprinkler systems
  { pattern: /^211313/, category: 'product', description: 'Wet pipe sprinkler heads/assemblies', priority: 80 },
  { pattern: /^211316/, category: 'product', description: 'Dry pipe sprinkler systems', priority: 80 },
  { pattern: /^211319/, category: 'product', description: 'Preaction sprinkler systems', priority: 80 },
  { pattern: /^211326/, category: 'product', description: 'Deluge systems', priority: 80 },
  { pattern: /^211341/, category: 'product', description: 'CPVC fire sprinkler pipe', priority: 80 },
  { pattern: /^211339/, category: 'product', description: 'Foam systems', priority: 80 },
  
  // Products - Standpipe/valves
  { pattern: /^211119/, category: 'product', description: 'Siamese/FDC connections', priority: 80 },
  { pattern: /^211213/, category: 'product', description: 'Fire hose', priority: 80 },
  { pattern: /^211223/, category: 'product', description: 'Fire department valves', priority: 80 },
  { pattern: /^211229/, category: 'product', description: 'Flow detection/manifolds', priority: 80 },
  
  // Products - Pumps
  { pattern: /^213113/, category: 'product', description: 'Electric fire pumps', priority: 80 },
  { pattern: /^213116/, category: 'product', description: 'Diesel fire pumps', priority: 80 },
  { pattern: /^213413/, category: 'product', description: 'Jockey pumps', priority: 80 },
  
  // Products - Suppression systems (clean agent, kitchen, dry chem)
  { pattern: /^212116/, category: 'product', description: 'CO2 systems', priority: 80 },
  { pattern: /^212216/, category: 'product', description: 'Clean agent (Sapphire)', priority: 80 },
  { pattern: /^212316/, category: 'product', description: 'Kitchen suppression', priority: 80 },
  { pattern: /^212416/, category: 'product', description: 'Dry chemical systems', priority: 80 },
  
  // Accessories
  { pattern: /^210519/, category: 'accessory', description: 'Pressure gauges', priority: 70 },
];

// ============================================
// DIVISION 22 - PLUMBING RULES
// ============================================

const DIVISION_22_RULES: CategoryRule[] = [
  // Services - R&R, repairs
  { pattern: /^220110/, category: 'service', description: 'Pipe repair', priority: 90 },
  { pattern: /^220140/, category: 'accessory', description: 'R&R fixture accessories', priority: 95 }, // High priority - always demote
  
  // Products - Valves
  { pattern: /^220523/, category: 'product', description: 'Bronze gate valves', priority: 80 },
  
  // Products - Pipe systems
  { pattern: /^221116/, category: 'product', description: 'Galvanized steel pipe', priority: 80 },
  { pattern: /^221119/, category: 'product', description: 'EPDM/flexible tubing', priority: 80 },
  { pattern: /^221123/, category: 'product', description: 'Booster pumps', priority: 80 },
  { pattern: /^221223/, category: 'product', description: 'Storage tanks', priority: 80 },
  { pattern: /^221316/, category: 'product', description: 'Cast iron soil pipe', priority: 80 },
  
  // Products - Fixtures (HIGH PRIORITY - these are what users want!)
  { pattern: /^221313/, category: 'product', description: 'Water closet rough-in', priority: 85 },
  { pattern: /^221319/, category: 'product', description: 'Floor drains', priority: 85 },
  { pattern: /^221426/, category: 'product', description: 'Roof drains', priority: 85 },
  { pattern: /^224216/, category: 'product', description: 'Lavatories', priority: 85 },
  { pattern: /^224239/, category: 'product', description: 'Kitchen faucets', priority: 85 },
  { pattern: /^224139/, category: 'product', description: 'Kitchen faucets (alt)', priority: 85 },
  { pattern: /^224243/, category: 'product', description: 'Flush valves', priority: 85 },
  
  // Products - Water heaters
  { pattern: /^223313/, category: 'product', description: 'Tankless water heaters', priority: 80 },
  { pattern: /^223330/, category: 'product', description: 'Small capacity water heaters', priority: 80 },
  { pattern: /^223333/, category: 'product', description: 'Residential water heaters', priority: 80 },
  { pattern: /^223336/, category: 'product', description: 'Commercial electric water heaters', priority: 80 },
  { pattern: /^223430/, category: 'product', description: 'Gas water heaters', priority: 80 },
  { pattern: /^223436/, category: 'product', description: 'Commercial gas water heaters', priority: 80 },
  
  // Products - Pumps
  { pattern: /^221329/, category: 'product', description: 'Sump/drainage pumps', priority: 80 },
  { pattern: /^221429/, category: 'product', description: 'Vertical sump pumps', priority: 80 },
  
  // Products - Zone valves, specialties
  { pattern: /^226313/, category: 'product', description: 'Zone valves', priority: 80 },
  { pattern: /^226683/, category: 'product', description: 'Acid neutralizing tanks', priority: 80 },
  
  // Accessories/Misc
  { pattern: /^220576/, category: 'accessory', description: 'Floor cleanouts', priority: 70 },
  { pattern: /^220719/, category: 'accessory', description: 'Pipe insulation', priority: 70 },
  { pattern: /^223216/, category: 'accessory', description: 'Water filter cartridges', priority: 70 },
  { pattern: /^226653/, category: 'accessory', description: 'Acid resistant DWV pipe', priority: 70 },
];

// ============================================
// COMPILE ALL RULES
// ============================================

const ALL_RULES: CategoryRule[] = [
  ...UNIVERSAL_RULES,
  ...DIVISION_21_RULES,
  ...DIVISION_22_RULES,
].sort((a, b) => b.priority - a.priority); // Higher priority first

// ============================================
// KEYWORD-TO-CATEGORY MAPPING
// ============================================

// When user searches for these terms, what category do they want?
const SEARCH_INTENT_MAP: Record<string, ItemCategory> = {
  // Product intent
  'pipe': 'product',
  'valve': 'product',
  'pump': 'product',
  'heater': 'product',
  'water heater': 'product',
  'drain': 'product',
  'floor drain': 'product',
  'roof drain': 'product',
  'lavatory': 'product',
  'lav': 'product',
  'sink': 'product',
  'faucet': 'product',
  'water closet': 'product',
  'wc': 'product',
  'toilet': 'product',
  'sprinkler': 'product',
  'sprinkler head': 'product',
  'head': 'product',
  'fixture': 'product',
  
  // Service intent
  'relocate': 'service',
  'remove': 'service',
  'repair': 'service',
  'inspect': 'service',
  'demo': 'service',
  'r&r': 'service',
  'removal': 'service',
  'replacement': 'service',
  
  // Accessory intent (user explicitly wants accessories)
  'supply line': 'accessory',
  'trap': 'accessory',
  'escutcheon': 'accessory',
  'hanger': 'accessory',
  'insulation': 'accessory',
  'filter': 'accessory',
  'cartridge': 'accessory',
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Determine the category of an item based on its task code
 */
export function categorizeItem(taskCode: string): ItemCategory {
  for (const rule of ALL_RULES) {
    if (rule.pattern.test(taskCode)) {
      return rule.category;
    }
  }
  return 'unknown';
}

/**
 * Determine what category the user is searching for
 */
export function detectSearchIntent(query: string, expandedWords: string[]): ItemCategory | null {
  const q = query.toLowerCase();
  
  // Check expanded words (includes synonyms)
  for (const word of expandedWords) {
    if (SEARCH_INTENT_MAP[word]) {
      return SEARCH_INTENT_MAP[word];
    }
  }
  
  // Check original query
  for (const [term, category] of Object.entries(SEARCH_INTENT_MAP)) {
    if (q.includes(term)) {
      return category;
    }
  }
  
  return null; // No clear intent
}

/**
 * Calculate a score adjustment based on search intent vs item category
 * 
 * @returns Score adjustment (positive = boost, negative = penalty)
 */
export function calculateCategoryScore(
  taskCode: string,
  searchIntent: ItemCategory | null
): number {
  if (!searchIntent) return 0; // No clear intent, don't adjust
  
  const itemCategory = categorizeItem(taskCode);
  
  // If searching for products
  if (searchIntent === 'product') {
    switch (itemCategory) {
      case 'product': return 150;   // Big boost
      case 'accessory': return -50; // Slight penalty (might still want)
      case 'service': return -100;  // Big penalty
      case 'mixed': return 0;
      default: return 0;
    }
  }
  
  // If searching for services
  if (searchIntent === 'service') {
    switch (itemCategory) {
      case 'service': return 150;
      case 'product': return -50;
      case 'accessory': return 0;
      default: return 0;
    }
  }
  
  // If searching for accessories
  if (searchIntent === 'accessory') {
    switch (itemCategory) {
      case 'accessory': return 150;
      case 'product': return 0;    // Still relevant
      case 'service': return -100;
      default: return 0;
    }
  }
  
  return 0;
}

/**
 * Get rule description for debugging
 */
export function getRuleDescription(taskCode: string): string | null {
  for (const rule of ALL_RULES) {
    if (rule.pattern.test(taskCode)) {
      return rule.description;
    }
  }
  return null;
}

/**
 * Bulk categorize items (for testing/analysis)
 */
export function analyzeCategories(taskCodes: string[]): Record<ItemCategory, number> {
  const counts: Record<ItemCategory, number> = {
    product: 0,
    service: 0,
    accessory: 0,
    mixed: 0,
    unknown: 0,
  };
  
  for (const code of taskCodes) {
    const category = categorizeItem(code);
    counts[category]++;
  }
  
  return counts;
}
