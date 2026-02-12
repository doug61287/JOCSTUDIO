// NYC H+H Construction Task Catalog - FULL 65,331 items
import type { JOCItem } from '../types';
import fullCatalogue from './nyc-hh-ctc-full.json';

export type { JOCItem };

// Export the full catalogue
export const jocCatalogue: JOCItem[] = fullCatalogue as JOCItem[];

// Re-export tier utilities for convenience
export { 
  findTierFamily, 
  hasTierVariants, 
  suggestTier,
  markRecommendedTier,
  type TierFamily,
  type QuantityTier 
} from '../utils/quantityTiers';

// Stats
console.log(`JOC Catalogue loaded: ${jocCatalogue.length.toLocaleString()} items`);

// ============================================
// KEYWORD EXPANSION & SYNONYMS
// Maps common search terms to catalogue terminology
// ============================================

const KEYWORD_SYNONYMS: Record<string, string[]> = {
  // Masonry terms
  'masonry': ['concrete block', 'cmu', 'brick', 'block wall', 'mortar'],
  'cmu': ['concrete block', 'block'],
  'block': ['concrete block', 'cmu'],
  'brick': ['face brick', 'common brick', 'clay brick'],
  
  // Drywall/Gypsum terms  
  'drywall': ['gypsum', 'gypsum board', 'sheetrock', 'gyp bd'],
  'sheetrock': ['gypsum', 'gypsum board', 'drywall'],
  'gyp': ['gypsum'],
  
  // Flooring terms
  'vct': ['vinyl composition tile', 'vinyl tile'],
  'lvt': ['luxury vinyl', 'vinyl plank'],
  'carpet': ['carpet tile', 'broadloom'],
  'terrazzo': ['epoxy terrazzo', 'cementitious terrazzo'],
  
  // Ceiling terms
  'act': ['acoustic ceiling', 'ceiling tile', 'suspended ceiling'],
  'drop ceiling': ['suspended ceiling', 'acoustic', 'ceiling tile'],
  
  // Door terms
  'hm': ['hollow metal', 'steel door'],
  'hollow metal': ['hm door', 'steel door', 'metal door'],
  
  // Paint terms
  'paint': ['coating', 'finish', 'primer'],
  'epoxy': ['epoxy coating', 'epoxy paint', 'epoxy floor'],
  
  // MEP terms
  'hvac': ['mechanical', 'ductwork', 'air handling'],
  'electrical': ['power', 'lighting', 'receptacle', 'outlet'],
  'plumbing': ['piping', 'fixture', 'lavatory', 'water'],
  
  // ============================================
  // DIVISION 21 - FIRE PROTECTION SYNONYMS
  // ============================================
  
  // Sprinkler pipe - natural language to catalogue terminology
  'sprinkler pipe': ['cpvc', 'fire sprinkler pipe', 'chlorinated polyvinyl'],
  'fp pipe': ['cpvc', 'fire sprinkler pipe'],
  'fire pipe': ['cpvc', 'fire sprinkler pipe'],
  'sprinkler main': ['cpvc', 'fire sprinkler pipe'],
  'branch pipe': ['cpvc', 'fire sprinkler pipe'],
  'branch line': ['cpvc', 'fire sprinkler pipe'],
  'cpvc': ['chlorinated polyvinyl chloride', 'fire sprinkler pipe'],
  
  // Sprinkler heads - including common misspellings
  'sprinkler head': ['sprinkler head', 'wet pipe sprinkler head'],
  // Removed 'head': ['sprinkler head'] - too generic, matches traffic signals etc.
  'pendant': ['pendent'],  // Common misspelling → H+H spelling
  'pendant head': ['pendent', 'sprinkler head'],
  'upright head': ['upright', 'sprinkler head'],
  'sidewall head': ['sidewall', 'sprinkler head'],
  'concealed head': ['concealed', 'sprinkler head'],
  'qr head': ['quick response'],
  'quick response head': ['quick response', 'sprinkler head'],
  
  // System types
  'wet pipe': ['wet-pipe', 'wet pipe'],
  'wet system': ['wet-pipe', 'wet pipe'],
  'dry pipe': ['dry-pipe', 'dry pipe'],
  'dry system': ['dry-pipe', 'dry pipe'],
  'preaction': ['preaction', 'pre-action'],
  'pre-action': ['preaction'],
  
  // Valves and components
  'alarm check': ['alarm check valve'],
  'check valve': ['alarm check valve', 'check valve'],
  'flow switch': ['flow detector', 'water flow'],
  'tamper switch': ['tamper', 'supervisory'],
  'fdc': ['siamese'],  // Just 'siamese' - don't expand to 'fire' which matches 'fired'
  'siamese': ['siamese connection'],
  'fire department connection': ['siamese'],
  
  // Kitchen/specialty systems
  'ansul': ['kitchen fire suppression', 'wet chemical'],
  'kitchen hood': ['kitchen fire suppression', 'wet chemical'],
  'kitchen suppression': ['kitchen fire suppression', 'wet chemical'],
  'clean agent': ['sapphire', 'novec', 'fm-200'],
  'sapphire': ['clean agent', 'sapphire'],
  'fm200': ['fm-200', 'clean agent'],
  'fm-200': ['fm-200', 'clean agent'],
  
  // Relocation/modification
  'relocate head': ['relocate', 'sprinkler head', 'branch piping'],
  'move head': ['relocate', 'sprinkler head'],
  'head relocation': ['relocate', 'sprinkler head'],
  'purge': ['purge liquid system'],
  'drain system': ['purge liquid system'],
  
  // Fire pumps
  'fire pump': ['fire pump', 'electric-drive', 'diesel'],
  'jockey pump': ['jockey pump', 'pressure maintenance'],
  
  // Demo terms
  'demo': ['demolition', 'removal', 'remove'],
  'demolition': ['demo', 'removal', 'selective demolition'],
  
  // General terms
  'storefront': ['aluminum storefront', 'storefront framing', 'glazing'],
  'window': ['glazing', 'glass', 'window frame'],
  'door': ['door frame', 'hardware', 'closer'],
  'insulation': ['thermal', 'fiberglass', 'rigid insulation'],
};

// Division code mappings for category searches
const DIVISION_KEYWORDS: Record<string, string> = {
  'masonry': '04',
  'concrete': '03',
  'metals': '05',
  'steel': '05',
  'wood': '06',
  'carpentry': '06',
  'thermal': '07',
  'roofing': '07',
  'waterproofing': '07',
  'doors': '08',
  'windows': '08',
  'openings': '08',
  'finishes': '09',
  'drywall': '09',
  'flooring': '09',
  'painting': '09',
  'specialties': '10',
  'equipment': '11',
  'furnishings': '12',
  'fire suppression': '21',
  'sprinkler': '21',
  'fire protection': '21',
  'fp': '21',
  'sprinkler pipe': '21',
  'sprinkler head': '21',
  'cpvc': '21',
  'wet pipe': '21',
  'dry pipe': '21',
  'ansul': '21',
  'kitchen suppression': '21',
  'fire pump': '21',
  'plumbing': '22',
  'hvac': '23',
  'mechanical': '23',
  'electrical': '26',
  'communications': '27',
  'security': '28',
};

/**
 * Expand search terms with synonyms
 */
function expandKeywords(words: string[]): string[] {
  const expanded = new Set(words);
  
  for (const word of words) {
    const synonyms = KEYWORD_SYNONYMS[word];
    if (synonyms) {
      synonyms.forEach(s => {
        // Add individual words from multi-word synonyms
        s.split(/\s+/).forEach(w => expanded.add(w));
      });
    }
  }
  
  return Array.from(expanded);
}

/**
 * Extract pipe size from query (for Division 21/22 searches)
 * "3 inch sprinkler pipe" → "3""
 * "1-1/2 sprinkler" → "1-1/2""
 * "3/4" cpvc" → "3/4""
 */
function extractPipeSize(query: string): string | null {
  const q = query.toLowerCase();
  
  // Order matters - check compound fractions FIRST
  const patterns = [
    // Compound sizes: 1-1/2, 2-1/2, 1 1/2, etc.
    /(\d+)[-\s](\d+\/\d+)\s*(?:"|"|inch|in\b|pipe)?/,
    // Simple fractions: 3/4, 1/2
    /(\d+\/\d+)\s*(?:"|"|inch|in\b)?/,
    // Whole numbers: 3", 3 inch, 4-inch (but NOT when part of a compound)
    /(?<!\d[-\s])(\d+)\s*(?:"|"|inch|-inch|in\b)/,
  ];
  
  for (const pattern of patterns) {
    const match = q.match(pattern);
    if (match) {
      // Handle compound fraction: "1-1/2" format
      if (match[2]) {
        return `${match[1]}-${match[2]}"`;
      }
      return `${match[1]}"`;
    }
  }
  
  return null;
}

/**
 * Normalize pipe size to H+H catalogue format
 */
function normalizePipeSize(size: string): string {
  // Convert "1.5" → "1-1/2", "2.5" → "2-1/2", etc.
  const decimalMap: Record<string, string> = {
    '0.5': '1/2',
    '0.75': '3/4',
    '1.25': '1-1/4',
    '1.5': '1-1/2',
    '2.5': '2-1/2',
  };
  
  for (const [decimal, fraction] of Object.entries(decimalMap)) {
    if (size.includes(decimal)) {
      return size.replace(decimal, fraction);
    }
  }
  
  return size;
}

/**
 * Search JOC catalogue by task code or description keywords
 * Optimized for 65k items - limits results and uses early termination
 * 
 * Now with:
 * - Keyword expansion (masonry → concrete block, cmu, etc.)
 * - Division-aware search (masonry → Division 04)
 * - Flexible matching (any expanded keyword, not all required)
 */
export function searchJOCItems(query: string, limit: number = 20): JOCItem[] {
  if (!query.trim() || query.length < 2) return [];
  
  const q = query.toLowerCase().trim();
  const results: JOCItem[] = [];
  
  // If looks like a task code (starts with 2 digits), search by code prefix
  if (/^\d{2}/.test(query)) {
    const codeQuery = q.replace(/[\s-]/g, '');
    for (const item of jocCatalogue) {
      if (item.taskCode.toLowerCase().replace(/-/g, '').startsWith(codeQuery)) {
        results.push(item);
        if (results.length >= limit) break;
      }
    }
    return results;
  }
  
  // Search by description keywords
  const originalWords = q.split(/\s+/).filter(w => w.length >= 2);
  if (originalWords.length === 0) return [];
  
  // Expand keywords with synonyms
  const expandedWords = expandKeywords(originalWords);
  
  // Check if this is a division-level search
  const divisionCode = DIVISION_KEYWORDS[q] || DIVISION_KEYWORDS[originalWords[0]];
  
  // Extract pipe size if present (for pipe/fitting searches)
  const pipeSize = extractPipeSize(q);
  const normalizedPipeSize = pipeSize ? normalizePipeSize(pipeSize) : null;
  
  // Score-based search for better relevance
  const scored: { item: JOCItem; score: number }[] = [];
  
  for (const item of jocCatalogue) {
    const desc = item.description.toLowerCase();
    const taskCode = item.taskCode;
    let score = 0;
    
    // Division match - boost items from the relevant division
    if (divisionCode && taskCode.startsWith(divisionCode)) {
      score += 50;
    }
    
    // Pipe size match - HUGE boost for exact size match
    if (normalizedPipeSize) {
      // Remove the trailing quote for matching
      const sizeWithoutQuote = normalizedPipeSize.replace('"', '');
      
      // Must match size at START of description (e.g., "3" Schedule" not "33"")
      // or after a comma/space with specific format
      const startsWithSize = desc.startsWith(sizeWithoutQuote + '"') || 
                             desc.startsWith(sizeWithoutQuote + ' ');
      const hasExactSize = new RegExp(`(^|[,\\s])${sizeWithoutQuote.replace(/[/-]/g, '[-/]')}"`, 'i').test(desc);
      
      if (startsWithSize || hasExactSize) {
        score += 200; // Very high boost for exact size match at start
      } else {
        // If we're searching for a specific size but this item doesn't match, penalize heavily
        score -= 100;
      }
    }
    
    // Check original word matches (highest priority)
    const originalMatches = originalWords.filter(word => desc.includes(word));
    
    // For multi-word queries, REQUIRE all words to match (or use expanded synonyms)
    const isMultiWord = originalWords.length >= 2;
    
    if (originalMatches.length === originalWords.length) {
      score += 150; // All original words match - big boost
    } else if (originalMatches.length > 0) {
      if (isMultiWord) {
        // Partial match on multi-word query - check if synonyms fill the gap
        // Much lower score for partial matches
        score += originalMatches.length * 10;
      } else {
        score += originalMatches.length * 30;
      }
    }
    
    // Check expanded word matches (synonyms)
    const expandedMatches = expandedWords.filter(word => desc.includes(word));
    const expandedOnlyMatches = expandedMatches.filter(w => !originalWords.includes(w));
    score += expandedOnlyMatches.length * 20;
    
    // For multi-word queries, require MOST words to match
    const totalMatches = new Set([...originalMatches, ...expandedMatches]).size;
    const hasGoodMatch = isMultiWord 
      ? (originalMatches.length === originalWords.length || totalMatches >= originalWords.length)
      : (originalMatches.length > 0 || expandedMatches.length > 0);
    
    // Skip if not a good match OR negative score
    if (!hasGoodMatch || score <= 0 || (score === 50 && expandedMatches.length === 0)) {
      // For division-only matches, require at least something relevant
      if (divisionCode && taskCode.startsWith(divisionCode) && score >= 0) {
        // Include division items but with lower score
        score = 25;
      } else {
        continue;
      }
    }
    
    // Exact phrase match = highest score
    if (desc.includes(q)) {
      score += 80;
    }
    
    // Starts with first word = high score
    if (desc.startsWith(originalWords[0]) || desc.startsWith(expandedWords[0])) {
      score += 40;
    }
    
    // Word appears early in description = higher score
    const firstWordPos = desc.indexOf(originalWords[0]);
    if (firstWordPos >= 0) {
      score += Math.max(0, 25 - firstWordPos / 2);
    }
    
    // Shorter descriptions = often more specific/relevant
    score += Math.max(0, 15 - desc.length / 15);
    
    // Higher unit cost = often main items (not accessories)
    score += Math.min(8, item.unitCost / 100);
    
    scored.push({ item, score });
    
    // Early termination - if we have enough high-scoring results, stop
    if (scored.length >= limit * 5) break;
  }
  
  // Sort by score and return top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.item);
}

/**
 * Get items by CSI division code (first 2 digits of task code)
 */
export function getItemsByDivision(divisionCode: string): JOCItem[] {
  const prefix = divisionCode.padStart(2, '0');
  return jocCatalogue.filter(item => item.taskCode.startsWith(prefix));
}

/**
 * Get all unique CSI divisions in the catalogue
 */
export function getDivisions(): { code: string; name: string; count: number }[] {
  const divisionNames: Record<string, string> = {
    '01': 'General Requirements',
    '02': 'Existing Conditions',
    '03': 'Concrete',
    '04': 'Masonry',
    '05': 'Metals',
    '06': 'Wood & Plastics',
    '07': 'Thermal & Moisture',
    '08': 'Doors & Windows',
    '09': 'Finishes',
    '10': 'Specialties',
    '11': 'Equipment',
    '12': 'Furnishings',
    '13': 'Special Construction',
    '14': 'Conveying Systems',
    '21': 'Fire Suppression',
    '22': 'Plumbing',
    '23': 'HVAC',
    '25': 'Integrated Automation',
    '26': 'Electrical',
    '27': 'Communications',
    '28': 'Electronic Safety',
    '31': 'Earthwork',
    '32': 'Exterior Improvements',
    '33': 'Utilities',
  };
  
  const counts: Record<string, number> = {};
  
  for (const item of jocCatalogue) {
    const div = item.taskCode.substring(0, 2);
    counts[div] = (counts[div] || 0) + 1;
  }
  
  return Object.entries(counts)
    .map(([code, count]) => ({
      code,
      name: divisionNames[code] || `Division ${code}`,
      count,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));
}
