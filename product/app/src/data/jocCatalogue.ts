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

/**
 * Search JOC catalogue by task code or description keywords
 * Optimized for 65k items - limits results and uses early termination
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
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return [];
  
  // Score-based search for better relevance
  const scored: { item: JOCItem; score: number }[] = [];
  
  for (const item of jocCatalogue) {
    const desc = item.description.toLowerCase();
    
    // Check if all words match
    const allMatch = words.every(word => desc.includes(word));
    if (!allMatch) continue;
    
    // Calculate relevance score
    let score = 0;
    
    // Exact phrase match = highest score
    if (desc.includes(q)) {
      score += 100;
    }
    
    // Starts with first word = high score
    if (desc.startsWith(words[0])) {
      score += 50;
    }
    
    // Word appears early in description = higher score
    const firstWordPos = desc.indexOf(words[0]);
    score += Math.max(0, 30 - firstWordPos);
    
    // Shorter descriptions = often more specific/relevant
    score += Math.max(0, 20 - desc.length / 10);
    
    // Higher unit cost = often main items (not accessories)
    score += Math.min(10, item.unitCost / 100);
    
    scored.push({ item, score });
    
    // Early termination - if we have enough high-scoring results, stop
    if (scored.length >= limit * 3) break;
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
