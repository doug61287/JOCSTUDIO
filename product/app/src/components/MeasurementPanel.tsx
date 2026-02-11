import { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { searchJOCItems } from '../data/jocCatalogue';
import { GuidedAssistant } from './GuidedAssistant';
import type { JOCItem, Measurement } from '../types';
import { formatMeasurement, generateId } from '../utils/geometry';

export function MeasurementPanel() {
  const { 
    project, 
    selectedMeasurement, 
    selectMeasurement,
    deleteMeasurement,
    assignJOCItem,
    setCoefficient,
    addMeasurement
  } = useProjectStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showJOCSearch, setShowJOCSearch] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState<Measurement | null>(null);
  const [activeTab, setActiveTab] = useState<'measurements' | 'summary'>('measurements');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['line', 'count', 'area']));

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchJOCItems(searchQuery).slice(0, 10);
  }, [searchQuery]);

  // Group measurements by type
  const groupedMeasurements = useMemo(() => {
    if (!project) return {};
    
    const filtered = project.measurements.filter(m => 
      !filterQuery || 
      m.type.includes(filterQuery.toLowerCase()) ||
      m.jocItem?.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.jocItem?.taskCode.toLowerCase().includes(filterQuery.toLowerCase())
    );
    
    return filtered.reduce((acc, m) => {
      if (!acc[m.type]) acc[m.type] = [];
      acc[m.type].push(m);
      return acc;
    }, {} as Record<string, Measurement[]>);
  }, [project, filterQuery]);

  // Calculate totals by JOC line item
  const lineItemTotals = useMemo(() => {
    if (!project) return [];
    
    const grouped: Record<string, { item: JOCItem; quantity: number; measurements: Measurement[] }> = {};
    
    project.measurements.forEach((m) => {
      if (m.jocItem) {
        const key = m.jocItem.taskCode;
        if (!grouped[key]) {
          grouped[key] = { item: m.jocItem, quantity: 0, measurements: [] };
        }
        grouped[key].quantity += m.value;
        grouped[key].measurements.push(m);
      }
    });
    
    return Object.values(grouped).sort((a, b) => a.item.taskCode.localeCompare(b.item.taskCode));
  }, [project]);

  const totals = useMemo(() => {
    if (!project) return { subtotal: 0, total: 0 };
    
    const subtotal = lineItemTotals.reduce((sum, { item, quantity }) => 
      sum + (quantity * item.unitCost), 0
    );
    
    return {
      subtotal,
      total: subtotal * project.coefficient,
    };
  }, [lineItemTotals, project]);

  const handleAssignItem = (measurementId: string, item: JOCItem) => {
    assignJOCItem(measurementId, item);
    setShowJOCSearch(null);
    setSearchQuery('');
  };

  const handleDuplicate = (m: Measurement) => {
    const duplicate: Measurement = {
      ...m,
      id: generateId(),
      points: m.points.map(p => ({ x: p.x + 20, y: p.y + 20 })),
    };
    addMeasurement(duplicate);
  };

  const toggleGroup = (type: string) => {
    const next = new Set(expandedGroups);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setExpandedGroups(next);
  };

  const handleExport = () => {
    if (!project) return;
    
    // Generate CSV export
    const lines = [
      'JOC Code,Description,Quantity,Unit,Unit Price,Extended Price',
      ...lineItemTotals.map(({ item, quantity }) => 
        `"${item.taskCode}","${item.description}",${quantity.toFixed(2)},${item.unit},${item.unitCost.toFixed(2)},${(quantity * item.unitCost).toFixed(2)}`
      ),
      '',
      `,,,,Subtotal,${totals.subtotal.toFixed(2)}`,
      `,,,,Coefficient,${project.coefficient}`,
      `,,,,TOTAL,${totals.total.toFixed(2)}`,
    ];
    
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-')}-takeoff.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!project) return null;

  const groupLabels = {
    line: { icon: '📏', label: 'Linear Measurements', unit: 'LF' },
    count: { icon: '🔢', label: 'Item Counts', unit: 'EA' },
    area: { icon: '⬛', label: 'Area Measurements', unit: 'SF' },
    space: { icon: '🏠', label: 'Spaces / Rooms', unit: 'SF' },
  };

  return (
    <div className="w-[576px] flex-shrink-0 bg-gray-900/80 backdrop-blur border-l border-white/10 flex flex-col">
      {/* Header with Tabs */}
      <div className="border-b border-white/10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all
              ${activeTab === 'measurements' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white/60 hover:text-white'}`}
          >
            📏 Measurements
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all
              ${activeTab === 'summary' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white/60 hover:text-white'}`}
          >
            📊 Summary
          </button>
        </div>
        
        {/* Search/Filter */}
        <div className="p-3">
          <input
            type="text"
            placeholder="🔍 Filter measurements..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'measurements' ? (
          <div className="p-3 space-y-3">
            {project.measurements.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <p className="text-5xl mb-3">📏</p>
                <p className="font-medium">No measurements yet</p>
                <p className="text-sm mt-2">Select a tool and click on the drawing to start measuring</p>
                <div className="mt-4 text-xs text-white/30">
                  <p>💡 Tip: Use keyboard shortcuts</p>
                  <p className="mt-1">L = Line, C = Count, A = Area</p>
                </div>
              </div>
            ) : (
              Object.entries(groupedMeasurements).map(([type, measurements]) => {
                const group = groupLabels[type as keyof typeof groupLabels];
                const isExpanded = expandedGroups.has(type);
                const groupTotal = measurements.reduce((sum, m) => sum + m.value, 0);
                
                return (
                  <div key={type} className="bg-white/5 rounded-xl overflow-hidden">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(type)}
                      className="w-full flex items-center justify-between p-3 hover:bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span>{group.icon}</span>
                        <span className="font-medium">{group.label}</span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                          {measurements.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-blue-400 font-medium">
                          {groupTotal.toFixed(1)} {group.unit}
                        </span>
                        <span className="text-white/40">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                    </button>
                    
                    {/* Group Items */}
                    {isExpanded && (
                      <div className="border-t border-white/5">
                        {measurements.map((m) => (
                          <div
                            key={m.id}
                            className={`p-3 border-b border-white/5 last:border-b-0 cursor-pointer transition-all
                              ${m.id === selectedMeasurement ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
                            onClick={() => selectMeasurement(m.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: m.color }}
                                />
                                <span className="text-lg font-bold text-blue-400">
                                  {m.type === 'space' && m.spaceName ? (
                                    <span className="text-purple-400">{m.spaceName}</span>
                                  ) : (
                                    formatMeasurement(m.value, m.unit)
                                  )}
                                </span>
                              </div>
                              
                              {/* Space-specific measurements */}
                              {m.type === 'space' && (
                                <div className="flex gap-3 text-sm text-white/60 mt-1">
                                  <span>📐 {m.value.toFixed(1)} SF</span>
                                  <span>📏 {m.perimeter?.toFixed(1) || 0} LF</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicate(m);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded text-xs"
                                  title="Duplicate"
                                >
                                  📋
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMeasurement(m.id);
                                  }}
                                  className="p-1 hover:bg-red-500/20 rounded text-red-400 text-xs"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                            
                            {m.jocItem ? (
                              <div className="bg-white/5 rounded p-2 text-sm mt-2">
                                <div className="text-white/50 text-xs font-mono">{m.jocItem.taskCode}</div>
                                <div className="truncate text-white/80">{m.jocItem.description}</div>
                                <div className="text-green-400 font-medium mt-1">
                                  ${(m.value * m.jocItem.unitCost).toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAssistant(m);
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-medium rounded-lg flex items-center justify-center gap-1"
                                >
                                  <span>🤖</span> Guide Me
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowJOCSearch(m.id);
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center gap-1"
                                >
                                  <span>🔍</span> Search
                                </button>
                              </div>
                            )}

                            {/* JOC Search Dropdown */}
                            {showJOCSearch === m.id && (
                              <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-white/10">
                                <input
                                  type="text"
                                  placeholder="Search JOC catalogue..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="w-full mb-2 text-sm"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="max-h-48 overflow-auto space-y-1">
                                  {searchResults.map((item) => (
                                    <button
                                      key={item.taskCode}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignItem(m.id, item);
                                      }}
                                      className="w-full text-left p-2 rounded hover:bg-white/10 text-sm"
                                    >
                                      <div className="text-white/50 text-xs font-mono">{item.taskCode}</div>
                                      <div className="truncate">{item.description}</div>
                                      <div className="text-green-400">
                                        ${item.unitCost.toFixed(2)}/{item.unit}
                                      </div>
                                    </button>
                                  ))}
                                  {searchQuery && searchResults.length === 0 && (
                                    <div className="text-center text-white/40 py-3 text-sm">
                                      No items found
                                    </div>
                                  )}
                                  {!searchQuery && (
                                    <div className="text-center text-white/40 py-3 text-sm">
                                      Type to search catalogue
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowJOCSearch(null);
                                    setSearchQuery('');
                                  }}
                                  className="w-full mt-2 text-sm text-white/40 hover:text-white"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Summary Tab */
          <div className="p-3 space-y-3">
            {lineItemTotals.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <p className="text-5xl mb-3">📊</p>
                <p className="font-medium">No line items assigned</p>
                <p className="text-sm mt-2">Assign JOC items to your measurements to see the summary</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lineItemTotals.map(({ item, quantity }) => (
                  <div key={item.taskCode} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/50 font-mono">{item.taskCode}</div>
                    <div className="text-sm truncate">{item.description}</div>
                    <div className="flex justify-between mt-2">
                      <span className="text-white/60">
                        {quantity.toFixed(2)} {item.unit} × ${item.unitCost.toFixed(2)}
                      </span>
                      <span className="text-green-400 font-medium">
                        ${(quantity * item.unitCost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Totals Footer */}
      {(lineItemTotals.length > 0 || project.measurements.length > 0) && (
        <div className="border-t border-white/10 bg-gray-900/50">
          {lineItemTotals.length > 0 && (
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Location Coefficient</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={project.coefficient}
                    onChange={(e) => setCoefficient(parseFloat(e.target.value) || 1)}
                    className="w-20 text-sm text-right"
                    step="0.05"
                    min="0.5"
                    max="2"
                  />
                  <span className="text-xs text-white/40">×</span>
                </div>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-green-400 pt-2 border-t border-white/10">
                <span>Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Export Button */}
          <div className="p-3 pt-0">
            <button 
              onClick={handleExport}
              disabled={lineItemTotals.length === 0}
              className="btn btn-gold w-full flex items-center justify-center gap-2"
            >
              📤 Export JOC Proposal
            </button>
          </div>
        </div>
      )}

      {/* Guided Assistant Modal */}
      {showAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl h-[85vh] max-h-[800px]">
            <GuidedAssistant
              measurementId={showAssistant.id}
              measurementType={showAssistant.type as 'line' | 'count' | 'area' | 'space'}
              measurementValue={showAssistant.value}
              measurementLabel={showAssistant.label || showAssistant.spaceName}
              onSelect={(item) => {
                // Item already has correct format from GuidedAssistant
                const jocItem: JOCItem = {
                  taskCode: item.taskCode,
                  description: item.description,
                  unit: item.unit,
                  unitCost: item.unitCost,
                };
                handleAssignItem(showAssistant.id, jocItem);
                setShowAssistant(null);
              }}
              onClose={() => setShowAssistant(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
