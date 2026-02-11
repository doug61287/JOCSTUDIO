import { useState, useCallback, useMemo } from 'react';
import { catalogueTree, TreeNode } from '../data/catalogueTree';
import { DIVISIONS, SECTIONS, SUBSECTIONS } from '../data/tocHierarchy';

interface GuidedAssistantProps {
  measurementId?: string;
  measurementType?: 'line' | 'count' | 'area' | 'space';
  measurementValue?: number;
  measurementLabel?: string;
  onSelect: (item: {
    taskCode: string;
    description: string;
    unit: string;
    unitCost: number;
  }) => void;
  onClose: () => void;
}

// Derive a friendly name from TOC hierarchy or node data
function getNodeDisplayName(node: TreeNode): string {
  if (node.isItem) {
    return node.name;
  }
  
  const code = node.code;
  
  // Division level (2 digits)
  if (code.length === 2) {
    return DIVISIONS[code] || node.name;
  }
  
  // Section level (4 digits -> "XX XX")
  if (code.length === 4) {
    const sectionCode = `${code.substring(0, 2)} ${code.substring(2, 4)}`;
    return SECTIONS[sectionCode] || node.name;
  }
  
  // Subsection level (6+ digits -> "XX XX XX")
  if (code.length >= 6) {
    const subsectionCode = `${code.substring(0, 2)} ${code.substring(2, 4)} ${code.substring(4, 6)}`;
    if (SUBSECTIONS[subsectionCode]) {
      return SUBSECTIONS[subsectionCode];
    }
    // Try 4-digit subsection format
    const altCode = `${code.substring(0, 2)} ${code.substring(2, 4)}`;
    if (SUBSECTIONS[altCode] && !SECTIONS[altCode]) {
      return SUBSECTIONS[altCode];
    }
  }
  
  // Fallback: use node name or derive from first child
  if (node.name && node.name !== code) {
    return node.name;
  }
  
  return `Section ${code}`;
}

// Parse item description into structured parts for better display
function parseItemDescription(description: string): { type: string; specs: string } {
  // Common item type keywords to identify at the end
  const typeKeywords = [
    'Door Frame', 'Door', 'Frame', 'Window', 'Hardware', 'Lock', 'Closer',
    'Tile', 'Flooring', 'Paint', 'Coating', 'Ceiling', 'Wall', 'Panel',
    'Pipe', 'Fitting', 'Valve', 'Fixture', 'Light', 'Switch', 'Outlet',
    'Duct', 'Diffuser', 'Grille', 'Insulation', 'Roofing', 'Flashing',
    'Railing', 'Stair', 'Grating', 'Anchor', 'Fastener', 'Bolt'
  ];
  
  // Try to find type at the end of description
  let type = '';
  let specs = description;
  
  for (const keyword of typeKeywords) {
    if (description.toLowerCase().includes(keyword.toLowerCase())) {
      // Find where the type info starts (usually after dimensions/specs)
      const idx = description.toLowerCase().lastIndexOf(keyword.toLowerCase());
      if (idx > 0) {
        type = description.substring(idx).trim();
        specs = description.substring(0, idx).trim();
        // Clean up trailing comma/space from specs
        specs = specs.replace(/[,\s]+$/, '');
        break;
      }
    }
  }
  
  // If no type found, try to split at first comma for short format
  if (!type && description.includes(',')) {
    const parts = description.split(',');
    if (parts.length >= 2) {
      type = parts[parts.length - 1].trim();
      specs = parts.slice(0, -1).join(',').trim();
    }
  }
  
  return { type: type || description, specs };
}

// Get emoji for division
function getDivisionEmoji(code: string): string {
  const emojis: Record<string, string> = {
    '01': '📋', // General Requirements
    '02': '🏚️', // Existing Conditions (Demo)
    '03': '🧱', // Concrete
    '04': '🧱', // Masonry
    '05': '🔩', // Metals
    '06': '🪵', // Wood
    '07': '🌡️', // Thermal
    '08': '🚪', // Openings
    '09': '🎨', // Finishes
    '10': '🔧', // Specialties
    '11': '⚙️', // Equipment
    '12': '🪑', // Furnishings
    '13': '🏗️', // Special Construction
    '14': '🛗', // Conveying
    '21': '🔥', // Fire Suppression
    '22': '🚿', // Plumbing
    '23': '❄️', // HVAC
    '25': '🤖', // Automation
    '26': '⚡', // Electrical
    '27': '📡', // Communications
    '28': '🔒', // Security
    '31': '⛏️', // Earthwork
    '32': '🌳', // Exterior
    '33': '🔌', // Utilities
    '34': '🚗', // Transportation
    '35': '🚢', // Marine
  };
  return emojis[code] || '📦';
}

export function GuidedAssistant({ onSelect, onClose, measurementLabel }: GuidedAssistantProps) {
  const [path, setPath] = useState<TreeNode[]>([catalogueTree]);
  const [searchTerm, setSearchTerm] = useState(measurementLabel || '');
  const [showSearch, setShowSearch] = useState(false);
  
  const currentNode = path[path.length - 1];
  const isRoot = path.length === 1;
  const isDivisionLevel = path.length === 2;
  
  // Get children to display
  const children = useMemo(() => {
    if (!currentNode.children) return [];
    
    let filtered = currentNode.children;
    
    // Filter by search if active
    if (searchTerm && showSearch) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(child => {
        const name = getNodeDisplayName(child).toLowerCase();
        const code = (child.code || '').toLowerCase();
        return name.includes(term) || code.includes(term);
      });
    }
    
    // Sort sequentially by task code (line item number)
    return filtered.sort((a, b) => {
      // Categories (non-items) come before items at same level
      if (a.isItem && !b.isItem) return 1;
      if (!a.isItem && b.isItem) return -1;
      
      // Sort by task code: split by hyphen, compare prefix then item number
      const codeA = a.code || '';
      const codeB = b.code || '';
      
      // Handle task codes like "08121313-0013"
      const [prefixA, itemA] = codeA.split('-');
      const [prefixB, itemB] = codeB.split('-');
      
      // Compare prefix first (section code)
      if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
      }
      
      // Same prefix - compare item numbers numerically
      const numA = parseInt(itemA || '0', 10);
      const numB = parseInt(itemB || '0', 10);
      return numA - numB;
    });
  }, [currentNode, searchTerm, showSearch]);
  
  const handleSelect = useCallback((node: TreeNode) => {
    if (node.isItem) {
      // Final selection - assign item
      onSelect({
        taskCode: node.code,
        description: node.name,
        unit: node.unit || 'EA',
        unitCost: node.unitCost || 0,
      });
      onClose();
    } else if (node.children && node.children.length > 0) {
      // Navigate deeper
      setPath([...path, node]);
      setSearchTerm('');
      setShowSearch(false);
    }
  }, [path, onSelect, onClose]);
  
  const handleBack = useCallback(() => {
    if (path.length > 1) {
      setPath(path.slice(0, -1));
      setSearchTerm('');
    }
  }, [path]);
  
  const handleBackToRoot = useCallback(() => {
    setPath([catalogueTree]);
    setSearchTerm('');
    setShowSearch(false);
  }, []);
  
  // Breadcrumb path
  const breadcrumbs = path.slice(1).map(node => ({
    code: node.code,
    name: getNodeDisplayName(node),
  }));

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <h3 className="font-bold text-white">Guide Me</h3>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              65,331 items
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
          >
            ✕
          </button>
        </div>
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1 text-sm flex-wrap">
            <button
              onClick={handleBackToRoot}
              className="text-white/50 hover:text-white"
            >
              🏠
            </button>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.code} className="flex items-center gap-1">
                <span className="text-white/30">/</span>
                <span className={i === breadcrumbs.length - 1 ? 'text-purple-400 font-medium' : 'text-white/60'}>
                  {crumb.name}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Search Toggle */}
      {!isRoot && (
        <div className="px-4 py-2 border-b border-white/10 bg-gray-800/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${
                showSearch ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              🔍 Filter
            </button>
            {showSearch && (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter..."
                className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            )}
            <span className="text-xs text-white/40">
              {children.length} option{children.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Back button */}
        {!isRoot && (
          <button
            onClick={handleBack}
            className="w-full mb-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 text-left text-white/70 hover:text-white flex items-center gap-2 transition-all"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        )}
        
        {/* Root level - show divisions */}
        {isRoot && (
          <div className="mb-4">
            <p className="text-white/60 text-sm mb-4">
              What type of work are you doing? Select a category:
            </p>
          </div>
        )}
        
        {/* Division level instructions */}
        {isDivisionLevel && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-purple-300 text-sm">
              📂 Select a section within <strong>{getNodeDisplayName(currentNode)}</strong>
            </p>
          </div>
        )}
        
        {/* Options grid */}
        <div className={`grid gap-3 ${isRoot ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => handleSelect(child)}
              className={`p-3 rounded-xl text-left transition-all ${
                child.isItem
                  ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 hover:scale-[1.02]'
              }`}
              title={getNodeDisplayName(child)}
            >
              {isRoot ? (
                /* Division cards - compact vertical layout */
                <div className="text-center">
                  <span className="text-3xl block mb-2">{getDivisionEmoji(child.code)}</span>
                  <div className="font-medium text-white text-sm leading-tight mb-1">
                    {getNodeDisplayName(child)}
                  </div>
                  <div className="text-xs text-white/40">
                    <span className="font-mono">{child.code}</span>
                    <span className="mx-1">•</span>
                    <span>{child.itemCount?.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                /* Non-root items - horizontal layout */
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {child.isItem ? (
                      /* Line item - structured display */
                      <>
                        {(() => {
                          const { type, specs } = parseItemDescription(child.name);
                          return (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                  {child.code}
                                </span>
                                <span className="text-green-400 font-medium text-sm">${child.unitCost?.toFixed(2)}/{child.unit}</span>
                              </div>
                              <div className="font-medium text-green-300 text-sm leading-tight">
                                {type}
                              </div>
                              {specs && specs !== type && (
                                <div className="text-xs text-white/50 mt-0.5 leading-tight">
                                  {specs}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      /* Category - simple display */
                      <>
                        <div className="flex items-start gap-2">
                          <span className="font-medium leading-tight text-white">
                            {getNodeDisplayName(child)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs font-mono text-white/40">{child.code}</span>
                          {child.itemCount && (
                            <span className="text-xs text-white/40">
                              • {child.itemCount.toLocaleString()} items
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {!child.isItem && (
                    <span className="text-white/30 text-lg">→</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
        
        {children.length === 0 && (
          <div className="text-center py-8 text-white/50">
            <span className="text-4xl mb-2 block">🔍</span>
            <p>No matching items found</p>
            {showSearch && searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-white/10 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Navigate the JOC catalogue hierarchy</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
}
