import { useState, useMemo } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { searchJOCItems } from '../data/jocCatalogue';
import { GuidedAssistant } from './GuidedAssistant';
import { FormattingPanel } from './FormattingPanel';
import { FlagsPanel } from './FlagsPanel';
import type { JOCItem, Measurement, MeasurementGroup } from '../types';
import { formatMeasurement, generateId } from '../utils/geometry';

// Group colors for visual distinction
const GROUP_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export function MeasurementPanel() {
  const { 
    project, 
    selectedMeasurement, 
    selectMeasurement,
    deleteMeasurement,
    assignJOCItem,
    setCoefficient,
    addMeasurement,
    addGroup,
    updateGroup,
    deleteGroup,
    assignToGroup,
    setActiveJOCItem,
    activeJOCItem
  } = useProjectStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showJOCSearch, setShowJOCSearch] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState<Measurement | null>(null);
  const [activeTab, setActiveTab] = useState<'measurements' | 'groups' | 'flags' | 'summary'>('measurements');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['ungrouped']));
  const [groupPickerOpen, setGroupPickerOpen] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [draggedMeasurement, setDraggedMeasurement] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [showFormatting, setShowFormatting] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchJOCItems(searchQuery).slice(0, 10);
  }, [searchQuery]);

  // Group measurements by user-created groups OR by JOC item
  const groupedMeasurements = useMemo(() => {
    if (!project) return { ungrouped: [], byGroup: {} as Record<string, Measurement[]>, byJocItem: {} as Record<string, Measurement[]> };
    
    const filtered = project.measurements.filter(m => 
      !filterQuery || 
      m.type.includes(filterQuery.toLowerCase()) ||
      m.jocItem?.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.jocItem?.taskCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.label?.toLowerCase().includes(filterQuery.toLowerCase())
    );
    
    const ungrouped: Measurement[] = [];
    const byGroup: Record<string, Measurement[]> = {};
    const byJocItem: Record<string, Measurement[]> = {};
    
    filtered.forEach((m) => {
      if (m.groupId) {
        if (!byGroup[m.groupId]) byGroup[m.groupId] = [];
        byGroup[m.groupId].push(m);
      } else if (m.jocItem) {
        // Group by JOC item if no user group assigned
        const key = m.jocItem.taskCode;
        if (!byJocItem[key]) byJocItem[key] = [];
        byJocItem[key].push(m);
      } else {
        ungrouped.push(m);
      }
    });
    
    return { ungrouped, byGroup, byJocItem };
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

  const toggleGroup = (id: string) => {
    const next = new Set(expandedGroups);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedGroups(next);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !project) return;
    
    const groupCount = project.groups?.length || 0;
    const newGroup: MeasurementGroup = {
      id: generateId(),
      name: newGroupName.trim(),
      color: GROUP_COLORS[groupCount % GROUP_COLORS.length],
      expanded: true,
      order: groupCount,
    };
    addGroup(newGroup);
    setNewGroupName('');
    setExpandedGroups(prev => new Set([...prev, newGroup.id]));
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    if (newName.trim()) {
      updateGroup(groupId, { name: newName.trim() });
    }
    setEditingGroup(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, measurementId: string) => {
    setDraggedMeasurement(measurementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDragOverGroup(groupId);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, groupId: string | undefined) => {
    e.preventDefault();
    if (draggedMeasurement) {
      assignToGroup(draggedMeasurement, groupId);
    }
    setDraggedMeasurement(null);
    setDragOverGroup(null);
  };

  const handleExport = () => {
    if (!project) return;
    
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

  const typeLabels: Record<string, { icon: string; label: string }> = {
    line: { icon: '📏', label: 'Line' },
    polyline: { icon: '📐', label: 'Poly' },
    count: { icon: '🔢', label: 'Count' },
    area: { icon: '⬛', label: 'Area' },
    space: { icon: '🏠', label: 'Space' },
  };

  // Render a single measurement item
  const renderMeasurementItem = (m: Measurement, allowGroupAssign: boolean = true) => (
    <div
      key={m.id}
      draggable
      onDragStart={(e) => handleDragStart(e, m.id)}
      className={`p-3 border-b border-white/5 last:border-b-0 cursor-pointer transition-all
        ${m.id === selectedMeasurement ? 'bg-blue-500/20' : 'hover:bg-white/5'}
        ${draggedMeasurement === m.id ? 'opacity-50' : ''}`}
      onClick={() => selectMeasurement(m.id)}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs">{typeLabels[m.type]?.icon || '📍'}</span>
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
        
        <div className="flex items-center gap-1">
          {allowGroupAssign && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGroupPickerOpen(groupPickerOpen === m.id ? null : m.id);
              }}
              className="p-1 hover:bg-white/10 rounded text-xs"
              title="Assign to group"
            >
              📁
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFormatting(m.id);
            }}
            className="p-1 hover:bg-white/10 rounded text-xs"
            title="Format"
          >
            🎨
          </button>
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
      
      {/* Group Picker Dropdown */}
      {groupPickerOpen === m.id && (
        <div className="mt-2 p-2 bg-gray-800 rounded-lg border border-white/10" onClick={(e) => e.stopPropagation()}>
          <div className="text-xs text-white/50 mb-2">Move to group:</div>
          <div className="space-y-1">
            <button
              onClick={() => {
                assignToGroup(m.id, undefined);
                setGroupPickerOpen(null);
              }}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-sm flex items-center gap-2"
            >
              <span className="text-white/40">—</span>
              <span>Ungrouped</span>
            </button>
            {(project?.groups || []).map((g) => (
              <button
                key={g.id}
                onClick={() => {
                  assignToGroup(m.id, g.id);
                  setGroupPickerOpen(null);
                }}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-white/10 text-sm flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }} />
                <span>{g.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
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
  );

  return (
    <div className="w-[576px] flex-shrink-0 bg-gray-900/80 backdrop-blur border-l border-white/10 flex flex-col">
      {/* Header with Tabs */}
      <div className="border-b border-white/10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all
              ${activeTab === 'measurements' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white/60 hover:text-white'}`}
          >
            📏 All
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all
              ${activeTab === 'groups' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white/60 hover:text-white'}`}
          >
            📁 Groups
          </button>
          <button
            onClick={() => setActiveTab('flags')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all relative
              ${activeTab === 'flags' 
                ? 'text-white border-b-2 border-red-500' 
                : 'text-white/60 hover:text-white'}`}
          >
            🚩 Flags
            {(project.flags?.filter(f => f.status === 'open').length || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] rounded-full flex items-center justify-center">
                {project.flags?.filter(f => f.status === 'open').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-3 py-3 text-sm font-medium transition-all
              ${activeTab === 'summary' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white/60 hover:text-white'}`}
          >
            📊 Takeoff
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

      {/* Active JOC Item Indicator */}
      {activeJOCItem && (
        <div className="mx-3 mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-green-400/70">Active Item (auto-assign)</div>
              <div className="text-sm text-white truncate">{activeJOCItem.description.slice(0, 50)}...</div>
            </div>
            <button
              onClick={() => setActiveJOCItem(null)}
              className="ml-2 p-1 hover:bg-white/10 rounded text-white/60"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'measurements' && (
          <div className="p-3 space-y-3">
            {project.measurements.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <p className="text-5xl mb-3">📏</p>
                <p className="font-medium">No measurements yet</p>
                <p className="text-sm mt-2">Select a tool and click on the drawing</p>
                <div className="mt-4 text-xs text-white/30">
                  <p>💡 Tip: Use keyboard shortcuts</p>
                  <p className="mt-1">L = Line, P = Poly, C = Count, A = Area</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {project.measurements.map((m) => renderMeasurementItem(m, true))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="p-3 space-y-3">
            {/* Create New Group */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                className="flex-1 text-sm"
              />
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm"
              >
                + Add
              </button>
            </div>

            {/* User-Created Groups */}
            {project.groups.map((group) => {
              const measurements = groupedMeasurements.byGroup[group.id] || [];
              const isExpanded = expandedGroups.has(group.id);
              const groupTotal = measurements.reduce((sum, m) => sum + (m.jocItem ? m.value * m.jocItem.unitCost : 0), 0);
              
              return (
                <div 
                  key={group.id} 
                  className={`bg-white/5 rounded-xl overflow-hidden transition-all
                    ${dragOverGroup === group.id ? 'ring-2 ring-blue-500' : ''}`}
                  onDragOver={(e) => handleDragOver(e, group.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, group.id)}
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between p-3 hover:bg-white/5">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: group.color }}
                      />
                      {editingGroup === group.id ? (
                        <input
                          type="text"
                          defaultValue={group.name}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => handleRenameGroup(group.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameGroup(group.id, e.currentTarget.value);
                            if (e.key === 'Escape') setEditingGroup(null);
                          }}
                          className="flex-1 text-sm bg-transparent border-b border-white/30 focus:outline-none"
                        />
                      ) : (
                        <span className="font-medium">{group.name}</span>
                      )}
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                        {measurements.length}
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      {groupTotal > 0 && (
                        <span className="text-sm text-green-400">${groupTotal.toFixed(0)}</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingGroup(group.id); }}
                        className="p-1 hover:bg-white/10 rounded text-xs"
                        title="Rename"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400 text-xs"
                        title="Delete group"
                      >
                        🗑️
                      </button>
                      <span className="text-white/40">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  
                  {/* Group Items */}
                  {isExpanded && (
                    <div className="border-t border-white/5">
                      {measurements.length === 0 ? (
                        <div className="p-4 text-center text-white/30 text-sm">
                          Drag measurements here
                        </div>
                      ) : (
                        measurements.map((m) => renderMeasurementItem(m, false))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Auto-grouped by JOC Item */}
            {Object.entries(groupedMeasurements.byJocItem).map(([taskCode, measurements]) => {
              const item = measurements[0]?.jocItem;
              if (!item) return null;
              
              const isExpanded = expandedGroups.has(taskCode);
              const totalQty = measurements.reduce((sum, m) => sum + m.value, 0);
              const totalCost = totalQty * item.unitCost;
              
              return (
                <div key={taskCode} className="bg-green-500/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleGroup(taskCode)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-green-400">🏷️</span>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-xs font-mono text-green-400/70">{taskCode}</div>
                        <div className="text-sm truncate">{item.description.slice(0, 40)}...</div>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        {measurements.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm text-green-400 font-medium">${totalCost.toFixed(0)}</div>
                        <div className="text-xs text-white/40">{totalQty.toFixed(1)} {item.unit}</div>
                      </div>
                      <span className="text-white/40">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-green-500/20">
                      {measurements.map((m) => renderMeasurementItem(m, true))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped - WARNING: These won't appear in Takeoff! */}
            {groupedMeasurements.ungrouped.length > 0 && (
              <div 
                className={`bg-amber-500/10 border border-amber-500/30 rounded-xl overflow-hidden transition-all
                  ${dragOverGroup === 'ungrouped' ? 'ring-2 ring-white/30' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'ungrouped')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, undefined)}
              >
                <button
                  onClick={() => toggleGroup('ungrouped')}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">⚠️</span>
                    <span className="font-medium text-amber-400">No JOC Item</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                      {groupedMeasurements.ungrouped.length}
                    </span>
                  </div>
                  <span className="text-white/40">
                    {expandedGroups.has('ungrouped') ? '▼' : '▶'}
                  </span>
                </button>
                <div className="px-3 pb-2 text-xs text-amber-400/70">
                  Assign a JOC item to include in Takeoff
                </div>
                
                {expandedGroups.has('ungrouped') && (
                  <div className="border-t border-white/5">
                    {groupedMeasurements.ungrouped.map((m) => renderMeasurementItem(m, true))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {project.groups.length === 0 && Object.keys(groupedMeasurements.byJocItem).length === 0 && groupedMeasurements.ungrouped.length === 0 && (
              <div className="text-center text-white/40 py-12">
                <p className="text-5xl mb-3">📁</p>
                <p className="font-medium">No groups yet</p>
                <p className="text-sm mt-2">Create groups to organize your measurements</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flags' && (
          <FlagsPanel />
        )}

        {activeTab === 'summary' && (
          <div className="p-3 space-y-3">
            {lineItemTotals.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <p className="text-5xl mb-3">📊</p>
                <p className="font-medium">No line items assigned</p>
                <p className="text-sm mt-2">Assign JOC items to see the summary</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lineItemTotals.map(({ item, quantity, measurements }) => (
                  <div key={item.taskCode} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/50 font-mono">{item.taskCode}</div>
                        <div className="text-sm truncate">{item.description}</div>
                      </div>
                      <button
                        onClick={() => setActiveJOCItem(item)}
                        className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30"
                        title="Set as active item"
                      >
                        Use
                      </button>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-white/60">
                        {quantity.toFixed(2)} {item.unit} × ${item.unitCost.toFixed(2)}
                      </span>
                      <span className="text-green-400 font-medium">
                        ${(quantity * item.unitCost).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      {measurements.length} measurement{measurements.length !== 1 ? 's' : ''}
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

      {/* Formatting Panel Modal */}
      {showFormatting && (
        <FormattingPanel 
          measurementId={showFormatting} 
          onClose={() => setShowFormatting(null)} 
        />
      )}
    </div>
  );
}
