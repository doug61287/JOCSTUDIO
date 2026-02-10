/**
 * Smart Translation Engine for JOCHero
 * Converts plain English work descriptions into JOC line items
 */

// Construction synonyms and aliases
const SYNONYMS: Record<string, string[]> = {
  // HVAC
  'hvac': ['air conditioning', 'ac', 'a/c', 'heating', 'ventilation', 'mechanical'],
  'duct': ['ductwork', 'air duct', 'supply duct', 'return duct'],
  'diffuser': ['air diffuser', 'supply diffuser', 'ceiling diffuser'],
  'thermostat': ['tstat', 'temperature control'],
  'vav': ['variable air volume', 'vav box'],
  'ahu': ['air handling unit', 'air handler'],
  'rtu': ['rooftop unit'],
  'fcu': ['fan coil unit', 'fan coil'],
  
  // Electrical
  'outlet': ['receptacle', 'plug', 'electrical outlet', 'duplex outlet'],
  'switch': ['light switch', 'wall switch', 'toggle switch'],
  'panel': ['electrical panel', 'panelboard', 'load center', 'breaker panel'],
  'conduit': ['emt', 'rigid conduit', 'pvc conduit', 'electrical conduit'],
  'wire': ['wiring', 'conductor', 'cable'],
  'light': ['lighting', 'luminaire', 'light fixture', 'fixture'],
  'led': ['led light', 'led fixture', 'led lamp'],
  'fluorescent': ['fluor', 'fluorescent light', 'fluorescent fixture'],
  'transformer': ['xfmr', 'xformer'],
  'breaker': ['circuit breaker', 'cb'],
  'gfci': ['gfi', 'ground fault'],
  
  // Plumbing
  'pipe': ['piping', 'tubing'],
  'valve': ['shut-off', 'shutoff', 'gate valve', 'ball valve'],
  'toilet': ['water closet', 'wc', 'commode'],
  'sink': ['lavatory', 'lav', 'basin'],
  'faucet': ['tap', 'spigot'],
  'drain': ['drainage', 'floor drain', 'waste'],
  'water heater': ['hot water heater', 'hwh', 'water heating'],
  'pump': ['circulating pump', 'circ pump', 'booster pump'],
  
  // Fire Protection
  'sprinkler': ['fire sprinkler', 'sprinkler head', 'spray head'],
  'standpipe': ['stand pipe', 'fire standpipe'],
  'fire alarm': ['fa', 'alarm system', 'fire detection'],
  'smoke detector': ['smoke alarm', 'detector'],
  'extinguisher': ['fire extinguisher', 'portable extinguisher'],
  
  // Finishes
  'drywall': ['gypsum board', 'sheetrock', 'gyp board', 'gypboard', 'wallboard'],
  'ceiling': ['ceiling tile', 'act', 'acoustic ceiling', 'suspended ceiling', 'drop ceiling'],
  'paint': ['painting', 'primer', 'finish coat'],
  'floor': ['flooring', 'floor covering'],
  'tile': ['ceramic tile', 'porcelain tile', 'floor tile', 'wall tile'],
  'carpet': ['carpeting', 'carpet tile', 'broadloom'],
  'vct': ['vinyl composition tile', 'vinyl tile'],
  'lvt': ['luxury vinyl tile', 'luxury vinyl'],
  'epoxy': ['epoxy floor', 'epoxy coating', 'epoxy flooring'],
  
  // Doors & Hardware
  'door': ['doorway', 'entry door', 'passage door'],
  'frame': ['door frame', 'hollow metal frame', 'hm frame'],
  'hardware': ['door hardware', 'lockset', 'hinges'],
  'closer': ['door closer', 'automatic closer'],
  
  // Demolition
  'demo': ['demolition', 'remove', 'removal', 'tear out', 'tearout', 'rip out'],
  'abatement': ['asbestos abatement', 'lead abatement', 'hazmat'],
  
  // General
  'install': ['installation', 'furnish and install', 'f&i', 'provide'],
  'replace': ['replacement', 'swap', 'change out'],
  'repair': ['fix', 'patch', 'mend'],
  'new': ['new construction', 'addition'],
};

// Division hints - keywords that suggest specific CSI divisions
const DIVISION_HINTS: Record<string, string[]> = {
  '01': ['general', 'temporary', 'mobilization', 'cleanup'],
  '02': ['demolition', 'demo', 'remove', 'existing', 'abatement', 'hazmat'],
  '03': ['concrete', 'cement', 'slab', 'foundation', 'rebar'],
  '04': ['masonry', 'brick', 'block', 'cmu', 'mortar'],
  '05': ['steel', 'metal', 'structural', 'beam', 'column', 'joist'],
  '06': ['wood', 'lumber', 'plywood', 'framing', 'millwork', 'casework'],
  '07': ['roofing', 'waterproofing', 'insulation', 'siding', 'flashing', 'membrane'],
  '08': ['door', 'window', 'glass', 'glazing', 'frame', 'hardware', 'storefront'],
  '09': ['drywall', 'paint', 'tile', 'floor', 'ceiling', 'carpet', 'finishes', 'gyp'],
  '10': ['signage', 'locker', 'partition', 'toilet partition', 'accessory'],
  '21': ['sprinkler', 'fire suppression', 'standpipe', 'fire protection'],
  '22': ['plumbing', 'pipe', 'valve', 'toilet', 'sink', 'faucet', 'drain', 'water'],
  '23': ['hvac', 'duct', 'diffuser', 'vav', 'ahu', 'mechanical', 'heating', 'cooling'],
  '26': ['electrical', 'wire', 'conduit', 'panel', 'outlet', 'switch', 'light', 'power'],
  '27': ['data', 'communication', 'network', 'cable', 'cat6', 'fiber'],
  '28': ['fire alarm', 'security', 'camera', 'access control', 'card reader'],
};

// Unit patterns for extraction
const UNIT_PATTERNS: Array<{ pattern: RegExp; unit: string; multiplier: number }> = [
  { pattern: /(\d+(?:\.\d+)?)\s*(?:linear\s*)?(?:feet|foot|ft|lf|l\.f\.)/i, unit: 'LF', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:square\s*)?(?:feet|foot|ft|sf|s\.f\.)/i, unit: 'SF', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:cubic\s*)?(?:feet|foot|ft|cf|c\.f\.)/i, unit: 'CF', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:cubic\s*)?(?:yards?|yd|cy|c\.y\.)/i, unit: 'CY', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:each|ea|pcs?|pieces?|units?)/i, unit: 'EA', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i, unit: 'HR', multiplier: 1 },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:days?)/i, unit: 'DA', multiplier: 1 },
];

// Quantity patterns
const QUANTITY_PATTERNS: RegExp[] = [
  /(\d+(?:\.\d+)?)\s*(?:x|×)/i,  // "10 x sprinkler heads"
  /install\s+(\d+(?:\.\d+)?)/i,   // "install 10 sprinkler heads"
  /(\d+(?:\.\d+)?)\s+(?:new|each|total)/i,  // "10 new outlets"
  /^(\d+(?:\.\d+)?)\s+/,  // "10 sprinkler heads" (at start)
  /(\d+(?:\.\d+)?)\s*(?:pcs?|pieces?|units?|items?|sets?)/i,
];

export interface TranslationContext {
  originalText: string;
  normalizedText: string;
  keywords: string[];
  expandedKeywords: string[];
  quantity: number | null;
  unit: string | null;
  suggestedDivisions: string[];
}

export interface ScoredItem {
  taskCode: string;
  description: string;
  unit: string;
  unitCost: number;
  score: number;
  matchedKeywords: string[];
  matchType: 'exact' | 'phrase' | 'keywords' | 'partial';
  divisionMatch: boolean;
  unitMatch: boolean;
}

/**
 * Analyze input text and extract translation context
 */
export function analyzeInput(text: string): TranslationContext {
  const normalizedText = text.toLowerCase().trim();
  
  // Extract quantity
  let quantity: number | null = null;
  for (const pattern of QUANTITY_PATTERNS) {
    const match = normalizedText.match(pattern);
    if (match) {
      quantity = parseFloat(match[1]);
      break;
    }
  }
  
  // Extract unit
  let unit: string | null = null;
  for (const { pattern, unit: u } of UNIT_PATTERNS) {
    if (pattern.test(normalizedText)) {
      unit = u;
      break;
    }
  }
  
  // Extract keywords (remove stopwords and short words)
  const stopwords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'i', 'we', 'you', 'they', 'it', 'this', 'that', 'these', 'those',
    'per', 'each', 'all', 'some', 'any', 'my', 'your', 'our',
  ]);
  
  const words = normalizedText
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !stopwords.has(w));
  
  // Expand keywords with synonyms
  const expandedKeywords = new Set<string>();
  for (const word of words) {
    expandedKeywords.add(word);
    
    // Check if this word is a synonym value
    for (const [canonical, synonyms] of Object.entries(SYNONYMS)) {
      if (synonyms.some(s => s.includes(word) || word.includes(s.split(' ')[0]))) {
        expandedKeywords.add(canonical);
        synonyms.forEach(s => expandedKeywords.add(s.split(' ')[0]));
      }
      if (canonical.includes(word)) {
        expandedKeywords.add(canonical);
        synonyms.forEach(s => expandedKeywords.add(s.split(' ')[0]));
      }
    }
  }
  
  // Suggest divisions based on keywords
  const divisionScores: Record<string, number> = {};
  for (const [div, hints] of Object.entries(DIVISION_HINTS)) {
    for (const hint of hints) {
      if (normalizedText.includes(hint)) {
        divisionScores[div] = (divisionScores[div] || 0) + 1;
      }
    }
  }
  
  const suggestedDivisions = Object.entries(divisionScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([div]) => div);
  
  return {
    originalText: text,
    normalizedText,
    keywords: words,
    expandedKeywords: Array.from(expandedKeywords),
    quantity,
    unit,
    suggestedDivisions,
  };
}

/**
 * Score an item against the translation context
 */
export function scoreItem(
  item: { taskCode: string; description: string; unit: string; unitCost: number },
  context: TranslationContext
): ScoredItem | null {
  const descLower = item.description.toLowerCase();
  const matched: string[] = [];
  let score = 0;
  let matchType: 'exact' | 'phrase' | 'keywords' | 'partial' = 'partial';
  
  // Check for exact match (highest score)
  if (descLower === context.normalizedText) {
    score = 1.0;
    matchType = 'exact';
    matched.push(...context.keywords);
  }
  // Check for phrase match (description contains the full query)
  else if (descLower.includes(context.normalizedText)) {
    score = 0.9;
    matchType = 'phrase';
    matched.push(...context.keywords);
  }
  // Keyword matching
  else {
    // Score based on keyword matches
    let keywordMatches = 0;
    let expandedMatches = 0;
    
    for (const keyword of context.keywords) {
      if (descLower.includes(keyword)) {
        keywordMatches++;
        matched.push(keyword);
      }
    }
    
    // Also check expanded keywords
    for (const keyword of context.expandedKeywords) {
      if (descLower.includes(keyword) && !matched.includes(keyword)) {
        expandedMatches++;
        matched.push(keyword);
      }
    }
    
    if (keywordMatches === 0 && expandedMatches === 0) {
      return null; // No match
    }
    
    // Calculate score
    const keywordScore = context.keywords.length > 0 
      ? keywordMatches / context.keywords.length 
      : 0;
    const expandedScore = context.expandedKeywords.length > 0
      ? expandedMatches / context.expandedKeywords.length * 0.5
      : 0;
    
    score = Math.min(0.85, keywordScore * 0.7 + expandedScore * 0.3);
    matchType = keywordMatches > 0 ? 'keywords' : 'partial';
  }
  
  // Bonus for division match
  const itemDiv = item.taskCode.substring(0, 2);
  const divisionMatch = context.suggestedDivisions.includes(itemDiv);
  if (divisionMatch) {
    score = Math.min(1.0, score + 0.1);
  }
  
  // Bonus for unit match
  const unitMatch = context.unit !== null && item.unit === context.unit;
  if (unitMatch) {
    score = Math.min(1.0, score + 0.05);
  }
  
  // Penalty for very short or very generic descriptions
  if (item.description.length < 20) {
    score *= 0.8;
  }
  
  return {
    ...item,
    score,
    matchedKeywords: matched,
    matchType,
    divisionMatch,
    unitMatch,
  };
}

/**
 * Translate description and return scored results
 */
export function translateDescription(
  description: string,
  items: Array<{ taskCode: string; description: string; unit: string; unitCost: number }>,
  options: { limit?: number; minScore?: number } = {}
): {
  context: TranslationContext;
  items: ScoredItem[];
  took: number;
} {
  const start = Date.now();
  const { limit = 20, minScore = 0.2 } = options;
  
  // Analyze input
  const context = analyzeInput(description);
  
  // Score all items
  const scored: ScoredItem[] = [];
  
  for (const item of items) {
    const result = scoreItem(item, context);
    if (result && result.score >= minScore) {
      scored.push(result);
    }
  }
  
  // Sort by score (desc), then by division match, then by cost (desc)
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.divisionMatch !== a.divisionMatch) return b.divisionMatch ? 1 : -1;
    return b.unitCost - a.unitCost;
  });
  
  return {
    context,
    items: scored.slice(0, limit),
    took: Date.now() - start,
  };
}
