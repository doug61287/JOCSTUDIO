/**
 * Assembly Assembler
 * Conversational wizard for building custom assemblies step-by-step
 */

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Package, Wrench, Info, Sparkles, Save } from 'lucide-react';
import type { Assembly, JOCItem, AssemblyItem, AssemblyCategory } from '../types';
import { parseAssemblyIntent, findMaterialOptions, getStandardFittings, type FittingOption } from '../utils/assemblyBuilder';
import { generateAssemblyId } from '../utils/userAssemblyStore';

interface AssemblyAssemblerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assembly: Assembly) => void;
  onSaveAndStart: (assembly: Assembly) => void;
  initialQuery: string;
}

type Step = 'material' | 'fittings' | 'review';

export function AssemblyAssembler({
  isOpen,
  onClose,
  onSave,
  onSaveAndStart,
  initialQuery,
}: AssemblyAssemblerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('material');
  const [selectedMaterial, setSelectedMaterial] = useState<JOCItem | null>(null);
  const [selectedFittings, setSelectedFittings] = useState<Set<string>>(new Set());
  const [fittingOptions, setFittingOptions] = useState<FittingOption[]>([]);
  const [customName, setCustomName] = useState('');

  // Parse the intent from the query
  const intent = useMemo(() => parseAssemblyIntent(initialQuery), [initialQuery]);
  
  // Find material options based on intent
  const materialOptions = useMemo(() => findMaterialOptions(intent), [intent]);

  // Reset state when opening with new query
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('material');
      setSelectedMaterial(null);
      setSelectedFittings(new Set());
      setFittingOptions([]);
      setCustomName(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Load fittings when material is selected
  useEffect(() => {
    if (selectedMaterial && intent.size) {
      // Extract material name from description
      const desc = selectedMaterial.description.toLowerCase();
      let materialName = 'steel';
      if (desc.includes('copper')) materialName = 'copper';
      else if (desc.includes('cpvc')) materialName = 'cpvc';
      else if (desc.includes('cast iron')) materialName = 'cast iron';
      else if (desc.includes('galv')) materialName = 'galvanized';
      else if (desc.includes('pvc')) materialName = 'pvc';
      
      const fittings = getStandardFittings(intent.size, materialName, intent.system);
      setFittingOptions(fittings);
      
      // Pre-select default fittings
      const defaults = new Set(
        fittings.filter(f => f.defaultChecked).map(f => f.jocItem.taskCode)
      );
      setSelectedFittings(defaults);
    }
  }, [selectedMaterial, intent]);

  // Build the final assembly
  const buildAssembly = (): Assembly => {
    const items: AssemblyItem[] = [];
    
    // Add the main pipe
    if (selectedMaterial) {
      items.push({
        jocItem: selectedMaterial,
        quantityFactor: 1.0,
        isPrimary: true,
      });
    }
    
    // Add selected fittings
    for (const fitting of fittingOptions) {
      if (selectedFittings.has(fitting.jocItem.taskCode)) {
        items.push({
          jocItem: fitting.jocItem,
          quantityFactor: fitting.quantityFactor,
          isPrimary: false,
        });
      }
    }
    
    // Determine category
    const category: AssemblyCategory = 
      intent.system === 'sprinkler' ? 'fire-protection' :
      intent.system === 'plumbing' ? 'plumbing' :
      intent.system === 'hvac' ? 'hvac' : 'general';
    
    return {
      id: generateAssemblyId(),
      name: customName || `${intent.sizeFormatted} ${intent.system} ${intent.itemType}`.trim(),
      description: `Custom assembly for ${intent.sizeFormatted} ${intent.system} work`,
      category,
      applicableTo: ['line', 'polyline'],
      items,
      keywords: [
        intent.size || '',
        intent.system,
        intent.itemType,
        intent.materialHint || '',
      ].filter(Boolean),
      createdBy: 'user',
    };
  };

  // Calculate estimated cost per LF
  const estimatedCostPerUnit = useMemo(() => {
    if (!selectedMaterial) return 0;
    let total = selectedMaterial.unitCost;
    
    for (const fitting of fittingOptions) {
      if (selectedFittings.has(fitting.jocItem.taskCode)) {
        total += fitting.jocItem.unitCost * fitting.quantityFactor;
      }
    }
    
    return total;
  }, [selectedMaterial, fittingOptions, selectedFittings]);

  if (!isOpen) return null;

  const steps: { id: Step; label: string }[] = [
    { id: 'material', label: 'Material' },
    { id: 'fittings', label: 'Fittings' },
    { id: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

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
              <p className="text-sm text-slate-400">Building: {initialQuery}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-slate-700/50 flex items-center justify-center gap-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${idx < currentStepIndex ? 'bg-green-500 text-white' : 
                    idx === currentStepIndex ? 'bg-amber-500 text-white' : 
                    'bg-slate-700 text-slate-400'}`}
              >
                {idx < currentStepIndex ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-sm ${idx === currentStepIndex ? 'text-white font-medium' : 'text-slate-400'}`}>
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-600 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Material Selection */}
          {currentStep === 'material' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">
                  Found {materialOptions.length} material options for {intent.sizeFormatted} pipe
                </span>
              </div>

              {materialOptions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No matching materials found in the catalogue.</p>
                  <p className="text-sm mt-2">Try a different size or system type.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {materialOptions.map((item) => (
                    <button
                      key={item.taskCode}
                      onClick={() => setSelectedMaterial(item)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all
                        ${selectedMaterial?.taskCode === item.taskCode
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{item.description}</p>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{item.taskCode}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-emerald-400">${item.unitCost.toFixed(2)}</p>
                          <p className="text-xs text-slate-400">per {item.unit}</p>
                        </div>
                      </div>
                      {selectedMaterial?.taskCode === item.taskCode && (
                        <div className="mt-2 pt-2 border-t border-amber-500/30 flex items-center gap-2 text-amber-400 text-sm">
                          <Check className="w-4 h-4" />
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Fittings Configuration */}
          {currentStep === 'fittings' && (
            <div className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-white mb-1">Industry-standard quantity factors</p>
                    <p>These factors are based on trade knowledge. Couplings and hangers are typically included; 
                    elbows and tees are better counted manually during takeoff.</p>
                  </div>
                </div>
              </div>

              {fittingOptions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No matching fittings found for this material.</p>
                  <p className="text-sm mt-2">You can still save the pipe-only assembly.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fittingOptions.map((fitting) => (
                    <label
                      key={fitting.jocItem.taskCode}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${selectedFittings.has(fitting.jocItem.taskCode)
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFittings.has(fitting.jocItem.taskCode)}
                        onChange={(e) => {
                          const newSet = new Set(selectedFittings);
                          if (e.target.checked) {
                            newSet.add(fitting.jocItem.taskCode);
                          } else {
                            newSet.delete(fitting.jocItem.taskCode);
                          }
                          setSelectedFittings(newSet);
                        }}
                        className="mt-1 w-5 h-5 rounded border-slate-500 bg-slate-700 text-green-500 focus:ring-green-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{fitting.jocItem.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <span className="text-emerald-400 font-medium">${fitting.jocItem.unitCost.toFixed(2)}/{fitting.jocItem.unit}</span>
                          <span className="text-amber-400">× {fitting.quantityFactor}/LF</span>
                          <span className="text-slate-400">({fitting.label})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{fitting.rationale}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Assembly Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Assembly Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={`${intent.sizeFormatted} ${intent.system} ${intent.itemType}`}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white 
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Bundled Items */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Bundled Items ({1 + selectedFittings.size})
                </h4>
                <div className="space-y-2 bg-slate-700/30 rounded-lg p-3">
                  {/* Main pipe */}
                  {selectedMaterial && (
                    <div className="flex items-center justify-between p-2 bg-amber-500/10 rounded border border-amber-500/30">
                      <div>
                        <span className="text-white font-medium">{selectedMaterial.description}</span>
                        <span className="text-amber-400 text-sm ml-2">× 1.0/unit</span>
                      </div>
                      <span className="text-emerald-400 font-medium">${selectedMaterial.unitCost.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Fittings */}
                  {fittingOptions
                    .filter(f => selectedFittings.has(f.jocItem.taskCode))
                    .map(fitting => (
                      <div key={fitting.jocItem.taskCode} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                        <div>
                          <span className="text-slate-200">{fitting.jocItem.description}</span>
                          <span className="text-slate-400 text-sm ml-2">× {fitting.quantityFactor}/unit</span>
                        </div>
                        <span className="text-slate-300">${fitting.jocItem.unitCost.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Estimated Cost */}
              <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Estimated Cost per LF</span>
                  <span className="text-2xl font-bold text-emerald-400">${estimatedCostPerUnit.toFixed(2)}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Based on base catalogue prices before quantity tiers</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={() => {
              const idx = currentStepIndex;
              if (idx > 0) {
                setCurrentStep(steps[idx - 1].id);
              }
            }}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 'review' ? (
              <>
                <button
                  onClick={() => onSave(buildAssembly())}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Assembly
                </button>
                <button
                  onClick={() => onSaveAndStart(buildAssembly())}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg text-black font-semibold transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Save & Start Takeoff
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  const idx = currentStepIndex;
                  if (idx < steps.length - 1) {
                    setCurrentStep(steps[idx + 1].id);
                  }
                }}
                disabled={currentStep === 'material' && !selectedMaterial}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 rounded-lg text-black font-semibold transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssemblyAssembler;
