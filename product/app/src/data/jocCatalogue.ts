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
    
    // Check original word matches (highest priority)
    const originalMatches = originalWords.filter(word => desc.includes(word));
    if (originalMatches.length === originalWords.length) {
      score += 100; // All original words match
    } else if (originalMatches.length > 0) {
      score += originalMatches.length * 30; // Partial original match
    }
    
    // Check expanded word matches
    const expandedMatches = expandedWords.filter(word => desc.includes(word));
    score += expandedMatches.length * 15;
    
    // Skip if no matches at all (unless division match)
    if (score === 0 || (score === 50 && expandedMatches.length === 0)) {
      // For division-only matches, require at least something relevant
      if (divisionCode && taskCode.startsWith(divisionCode)) {
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
