/**
 * HeightSelector Component
 * 
 * "Prompt user for ceiling height and add as a multiplier,
 *  when a line item in an assembly has that multiplier as an option"
 * 
 * Shows height tier options when items have ceiling height variants.
 */

import { useState, useMemo } from 'react';
import { Check, ArrowUpFromLine, TrendingUp, Info } from 'lucide-react';
import type { JOCItem } from '../types';
import { 
  HeightFamily,
  markRecommendedHeightTier,
  calculateHeightPremium,
  COMMON_HEIGHT_THRESHOLDS
} from '../utils/heightPremiums';

interface HeightSelectorProps {
  families: { item: JOCItem; family: HeightFamily }[];
  quantity: number;
  catalogue: JOCItem[];
  onConfirm: (ceilingHeight: number, adjustedItems: JOCItem[]) => void;
  onCancel: () => void;
}

export function HeightSelector({
  families,
  quantity,
  catalogue,
  onConfirm,
  onCancel
}: HeightSelectorProps) {
  const [ceilingHeight, setCeilingHeight] = useState<number>(10);
  const [customHeight, setCustomHeight] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);
  
  // Get unique height thresholds from all families
  const heightOptions = useMemo(() => {
    const thresholds = new Set<number>();
    families.forEach(({ family }) => {
      family.tiers.forEach(tier => {
        if (tier.range.max !== Infinity) thresholds.add(tier.range.max);
        if (tier.range.min > 0) thresholds.add(tier.range.min);
      });
    });
    
    // Add common thresholds if not present
    COMMON_HEIGHT_THRESHOLDS.forEach(t => thresholds.add(t));
    
    return Array.from(thresholds).sort((a, b) => a - b).slice(0, 6);
  }, [families]);
  
  // Calculate premium impact
  const premiumInfo = useMemo(() => {
    const items = families.map(f => f.item);
    return calculateHeightPremium(items, quantity, ceilingHeight, catalogue);
  }, [families, quantity, ceilingHeight, catalogue]);
  
  // Get adjusted items based on ceiling height
  const getAdjustedItems = () => {
    return families.map(({ family }) => {
      const markedFamily = markRecommendedHeightTier(family, ceilingHeight);
      const recommended = markedFamily.tiers.find(t => t.isRecommended);
      return recommended?.item || family.tiers[0]?.item;
    }).filter(Boolean) as JOCItem[];
  };
  
  const handleHeightChange = (height: number) => {
    setCeilingHeight(height);
    setShowCustom(false);
  };
  
  const handleCustomSubmit = () => {
    const height = parseFloat(customHeight);
    if (!isNaN(height) && height > 0) {
      setCeilingHeight(height);
      setShowCustom(false);
    }
  };
  
  const handleConfirm = () => {
    const adjustedItems = getAdjustedItems();
    onConfirm(ceilingHeight, adjustedItems);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-700/50 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpFromLine className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-white">Ceiling Height</h3>
        </div>
        <p className="text-sm text-white/60">
          Some items have height-based pricing. What's the ceiling height for this work?
        </p>
      </div>
      
      {/* Height Options */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-wrap gap-2 mb-3">
          {heightOptions.map(height => (
            <button
              key={height}
              onClick={() => handleHeightChange(height)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                ceilingHeight === height && !showCustom
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {height}'
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              showCustom
                ? 'bg-cyan-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            Custom
          </button>
        </div>
        
        {showCustom && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              placeholder="Enter height..."
              autoFocus
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCustomSubmit();
                if (e.key === 'Escape') setShowCustom(false);
              }}
            />
            <span className="text-white/50 text-sm">feet</span>
            <button
              onClick={handleCustomSubmit}
              className="px-3 py-2 bg-cyan-500 rounded-lg text-white text-sm font-medium"
            >
              Set
            </button>
          </div>
        )}
        
        <div className="mt-3 text-sm text-white/50">
          Selected: <span className="text-cyan-400 font-medium">{ceilingHeight}' ceiling height</span>
        </div>
      </div>
      
      {/* Affected Items */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">
          Items with height pricing ({families.length})
        </h4>
        <div className="space-y-2 max-h-40 overflow-auto">
          {families.map(({ item, family }) => {
            const markedFamily = markRecommendedHeightTier(family, ceilingHeight);
            const recommended = markedFamily.tiers.find(t => t.isRecommended);
            const baseTier = family.tiers[0];
            const premium = recommended && baseTier 
              ? ((recommended.item.unitCost - baseTier.item.unitCost) / baseTier.item.unitCost) * 100
              : 0;
            
            return (
              <div 
                key={item.taskCode}
                className="p-2 bg-white/5 rounded-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">
                      {family.baseDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-cyan-400">
                        {recommended?.range.label || 'Standard'}
                      </span>
                      {premium > 0 && (
                        <span className="text-xs text-amber-400">
                          +{premium.toFixed(0)}% premium
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-emerald-400">
                      ${recommended?.item.unitCost.toFixed(2)}/{family.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Cost Impact */}
      {premiumInfo.premium > 0 && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="text-amber-300 font-medium">
              +{(premiumInfo.premium * 100).toFixed(0)}% height premium
            </span>
            <span className="text-amber-300/70">
              {' '}(${premiumInfo.baseCost.toFixed(0)} → ${premiumInfo.adjustedCost.toFixed(0)})
            </span>
          </div>
        </div>
      )}
      
      {/* Info */}
      <div className="p-4 bg-blue-500/10 border-b border-blue-500/30 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-300">
          Higher ceilings require scaffolding or lifts, increasing labor costs. 
          Standard ceiling height is 8-10 feet.
        </p>
      </div>
      
      {/* Actions */}
      <div className="p-4 bg-gray-700/30 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-white/70 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Apply {ceilingHeight}' Height</span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// INLINE HEIGHT BADGE (for measurement panel)
// ============================================

interface HeightBadgeProps {
  ceilingHeight: number;
  hasPremium?: boolean;
  onClick?: () => void;
}

export function HeightBadge({ ceilingHeight, hasPremium, onClick }: HeightBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-all ${
        hasPremium
          ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
      }`}
      title={`Ceiling height: ${ceilingHeight}'`}
    >
      <ArrowUpFromLine className="w-3 h-3" />
      <span>{ceilingHeight}'</span>
      {hasPremium && <TrendingUp className="w-3 h-3" />}
    </button>
  );
}
