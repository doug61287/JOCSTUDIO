/**
 * Height Premium System
 * 
 * "Prompt user for ceiling height and add as a multiplier,
 *  when a line item in an assembly has that multiplier as an option"
 * 
 * JOC catalogues have items with height-based pricing:
 * - 09291000-0038: Up To 10' High, Walls, Tape... $0.78/SF
 * - 09291000-0039: >10' High, Walls, Tape... $1.03/SF (+32%)
 * 
 * This module detects height variants and helps select the right tier.
 */

import type { JOCItem } from '../types';

// ============================================
// TYPES
// ============================================

export interface HeightRange {
  min: number;        // Minimum height in feet (0 for "Up To X")
  max: number;        // Maximum height in feet (Infinity for ">X")
  label: string;      // Human-readable: "Up To 10'", ">10'"
}

export interface HeightTier {
  item: JOCItem;
  range: HeightRange;
  isRecommended?: boolean;
  premium?: number;   // Percentage premium vs base tier (e.g., 0.32 = +32%)
}

export interface HeightFamily {
  baseCode: string;           // Common task code prefix
  baseDescription: string;    // Description without height range
  unit: string;
  tiers: HeightTier[];
}

// Standard height thresholds commonly found in JOC catalogues
export const COMMON_HEIGHT_THRESHOLDS = [8, 10, 12, 15, 18, 20];

// ============================================
// PARSING UTILITIES
// ============================================

/**
 * Parse height range from description
 * Examples:
 *   "Up To 10' High, Walls, Tape..." → { min: 0, max: 10 }
 *   ">10' High, Walls, Tape..." → { min: 10, max: Infinity }
 *   "Up to 8' High Above Grade..." → { min: 0, max: 8 }
 *   ">12' To 18' Height, ..." → { min: 12, max: 18 }
 */
export function parseHeightRange(description: string): HeightRange | null {
  const normalized = description.replace(/,/g, '');
  
  // Pattern: "Up To X' High" or "Up to X' High" or "Up To X' Height"
  const upToMatch = normalized.match(/Up\s*To\s*(\d+)['']?\s*(High|Height)/i);
  if (upToMatch) {
    const max = parseInt(upToMatch[1], 10);
    return {
      min: 0,
      max: max,
      label: `Up To ${max}'`
    };
  }
  
  // Pattern: ">X' To Y' High/Height" (range)
  const rangeMatch = normalized.match(/>(\d+)['']?\s*To\s*(\d+)['']?\s*(High|Height)/i);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    return {
      min: min,
      max: max,
      label: `>${min}' To ${max}'`
    };
  }
  
  // Pattern: ">X' High" or ">X' Height" (open-ended)
  const openMatch = normalized.match(/>(\d+)['']?\s*(High|Height)/i);
  if (openMatch) {
    const min = parseInt(openMatch[1], 10);
    return {
      min: min,
      max: Infinity,
      label: `>${min}'`
    };
  }
  
  return null;
}

/**
 * Check if a description has height variant indicators
 */
export function hasHeightIndicator(description: string): boolean {
  return /Up\s*To\s*\d+['']?\s*(High|Height)|>\d+['']?\s*(High|Height)/i.test(description);
}

/**
 * Extract the base description without height range
 * "Up To 10' High, Walls, Tape, Spackle..." → "Walls, Tape, Spackle..."
 * ">10' High, Walls, Tape, Spackle..." → "Walls, Tape, Spackle..."
 */
export function getHeightBaseDescription(description: string): string {
  return description
    .replace(/^(Up\s*To\s*\d+['']?|>\d+['']?(\s*To\s*\d+['']?)?)\s*(High|Height),?\s*/i, '')
    .trim();
}

// ============================================
// HEIGHT FAMILY DETECTION
// ============================================

/**
 * Check if an item has height variants
 */
export function hasHeightVariants(item: JOCItem): boolean {
  return hasHeightIndicator(item.description);
}

/**
 * Find all height variants for an item from the catalogue
 * Height variants typically share the same task code prefix and have similar descriptions
 */
export function findHeightFamily(item: JOCItem, catalogue: JOCItem[]): HeightFamily | null {
  const range = parseHeightRange(item.description);
  if (!range) return null;
  
  // Get base description for matching
  const baseDesc = getHeightBaseDescription(item.description);
  const baseCode = item.taskCode.replace(/-\d{4}$/, '');
  
  // Find items with the same base code that have height indicators
  const relatedItems = catalogue.filter(i => {
    const iBaseCode = i.taskCode.replace(/-\d{4}$/, '');
    if (iBaseCode !== baseCode) return false;
    
    const iRange = parseHeightRange(i.description);
    if (!iRange) return false;
    
    // Check if base descriptions match (they should describe the same work)
    const iBaseDesc = getHeightBaseDescription(i.description);
    return baseDesc.toLowerCase() === iBaseDesc.toLowerCase();
  });
  
  if (relatedItems.length <= 1) return null;
  
  // Build tier list sorted by height
  const tiers: HeightTier[] = relatedItems
    .map(i => ({
      item: i,
      range: parseHeightRange(i.description)!
    }))
    .sort((a, b) => a.range.min - b.range.min);
  
  // Calculate premiums relative to first (base) tier
  const baseCost = tiers[0]?.item.unitCost || 0;
  tiers.forEach(tier => {
    if (baseCost > 0) {
      tier.premium = (tier.item.unitCost - baseCost) / baseCost;
    }
  });
  
  return {
    baseCode,
    baseDescription: baseDesc,
    unit: item.unit,
    tiers
  };
}

// ============================================
// HEIGHT SELECTION
// ============================================

/**
 * Suggest the appropriate tier based on ceiling height
 */
export function suggestHeightTier(tiers: HeightTier[], ceilingHeight: number): HeightTier | null {
  for (const tier of tiers) {
    const { min, max } = tier.range;
    
    // "Up To X" means height <= X
    if (tier.range.label.startsWith('Up To')) {
      if (ceilingHeight <= max) return tier;
    } 
    // ">X" open-ended means height > X
    else if (max === Infinity) {
      if (ceilingHeight > min) return tier;
    }
    // ">X To Y" means X < height <= Y
    else {
      if (ceilingHeight > min && ceilingHeight <= max) return tier;
    }
  }
  
  // Default to last (highest) tier if exceeds all
  return tiers.length > 0 ? tiers[tiers.length - 1] : null;
}

/**
 * Mark recommended tier based on ceiling height
 */
export function markRecommendedHeightTier(family: HeightFamily, ceilingHeight: number): HeightFamily {
  const recommended = suggestHeightTier(family.tiers, ceilingHeight);
  
  return {
    ...family,
    tiers: family.tiers.map(tier => ({
      ...tier,
      isRecommended: recommended?.item.taskCode === tier.item.taskCode
    }))
  };
}

// ============================================
// ASSEMBLY HEIGHT ANALYSIS
// ============================================

/**
 * Check if any items in a list have height variants
 * Used to determine if we should prompt for ceiling height
 */
export function assemblyHasHeightOptions(items: JOCItem[], catalogue: JOCItem[]): boolean {
  return items.some(item => {
    if (!hasHeightIndicator(item.description)) return false;
    const family = findHeightFamily(item, catalogue);
    return family !== null && family.tiers.length > 1;
  });
}

/**
 * Get all items in a list that have height variants
 */
export function getItemsWithHeightOptions(items: JOCItem[], catalogue: JOCItem[]): {
  item: JOCItem;
  family: HeightFamily;
}[] {
  const results: { item: JOCItem; family: HeightFamily }[] = [];
  
  for (const item of items) {
    if (!hasHeightIndicator(item.description)) continue;
    const family = findHeightFamily(item, catalogue);
    if (family && family.tiers.length > 1) {
      results.push({ item, family });
    }
  }
  
  return results;
}

/**
 * Replace height-tiered items with the correct tier based on ceiling height
 */
export function applyHeightSelection(
  items: JOCItem[], 
  ceilingHeight: number,
  catalogue: JOCItem[]
): JOCItem[] {
  return items.map(item => {
    if (!hasHeightIndicator(item.description)) return item;
    
    const family = findHeightFamily(item, catalogue);
    if (!family || family.tiers.length <= 1) return item;
    
    const recommended = suggestHeightTier(family.tiers, ceilingHeight);
    return recommended?.item || item;
  });
}

/**
 * Calculate total premium for using higher tiers
 * Useful for showing cost impact of ceiling height
 */
export function calculateHeightPremium(
  items: JOCItem[],
  quantity: number,
  ceilingHeight: number,
  catalogue: JOCItem[]
): { baseCost: number; adjustedCost: number; premium: number } {
  let baseCost = 0;
  let adjustedCost = 0;
  
  for (const item of items) {
    if (!hasHeightIndicator(item.description)) {
      baseCost += item.unitCost * quantity;
      adjustedCost += item.unitCost * quantity;
      continue;
    }
    
    const family = findHeightFamily(item, catalogue);
    if (!family || family.tiers.length <= 1) {
      baseCost += item.unitCost * quantity;
      adjustedCost += item.unitCost * quantity;
      continue;
    }
    
    // Base is first tier (lowest height)
    const baseTier = family.tiers[0];
    const selectedTier = suggestHeightTier(family.tiers, ceilingHeight);
    
    baseCost += baseTier.item.unitCost * quantity;
    adjustedCost += (selectedTier?.item.unitCost || item.unitCost) * quantity;
  }
  
  return {
    baseCost,
    adjustedCost,
    premium: baseCost > 0 ? (adjustedCost - baseCost) / baseCost : 0
  };
}
