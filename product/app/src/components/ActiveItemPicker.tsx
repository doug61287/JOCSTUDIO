import { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { searchJOCItems } from '../data/jocCatalogue';
import type { JOCItem } from '../types';

export function ActiveItemPicker() {
  const { activeJOCItem, setActiveJOCItem, activeTool } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchJOCItems(searchQuery).slice(0, 8);
  }, [searchQuery]);

  // Only show for measurement tools
  const isMeasureTool = ['line', 'polyline', 'count', 'area', 'space'].includes(activeTool);
  if (!isMeasureTool) return null;

  const handleSelect = (item: JOCItem) => {
    setActiveJOCItem(item);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setActiveJOCItem(null);
    setIsOpen(false);
  };

  // Parse item description for cleaner display
  const parseDescription = (desc: string) => {
    // Extract main type and dimensions
    const parts = desc.split(',');
    const mainType = parts[0]?.trim() || desc;
    return mainType.length > 40 ? mainType.slice(0, 40) + '...' : mainType;
  };

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40">
      {activeJOCItem ? (
        // Active item badge
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-green-400/30">
          <div className="flex flex-col">
            <span className="text-[10px] text-green-200/70 font-mono">{activeJOCItem.taskCode}</span>
            <span className="text-sm text-white font-medium">{parseDescription(activeJOCItem.description)}</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-green-200/70">
              ${activeJOCItem.unitCost.toFixed(2)}/{activeJOCItem.unit}
            </span>
            <button
              onClick={handleClear}
              className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 text-white/70 hover:text-white"
              title="Clear active item"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        // No active item - show picker prompt
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
              ${isOpen 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-amber-500/90 hover:bg-amber-500 text-black shadow-md animate-pulse'}`}
          >
            <span>🎯</span>
            <span className="font-medium">Select JOC Item First</span>
            <span className="text-xs opacity-70">(optional)</span>
          </button>

          {isOpen && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] bg-gray-900/95 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-white/10">
                <input
                  type="text"
                  placeholder="Search JOC catalogue (e.g., 'toilet', 'door frame', 'paint')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40"
                  autoFocus
                />
              </div>
              
              <div className="max-h-[400px] overflow-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.taskCode}
                        onClick={() => handleSelect(item)}
                        className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                                {item.taskCode}
                              </span>
                              <span className="text-xs text-white/40">{item.unit}</span>
                            </div>
                            <div className="text-sm text-white/90 mt-1 line-clamp-2">{item.description}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-green-400 font-medium">${item.unitCost.toFixed(2)}</div>
                            <div className="text-xs text-white/40">per {item.unit}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-8 text-center text-white/40">
                    <p>No items found for "{searchQuery}"</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-8 text-center text-white/40">
                    <p className="text-2xl mb-2">🔍</p>
                    <p>Search the JOC catalogue</p>
                    <p className="text-sm mt-1">All measurements will auto-assign to selected item</p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => { setIsOpen(false); setSearchQuery(''); }}
                  className="w-full text-sm text-white/50 hover:text-white py-1"
                >
                  Cancel (or measure without selecting)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
