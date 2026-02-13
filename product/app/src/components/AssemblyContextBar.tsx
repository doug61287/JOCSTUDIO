import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Package, Layers, Check, X, Wrench, Plus } from 'lucide-react';
import { ASSEMBLY_LIBRARY } from '../data/assemblies';
import { getUserAssemblies, saveUserAssembly } from '../utils/userAssemblyStore';
import { AssemblyAssembler } from './AssemblyAssembler';
import type { Assembly, AssemblyCategory } from '../types';

interface AssemblyContextBarProps {
  selectedAssembly: Assembly | null;
  onSelectAssembly: (assembly: Assembly | null) => void;
}

const CATEGORY_CONFIG: { id: AssemblyCategory; label: string; icon: string; color: string }[] = [
  { id: 'plumbing', label: 'Plumbing', icon: '🔵', color: 'bg-blue-500' },
  { id: 'fire-protection', label: 'Fire Protection', icon: '🔴', color: 'bg-red-500' },
  { id: 'drywall', label: 'Drywall', icon: '⬜', color: 'bg-gray-400' },
  { id: 'concrete', label: 'Concrete', icon: '🟫', color: 'bg-stone-500' },
  { id: 'electrical', label: 'Electrical', icon: '⚡', color: 'bg-yellow-500' },
  { id: 'hvac', label: 'HVAC', icon: '❄️', color: 'bg-cyan-500' },
  { id: 'demolition', label: 'Demo', icon: '🔨', color: 'bg-orange-500' },
  { id: 'doors-windows', label: 'Doors', icon: '🚪', color: 'bg-amber-600' },
];

export function AssemblyContextBar({ 
  selectedAssembly, 
  onSelectAssembly,
}: AssemblyContextBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<AssemblyCategory | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAssembler, setShowAssembler] = useState(false);
  const [assemblerQuery, setAssemblerQuery] = useState('');
  const [userAssemblies, setUserAssemblies] = useState<Assembly[]>([]);

  // Load user assemblies on mount
  useEffect(() => {
    setUserAssemblies(getUserAssemblies());
  }, []);

  // Combine built-in and user assemblies
  const allAssemblies = useMemo(() => {
    return [...userAssemblies, ...ASSEMBLY_LIBRARY];
  }, [userAssemblies]);

  // Filter assemblies based on search and category
  const filteredAssemblies = useMemo(() => {
    let results = allAssemblies;

    // Filter by category
    if (activeCategory !== 'all') {
      results = results.filter(a => a.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().split(/\s+/);
      results = results.filter(a => {
        const searchText = `${a.name} ${a.description || ''} ${a.keywords.join(' ')}`.toLowerCase();
        return terms.every(term => searchText.includes(term));
      });
    }

    return results.slice(0, 20);
  }, [searchQuery, activeCategory]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allAssemblies.length };
    allAssemblies.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [allAssemblies]);

  // Handle saving assembly from wizard
  const handleSaveAssembly = (assembly: Assembly) => {
    saveUserAssembly(assembly);
    setUserAssemblies(getUserAssemblies());
    setShowAssembler(false);
  };

  // Handle save and start takeoff
  const handleSaveAndStart = (assembly: Assembly) => {
    saveUserAssembly(assembly);
    setUserAssemblies(getUserAssemblies());
    onSelectAssembly(assembly);
    setShowAssembler(false);
    setSearchQuery('');
  };

  // Open assembler with current query
  const openAssembler = () => {
    setAssemblerQuery(searchQuery);
    setShowAssembler(true);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.assembly-context-bar')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="assembly-context-bar bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder='Type: "2 inch copper" or "sprinkler head"'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg 
                       text-white placeholder-slate-400 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Dropdown results */}
          {showDropdown && (searchQuery || activeCategory !== 'all') && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 
                            rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
              {filteredAssemblies.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-slate-400 text-sm mb-3">No matching assemblies found.</p>
                  {searchQuery.trim().length >= 2 && (
                    <button
                      onClick={openAssembler}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 
                                 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-lg transition-all"
                    >
                      <Wrench className="w-4 h-4" />
                      Build "{searchQuery}" Assembly
                    </button>
                  )}
                </div>
              ) : (
                filteredAssemblies.map(assembly => (
                  <button
                    key={assembly.id}
                    onClick={() => {
                      onSelectAssembly(assembly);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors
                                border-b border-slate-600 last:border-0
                                ${selectedAssembly?.id === assembly.id ? 'bg-blue-600/20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{assembly.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{assembly.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            CATEGORY_CONFIG.find(c => c.id === assembly.category)?.color || 'bg-slate-500'
                          } text-white`}>
                            {assembly.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            {assembly.items.length} items bundled
                          </span>
                        </div>
                      </div>
                      {selectedAssembly?.id === assembly.id && (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Category pills */}
        <div className="hidden md:flex items-center gap-1">
          {CATEGORY_CONFIG.slice(0, 4).map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(activeCategory === cat.id ? 'all' : cat.id);
                setShowDropdown(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                         ${activeCategory === cat.id 
                           ? `${cat.color} text-white` 
                           : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {cat.icon} {cat.label}
              <span className="ml-1 opacity-60">({categoryCounts[cat.id] || 0})</span>
            </button>
          ))}
          {/* Build New Assembly button */}
          <button
            onClick={() => {
              setAssemblerQuery('');
              setShowAssembler(true);
            }}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 
                       text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 
                       transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Build
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1.5 rounded-full text-xs bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Selected assembly indicator */}
        {selectedAssembly && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded-lg">
            <Package className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300 font-medium truncate max-w-[200px]">
              {selectedAssembly.name}
            </span>
            <button
              onClick={() => onSelectAssembly(null)}
              className="p-0.5 hover:bg-green-500/20 rounded"
            >
              <X className="w-4 h-4 text-green-400" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded category row */}
      {isExpanded && (
        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-700 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                       ${activeCategory === 'all' 
                         ? 'bg-slate-500 text-white' 
                         : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            All ({categoryCounts.all})
          </button>
          {CATEGORY_CONFIG.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(activeCategory === cat.id ? 'all' : cat.id);
                setShowDropdown(true);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                         ${activeCategory === cat.id 
                           ? `${cat.color} text-white` 
                           : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {cat.icon} {cat.label} ({categoryCounts[cat.id] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Assembly detail preview */}
      {selectedAssembly && isExpanded && (
        <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Bundled Items</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedAssembly.items.slice(0, 6).map((item, idx) => (
              <div key={idx} className="text-xs bg-slate-800 rounded px-2 py-1.5">
                <div className="text-slate-300 truncate">{item.jocItem.description}</div>
                <div className="text-slate-500 mt-0.5">
                  {item.quantityFactor === 1 ? '1:1' : `${item.quantityFactor}/unit`} · ${item.jocItem.unitCost.toFixed(2)}/{item.jocItem.unit}
                </div>
              </div>
            ))}
            {selectedAssembly.items.length > 6 && (
              <div className="text-xs text-slate-400 flex items-center">
                +{selectedAssembly.items.length - 6} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assembly Assembler Wizard */}
      <AssemblyAssembler
        isOpen={showAssembler}
        onClose={() => setShowAssembler(false)}
        onSave={handleSaveAssembly}
        onSaveAndStart={handleSaveAndStart}
        initialQuery={assemblerQuery}
      />
    </div>
  );
}

export default AssemblyContextBar;
