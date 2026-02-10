/**
 * JOC Catalogue Service
 * Provides fast search and translation for 65,000+ NYC H+H CTC line items
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../../lib/logger.js';
import { translateDescription, analyzeInput, TranslationContext, ScoredItem } from './translator.js';

export interface JOCItem {
  taskCode: string;
  description: string;
  unit: string;
  unitCost: number;
}

export interface SearchResult {
  items: JOCItem[];
  total: number;
  query: string;
  took: number;
}

export interface DivisionInfo {
  code: string;
  name: string;
  count: number;
}

// CSI Division names
const CSI_DIVISIONS: Record<string, string> = {
  '01': 'General Requirements',
  '02': 'Existing Conditions',
  '03': 'Concrete',
  '04': 'Masonry',
  '05': 'Metals',
  '06': 'Wood/Plastics/Composites',
  '07': 'Thermal/Moisture Protection',
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
  '28': 'Electronic Safety/Security',
  '31': 'Earthwork',
  '32': 'Exterior Improvements',
  '33': 'Utilities',
  '34': 'Transportation',
  '40': 'Process Integration',
  '41': 'Material Processing',
  '42': 'Process Heating/Cooling',
  '43': 'Process Gas/Liquid',
  '44': 'Pollution Control',
  '46': 'Water/Wastewater',
  '48': 'Electrical Power',
};

// In-memory catalogue with search indexes
class CatalogueService {
  private items: JOCItem[] = [];
  private byCode: Map<string, JOCItem> = new Map();
  private byDivision: Map<string, JOCItem[]> = new Map();
  private searchIndex: Map<string, Set<number>> = new Map(); // word -> item indexes
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    const start = Date.now();
    const dataPath = join(process.cwd(), 'data/nyc-hh-ctc-2024.json');
    
    try {
      const data = readFileSync(dataPath, 'utf-8');
      this.items = JSON.parse(data);
      
      // Build indexes
      this.buildIndexes();
      
      this.loaded = true;
      logger.info(`Loaded ${this.items.length} JOC items in ${Date.now() - start}ms`);
    } catch (error) {
      logger.error({ error }, 'Failed to load JOC catalogue');
      throw error;
    }
  }

  private buildIndexes(): void {
    // Index by task code
    for (const item of this.items) {
      this.byCode.set(item.taskCode, item);
    }

    // Index by division
    for (const item of this.items) {
      const div = item.taskCode.substring(0, 2);
      if (!this.byDivision.has(div)) {
        this.byDivision.set(div, []);
      }
      this.byDivision.get(div)!.push(item);
    }

    // Build word search index
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const words = this.tokenize(item.description);
      
      for (const word of words) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set());
        }
        this.searchIndex.get(word)!.add(i);
      }
    }
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);
  }

  /**
   * Search catalogue by keyword or task code
   */
  search(query: string, options: { limit?: number; division?: string } = {}): SearchResult {
    const start = Date.now();
    const { limit = 50, division } = options;
    
    const queryLower = query.toLowerCase().trim();
    let candidates: JOCItem[] = [];

    // If query looks like a task code, search by code prefix
    if (/^\d{2}/.test(query)) {
      candidates = this.items.filter(item => 
        item.taskCode.startsWith(query.replace(/\s/g, ''))
      );
    } else {
      // Word-based search
      const queryWords = this.tokenize(queryLower);
      
      if (queryWords.length === 0) {
        return { items: [], total: 0, query, took: Date.now() - start };
      }

      // Find items matching ALL query words
      const matchSets = queryWords.map(word => {
        const exactMatches = this.searchIndex.get(word) || new Set<number>();
        
        // Also find partial matches for flexibility
        const partialMatches = new Set<number>();
        for (const [indexWord, indexes] of this.searchIndex) {
          if (indexWord.includes(word) || word.includes(indexWord)) {
            for (const idx of indexes) {
              partialMatches.add(idx);
            }
          }
        }
        
        return new Set([...exactMatches, ...partialMatches]);
      });

      // Intersection of all word matches
      const resultIndexes = matchSets.reduce((acc, set) => {
        return new Set([...acc].filter(x => set.has(x)));
      });

      candidates = [...resultIndexes].map(i => this.items[i]);
    }

    // Filter by division if specified
    if (division) {
      candidates = candidates.filter(item => item.taskCode.startsWith(division));
    }

    // Sort by relevance (exact match first, then by cost)
    candidates.sort((a, b) => {
      const aExact = a.description.toLowerCase().includes(queryLower) ? 0 : 1;
      const bExact = b.description.toLowerCase().includes(queryLower) ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      return b.unitCost - a.unitCost; // Higher cost first (more significant items)
    });

    return {
      items: candidates.slice(0, limit),
      total: candidates.length,
      query,
      took: Date.now() - start,
    };
  }

  /**
   * Get item by exact task code
   */
  getByCode(taskCode: string): JOCItem | undefined {
    return this.byCode.get(taskCode.replace(/\s/g, ''));
  }

  /**
   * Get all items in a division
   */
  getByDivision(divCode: string, limit = 100): JOCItem[] {
    const items = this.byDivision.get(divCode) || [];
    return items.slice(0, limit);
  }

  /**
   * Get division summary
   */
  getDivisions(): DivisionInfo[] {
    const divisions: DivisionInfo[] = [];
    
    for (const [code, items] of this.byDivision) {
      divisions.push({
        code,
        name: CSI_DIVISIONS[code] || 'Unknown',
        count: items.length,
      });
    }

    return divisions.sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Translate plain English description to JOC line items
   * Uses smart keyword extraction, synonyms, and division hints
   */
  translate(description: string, options: { limit?: number; minScore?: number } = {}): {
    items: ScoredItem[];
    context: TranslationContext;
    took: number;
  } {
    const result = translateDescription(description, this.items, options);
    
    return {
      items: result.items,
      context: result.context,
      took: result.took,
    };
  }

  /**
   * Get catalogue stats
   */
  getStats(): { total: number; divisions: number; loaded: boolean } {
    return {
      total: this.items.length,
      divisions: this.byDivision.size,
      loaded: this.loaded,
    };
  }
}

// Singleton instance
export const catalogueService = new CatalogueService();
