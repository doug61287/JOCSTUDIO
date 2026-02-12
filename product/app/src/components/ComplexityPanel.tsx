/**
 * ComplexityPanel Component
 * 
 * "Let's handle these separately at the end for potential
 *  local/global adjustments to the estimate"
 * 
 * Project-level complexity factors that apply multipliers to the estimate.
 */

import { useState } from 'react';
import {
  Moon,
  Clock,
  Users,
  DoorClosed,
  Building2,
  ShieldPlus,
  AlertTriangle,
  Sparkles,
  KeyRound,
  Landmark,
  BadgeDollarSign,
  ChevronDown,
  ChevronUp,
  Settings2,
  Info,
  TrendingUp,
} from 'lucide-react';
import type { ComplexityFactor } from '../utils/complexityFactors';
import { 
  CATEGORY_INFO, 
  getFactorsByCategory,
  calculateComplexityMultiplier 
} from '../utils/complexityFactors';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon,
  Clock,
  Users,
  DoorClosed,
  Building2,
  ShieldPlus,
  AlertTriangle,
  Sparkles,
  KeyRound,
  Landmark,
  BadgeDollarSign,
};

interface ComplexityPanelProps {
  factors: ComplexityFactor[];
  subtotal: number;
  onToggleFactor: (factorId: string) => void;
  onUpdateMultiplier: (factorId: string, multiplier: number) => void;
  compact?: boolean;
}

export function ComplexityPanel({
  factors,
  subtotal,
  onToggleFactor,
  onUpdateMultiplier,
  compact = false
}: ComplexityPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['schedule', 'access']) // Start with these expanded
  );
  const [showAdjustments, setShowAdjustments] = useState<string | null>(null);
  
  const factorsByCategory = getFactorsByCategory(factors);
  const enabledCount = factors.filter(f => f.enabled).length;
  const totalMultiplier = calculateComplexityMultiplier(factors);
  const complexityAmount = subtotal * (totalMultiplier - 1);
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const renderFactor = (factor: ComplexityFactor) => {
    const IconComponent = ICON_MAP[factor.icon] || AlertTriangle;
    const isAdjusting = showAdjustments === factor.id;
    const amount = subtotal * factor.multiplier;
    
    return (
      <div 
        key={factor.id}
        className={`
          rounded-lg border transition-all
          ${factor.enabled 
            ? 'bg-white/5 border-white/10' 
            : 'bg-transparent border-white/5 hover:border-white/10'
          }
        `}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Toggle */}
          <button
            onClick={() => onToggleFactor(factor.id)}
            className={`
              w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors
              ${factor.enabled 
                ? 'bg-emerald-500 text-white' 
                : 'bg-white/10 hover:bg-white/20'
              }
            `}
          >
            {factor.enabled && <span className="text-xs">✓</span>}
          </button>
          
          {/* Icon & Name */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <IconComponent className={`w-4 h-4 flex-shrink-0 ${
              factor.enabled ? 'text-emerald-400' : 'text-white/40'
            }`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                factor.enabled ? 'text-white' : 'text-white/60'
              }`}>
                {factor.name}
              </p>
              {!compact && (
                <p className="text-[10px] text-white/40 truncate">
                  {factor.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Multiplier & Amount */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowAdjustments(isAdjusting ? null : factor.id)}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-colors
                ${factor.enabled
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                }
              `}
            >
              +{(factor.multiplier * 100).toFixed(0)}%
            </button>
            {factor.enabled && (
              <span className="text-sm text-emerald-400 font-medium tabular-nums w-16 text-right">
                +${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
        </div>
        
        {/* Multiplier Adjustment Slider */}
        {isAdjusting && (
          <div className="px-3 pb-3 pt-1 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/40 w-10">
                {(factor.minMultiplier * 100).toFixed(0)}%
              </span>
              <input
                type="range"
                min={factor.minMultiplier * 100}
                max={factor.maxMultiplier * 100}
                step={5}
                value={factor.multiplier * 100}
                onChange={(e) => onUpdateMultiplier(factor.id, parseInt(e.target.value) / 100)}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-white/40 w-10 text-right">
                {(factor.maxMultiplier * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-white/30 mt-2 text-center">
              Adjust based on project-specific conditions
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-white/10 bg-gray-800/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gray-700/50 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white">Complexity Factors</h3>
            {enabledCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                {enabledCount} active
              </span>
            )}
          </div>
          {enabledCount > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/40">Total Adjustment</p>
              <p className="text-lg font-bold text-emerald-400">
                +{((totalMultiplier - 1) * 100).toFixed(0)}%
              </p>
            </div>
          )}
        </div>
        
        {enabledCount === 0 && (
          <p className="text-sm text-white/50 mt-2">
            Toggle factors that apply to this project to adjust the estimate.
          </p>
        )}
      </div>
      
      {/* Categories */}
      <div className="divide-y divide-white/5">
        {Object.entries(CATEGORY_INFO).map(([categoryId, info]) => {
          const categoryFactors = factorsByCategory[categoryId] || [];
          const isExpanded = expandedCategories.has(categoryId);
          const enabledInCategory = categoryFactors.filter(f => f.enabled).length;
          
          return (
            <div key={categoryId}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryId)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider text-${info.color}-400`}>
                    {info.name}
                  </span>
                  {enabledInCategory > 0 && (
                    <span className={`px-1.5 py-0.5 bg-${info.color}-500/20 text-${info.color}-400 text-[10px] rounded font-medium`}>
                      {enabledInCategory}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/30" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/30" />
                )}
              </button>
              
              {/* Category Factors */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {categoryFactors.map(renderFactor)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      {enabledCount > 0 && (
        <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/30">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300">Complexity Premium</span>
                <span className="text-sm font-bold text-emerald-400">
                  +${complexityAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <p className="text-[10px] text-emerald-400/60 mt-1">
                Applied to ${subtotal.toLocaleString()} subtotal
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Info Footer */}
      <div className="p-3 bg-blue-500/5 border-t border-blue-500/20 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-300/70">
          Complexity factors are additive and apply to the line item subtotal 
          before location coefficient. Adjust percentages based on project-specific conditions.
        </p>
      </div>
    </div>
  );
}

// ============================================
// INLINE SUMMARY (for takeoff tab)
// ============================================

interface ComplexitySummaryProps {
  factors: ComplexityFactor[];
  subtotal: number;
  onClick?: () => void;
}

export function ComplexitySummary({ factors, subtotal, onClick }: ComplexitySummaryProps) {
  const enabledFactors = factors.filter(f => f.enabled);
  const totalMultiplier = calculateComplexityMultiplier(factors);
  const complexityAmount = subtotal * (totalMultiplier - 1);
  
  if (enabledFactors.length === 0) {
    return (
      <button
        onClick={onClick}
        className="w-full p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-dashed border-white/10 rounded-lg text-left transition-colors"
      >
        <div className="flex items-center gap-2 text-white/40">
          <Settings2 className="w-4 h-4" />
          <span className="text-xs">Add complexity factors (night work, occupied space, etc.)</span>
        </div>
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 rounded-lg text-left transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">
            Complexity Factors ({enabledFactors.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-400">
            +{((totalMultiplier - 1) * 100).toFixed(0)}%
          </span>
          <span className="text-sm font-bold text-emerald-400">
            +${complexityAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {enabledFactors.slice(0, 4).map(f => (
          <span 
            key={f.id}
            className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded"
          >
            {f.name}
          </span>
        ))}
        {enabledFactors.length > 4 && (
          <span className="px-1.5 py-0.5 bg-white/10 text-white/50 text-[10px] rounded">
            +{enabledFactors.length - 4} more
          </span>
        )}
      </div>
    </button>
  );
}
