/**
 * Quantity Tier System
 * 
 * "Suggest, but make the user manually confirm. Present all options."
 * 
 * JOC catalogues have items with quantity-based pricing tiers:
 * - 09012091-0002: Up To 2 SF, Cut And Patch... $21.36/SF
 * - 09012091-0003: >2 To 4 SF, Cut And Patch... $17.27/SF
 * - 09012091-0004: >4 To 8 SF, Cut And Patch... $15.51/SF
 * 
 * This module detects tier families and auto-suggests the right tier.
 */

import type { JOCItem } from '../types';

// ============================================
// TYPES
// ============================================

export interface QuantityRange {
  min: number;       // Inclusive minimum (0 for "Up To X")
  max: number;       // Exclusive maximum (Infinity for ">X")
  label: string;     // Human-readable: "Up To 2 SF", ">2 To 4 SF"
}

export interface QuantityTier {
  item: JOCItem;
  range: QuantityRange;
  isRecommended?: boolean;  // True when this is the auto-suggested tier
}

export interface TierFamily {
  baseCode: string;          // Common prefix: "09012091"
  baseDescription: string;   // Description without quantity range
  unit: string;
  tiers: QuantityTier[];
}

// ============================================
// PARSING UTILITIES
// ============================================

/**
 * Parse quantity range from description
 * Examples:
 *   "Up To 2 SF, Cut And Patch..." → { min: 0, max: 2 }
 *   ">2 To 4 SF, Cut And Patch..." → { min: 2, max: 4 }
 *   ">16 To 32 SF, Cut And Patch..." → { min: 16, max: 32 }
 *   ">10,000 SF, Gypsum Board..." → { min: 10000, max: Infinity }
 */
export function parseQuantityRange(description: string): QuantityRange | null {
  // Normalize - remove commas in numbers
  const normalized = description.replace(/,/g, '');
  
  // Pattern: "Up To X (SF|EA|LF|CY|etc)"
  const upToMatch = normalized.match(/^Up To (\d+(?:\.\d+)?)\s*(SF|EA|LF|CY|HR|EA)/i);
  if (upToMatch) {
    const max = parseFloat(upToMatch[1]);
    return {
      min: 0,
      max: max,
      label: `Up To ${formatNumber(max)} ${upToMatch[2]}`
    };
  }
  
  // Pattern: ">X To Y (SF|EA|LF|CY|etc)"
  const rangeMatch = normalized.match(/^>(\d+(?:\.\d+)?)\s*To\s*(\d+(?:\.\d+)?)\s*(SF|EA|LF|CY|HR|EA)/i);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return {
      min: min,
      max: max,
      label: `>${formatNumber(min)} To ${formatNumber(max)} ${rangeMatch[3]}`
    };
  }
  
  // Pattern: ">X (SF|EA|LF|CY|etc)" (open-ended)
  const openMatch = normalized.match(/^>(\d+(?:\.\d+)?)\s*(SF|EA|LF|CY|HR|EA)/i);
  if (openMatch) {
    const min = parseFloat(openMatch[1]);
    return {
      min: min,
      max: Infinity,
      label: `>${formatNumber(min)} ${openMatch[2]}`
    };
  }
  
  return null;
}

/**
 * Format numbers with commas for display
 */
function formatNumber(n: number): string {
  if (n === Infinity) return '∞';
  return n.toLocaleString();
}

/**
 * Extract base task code (remove the tier suffix)
 * "09012091-0002" → "09012091"
 * "02821660-0012" → "02821660"
 */
export function getBaseTaskCode(taskCode: string): string {
  // Remove trailing -#### suffix
  return taskCode.replace(/-\d{4}$/, '');
}

/**
 * Extract the description without the quantity prefix
 * "Up To 2 SF, Cut And Patch Hole In Gypsum Board" → "Cut And Patch Hole In Gypsum Board"
 * ">2 To 4 SF, Cut And Patch Hole In Gypsum Board" → "Cut And Patch Hole In Gypsum Board"
 */
export function getBaseDescription(description: string): string {
  // Remove leading quantity range and comma/whitespace
  return description
    .replace(/^(Up To \d[\d,]*(?:\.\d+)?|>\d[\d,]*(?:\.\d+)?(?: To \d[\d,]*(?:\.\d+)?)?)\s*(SF|EA|LF|CY|HR|EA),?\s*/i, '')
    .trim();
}

// ============================================
// TIER DETECTION
// ============================================

/**
 * Check if an item has quantity tiers (description starts with range pattern)
 */
export function hasTierVariants(item: JOCItem): boolean {
  return parseQuantityRange(item.description) !== null;
}

/**
 * Find all tier variants for an item from the catalogue
 * Returns null if the item doesn't have tiers
 */
export function findTierFamily(item: JOCItem, catalogue: JOCItem[]): TierFamily | null {
  // Check if this item has a quantity range
  const range = parseQuantityRange(item.description);
  if (!range) return null;
  
  const baseCode = getBaseTaskCode(item.taskCode);
  const baseDesc = getBaseDescription(item.description);
  
  // Find all items with the same base code
  const relatedItems = catalogue.filter(i => {
    const iBaseCode = getBaseTaskCode(i.taskCode);
    const iRange = parseQuantityRange(i.description);
    return iBaseCode === baseCode && iRange !== null;
  });
  
  if (relatedItems.length <= 1) return null;
  
  // Build tier list
  const tiers: QuantityTier[] = relatedItems
    .map(i => ({
      item: i,
      range: parseQuantityRange(i.description)!
    }))
    .sort((a, b) => a.range.min - b.range.min);
  
  return {
    baseCode,
    baseDescription: baseDesc,
    unit: item.unit,
    tiers
  };
}

/**
 * Find tier families by searching with a base description
 * Useful when user searches for "gypsum board patch" and we want to show all tiers
 */
export function findTierFamiliesByDescription(
  query: string, 
  catalogue: JOCItem[],
  limit: number = 5
): TierFamily[] {
  const q = query.toLowerCase();
  const families: Map<string, TierFamily> = new Map();
  
  for (const item of catalogue) {
    const range = parseQuantityRange(item.description);
    if (!range) continue;
    
    const baseCode = getBaseTaskCode(item.taskCode);
    const baseDesc = getBaseDescription(item.description);
    
    // Check if matches query
    if (!baseDesc.toLowerCase().includes(q)) continue;
    
    // Skip if we already have this family
    if (families.has(baseCode)) continue;
    
    // Build the family
    const family = findTierFamily(item, catalogue);
    if (family && family.tiers.length > 1) {
      families.set(baseCode, family);
      if (families.size >= limit) break;
    }
  }
  
  return Array.from(families.values());
}

// ============================================
// TIER SELECTION
// ============================================

/**
 * Auto-suggest the best tier based on quantity
 * Returns the tier where quantity falls within [min, max)
 */
export function suggestTier(tiers: QuantityTier[], quantity: number): QuantityTier | null {
  for (const tier of tiers) {
    const { min, max } = tier.range;
    
    // Check if quantity falls in this range
    // min is inclusive, max is exclusive (except for "Up To" which is inclusive)
    if (tier.range.label.startsWith('Up To')) {
      if (quantity <= max) return tier;
    } else if (max === Infinity) {
      if (quantity > min) return tier;
    } else {
      if (quantity > min && quantity <= max) return tier;
    }
  }
  
  // Default to last tier if quantity exceeds all ranges
  return tiers.length > 0 ? tiers[tiers.length - 1] : null;
}

/**
 * Mark the recommended tier in a tier family
 */
export function markRecommendedTier(family: TierFamily, quantity: number): TierFamily {
  const recommended = suggestTier(family.tiers, quantity);
  
  return {
    ...family,
    tiers: family.tiers.map(tier => ({
      ...tier,
      isRecommended: recommended?.item.taskCode === tier.item.taskCode
    }))
  };
}

// ============================================
// COST COMPARISON
// ============================================

/**
 * Calculate total cost for a quantity at each tier
 * Helps user understand impact of tier selection
 */
export function compareTierCosts(
  family: TierFamily, 
  quantity: number
): { tier: QuantityTier; totalCost: number; perUnitCost: number }[] {
  return family.tiers.map(tier => ({
    tier,
    totalCost: quantity * tier.item.unitCost,
    perUnitCost: tier.item.unitCost
  }));
}

/**
 * Calculate savings from using the correct tier vs the first/smallest tier
 */
export function calculateTierSavings(family: TierFamily, quantity: number): number {
  const firstTier = family.tiers[0];
  const recommendedTier = suggestTier(family.tiers, quantity);
  
  if (!firstTier || !recommendedTier) return 0;
  if (firstTier.item.taskCode === recommendedTier.item.taskCode) return 0;
  
  const firstCost = quantity * firstTier.item.unitCost;
  const recommendedCost = quantity * recommendedTier.item.unitCost;
  
  return firstCost - recommendedCost;
}

// ============================================
// ADD/DEDUCT TIER SYSTEM (from H+H CTC PDF)
// Single item with quantity-based price adjustments
// ============================================

export interface AddDeductTier {
  minQty: number;
  maxQty: number | null;  // null = open-ended (e.g., >1000)
  operation: 'add' | 'deduct';
  adjustment: number;  // The amount to add/deduct (negative for deduct)
}

// Import the tier map (loaded from JSON)
import tierMapData from '../data/tier-map.json';
const tierMap = tierMapData as Record<string, AddDeductTier[]>;

/**
 * Check if an item has add/deduct quantity tiers
 */
export function hasAddDeductTiers(taskCode: string): boolean {
  return taskCode in tierMap && tierMap[taskCode].length > 0;
}

/**
 * Get all add/deduct tiers for an item
 */
export function getAddDeductTiers(taskCode: string): AddDeductTier[] {
  return tierMap[taskCode] || [];
}

/**
 * Calculate the adjusted unit price based on quantity
 * 
 * Example: 21131300-0026 (Upright Brass Sprinkler Head)
 * - Base price: $101.97 (for qty 1-25)
 * - Qty 26-50: Deduct $3.38 → $98.59
 * - Qty 51-100: Deduct $8.48 → $93.49
 */
export function calculateAdjustedPrice(
  basePrice: number, 
  taskCode: string, 
  quantity: number
): { adjustedPrice: number; adjustment: number; tierLabel: string } {
  const tiers = getAddDeductTiers(taskCode);
  
  if (tiers.length === 0) {
    return { adjustedPrice: basePrice, adjustment: 0, tierLabel: 'Base' };
  }
  
  // Find the applicable tier
  for (const tier of tiers) {
    const inRange = quantity >= tier.minQty && 
                   (tier.maxQty === null || quantity <= tier.maxQty);
    
    if (inRange) {
      const adjustment = tier.adjustment;
      const adjustedPrice = basePrice + adjustment;
      const rangeLabel = tier.maxQty 
        ? `${tier.minQty}-${tier.maxQty}`
        : `${tier.minQty}+`;
      
      return { 
        adjustedPrice, 
        adjustment,
        tierLabel: `Qty ${rangeLabel}` 
      };
    }
  }
  
  // No matching tier = base price
  return { adjustedPrice: basePrice, adjustment: 0, tierLabel: 'Base (1-25)' };
}

/**
 * Get a summary of potential savings from quantity tiers
 */
export function getQuantityTierSummary(
  taskCode: string, 
  basePrice: number,
  quantity: number
): { hasTiers: boolean; currentPrice: number; savings: number; maxSavings: number } {
  const tiers = getAddDeductTiers(taskCode);
  
  if (tiers.length === 0) {
    return { hasTiers: false, currentPrice: basePrice, savings: 0, maxSavings: 0 };
  }
  
  const { adjustedPrice } = calculateAdjustedPrice(basePrice, taskCode, quantity);
  const savings = (basePrice - adjustedPrice) * quantity;
  
  // Calculate max possible savings (using the largest discount tier)
  const maxDiscount = Math.max(...tiers.filter(t => t.adjustment < 0).map(t => Math.abs(t.adjustment)));
  const maxSavings = maxDiscount * quantity;
  
  return { 
    hasTiers: true, 
    currentPrice: adjustedPrice, 
    savings: savings > 0 ? savings : 0,
    maxSavings 
  };
}
