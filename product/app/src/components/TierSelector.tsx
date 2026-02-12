/**
 * TierSelector Component
 * 
 * "Suggest, but make the user manually confirm. Present all options."
 * 
 * Shows quantity tier options for JOC items with volume discounts.
 * Auto-suggests the appropriate tier based on the measurement quantity.
 */

import { useMemo } from 'react';
import { Check, AlertCircle, TrendingDown, ChevronRight } from 'lucide-react';
import type { JOCItem } from '../types';
import { 
  TierFamily, 
  QuantityTier,
  markRecommendedTier,
  calculateTierSavings,
  compareTierCosts
} from '../utils/quantityTiers';

interface TierSelectorProps {
  family: TierFamily;
  quantity: number;
  selectedTier?: QuantityTier;
  onSelectTier: (tier: QuantityTier) => void;
  onConfirm: (item: JOCItem) => void;
  compact?: boolean;
}

export function TierSelector({
  family,
  quantity,
  selectedTier,
  onSelectTier,
  onConfirm,
  compact = false
}: TierSelectorProps) {
  // Mark recommended tier based on quantity
  const markedFamily = useMemo(
    () => markRecommendedTier(family, quantity),
    [family, quantity]
  );
  
  // Calculate potential savings
  const savings = useMemo(
    () => calculateTierSavings(family, quantity),
    [family, quantity]
  );
  
  // Get cost comparison for all tiers
  const costComparison = useMemo(
    () => compareTierCosts(family, quantity),
    [family, quantity]
  );
  
  // Find the recommended tier
  const recommendedTier = markedFamily.tiers.find(t => t.isRecommended);
  
  // Current selection (default to recommended)
  const currentSelection = selectedTier || recommendedTier;
  
  return (
    <div className={`rounded-xl border border-white/10 bg-gray-800/50 overflow-hidden ${compact ? 'text-sm' : ''}`}>
      {/* Header */}
      <div className="p-3 bg-gray-700/50 border-b border-white/10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm leading-tight">
              {family.baseDescription}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/50">
                Quantity: <span className="text-white font-medium">{quantity.toLocaleString()} {family.unit}</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs text-amber-400">
                {markedFamily.tiers.length} tier options
              </span>
            </div>
          </div>
          
          {savings > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-lg shrink-0">
              <TrendingDown className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">
                Save ${savings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Tier Options */}
      <div className="divide-y divide-white/5">
        {markedFamily.tiers.map((tier, idx) => {
          const isSelected = currentSelection?.item.taskCode === tier.item.taskCode;
          const isRecommended = tier.isRecommended;
          const comparison = costComparison[idx];
          
          return (
            <button
              key={tier.item.taskCode}
              onClick={() => onSelectTier(tier)}
              className={`w-full p-3 text-left transition-all ${
                isSelected 
                  ? 'bg-blue-500/20 border-l-2 border-l-blue-500' 
                  : 'hover:bg-white/5 border-l-2 border-l-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Radio + Range */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Radio indicator */}
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-white/30'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  
                  {/* Range label */}
                  <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/80'}`}>
                    {tier.range.label}
                  </span>
                  
                  {/* Recommended badge */}
                  {isRecommended && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded font-medium shrink-0">
                      Suggested
                    </span>
                  )}
                </div>
                
                {/* Right: Cost info */}
                <div className="text-right shrink-0">
                  <div className={`font-medium ${isSelected ? 'text-blue-300' : 'text-white/70'}`}>
                    ${tier.item.unitCost.toFixed(2)}/{family.unit}
                  </div>
                  <div className="text-xs text-white/40">
                    Total: ${comparison.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              
              {/* Task code (subtle) */}
              <div className="mt-1 pl-6">
                <span className="text-xs font-mono text-white/30">
                  {tier.item.taskCode}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Warning if quantity exceeds all tiers */}
      {quantity > (markedFamily.tiers[markedFamily.tiers.length - 1]?.range.max || 0) && 
       markedFamily.tiers[markedFamily.tiers.length - 1]?.range.max !== Infinity && (
        <div className="p-3 bg-amber-500/10 border-t border-amber-500/30 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-xs text-amber-300">
            Quantity exceeds highest tier range. Using largest tier pricing. 
            Consider splitting into separate line items.
          </span>
        </div>
      )}
      
      {/* Confirm Button */}
      <div className="p-3 bg-gray-700/30 border-t border-white/10">
        <button
          onClick={() => currentSelection && onConfirm(currentSelection.item)}
          disabled={!currentSelection}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
        >
          <span>Confirm Selection</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// INLINE TIER BADGE (for measurement panel)
// ============================================

interface TierBadgeProps {
  family: TierFamily;
  selectedTier: QuantityTier;
  quantity: number;
  onClick?: () => void;
}

export function TierBadge({ family, selectedTier, quantity, onClick }: TierBadgeProps) {
  const markedFamily = markRecommendedTier(family, quantity);
  const isRecommended = markedFamily.tiers.find(
    t => t.item.taskCode === selectedTier.item.taskCode
  )?.isRecommended;
  
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all ${
        isRecommended
          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
      }`}
      title={`${family.tiers.length} tier options available`}
    >
      <span>{selectedTier.range.label}</span>
      {!isRecommended && (
        <AlertCircle className="w-3 h-3" />
      )}
    </button>
  );
}
