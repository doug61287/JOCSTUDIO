import { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { searchJOCItems } from '../data/jocCatalogue';
import type { JOCItem } from '../types';
import { formatMeasurement } from '../utils/geometry';

export function MeasurementPanel() {
  const { 
    project, 
    selectedMeasurement, 
    selectMeasurement,
    deleteMeasurement,
    assignJOCItem,
    setCoefficient 
  } = useProjectStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showJOCSearch, setShowJOCSearch] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchJOCItems(searchQuery).slice(0, 10);
  }, [searchQuery]);

  const totals = useMemo(() => {
    if (!project) return { subtotal: 0, total: 0 };
    
    const subtotal = project.measurements.reduce((sum, m) => {
      if (m.jocItem) {
        return sum + (m.value * m.jocItem.unitPrice);
      }
      return sum;
    }, 0);
    
    return {
      subtotal,
      total: subtotal * project.coefficient,
    };
  }, [project]);

  const handleAssignItem = (measurementId: string, item: JOCItem) => {
    assignJOCItem(measurementId, item);
    setShowJOCSearch(null);
    setSearchQuery('');
  };

  if (!project) return null;

  return (
    <div className="w-96 bg-gray-900/50 border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-bold">Measurements</h2>
        <p className="text-sm text-white/60">
          {project.measurements.length} items • Scale: {project.scale} px/ft
        </p>
      </div>

      {/* Measurement List */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {project.measurements.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            <p className="text-4xl mb-2">📏</p>
            <p>No measurements yet</p>
            <p className="text-sm mt-2">Use the tools above to start measuring</p>
          </div>
        ) : (
          project.measurements.map((m) => (
            <div
              key={m.id}
              className={`measurement-item ${m.id === selectedMeasurement ? 'selected' : ''}`}
              onClick={() => selectMeasurement(m.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="font-medium capitalize">{m.type}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMeasurement(m.id);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-xl font-bold text-blue-400">
                {formatMeasurement(m.value, m.unit)}
              </div>
              
              {m.jocItem ? (
                <div className="mt-2 p-2 bg-white/5 rounded text-sm">
                  <div className="text-white/60">{m.jocItem.code}</div>
                  <div className="truncate">{m.jocItem.description}</div>
                  <div className="text-green-400 font-medium mt-1">
                    ${(m.value * m.jocItem.unitPrice).toFixed(2)}
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowJOCSearch(m.id);
                  }}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  + Assign JOC Item
                </button>
              )}

              {/* JOC Search Dropdown */}
              {showJOCSearch === m.id && (
                <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                  <input
                    type="text"
                    placeholder="Search JOC catalogue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full mb-2 text-sm"
                    autoFocus
                  />
                  <div className="max-h-48 overflow-auto space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleAssignItem(m.id, item)}
                        className="w-full text-left p-2 rounded hover:bg-white/10 text-sm"
                      >
                        <div className="text-white/60 text-xs">{item.code}</div>
                        <div className="truncate">{item.description}</div>
                        <div className="text-green-400">
                          ${item.unitPrice.toFixed(2)}/{item.unit}
                        </div>
                      </button>
                    ))}
                    {searchQuery && searchResults.length === 0 && (
                      <div className="text-center text-white/40 py-2 text-sm">
                        No items found
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowJOCSearch(null);
                      setSearchQuery('');
                    }}
                    className="w-full mt-2 text-sm text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      {project.measurements.some((m) => m.jocItem) && (
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex justify-between mb-2">
            <span className="text-white/60">Subtotal</span>
            <span>${totals.subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/60">Coefficient</span>
            <input
              type="number"
              value={project.coefficient}
              onChange={(e) => setCoefficient(parseFloat(e.target.value) || 1)}
              className="w-20 text-sm text-right"
              step="0.05"
              min="0.5"
              max="2"
            />
          </div>
          
          <div className="flex justify-between text-lg font-bold text-green-400 pt-2 border-t border-white/10">
            <span>Total</span>
            <span>${totals.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="p-4 border-t border-white/10">
        <button className="btn btn-gold w-full">
          📄 Export JOC Proposal
        </button>
      </div>
    </div>
  );
}
