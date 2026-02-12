import { useState, useMemo, useRef } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { searchJOCItems, jocCatalogue, findTierFamily, hasTierVariants, type TierFamily, type QuantityTier } from '../data/jocCatalogue';
import { searchAssemblies, calculateAssemblyCost, getAssemblyById } from '../data/assemblies';
import { AssemblyConfigurator, findMatchingAssembly, type AssemblyConfig } from './AssemblyConfigurator';
import { TierSelector } from './TierSelector';
import { ComplexityPanel, ComplexitySummary } from './ComplexityPanel';
import { calculateComplexityMultiplier } from '../utils/complexityFactors';
import type { Assembly } from '../types';
import { GuidedAssistant } from './GuidedAssistant';
import { FormattingPanel } from './FormattingPanel';
import { FlagsPanel } from './FlagsPanel';
import type { JOCItem, Measurement, MeasurementGroup, Flag as FlagType } from '../types';
import { formatMeasurement, generateId } from '../utils/geometry';
import {
  Ruler,
  Hash,
  Square,
  Home,
  Pencil,
  FolderOpen,
  Flag,
  BarChart3,
  Search,
  ChevronDown,
  ChevronRight,
  Trash2,
  Palette,
  Plus,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  MoreHorizontal,
  X,
  Zap,
  Package,
  Layers,
  Tag,
  AlertTriangle,
  MousePointer2,
  Link2,
} from 'lucide-react';

// Group colors
const GROUP_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// Type icons - small
const TYPE_ICONS: Record<string, React.ReactNode> = {
  line: <Ruler className="w-3.5 h-3.5" />,
  polyline: <Pencil className="w-3.5 h-3.5" />,
  count: <Hash className="w-3.5 h-3.5" />,
  area: <Square className="w-3.5 h-3.5" />,
  space: <Home className="w-3.5 h-3.5" />,
};

export function MeasurementPanel() {
  const { 
    project, 
    selectedMeasurement, 
    selectMeasurement,
    deleteMeasurement,
    updateMeasurement,
    addMeasurement,
    setCoefficient,
    addGroup,
    setActiveJOCItem,
    activeJOCItem,
    setActiveTool,
    toggleComplexityFactor,
    updateComplexityMultiplier,
    flagMeasurement,
  } = useProjectStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showJOCSearch, setShowJOCSearch] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState<Measurement | null>(null);
  const [activeTab, setActiveTab] = useState<'measurements' | 'groups' | 'flags' | 'summary'>('measurements');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [assemblySuggestions, setAssemblySuggestions] = useState<Assembly[]>([]);
  const [showFormatting, setShowFormatting] = useState<string | null>(null);
  const [showConfigurator, setShowConfigurator] = useState<{ measurement: Measurement; assembly: AssemblyConfig } | null>(null);
  const [showTierSelector, setShowTierSelector] = useState<{ 
    measurementId: string; 
    family: TierFamily; 
    quantity: number;
    selectedTier?: QuantityTier;
  } | null>(null);
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return searchJOCItems(searchQuery).slice(0, 8);
  }, [searchQuery]);

  // Get all JOC items for a measurement (supports both single and multiple)
  const getJocItems = (m: Measurement): JOCItem[] => {
    if (m.jocItems && m.jocItems.length > 0) return m.jocItems;
    if (m.jocItem) return [m.jocItem];
    return [];
  };

  // Get display name for measurement
  const getMeasurementName = (m: Measurement): string => {
    if (m.name) return m.name;
    if (m.spaceName) return m.spaceName;
    if (m.label) return m.label;
    // Generate default name based on type
    const typeNames: Record<string, string> = {
      line: 'Linear',
      polyline: 'Polyline',
      count: 'Count',
      area: 'Area',
      space: 'Space',
    };
    return `${typeNames[m.type] || 'Measurement'} ${m.id.slice(-4)}`;
  };

  // Calculate totals
  const calculateTotal = (m: Measurement): number => {
    const items = getJocItems(m);
    return items.reduce((sum, item) => sum + (m.value * item.unitCost), 0);
  };

  // Group measurements
  const groupedMeasurements = useMemo(() => {
    if (!project) return { ungrouped: [], byGroup: {} as Record<string, Measurement[]> };
    
    const filtered = project.measurements.filter(m => 
      !filterQuery || 
      getMeasurementName(m).toLowerCase().includes(filterQuery.toLowerCase()) ||
      m.type.includes(filterQuery.toLowerCase())
    );
    
    const ungrouped: Measurement[] = [];
    const byGroup: Record<string, Measurement[]> = {};
    
    filtered.forEach((m) => {
      if (m.groupId) {
        if (!byGroup[m.groupId]) byGroup[m.groupId] = [];
        byGroup[m.groupId].push(m);
      } else {
        ungrouped.push(m);
      }
    });
    
    return { ungrouped, byGroup };
  }, [project, filterQuery]);

  // Line item totals for summary
  const lineItemTotals = useMemo(() => {
    if (!project) return [];
    
    const grouped: Record<string, { item: JOCItem; quantity: number; measurements: Measurement[] }> = {};
    
    project.measurements.forEach((m) => {
      const items = getJocItems(m);
      items.forEach((item) => {
        const key = item.taskCode;
        if (!grouped[key]) {
          grouped[key] = { item, quantity: 0, measurements: [] };
        }
        grouped[key].quantity += m.value;
        if (!grouped[key].measurements.includes(m)) {
          grouped[key].measurements.push(m);
        }
      });
    });
    
    return Object.values(grouped).sort((a, b) => a.item.taskCode.localeCompare(b.item.taskCode));
  }, [project]);

  const totals = useMemo(() => {
    if (!project) return { subtotal: 0, complexityAmount: 0, total: 0 };
    
    const subtotal = lineItemTotals.reduce((sum, { item, quantity }) => 
      sum + (quantity * item.unitCost), 0
    );
    
    // Calculate complexity multiplier
    const complexityMultiplier = calculateComplexityMultiplier(project.complexityFactors || []);
    const complexityAmount = subtotal * (complexityMultiplier - 1);
    const afterComplexity = subtotal + complexityAmount;
    
    return {
      subtotal,
      complexityAmount,
      total: afterComplexity * project.coefficient,
    };
  }, [lineItemTotals, project]);

  const handleAddJocItem = (measurementId: string, item: JOCItem, skipTierCheck = false) => {
    const measurement = project?.measurements.find(m => m.id === measurementId);
    if (!measurement) return;
    
    // Check if this item has quantity tier variants
    if (!skipTierCheck && hasTierVariants(item)) {
      const tierFamily = findTierFamily(item, jocCatalogue);
      if (tierFamily && tierFamily.tiers.length > 1) {
        // Show tier selector instead of adding directly
        setShowTierSelector({
          measurementId,
          family: tierFamily,
          quantity: measurement.value,
        });
        return;
      }
    }
    
    const currentItems = getJocItems(measurement);
    const newItems = [...currentItems, item];
    
    updateMeasurement(measurementId, { jocItems: newItems, jocItem: undefined });
    setShowJOCSearch(null);
    setSearchQuery('');
    setShowTierSelector(null);
  };
  
  // Handle tier selection confirmation
  const handleTierConfirm = (item: JOCItem) => {
    if (!showTierSelector) return;
    handleAddJocItem(showTierSelector.measurementId, item, true);
    setShowTierSelector(null);
  };

  const handleRemoveJocItem = (measurementId: string, taskCode: string) => {
    const measurement = project?.measurements.find(m => m.id === measurementId);
    if (!measurement) return;
    
    const currentItems = getJocItems(measurement);
    const newItems = currentItems.filter(item => item.taskCode !== taskCode);
    
    updateMeasurement(measurementId, { jocItems: newItems, jocItem: undefined });
  };

  // Apply an assembly to a measurement
  const handleApplyAssembly = (measurementId: string, assembly: Assembly) => {
    const measurement = project?.measurements.find(m => m.id === measurementId);
    if (!measurement) return;
    
    // Convert assembly items to JOC items
    // EXCLUDE FITTINGS (quantityFactor < 1) - they go in "Continue Takeoff" instead
    const jocItems: JOCItem[] = assembly.items
      .filter(item => item.quantityFactor >= 1.0) // Only primary items, not fittings
      .map(item => ({
        ...item.jocItem,
      }));
    
    // Update measurement with assembly name, JOC items, AND assembly ID for companion tracking
    updateMeasurement(measurementId, { 
      name: assembly.name,
      jocItems: jocItems,
      jocItem: undefined,
      sourceAssemblyId: assembly.id, // Track which assembly was applied
    });
    
    // Expand the item to show the added JOC items
    setExpandedItems(prev => new Set([...prev, measurementId]));
    setEditingName(null);
    setAssemblySuggestions([]);
  };

  // ============================================
  // 🔗 CONTEXTUAL CONTINUATION - Spawn companion measurement
  // ============================================
  
  /**
   * Get companion items for a measurement based on its source assembly
   * Companion items are those with quantityFactor < 1 (fittings, accessories)
   * FILTERS OUT items that have already been counted (child measurement exists with value > 0)
   */
  const getCompanionItems = (measurement: Measurement): { jocItem: JOCItem; parentTaskCode: string; label: string }[] => {
    if (!measurement.sourceAssemblyId) return [];
    
    const assembly = getAssemblyById(measurement.sourceAssemblyId);
    if (!assembly) return [];
    
    // Find the "main" item (quantityFactor = 1.0) to use as parent reference
    const mainItem = assembly.items.find(i => i.quantityFactor === 1.0);
    const parentTaskCode = mainItem?.jocItem.taskCode || '';
    
    // Find child measurements that were spawned for counting fittings
    const countedFittingCodes = new Set(
      project?.measurements
        .filter(m => 
          m.parentMeasurementId === measurement.id && 
          m.type === 'count' && 
          m.value > 0 // Has been counted
        )
        .flatMap(m => m.jocItems?.map(i => i.taskCode) || [])
    );
    
    // Return items with quantityFactor < 1, excluding already-counted ones
    return assembly.items
      .filter(item => item.quantityFactor < 1.0)
      .filter(item => !countedFittingCodes.has(item.jocItem.taskCode)) // Exclude counted
      .map(item => ({
        jocItem: item.jocItem,
        parentTaskCode,
        label: item.jocItem.description.split(',')[0].trim(),
      }));
  };

  // State for showing count prompt
  const [countingPrompt, setCountingPrompt] = useState<{ itemName: string; measurementId: string } | null>(null);

  /**
   * Spawn a new COUNT measurement for a companion item
   * Links back to the parent measurement for context
   */
  const handleSpawnCompanionCount = (parentMeasurement: Measurement, companionItem: JOCItem, parentTaskCode: string) => {
    // Generate new measurement ID
    const newId = generateId();
    
    // Extract clean short name from description
    // "3" Schedule 80 CPVC 90 Degree Elbow, Fire Sprinkler Piping" → "3" Elbow"
    const desc = companionItem.description;
    const sizeMatch = desc.match(/^(\d+(?:-\d+\/\d+)?["']?)/); // Get pipe size like "3"" or "1-1/2""
    const size = sizeMatch ? sizeMatch[1] : '';
    
    // Extract fitting type
    let fittingType = 'Fitting';
    if (/elbow/i.test(desc)) fittingType = 'Elbow';
    else if (/tee/i.test(desc)) fittingType = 'Tee';
    else if (/coupling/i.test(desc)) fittingType = 'Coupling';
    else if (/reducer/i.test(desc)) fittingType = 'Reducer';
    else if (/cap/i.test(desc)) fittingType = 'Cap';
    else if (/union/i.test(desc)) fittingType = 'Union';
    else if (/flange/i.test(desc)) fittingType = 'Flange';
    else if (/valve/i.test(desc)) fittingType = 'Valve';
    else if (/hanger/i.test(desc)) fittingType = 'Hanger';
    else if (/escutcheon/i.test(desc)) fittingType = 'Escutcheon';
    
    const shortLabel = size ? `${size} ${fittingType}` : fittingType;
    
    // Create a new COUNT measurement linked to the parent
    const newMeasurement: Measurement = {
      id: newId,
      type: 'count',
      points: [], // User will click to place counts
      value: 0,
      unit: 'EA',
      pageNumber: parentMeasurement.pageNumber,
      name: shortLabel, // Clean short name like "3" Elbow"
      jocItems: [companionItem],
      color: '#f59e0b', // Amber for companion counts
      visible: true,
      // Link back to parent
      parentMeasurementId: parentMeasurement.id,
      sourceAssemblyId: parentMeasurement.sourceAssemblyId,
      companionOf: parentTaskCode,
    };
    
    // Add the measurement
    addMeasurement(newMeasurement);
    
    // Switch to count tool
    setActiveTool('count');
    
    // Select the new measurement
    selectMeasurement(newId);
    
    // Expand it to show the JOC item
    setExpandedItems(prev => new Set([...prev, newId]));
    
    // Show counting prompt with clear name
    setCountingPrompt({ itemName: shortLabel, measurementId: newId });
    
    // Auto-hide prompt after 8 seconds (longer to give time to start counting)
    setTimeout(() => setCountingPrompt(null), 8000);
  };

  /**
   * Save all companion items for later - creates placeholder measurements with flags
   * "I'll count these fittings later"
   */
  const handleSaveCompanionsForLater = (parentMeasurement: Measurement) => {
    const companions = getCompanionItems(parentMeasurement);
    if (companions.length === 0) return;
    
    const createdIds: string[] = [];
    
    companions.forEach(({ jocItem, parentTaskCode }) => {
      const newId = generateId();
      const shortLabel = jocItem.description.split(',')[0].trim();
      
      // Create placeholder COUNT measurement with value=0
      const newMeasurement: Measurement = {
        id: newId,
        type: 'count',
        points: [],
        value: 0, // Placeholder - needs hard count
        unit: 'EA',
        pageNumber: parentMeasurement.pageNumber,
        name: `${shortLabel} (from ${parentMeasurement.name || 'parent'})`,
        jocItems: [jocItem],
        color: '#ef4444', // Red for "needs attention"
        visible: true,
        parentMeasurementId: parentMeasurement.id,
        sourceAssemblyId: parentMeasurement.sourceAssemblyId,
        companionOf: parentTaskCode,
      };
      
      addMeasurement(newMeasurement);
      createdIds.push(newId);
      
      // Add flag to each one
      const flag: FlagType = {
        id: generateId(),
        type: 'verify',
        title: `Hard count needed: ${shortLabel}`,
        description: `Placeholder from ${parentMeasurement.name || 'assembly'}. Count actual fittings on drawing.`,
        measurementId: newId,
        pageNumber: parentMeasurement.pageNumber,
        status: 'open',
        priority: 'medium',
        createdAt: new Date(),
      };
      
      flagMeasurement(newId, flag);
    });
    
    // Expand to show the new items
    setExpandedItems(prev => new Set([...prev, ...createdIds]));
    
    // Show confirmation
    setCountingPrompt({ 
      itemName: `${companions.length} items saved - check Flags tab`, 
      measurementId: createdIds[0] 
    });
    setTimeout(() => setCountingPrompt(null), 4000);
  };

  // Handle name input change with assembly suggestions
  const handleNameInputChange = (value: string, measurementType: string) => {
    setEditingNameValue(value);
    
    if (value.length >= 2) {
      const suggestions = searchAssemblies(value, measurementType);
      setAssemblySuggestions(suggestions);
    } else {
      setAssemblySuggestions([]);
    }
  };

  const toggleExpanded = (id: string) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const toggleVisibility = (id: string) => {
    const m = project?.measurements.find(m => m.id === id);
    if (m) {
      updateMeasurement(id, { visible: m.visible === false ? true : false });
    }
  };

  const handleRename = (id: string, newName: string) => {
    if (!newName.trim()) {
      setEditingName(null);
      return;
    }
    
    const measurement = project?.measurements.find(m => m.id === id);
    if (!measurement) {
      setEditingName(null);
      return;
    }
    
    // Update the name first
    updateMeasurement(id, { name: newName.trim() });
    
    // Check for matching assembly
    const matchedAssembly = findMatchingAssembly(newName.trim(), measurement.type);
    
    if (matchedAssembly) {
      // Show the configurator!
      setShowConfigurator({ 
        measurement: { ...measurement, name: newName.trim() }, 
        assembly: matchedAssembly 
      });
    }
    
    setEditingName(null);
  };
  
  // Handle configurator apply
  const handleConfiguratorApply = (
    measurementId: string, 
    jocItems: JOCItem[], 
    fittingsToCount?: JOCItem[], 
    fittingsToFlag?: JOCItem[]
  ) => {
    const measurement = project?.measurements.find(m => m.id === measurementId);
    if (!measurement) return;
    
    updateMeasurement(measurementId, { jocItems, jocItem: undefined });
    setExpandedItems(prev => new Set([...prev, measurementId]));
    setShowConfigurator(null);
    
    // Handle fittings to count - spawn count measurements and start counting
    if (fittingsToCount && fittingsToCount.length > 0) {
      // Start counting the first one, queue the rest
      const firstFitting = fittingsToCount[0];
      handleSpawnCompanionCount(measurement, firstFitting, jocItems[0]?.taskCode || '');
      
      // If there are more, flag them for later with note to count
      fittingsToCount.slice(1).forEach(fitting => {
        const newId = generateId();
        const shortLabel = fitting.description.split(',')[0].trim();
        
        const newMeasurement: Measurement = {
          id: newId,
          type: 'count',
          points: [],
          value: 0,
          unit: 'EA',
          pageNumber: measurement.pageNumber,
          name: `${shortLabel} (from ${measurement.name || 'assembly'})`,
          jocItems: [fitting],
          color: '#f59e0b',
          visible: true,
          parentMeasurementId: measurementId,
        };
        
        addMeasurement(newMeasurement);
        
        const flag: FlagType = {
          id: generateId(),
          type: 'verify',
          title: `Count needed: ${shortLabel}`,
          description: `Count on drawing after finishing current item.`,
          measurementId: newId,
          pageNumber: measurement.pageNumber,
          status: 'open',
          priority: 'medium',
          createdAt: new Date(),
        };
        
        flagMeasurement(newId, flag);
      });
    }
    
    // Handle fittings to flag - create placeholders with flags
    if (fittingsToFlag && fittingsToFlag.length > 0) {
      fittingsToFlag.forEach(fitting => {
        const newId = generateId();
        const shortLabel = fitting.description.split(',')[0].trim();
        
        const newMeasurement: Measurement = {
          id: newId,
          type: 'count',
          points: [],
          value: 0,
          unit: 'EA',
          pageNumber: measurement.pageNumber,
          name: `${shortLabel} (from ${measurement.name || 'assembly'})`,
          jocItems: [fitting],
          color: '#ef4444',
          visible: true,
          parentMeasurementId: measurementId,
        };
        
        addMeasurement(newMeasurement);
        
        const flag: FlagType = {
          id: generateId(),
          type: 'verify',
          title: `Hard count needed: ${shortLabel}`,
          description: `Placeholder from ${measurement.name || 'assembly'}. Count actual fittings on drawing.`,
          measurementId: newId,
          pageNumber: measurement.pageNumber,
          status: 'open',
          priority: 'medium',
          createdAt: new Date(),
        };
        
        flagMeasurement(newId, flag);
      });
    }
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
  };

  const handleExport = () => {
    if (!project) return;
    
    // Calculate complexity info
    const complexityMultiplier = calculateComplexityMultiplier(project.complexityFactors || []);
    const activeComplexityFactors = (project.complexityFactors || []).filter(f => f.enabled);
    const subtotalAfterComplexity = totals.subtotal * complexityMultiplier;
    
    const lines = [
      'JOC Code,Description,Quantity,Unit,Unit Price,Extended Price',
      ...lineItemTotals.map(({ item, quantity }) => 
        `"${item.taskCode}","${item.description}",${quantity.toFixed(2)},${item.unit},${item.unitCost.toFixed(2)},${(quantity * item.unitCost).toFixed(2)}`
      ),
      '',
      `,,,,Subtotal,${totals.subtotal.toFixed(2)}`,
    ];
    
    // Add complexity factors "below the line" if any are active
    if (activeComplexityFactors.length > 0) {
      lines.push(`,,,,--- Complexity Factors ---,`);
      activeComplexityFactors.forEach(f => {
        const amount = totals.subtotal * ((f.multiplier - 1) * 100) / 100;
        lines.push(`,,"${f.name}",,${((f.multiplier - 1) * 100).toFixed(0)}%,${amount.toFixed(2)}`);
      });
      lines.push(`,,,,Complexity Subtotal,${subtotalAfterComplexity.toFixed(2)}`);
    }
    
    lines.push(
      `,,,,Coefficient,${project.coefficient}`,
      `,,,,TOTAL,${totals.total.toFixed(2)}`,
    );
    
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

  // Compact measurement row
  const renderMeasurementRow = (m: Measurement) => {
    const isSelected = m.id === selectedMeasurement;
    const isExpanded = expandedItems.has(m.id);
    const jocItems = getJocItems(m);
    const hasJocItems = jocItems.length > 0;
    const total = calculateTotal(m);
    const isVisible = m.visible !== false;
    const displayName = getMeasurementName(m);
    
    return (
      <div key={m.id} className="border-b border-white/[0.04] last:border-b-0">
        {/* Main Row */}
        <div
          className={`
            flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
            ${isSelected ? 'bg-blue-500/10' : 'hover:bg-white/[0.02]'}
          `}
          onClick={() => selectMeasurement(m.id)}
        >
          {/* Expand Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleExpanded(m.id); }}
            className={`w-5 h-5 flex items-center justify-center rounded text-white/30 hover:text-white/60 transition-colors ${!hasJocItems && 'opacity-0'}`}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          {/* Type Icon + Color */}
          <div 
            className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 relative"
            style={{ backgroundColor: m.color + '30', color: m.color }}
          >
            {TYPE_ICONS[m.type]}
            {/* Chain link indicator for companion measurements */}
            {m.parentMeasurementId && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                <Link2 className="w-2 h-2 text-black" />
              </div>
            )}
          </div>
          
          {/* Name */}
          <div className="flex-1 min-w-0 relative">
            {editingName === m.id ? (
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={editingNameValue}
                  autoFocus
                  placeholder="Name this takeoff..."
                  className="w-full text-sm bg-white/5 border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => handleNameInputChange(e.target.value, m.type)}
                  onBlur={(e) => {
                    // Delay to allow clicking suggestions
                    setTimeout(() => {
                      if (editingName === m.id) {
                        handleRename(m.id, e.target.value);
                        setAssemblySuggestions([]);
                      }
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(m.id, e.currentTarget.value);
                      setAssemblySuggestions([]);
                    }
                    if (e.key === 'Escape') {
                      setEditingName(null);
                      setAssemblySuggestions([]);
                    }
                  }}
                />
                
                {/* Assembly Suggestions Dropdown */}
                {assemblySuggestions.length > 0 && (
                  <div 
                    className="absolute left-0 right-0 top-full mt-1 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-30 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2 py-1.5 bg-white/5 border-b border-white/10">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Quick Apply Assembly
                      </span>
                    </div>
                    {assemblySuggestions.map((assembly) => (
                      <button
                        key={assembly.id}
                        className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyAssembly(m.id, assembly);
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-sm font-medium">{assembly.name}</span>
                          </div>
                          <span className="text-xs text-emerald-400">
                            ${calculateAssemblyCost(assembly, m.value).toFixed(0)}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40 mt-0.5 ml-5">
                          {assembly.items.length} JOC items • {assembly.category}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span 
                className="text-sm font-medium truncate block cursor-text"
                onDoubleClick={(e) => { 
                  e.stopPropagation(); 
                  setEditingName(m.id);
                  setEditingNameValue(displayName);
                  setAssemblySuggestions([]);
                }}
              >
                {displayName}
              </span>
            )}
          </div>
          
          {/* Measurement Value */}
          <span className="text-sm text-white/60 tabular-nums flex-shrink-0">
            {formatMeasurement(m.value, m.unit)}
          </span>
          
          {/* Total (if has JOC items) */}
          {hasJocItems && (
            <span className="text-sm text-emerald-400 font-medium tabular-nums w-16 text-right flex-shrink-0">
              ${total.toFixed(0)}
            </span>
          )}
          
          {/* Visibility Toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleVisibility(m.id); }}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              isVisible ? 'text-white/30 hover:text-white/60' : 'text-white/20 hover:text-white/40'
            }`}
          >
            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          
          {/* Actions Menu */}
          <div className="relative group">
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-6 h-6 flex items-center justify-center rounded text-white/20 hover:text-white/60 transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-20">
              <div className="bg-gray-800 rounded-lg border border-white/10 shadow-xl py-1 min-w-[120px]">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingName(m.id); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 flex items-center gap-2"
                >
                  <Pencil className="w-3 h-3" /> Rename
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowFormatting(m.id); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 flex items-center gap-2"
                >
                  <Palette className="w-3 h-3" /> Format
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMeasurement(m.id); }}
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded JOC Items */}
        {isExpanded && (
          <div className="bg-white/[0.01] border-t border-white/[0.04]">
            {jocItems.map((item) => (
              <div 
                key={item.taskCode}
                className="flex items-center gap-2 px-3 py-1.5 pl-14 text-xs hover:bg-white/[0.02] group"
              >
                <span className="text-white/40 font-mono">{item.taskCode.slice(0, 14)}</span>
                <span className="flex-1 truncate text-white/60">{item.description.split(',')[0]}</span>
                <span className="text-emerald-400/70 tabular-nums">${(m.value * item.unitCost).toFixed(0)}</span>
                <button
                  onClick={() => handleRemoveJocItem(m.id, item.taskCode)}
                  className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {/* 🔗 COMPANION ITEMS - Click to start count takeoff! */}
            {(() => {
              const companions = getCompanionItems(m);
              if (companions.length === 0) return null;
              
              return (
                <div className="border-t border-amber-500/20 bg-amber-500/5 px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MousePointer2 className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                      Continue Takeoff
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {companions.map(({ jocItem, parentTaskCode, label }) => (
                      <button
                        key={jocItem.taskCode}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpawnCompanionCount(m, jocItem, parentTaskCode);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 rounded-lg text-[11px] font-medium transition-all hover:scale-105 border border-amber-500/30 hover:border-amber-500/60 group"
                      >
                        <span className="px-1.5 py-0.5 bg-amber-500/30 rounded text-[9px] text-amber-300 uppercase tracking-wider">Count</span>
                        <span>{label}</span>
                        <span className="text-amber-400/60 text-[10px]">${jocItem.unitCost.toFixed(0)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-500/20">
                    <p className="text-[9px] text-white/40 flex items-center gap-1">
                      <MousePointer2 className="w-3 h-3" />
                      Click to count now
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveCompanionsForLater(m);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-[9px] text-white/50 hover:text-white/80 hover:bg-white/10 rounded transition-colors"
                    >
                      <Flag className="w-3 h-3" />
                      Save all for later
                    </button>
                  </div>
                </div>
              );
            })()}
            
            {/* Add JOC Item Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowJOCSearch(m.id); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 pl-14 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.02] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add JOC Item
            </button>
          </div>
        )}
        
        {/* No JOC items - show add buttons */}
        {!hasJocItems && !isExpanded && (
          <div className="flex items-center gap-2 px-3 py-1.5 pl-14 border-t border-white/[0.02]">
            <button
              onClick={(e) => { e.stopPropagation(); setShowAssistant(m); }}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-amber-500/10 text-amber-400 rounded hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles className="w-3 h-3" /> Guide Me
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowJOCSearch(m.id); toggleExpanded(m.id); }}
              className="flex items-center gap-1.5 px-2 py-1 text-[10px] bg-white/5 text-white/50 rounded hover:bg-white/10 transition-colors"
            >
              <Search className="w-3 h-3" /> Search JOC
            </button>
          </div>
        )}
        
        {/* JOC Search (inline) */}
        {showJOCSearch === m.id && (
          <div className="p-3 pl-14 bg-gray-800/50 border-t border-white/[0.04]">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search JOC catalogue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-3 py-2 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg focus:outline-none focus:border-white/20"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-64 overflow-auto">
              {searchResults.map((item) => {
                const hasTiers = hasTierVariants(item);
                // Get division name from task code prefix
                const divisionCode = item.taskCode.slice(0, 2);
                const divisionNames: Record<string, string> = {
                  '01': 'General', '02': 'Sitework', '03': 'Concrete', '04': 'Masonry',
                  '05': 'Metals', '06': 'Wood', '07': 'Thermal', '08': 'Openings',
                  '09': 'Finishes', '10': 'Specialties', '11': 'Equipment', '12': 'Furnishings',
                  '21': 'Fire Protection', '22': 'Plumbing', '23': 'HVAC', '26': 'Electrical',
                };
                const divisionName = divisionNames[divisionCode] || `Div ${divisionCode}`;
                return (
                  <button
                    key={item.taskCode}
                    onClick={(e) => { e.stopPropagation(); handleAddJocItem(m.id, item); }}
                    className="w-full text-left p-2 rounded hover:bg-white/10 text-xs transition-colors border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-white/60">{divisionName}</span>
                        <span className="text-white/40 font-mono text-[10px]">{item.taskCode}</span>
                        {hasTiers && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-[9px] font-medium">
                            <Layers className="w-2.5 h-2.5" />
                            Tiers
                          </span>
                        )}
                      </div>
                      <span className="text-emerald-400 font-medium">${item.unitCost.toFixed(2)}/{item.unit}</span>
                    </div>
                    <p className="text-white/80 mt-1 text-[11px] leading-relaxed">{item.description}</p>
                  </button>
                );
              })}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-center text-white/30 py-4 text-xs">No items found</p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowJOCSearch(null); setSearchQuery(''); }}
              className="w-full mt-2 text-xs text-white/30 hover:text-white/60"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const openFlagsCount = project.flags?.filter(f => f.status === 'open').length || 0;

  return (
    <div className="w-[360px] flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-l border-white/[0.08] flex flex-col text-sm">
      {/* Header Tabs */}
      <div className="border-b border-white/[0.08]">
        <div className="flex">
          {[
            { id: 'measurements', icon: Ruler, label: 'Items' },
            { id: 'groups', icon: FolderOpen, label: 'Groups' },
            { id: 'flags', icon: Flag, label: 'Flags', badge: openFlagsCount },
            { id: 'summary', icon: BarChart3, label: 'Takeoff' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex-1 px-2 py-2.5 text-[10px] font-medium transition-all relative
                flex flex-col items-center gap-1
                ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${tab.id === 'flags' ? 'bg-red-500' : 'bg-blue-500'}`} />
              )}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] rounded-full flex items-center justify-center font-semibold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Filter */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Filter..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg focus:outline-none focus:border-white/20 placeholder:text-white/30"
            />
          </div>
        </div>
      </div>

      {/* 🎯 COUNT MODE PROMPT - Shows when starting companion count */}
      {countingPrompt && (
        <div className="mx-3 mt-2 p-3 bg-amber-500/20 border border-amber-500/40 rounded-lg animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                <Hash className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-200">
                  Counting: {countingPrompt.itemName}
                </p>
                <p className="text-xs text-amber-300/80">
                  👆 Click on the drawing to place each count
                </p>
              </div>
            </div>
            <button
              onClick={() => setCountingPrompt(null)}
              className="p-1.5 hover:bg-white/10 rounded text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Active JOC Item */}
      {activeJOCItem && (
        <div className="mx-3 mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" /> Active
              </p>
              <p className="text-xs text-white/70 truncate">{activeJOCItem.description.slice(0, 40)}...</p>
            </div>
            <button
              onClick={() => setActiveJOCItem(null)}
              className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'measurements' && (
          <div>
            {project.measurements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/[0.03] flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/50 text-xs">No measurements yet</p>
                <p className="text-white/30 text-[10px] mt-1">Select a tool and click on the drawing</p>
              </div>
            ) : (
              project.measurements.map(renderMeasurementRow)
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="p-3 space-y-2">
            {/* Create Group */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New group..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateGroup()}
                className="flex-1 px-3 py-1.5 text-xs bg-white/[0.03] border border-white/[0.06] rounded-lg focus:outline-none focus:border-white/20 placeholder:text-white/30"
              />
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded-lg text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Groups */}
            {project.groups.map((group) => {
              const measurements = groupedMeasurements.byGroup[group.id] || [];
              const isExpanded = expandedItems.has(group.id);
              const groupTotal = measurements.reduce((sum, m) => sum + calculateTotal(m), 0);
              
              return (
                <div key={group.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                  <button
                    onClick={() => toggleExpanded(group.id)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-white/[0.02]"
                  >
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: group.color }} />
                    <span className="flex-1 text-left text-xs font-medium">{group.name}</span>
                    <span className="text-[10px] text-white/40">{measurements.length}</span>
                    {groupTotal > 0 && (
                      <span className="text-xs text-emerald-400">${groupTotal.toFixed(0)}</span>
                    )}
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-white/30" /> : <ChevronRight className="w-3.5 h-3.5 text-white/30" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-white/[0.04]">
                      {measurements.length === 0 ? (
                        <p className="text-center text-white/20 py-4 text-[10px]">Drag items here</p>
                      ) : (
                        measurements.map(renderMeasurementRow)
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Ungrouped Warning */}
            {groupedMeasurements.ungrouped.filter(m => getJocItems(m).length === 0).length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.05] overflow-hidden">
                <button
                  onClick={() => toggleExpanded('unassigned')}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/[0.02]"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="flex-1 text-left text-xs font-medium text-amber-400">No JOC Items</span>
                  <span className="text-[10px] text-amber-400/60">
                    {groupedMeasurements.ungrouped.filter(m => getJocItems(m).length === 0).length}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'flags' && <FlagsPanel />}

        {activeTab === 'summary' && (
          <div className="p-3 space-y-1">
            {lineItemTotals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/[0.03] flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white/20" />
                </div>
                <p className="text-white/50 text-xs">No JOC items assigned</p>
              </div>
            ) : (
              lineItemTotals.map(({ item, quantity }) => (
                <div key={item.taskCode} className="p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-mono text-white/40">{item.taskCode.slice(0, 14)}</span>
                    <span className="flex-1 text-xs text-white/70 line-clamp-1">{item.description.split(',')[0]}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px]">
                    <span className="text-white/40">
                      {quantity.toFixed(1)} {item.unit} × ${item.unitCost.toFixed(2)}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      ${(quantity * item.unitCost).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {lineItemTotals.length > 0 && (
        <div className="border-t border-white/[0.08] p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Subtotal</span>
            <span className="tabular-nums">${totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          
          {/* Complexity Factors Summary */}
          <ComplexitySummary
            factors={project.complexityFactors || []}
            subtotal={totals.subtotal}
            onClick={() => setShowComplexityPanel(true)}
          />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Location Coefficient</span>
            <input
              type="number"
              value={project.coefficient}
              onChange={(e) => setCoefficient(parseFloat(e.target.value) || 1)}
              className="w-16 px-2 py-1 text-right text-xs bg-white/[0.03] border border-white/[0.06] rounded"
              step="0.05"
            />
          </div>
          <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-white/[0.06]">
            <span>Total</span>
            <span className="tabular-nums">${totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <button 
            onClick={handleExport}
            className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black text-xs font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Export Proposal
          </button>
        </div>
      )}

      {/* Modals */}
      {showAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl h-[85vh]">
            <GuidedAssistant
              measurementId={showAssistant.id}
              measurementType={showAssistant.type as 'line' | 'count' | 'area' | 'space'}
              measurementValue={showAssistant.value}
              measurementLabel={showAssistant.name || showAssistant.spaceName}
              onSelect={(item) => {
                handleAddJocItem(showAssistant.id, {
                  taskCode: item.taskCode,
                  description: item.description,
                  unit: item.unit,
                  unitCost: item.unitCost,
                });
                setShowAssistant(null);
              }}
              onClose={() => setShowAssistant(null)}
            />
          </div>
        </div>
      )}

      {showFormatting && (
        <FormattingPanel measurementId={showFormatting} onClose={() => setShowFormatting(null)} />
      )}

      {/* Assembly Configurator - The Magic! */}
      {showConfigurator && (
        <AssemblyConfigurator
          measurement={showConfigurator.measurement}
          matchedAssembly={showConfigurator.assembly}
          onApply={(items, fittingsToCount, fittingsToFlag) => 
            handleConfiguratorApply(showConfigurator.measurement.id, items, fittingsToCount, fittingsToFlag)
          }
          onCountNow={(items, fittingToCount) => {
            // Apply assembly immediately and start counting the fitting
            const measurementId = showConfigurator.measurement.id;
            const measurement = showConfigurator.measurement;
            
            // Update the measurement with assembly items
            updateMeasurement(measurementId, { jocItems: items, jocItem: undefined });
            setExpandedItems(prev => new Set([...prev, measurementId]));
            setShowConfigurator(null);
            
            // Immediately spawn the count measurement
            handleSpawnCompanionCount(measurement, fittingToCount, items[0]?.taskCode || '');
          }}
          onCancel={() => setShowConfigurator(null)}
        />
      )}

      {/* Quantity Tier Selector - "Suggest, but make the user manually confirm" */}
      {showTierSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md">
            <div className="bg-gray-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white">Select Quantity Tier</h3>
                </div>
                <button
                  onClick={() => setShowTierSelector(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <TierSelector
                  family={showTierSelector.family}
                  quantity={showTierSelector.quantity}
                  selectedTier={showTierSelector.selectedTier}
                  onSelectTier={(tier) => setShowTierSelector(prev => prev ? { ...prev, selectedTier: tier } : null)}
                  onConfirm={handleTierConfirm}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complexity Factors Panel - "Handle separately at the end" */}
      {showComplexityPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-auto">
            <div className="relative">
              <button
                onClick={() => setShowComplexityPanel(false)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 text-white/60 hover:text-white z-10 border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
              <ComplexityPanel
                factors={project.complexityFactors || []}
                subtotal={totals.subtotal}
                onToggleFactor={toggleComplexityFactor}
                onUpdateMultiplier={updateComplexityMultiplier}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
