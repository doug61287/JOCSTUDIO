import { useState, useMemo, useEffect } from 'react';
import type { JOCItem, Measurement } from '../types';
import { searchJOCItems } from '../data/jocCatalogue';
import { 
  Package, 
  Check, 
  X, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Calculator,
} from 'lucide-react';

// ============================================
// ASSEMBLY CONFIGURATOR
// "Don't let them miss anything"
// ============================================

interface ConfigurableItem {
  id: string;
  jocItem: JOCItem;
  category: 'primary' | 'typical' | 'optional';
  checked: boolean;
  quantityFactor: number; // Multiplier on measurement value
  needsInput?: 'perimeter' | 'count' | 'custom'; // Some items need additional input
  inputValue?: number;
  inputUnit?: string;
  note?: string;
}

interface AssemblyConfig {
  id: string;
  name: string;
  matchPatterns: string[]; // Patterns to match user input
  measurementTypes: string[]; // What measurement types this applies to
  items: Omit<ConfigurableItem, 'checked' | 'inputValue'>[];
}

// ============================================
// ASSEMBLY CONFIGURATIONS
// These define what items belong together
// ============================================

const ASSEMBLY_CONFIGS: AssemblyConfig[] = [
  {
    id: 'concrete-slab-4',
    name: 'Concrete Slab on Grade, 4"',
    matchPatterns: ['concrete slab', '4" concrete', '4 inch concrete', 'new concrete slab', 'slab on grade'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'concrete-4',
        jocItem: { taskCode: '03300000-0010', description: 'Cast-In-Place Concrete, 4" Slab on Grade', unit: 'SF', unitCost: 12.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'wwf',
        jocItem: { taskCode: '03210000-0010', description: 'Welded Wire Fabric Reinforcement, 6x6-W1.4xW1.4', unit: 'SF', unitCost: 2.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'vapor-barrier',
        jocItem: { taskCode: '07260000-0010', description: 'Vapor Barrier, 10 mil Polyethylene', unit: 'SF', unitCost: 0.80 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'edge-form',
        jocItem: { taskCode: '03110000-0010', description: 'Edge Formwork for Slab on Grade', unit: 'LF', unitCost: 8.50 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'perimeter',
        inputUnit: 'LF',
        note: 'Enter perimeter length',
      },
      {
        id: 'broom-finish',
        jocItem: { taskCode: '03350000-0010', description: 'Broom Finish, Concrete Flatwork', unit: 'SF', unitCost: 1.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'curing',
        jocItem: { taskCode: '03390000-0010', description: 'Curing Compound, Concrete', unit: 'SF', unitCost: 0.50 },
        category: 'optional',
        quantityFactor: 1.0,
      },
      {
        id: 'control-joints',
        jocItem: { taskCode: '03150000-0010', description: 'Control Joint Sawcuts', unit: 'LF', unitCost: 4.25 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'custom',
        inputUnit: 'LF',
        note: 'Typically every 10-12 ft',
      },
    ],
  },
  {
    id: 'concrete-slab-6',
    name: 'Concrete Slab on Grade, 6"',
    matchPatterns: ['6" concrete', '6 inch concrete', '6" slab'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'concrete-6',
        jocItem: { taskCode: '03300000-0020', description: 'Cast-In-Place Concrete, 6" Slab on Grade', unit: 'SF', unitCost: 15.75 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'wwf',
        jocItem: { taskCode: '03210000-0010', description: 'Welded Wire Fabric Reinforcement, 6x6-W1.4xW1.4', unit: 'SF', unitCost: 2.50 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'vapor-barrier',
        jocItem: { taskCode: '07260000-0010', description: 'Vapor Barrier, 10 mil Polyethylene', unit: 'SF', unitCost: 0.80 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        jocItem: { taskCode: '03350000-0010', description: 'Broom Finish, Concrete Flatwork', unit: 'SF', unitCost: 1.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'concrete-sidewalk',
    name: 'Concrete Sidewalk',
    matchPatterns: ['sidewalk', 'concrete walk', 'walkway'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'sidewalk',
        jocItem: { taskCode: '03300000-0030', description: 'Concrete Sidewalk, 4" Thick', unit: 'SF', unitCost: 11.25 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'base',
        jocItem: { taskCode: '31230000-0010', description: 'Aggregate Base Course, 4"', unit: 'SF', unitCost: 2.85 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'broom-finish',
        jocItem: { taskCode: '03350000-0010', description: 'Broom Finish, Concrete Flatwork', unit: 'SF', unitCost: 1.00 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'storefront-system',
    name: 'Aluminum Storefront System',
    matchPatterns: ['storefront', 'aluminum storefront', 'storefront system', 'storefront glazing'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'storefront-frame',
        jocItem: { taskCode: '08431300-0002', description: 'Aluminum Storefront Framing Assembly', unit: 'SF', unitCost: 64.28 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'glazing',
        jocItem: { taskCode: '08800000-0030', description: '1" Insulated Glass Unit, Clear', unit: 'SF', unitCost: 42.75 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'door-single',
        jocItem: { taskCode: '08110000-0010', description: '3\'-0" x 7\'-0" Aluminum Storefront Door, Single', unit: 'EA', unitCost: 2850.00 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'count',
        inputUnit: 'EA',
        note: 'Number of doors',
      },
    ],
  },
  {
    id: 'ballistic-storefront',
    name: 'Ballistic Resistant Storefront',
    matchPatterns: ['ballistic', 'ballistic storefront', 'bullet resistant', 'security glazing'],
    measurementTypes: ['area'],
    items: [
      {
        id: 'storefront-frame',
        jocItem: { taskCode: '08431300-0002', description: 'Aluminum Storefront Framing Assembly', unit: 'SF', unitCost: 64.28 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'ballistic-glass',
        jocItem: { taskCode: '08800000-0050', description: 'Ballistic Resistant Glass, Level 3', unit: 'SF', unitCost: 185.00 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'ballistic-door',
        jocItem: { taskCode: '08700000-0010', description: 'Ballistic Resistant Door and Frame Assembly', unit: 'EA', unitCost: 8500.00 },
        category: 'optional',
        quantityFactor: 1.0,
        needsInput: 'count',
        inputUnit: 'EA',
        note: 'Number of doors',
      },
    ],
  },
  {
    id: 'wall-patch',
    name: 'Wall Patch & Repair',
    matchPatterns: ['wall patch', 'drywall patch', 'gypsum patch', 'patch wall', 'wall repair'],
    measurementTypes: ['area', 'count'],
    items: [
      {
        id: 'patch',
        jocItem: { taskCode: '09013091-0005', description: 'Cut and Patch Hole in Gypsum Board to Match Existing', unit: 'SF', unitCost: 15.50 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'tape-finish',
        jocItem: { taskCode: '09291000-0038', description: 'Tape, Spackle, and Finish Gypsum Board', unit: 'SF', unitCost: 3.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'primer',
        jocItem: { taskCode: '09911300-0047', description: 'Primer, Brush Work, Interior Drywall', unit: 'SF', unitCost: 1.19 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'paint',
        jocItem: { taskCode: '09911300-0049', description: 'Paint, 2 Coats, Brush Work, Interior Drywall', unit: 'SF', unitCost: 2.34 },
        category: 'typical',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'act-ceiling',
    name: 'Acoustic Ceiling Tile',
    matchPatterns: ['act', 'acoustic ceiling', 'ceiling tile', 'drop ceiling', 'suspended ceiling'],
    measurementTypes: ['area', 'space'],
    items: [
      {
        id: 'grid',
        jocItem: { taskCode: '09511000-0010', description: 'Suspended Ceiling Grid System, 2x4', unit: 'SF', unitCost: 4.25 },
        category: 'typical',
        quantityFactor: 1.0,
      },
      {
        id: 'tile',
        jocItem: { taskCode: '09511000-0020', description: 'Acoustic Ceiling Tile, 2x4, Standard', unit: 'SF', unitCost: 3.85 },
        category: 'primary',
        quantityFactor: 1.0,
      },
    ],
  },
  {
    id: 'flood-barrier',
    name: 'Deployable Flood Barrier',
    matchPatterns: ['flood barrier', 'flood protection', 'flood panel', 'flood defense'],
    measurementTypes: ['line'],
    items: [
      {
        id: 'barrier',
        jocItem: { taskCode: '10400000-0030', description: 'Deployable Flood Barrier System, 2\' High', unit: 'LF', unitCost: 285.00 },
        category: 'primary',
        quantityFactor: 1.0,
      },
      {
        id: 'anchors',
        jocItem: { taskCode: '10400000-0040', description: 'Flood Barrier Anchor Points, Wall Mounted', unit: 'EA', unitCost: 125.00 },
        category: 'typical',
        quantityFactor: 0.25, // Roughly 1 anchor per 4 LF
        note: 'Approx 1 per 4 LF',
      },
    ],
  },
];

// ============================================
// MATCHING FUNCTIONS
// ============================================

export function findMatchingAssembly(input: string, measurementType: string): AssemblyConfig | null {
  const normalized = input.toLowerCase().trim();
  
  for (const config of ASSEMBLY_CONFIGS) {
    // Check if measurement type is applicable
    if (!config.measurementTypes.includes(measurementType)) continue;
    
    // Check patterns
    for (const pattern of config.matchPatterns) {
      if (normalized.includes(pattern) || pattern.includes(normalized)) {
        return config;
      }
    }
  }
  
  return null;
}

// ============================================
// CONFIGURATOR COMPONENT
// ============================================

interface AssemblyConfiguratorProps {
  measurement: Measurement;
  matchedAssembly: AssemblyConfig;
  onApply: (items: JOCItem[]) => void;
  onCancel: () => void;
}

export function AssemblyConfigurator({ 
  measurement, 
  matchedAssembly, 
  onApply, 
  onCancel 
}: AssemblyConfiguratorProps) {
  // Initialize items with default checked states
  const [items, setItems] = useState<ConfigurableItem[]>(() => 
    matchedAssembly.items.map(item => ({
      ...item,
      checked: item.category === 'primary' || item.category === 'typical',
      inputValue: item.needsInput ? 0 : undefined,
    }))
  );
  
  const [showOptional, setShowOptional] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JOCItem[]>([]);

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    const checkedItems: JOCItem[] = [];
    
    items.forEach(item => {
      if (!item.checked) return;
      
      let qty = measurement.value * item.quantityFactor;
      
      // Use input value for items that need it
      if (item.needsInput && item.inputValue) {
        qty = item.inputValue;
      }
      
      subtotal += qty * item.jocItem.unitCost;
      checkedItems.push(item.jocItem);
    });
    
    return { subtotal, checkedItems };
  }, [items, measurement.value]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const updateInputValue = (id: string, value: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, inputValue: value } : item
    ));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setSearchResults(searchJOCItems(query, 5));
    } else {
      setSearchResults([]);
    }
  };

  const addCustomItem = (jocItem: JOCItem) => {
    const newItem: ConfigurableItem = {
      id: `custom-${Date.now()}`,
      jocItem,
      category: 'optional',
      checked: true,
      quantityFactor: 1.0,
    };
    setItems(prev => [...prev, newItem]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const primaryItems = items.filter(i => i.category === 'primary');
  const typicalItems = items.filter(i => i.category === 'typical');
  const optionalItems = items.filter(i => i.category === 'optional');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">{matchedAssembly.name}</h2>
              <p className="text-xs text-white/50">
                {measurement.value.toFixed(1)} {measurement.unit} measured
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-auto space-y-4">
          {/* Primary Items */}
          {primaryItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Check className="w-3 h-3" /> Primary Items
              </h3>
              <div className="space-y-2">
                {primaryItems.map(item => (
                  <ItemRow 
                    key={item.id} 
                    item={item} 
                    measurementValue={measurement.value}
                    onToggle={() => toggleItem(item.id)}
                    onInputChange={(v) => updateInputValue(item.id, v)}
                    locked
                  />
                ))}
              </div>
            </div>
          )}

          {/* Typical Items */}
          {typicalItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Typically Included
              </h3>
              <div className="space-y-2">
                {typicalItems.map(item => (
                  <ItemRow 
                    key={item.id} 
                    item={item}
                    measurementValue={measurement.value}
                    onToggle={() => toggleItem(item.id)}
                    onInputChange={(v) => updateInputValue(item.id, v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional Items */}
          {optionalItems.length > 0 && (
            <div>
              <button 
                onClick={() => setShowOptional(!showOptional)}
                className="w-full flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 hover:text-white/60"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Optional / As Needed
                </span>
                {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showOptional && (
                <div className="space-y-2">
                  {optionalItems.map(item => (
                    <ItemRow 
                      key={item.id} 
                      item={item}
                      measurementValue={measurement.value}
                      onToggle={() => toggleItem(item.id)}
                      onInputChange={(v) => updateInputValue(item.id, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Custom Item */}
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Search className="w-3 h-3" /> Add More Items
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search JOC catalogue..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/20"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map(item => (
                  <button
                    key={item.taskCode}
                    onClick={() => addCustomItem(item)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 text-xs transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="text-white/50 font-mono">{item.taskCode.slice(0, 11)}</span>
                      <span className="text-emerald-400">${item.unitCost.toFixed(2)}/{item.unit}</span>
                    </div>
                    <p className="truncate text-white/70">{item.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-white/60">
              <Calculator className="w-4 h-4" />
              <span className="text-sm">{totals.checkedItems.length} items selected</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Estimated Total</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 text-sm font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(totals.checkedItems)}
              className="flex-1 py-2.5 px-4 text-sm font-semibold text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Apply {totals.checkedItems.length} Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ITEM ROW COMPONENT
// ============================================

interface ItemRowProps {
  item: ConfigurableItem;
  measurementValue: number;
  onToggle: () => void;
  onInputChange: (value: number) => void;
  locked?: boolean;
}

function ItemRow({ item, measurementValue, onToggle, onInputChange, locked }: ItemRowProps) {
  const quantity = item.needsInput && item.inputValue 
    ? item.inputValue 
    : measurementValue * item.quantityFactor;
  
  const cost = quantity * item.jocItem.unitCost;
  
  return (
    <div className={`
      p-3 rounded-lg border transition-all
      ${item.checked 
        ? 'bg-white/5 border-white/10' 
        : 'bg-transparent border-white/5 opacity-50'
      }
    `}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          disabled={locked}
          className={`
            w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
            ${item.checked 
              ? 'bg-emerald-500 text-white' 
              : 'bg-white/10 text-transparent hover:bg-white/20'
            }
            ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Check className="w-3 h-3" />
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-tight">{item.jocItem.description}</p>
              <p className="text-[10px] text-white/40 font-mono mt-0.5">{item.jocItem.taskCode}</p>
            </div>
            <p className={`text-sm font-medium flex-shrink-0 ${item.checked ? 'text-emerald-400' : 'text-white/30'}`}>
              ${cost.toFixed(0)}
            </p>
          </div>
          
          {/* Quantity / Input */}
          <div className="flex items-center gap-2 mt-2">
            {item.needsInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={item.inputValue || ''}
                  onChange={(e) => onInputChange(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-white/20"
                />
                <span className="text-xs text-white/40">{item.inputUnit}</span>
                {item.note && (
                  <span className="text-[10px] text-white/30">({item.note})</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-white/40">
                {quantity.toFixed(1)} {item.jocItem.unit} × ${item.jocItem.unitCost.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { ASSEMBLY_CONFIGS };
export type { AssemblyConfig };
