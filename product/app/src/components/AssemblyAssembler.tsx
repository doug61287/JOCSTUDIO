/**
 * Assembly Assembler - Guided Chatbot Flow
 * Conversational wizard for building custom assemblies step-by-step
 */

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Package, Wrench, Info, Sparkles, Save } from 'lucide-react';
import type { Assembly, JOCItem, AssemblyItem, AssemblyCategory } from '../types';
import { jocCatalogue } from '../data/jocCatalogue';
import { generateAssemblyId } from '../utils/userAssemblyStore';

// ============================================
// TYPES
// ============================================

interface AssemblyAssemblerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assembly: Assembly) => void;
  onSaveAndStart: (assembly: Assembly) => void;
  initialQuery: string;
  initialCategory?: AssemblyCategory;
}

type Step = 'type' | 'size' | 'material' | 'fittings' | 'review';

// Assembly type definitions per category
interface AssemblyTypeOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  needsSize: boolean;
  needsMaterial: boolean;
  taskCodePrefix: string; // Division prefix for searching
  applicableTo: ('line' | 'polyline' | 'area' | 'count' | 'space')[];
}

// ============================================
// FIRE PROTECTION OPTIONS
// ============================================

const FIRE_PROTECTION_TYPES: AssemblyTypeOption[] = [
  {
    id: 'sprinkler-main',
    name: 'Sprinkler Main',
    icon: '🔴',
    description: 'Underground or riser pipe',
    needsSize: true,
    needsMaterial: true,
    taskCodePrefix: '21', // Fire suppression (CPVC under 21134, black steel under 23211)
    applicableTo: ['line', 'polyline'],
  },
  {
    id: 'branch-line',
    name: 'Branch Line',
    icon: '🟠',
    description: 'Ceiling distribution',
    needsSize: true,
    needsMaterial: true,
    taskCodePrefix: '21',
    applicableTo: ['line', 'polyline'],
  },
  {
    id: 'sprinkler-head',
    name: 'Sprinkler Head',
    icon: '💧',
    description: 'Pendent, upright, sidewall',
    needsSize: false,
    needsMaterial: false,
    taskCodePrefix: '211313', // Sprinkler heads
    applicableTo: ['count'],
  },
  {
    id: 'standpipe',
    name: 'Standpipe',
    icon: '🔵',
    description: 'Vertical riser system',
    needsSize: true,
    needsMaterial: true,
    taskCodePrefix: '21111',
    applicableTo: ['line', 'polyline'],
  },
  {
    id: 'fire-pump',
    name: 'Fire Pump',
    icon: '⚙️',
    description: 'Pump assembly',
    needsSize: false,
    needsMaterial: false,
    taskCodePrefix: '211123', // Fire pumps
    applicableTo: ['count'],
  },
  {
    id: 'cabinet',
    name: 'Cabinets & Ext.',
    icon: '🧯',
    description: 'Fire cabinets, extinguishers',
    needsSize: false,
    needsMaterial: false,
    taskCodePrefix: '104413', // Fire extinguisher cabinets
    applicableTo: ['count'],
  },
];

// ============================================
// PLUMBING OPTIONS
// ============================================

const PLUMBING_TYPES: AssemblyTypeOption[] = [
  {
    id: 'supply-pipe',
    name: 'Supply Pipe',
    icon: '💧',
    description: 'Hot/cold water supply',
    needsSize: true,
    needsMaterial: true,
    taskCodePrefix: '22111', // Plumbing piping
    applicableTo: ['line', 'polyline'],
  },
  {
    id: 'waste-drain',
    name: 'Waste/Drain',
    icon: '🟤',
    description: 'DWV - sanitary drain',
    needsSize: true,
    needsMaterial: true,
    taskCodePrefix: '22111',
    applicableTo: ['line', 'polyline'],
  },
  {
    id: 'vent-pipe',
    name: 'Vent Pipe',
    icon: '🌬️',
    description: 'Plumbing vent stack',
    needsSize: true,
    needsMaterial: true,
    taskCodePrefix: '22111',
    applicableTo: ['line', 'polyline'],
  },
  {
    id: 'fixture',
    name: 'Fixture',
    icon: '🚿',
    description: 'Lavatory, WC, sink, etc.',
    needsSize: false,
    needsMaterial: false,
    taskCodePrefix: '22411', // Plumbing fixtures
    applicableTo: ['count'],
  },
  {
    id: 'water-heater',
    name: 'Water Heater',
    icon: '🔥',
    description: 'Tank or tankless',
    needsSize: false,
    needsMaterial: false,
    taskCodePrefix: '22331', // Water heaters
    applicableTo: ['count'],
  },
  {
    id: 'cleanout',
    name: 'Cleanout',
    icon: '🔧',
    description: 'Access fitting',
    needsSize: true,
    needsMaterial: false,
    taskCodePrefix: '22111',
    applicableTo: ['count'],
  },
];

// ============================================
// SIZE OPTIONS
// ============================================

const PIPE_SIZES = [
  '1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3', '4', '6', '8', '10', '12'
];

// ============================================
// MATERIAL OPTIONS PER SYSTEM
// ============================================

interface MaterialOption {
  id: string;
  name: string;
  keywords: string[]; // For searching catalogue
  common: boolean;
}

const FP_MATERIALS: MaterialOption[] = [
  { id: 'black-steel', name: 'Black Steel Sch 40', keywords: ['black', 'steel', 'schedule 40', 'sch 40'], common: true },
  { id: 'cpvc', name: 'CPVC', keywords: ['cpvc', 'chlorinated'], common: true },
  { id: 'copper', name: 'Copper Type L', keywords: ['copper', 'type l'], common: false },
  { id: 'stainless', name: 'Stainless Steel', keywords: ['stainless'], common: false },
];

const PLUMBING_MATERIALS: MaterialOption[] = [
  { id: 'copper', name: 'Copper Type L', keywords: ['copper', 'type l'], common: true },
  { id: 'pvc', name: 'PVC Sch 40', keywords: ['pvc', 'schedule 40'], common: true },
  { id: 'cast-iron', name: 'Cast Iron No-Hub', keywords: ['cast iron', 'no-hub', 'nohub'], common: true },
  { id: 'cpvc', name: 'CPVC', keywords: ['cpvc'], common: false },
  { id: 'pex', name: 'PEX', keywords: ['pex'], common: false },
  { id: 'galvanized', name: 'Galvanized', keywords: ['galvanized', 'galv'], common: false },
];

// ============================================
// TRADE FACTORS
// ============================================

const TRADE_FACTORS = {
  coupling: { factor: 0.10, label: '1 per 10 LF', rationale: '10-foot pipe sticks' },
  hanger: { factor: 0.125, label: '1 per 8 LF', rationale: 'Code minimum' },
  elbow: { factor: 0.05, label: '~1 per 20 LF', rationale: 'Estimated - verify count' },
  tee: { factor: 0.02, label: '~1 per 50 LF', rationale: 'Estimated - verify count' },
};

// ============================================
// COMPONENT
// ============================================

export function AssemblyAssembler({
  isOpen,
  onClose,
  onSave,
  onSaveAndStart,
  initialQuery,
  initialCategory,
}: AssemblyAssemblerProps) {
  // State
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<AssemblyTypeOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption | null>(null);
  const [selectedPipeItem, setSelectedPipeItem] = useState<JOCItem | null>(null);
  const [selectedFittings, setSelectedFittings] = useState<Set<string>>(new Set(['coupling', 'hanger']));
  const [fittingItems, setFittingItems] = useState<Record<string, JOCItem | null>>({});
  const [customName, setCustomName] = useState('');

  // Determine category
  const category = initialCategory || 'fire-protection';
  const isFP = category === 'fire-protection';
  const typeOptions = isFP ? FIRE_PROTECTION_TYPES : PLUMBING_TYPES;
  const materialOptions = isFP ? FP_MATERIALS : PLUMBING_MATERIALS;

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('type');
      setSelectedType(null);
      setSelectedSize(null);
      setSelectedMaterial(null);
      setSelectedPipeItem(null);
      setSelectedFittings(new Set(['coupling', 'hanger']));
      setFittingItems({});
      setCustomName(initialQuery || '');
    }
  }, [isOpen, initialQuery]);

  // Find pipe item when size and material are selected
  useEffect(() => {
    if (selectedType && selectedSize && selectedMaterial) {
      const size = selectedSize;
      const isFP = category === 'fire-protection';
      
      // Search for matching pipe - search broader for black steel (in Div 23)
      const matches = jocCatalogue.filter(item => {
        const code = item.taskCode;
        const desc = item.description.toLowerCase();
        
        // For FP, CPVC is in 21, Black Steel is in 23
        // For Plumbing, most items in 22, some in 23
        const validDivisions = isFP 
          ? ['21', '23'] // FP can use Div 21 (CPVC) or 23 (Black Steel)
          : ['22', '23']; // Plumbing uses 22 and 23
        
        if (!validDivisions.some(d => code.startsWith(d))) return false;
        
        // Must contain size (anywhere in description)
        const sizePattern = `${size}"`;
        if (!desc.includes(sizePattern)) return false;
        
        // Must be pipe (not fitting, not service)
        if (!desc.includes('pipe')) return false;
        if (desc.includes('removal') || desc.includes('relocate') || desc.includes('demo')) return false;
        if (desc.includes('clamp') || desc.includes('nipple') || desc.includes('repair')) return false;
        
        // Must match material keywords
        const hasKeyword = selectedMaterial.keywords.some(kw => desc.includes(kw.toLowerCase()));
        if (!hasKeyword) return false;
        
        // For FP, prefer items with "fire" or "sprinkler" in description
        if (isFP && selectedMaterial.id === 'cpvc') {
          if (!desc.includes('fire') && !desc.includes('sprinkler')) return false;
        }
        
        return true;
      });
      
      if (matches.length > 0) {
        // Sort by relevance: prefer items with "pipe" in description
        matches.sort((a, b) => {
          const aScore = a.description.toLowerCase().includes('pipe') ? 10 : 0;
          const bScore = b.description.toLowerCase().includes('pipe') ? 10 : 0;
          return bScore - aScore || b.unitCost - a.unitCost;
        });
        setSelectedPipeItem(matches[0]);
      } else {
        setSelectedPipeItem(null);
      }
    }
  }, [selectedType, selectedSize, selectedMaterial, category]);

  // Find fitting items when pipe is selected
  useEffect(() => {
    if (selectedPipeItem && selectedSize && selectedMaterial) {
      const isFP = category === 'fire-protection';
      const validDivisions = isFP ? ['21', '23'] : ['22', '23'];
      const fittings: Record<string, JOCItem | null> = {};
      
      const fittingTypes = ['coupling', 'hanger', 'elbow', 'tee'];
      
      for (const fittingType of fittingTypes) {
        const matches = jocCatalogue.filter(item => {
          const desc = item.description.toLowerCase();
          const code = item.taskCode;
          
          // Must be in valid division
          if (!validDivisions.some(d => code.startsWith(d))) return false;
          
          // Must contain size
          if (!desc.includes(`${selectedSize}"`)) return false;
          
          // Must match fitting type
          if (!desc.includes(fittingType)) return false;
          
          // Exclude service items
          if (desc.includes('removal') || desc.includes('relocate') || desc.includes('demo')) return false;
          
          // Try to match material (hangers are generic)
          if (fittingType !== 'hanger') {
            const hasKeyword = selectedMaterial!.keywords.some(kw => desc.includes(kw.toLowerCase()));
            if (!hasKeyword) return false;
          }
          
          return true;
        });
        
        fittings[fittingType] = matches.length > 0 ? matches[0] : null;
      }
      
      // Only pre-select fittings that were found
      const foundFittings = new Set<string>();
      if (fittings.coupling) foundFittings.add('coupling');
      if (fittings.hanger) foundFittings.add('hanger');
      setSelectedFittings(foundFittings);
      
      setFittingItems(fittings);
    }
  }, [selectedPipeItem, selectedSize, selectedMaterial, category]);

  // TODO: Add head/fixture selection step for count-type assemblies

  // Build assembly
  const buildAssembly = (): Assembly => {
    const items: AssemblyItem[] = [];
    
    if (selectedType?.needsSize && selectedPipeItem) {
      // Pipe assembly
      items.push({ jocItem: selectedPipeItem, quantityFactor: 1.0 });
      
      // Add selected fittings
      for (const [fittingType, factor] of Object.entries(TRADE_FACTORS)) {
        if (selectedFittings.has(fittingType) && fittingItems[fittingType]) {
          items.push({ jocItem: fittingItems[fittingType]!, quantityFactor: factor.factor });
        }
      }
    } else if (selectedPipeItem) {
      // Count item (head, fixture, etc.)
      items.push({ jocItem: selectedPipeItem, quantityFactor: 1.0 });
    }
    
    const assemblyCategory: AssemblyCategory = isFP ? 'fire-protection' : 'plumbing';
    const name = customName || 
      `${selectedSize ? selectedSize + '" ' : ''}${selectedMaterial?.name || ''} ${selectedType?.name || 'Assembly'}`.trim();
    
    return {
      id: generateAssemblyId(),
      name,
      description: `Custom ${selectedType?.name || 'assembly'}`,
      category: assemblyCategory,
      applicableTo: selectedType?.applicableTo || ['line'],
      items,
      keywords: [selectedSize, selectedMaterial?.id, selectedType?.id].filter(Boolean) as string[],
      createdBy: 'user',
    };
  };

  // Calculate cost
  const estimatedCost = useMemo(() => {
    if (!selectedPipeItem) return 0;
    let total = selectedPipeItem.unitCost;
    
    for (const [fittingType, factor] of Object.entries(TRADE_FACTORS)) {
      if (selectedFittings.has(fittingType) && fittingItems[fittingType]) {
        total += fittingItems[fittingType]!.unitCost * factor.factor;
      }
    }
    
    return total;
  }, [selectedPipeItem, selectedFittings, fittingItems]);

  // Determine steps based on type
  const getSteps = (): Step[] => {
    if (!selectedType) return ['type'];
    if (!selectedType.needsSize) return ['type', 'review']; // Count items skip size/material/fittings
    return ['type', 'size', 'material', 'fittings', 'review'];
  };

  const steps = getSteps();
  const currentStepIndex = steps.indexOf(currentStep);

  const nextStep = () => {
    const idx = currentStepIndex;
    if (idx < steps.length - 1) {
      setCurrentStep(steps[idx + 1]);
    }
  };

  const prevStep = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setCurrentStep(steps[idx - 1]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Assembly Assembler</h2>
              <p className="text-sm text-slate-400">
                {isFP ? '🔴 Fire Protection' : '🔵 Plumbing'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-slate-700/50 flex items-center justify-center gap-1">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${idx < currentStepIndex ? 'bg-green-500 text-white' : 
                    idx === currentStepIndex ? 'bg-amber-500 text-white' : 
                    'bg-slate-700 text-slate-400'}`}
              >
                {idx < currentStepIndex ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Step: Type Selection */}
          {currentStep === 'type' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">What are you building?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {typeOptions.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type);
                      // Auto-advance - directly set step since state hasn't updated yet
                      if (!type.needsSize) {
                        setCurrentStep('review');
                      } else {
                        setCurrentStep('size'); // Go directly to size step
                      }
                    }}
                    className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105
                      ${selectedType?.id === type.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'}`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-medium text-white">{type.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Size Selection */}
          {currentStep === 'size' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">What size pipe?</h3>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {PIPE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      nextStep();
                    }}
                    className={`p-3 rounded-lg border-2 text-center font-medium transition-all
                      ${selectedSize === size
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30 text-white'}`}
                  >
                    {size}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Material Selection */}
          {currentStep === 'material' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">What material?</h3>
              <div className="space-y-2">
                {materialOptions.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => {
                      setSelectedMaterial(mat);
                      nextStep();
                    }}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between
                      ${selectedMaterial?.id === mat.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'}`}
                  >
                    <span className="font-medium text-white">{mat.name}</span>
                    {mat.common && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Common</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Fittings Configuration */}
          {currentStep === 'fittings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-2">Include fittings?</h3>
              
              {/* Found pipe item */}
              {selectedPipeItem ? (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
                    <Check className="w-4 h-4" /> Found matching pipe
                  </div>
                  <div className="text-white">{selectedPipeItem.description}</div>
                  <div className="text-emerald-400 font-medium">${selectedPipeItem.unitCost.toFixed(2)}/{selectedPipeItem.unit}</div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                  <div className="text-amber-400 text-sm">No exact match found - try different size/material</div>
                </div>
              )}
              
              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">
                    Couplings and hangers are auto-calculated. Elbows and tees are better counted manually during takeoff.
                  </p>
                </div>
              </div>

              {/* Only show fittings that exist in catalogue */}
              {Object.values(fittingItems).every(v => v === null) ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-400 text-sm">No matching fittings found in catalogue for this size/material combination.</p>
                  <p className="text-slate-400 text-xs mt-1">You can still save the pipe-only assembly.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(TRADE_FACTORS).map(([key, factor]) => {
                    const fittingItem = fittingItems[key];
                    // Only show fittings that exist in the catalogue
                    if (!fittingItem) return null;
                    
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${selectedFittings.has(key)
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFittings.has(key)}
                          onChange={(e) => {
                            const newSet = new Set(selectedFittings);
                            if (e.target.checked) newSet.add(key);
                            else newSet.delete(key);
                            setSelectedFittings(newSet);
                          }}
                          className="w-5 h-5 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white capitalize">{key}s</span>
                            <span className="text-amber-400 text-sm">× {factor.factor}/LF</span>
                            <span className="text-slate-400 text-sm">({factor.label})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {fittingItem.description} — ${fittingItem.unitCost.toFixed(2)}/{fittingItem.unit}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assembly Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`${selectedSize || ''}${selectedSize ? '" ' : ''}${selectedMaterial?.name || ''} ${selectedType?.name || ''}`}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white 
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Assembly Summary
                </h4>
                <div className="space-y-2 bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                    <span className="text-slate-300">Type</span>
                    <span className="text-white font-medium">{selectedType?.icon} {selectedType?.name}</span>
                  </div>
                  {selectedSize && (
                    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <span className="text-slate-300">Size</span>
                      <span className="text-white font-medium">{selectedSize}"</span>
                    </div>
                  )}
                  {selectedMaterial && (
                    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                      <span className="text-slate-300">Material</span>
                      <span className="text-white font-medium">{selectedMaterial.name}</span>
                    </div>
                  )}
                  {selectedPipeItem && (
                    <div className="p-2 bg-amber-500/10 rounded border border-amber-500/30">
                      <div className="text-amber-400 text-xs uppercase tracking-wider mb-1">Main Item</div>
                      <div className="text-white text-sm">{selectedPipeItem.description}</div>
                      <div className="text-emerald-400 font-medium">${selectedPipeItem.unitCost.toFixed(2)}/{selectedPipeItem.unit}</div>
                    </div>
                  )}
                  {selectedType?.needsSize && selectedFittings.size > 0 && (
                    <div className="p-2 bg-slate-700/50 rounded">
                      <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bundled Fittings</div>
                      {Array.from(selectedFittings).map(key => {
                        const item = fittingItems[key];
                        const factor = TRADE_FACTORS[key as keyof typeof TRADE_FACTORS];
                        return (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <span className="text-slate-300 capitalize">{key}s ({factor.factor}/LF)</span>
                            <span className="text-slate-400">{item ? `$${item.unitCost.toFixed(2)}` : 'N/A'}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cost */}
              {selectedType?.needsSize && (
                <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Estimated Cost per LF</span>
                    <span className="text-2xl font-bold text-emerald-400">${estimatedCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 'review' ? (
              <>
                <button
                  onClick={() => onSave(buildAssembly())}
                  disabled={!selectedType}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => onSaveAndStart(buildAssembly())}
                  disabled={!selectedType}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg text-black font-semibold transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> Save & Start
                </button>
              </>
            ) : currentStep !== 'type' && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-black font-semibold transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssemblyAssembler;
