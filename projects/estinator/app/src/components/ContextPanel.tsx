import { useState } from 'react';
import { FileText, FolderOpen, Package, ChevronDown, ChevronRight, Building2, HardHat, Flame, Droplets, Thermometer, Zap, Hash, DoorOpen, Lightbulb, CheckCircle2, LayoutGrid, AlertCircle } from 'lucide-react';
import type { Issue, Project } from '../types';

interface ContextPanelProps {
  issues: Issue[];
  activeProject: Project;
  selectedScopes: string[];
  completedItems: { documents: string[]; materials: string[]; specs: string[] };
  onItemClick: (item: { id: string; name: string; type: 'drawing' | 'spec' | 'schedule' | 'material' }) => void;
  onMarkComplete: (id: string, type: 'drawing' | 'spec' | 'material') => void;
  activeContextId: string | null;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'addendum' | 'rfi';
  division?: string;
  discipline?: string;
  status: 'processed' | 'processing' | 'pending';
  pageCount?: number;
  uploadDate: string;
  conflictCount?: number;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  division: string;
  manufacturer?: string;
  modelNumber?: string;
  quantity?: string;
  sources: MaterialSource[];
}

export interface MaterialSource {
  documentId: string;
  documentName: string;
  documentType: 'schedule' | 'spec' | 'drawing';
  location: string;
}

interface TradeCoverage {
  division: string;
  name: string;
  overallProgress: number;
  drawings: { total: number; processed: number; status: string; documents: { id: string; name: string; status: string; conflictCount: number }[] };
  specs: { sections: string[]; completedSections: string[]; status: string };
  schedules: { types: string[]; completed: string[]; status: string };
  quantities: { extracted: boolean; itemCount: number; confidence: number; status: string };
  crossCheck: { conflictsFound: number; conflictsResolved: number; rfisDrafted: number; status: string };
  lastActivity?: string;
}

const MOCK_TRADE_COVERAGE: TradeCoverage[] = [
  {
    division: '21',
    name: 'Fire Suppression',
    overallProgress: 80,
    drawings: { total: 3, processed: 3, status: 'complete', documents: [{ id: 'fp1', name: 'FP-001', status: 'processed', conflictCount: 0 }, { id: 'fp2', name: 'FP-002', status: 'processed', conflictCount: 2 }, { id: 'fp3', name: 'FP-100', status: 'processed', conflictCount: 0 }] },
    specs: { sections: ['21.100', '21.200', '28.310'], completedSections: ['21.100', '21.200'], status: 'partial' },
    schedules: { types: ['Equipment Schedule', 'Head Schedule'], completed: ['Equipment Schedule'], status: 'partial' },
    quantities: { extracted: false, itemCount: 0, confidence: 0, status: 'missing' },
    crossCheck: { conflictsFound: 3, conflictsResolved: 0, rfisDrafted: 0, status: 'issues' },
    lastActivity: 'FP-002 reviewed 2 min ago',
  },
  {
    division: '22',
    name: 'Plumbing',
    overallProgress: 60,
    drawings: { total: 4, processed: 4, status: 'complete', documents: [{ id: 'p1', name: 'P-001', status: 'processed', conflictCount: 1 }, { id: 'p2', name: 'P-002', status: 'processed', conflictCount: 0 }, { id: 'p3', name: 'P-100', status: 'processed', conflictCount: 0 }, { id: 'p4', name: 'P-200', status: 'processed', conflictCount: 1 }] },
    specs: { sections: ['22.100', '22.400'], completedSections: ['22.100', '22.400'], status: 'complete' },
    schedules: { types: ['Fixture Schedule'], completed: ['Fixture Schedule'], status: 'complete' },
    quantities: { extracted: true, itemCount: 45, confidence: 85, status: 'partial' },
    crossCheck: { conflictsFound: 2, conflictsResolved: 1, rfisDrafted: 1, status: 'issues' },
    lastActivity: 'Quantities extracted 15 min ago',
  },
  {
    division: '26',
    name: 'Electrical',
    overallProgress: 45,
    drawings: { total: 5, processed: 4, status: 'partial', documents: [{ id: 'e1', name: 'E-001', status: 'processed', conflictCount: 2 }, { id: 'e2', name: 'E-002', status: 'processed', conflictCount: 1 }, { id: 'e3', name: 'E-100', status: 'processed', conflictCount: 1 }, { id: 'e4', name: 'E-200', status: 'pending', conflictCount: 0 }, { id: 'e5', name: 'E-300', status: 'processed', conflictCount: 0 }] },
    specs: { sections: ['26.050', '26.240', '26.510'], completedSections: ['26.050'], status: 'partial' },
    schedules: { types: ['Panel Schedule', 'Fixture Schedule'], completed: [], status: 'missing' },
    quantities: { extracted: false, itemCount: 0, confidence: 0, status: 'missing' },
    crossCheck: { conflictsFound: 4, conflictsResolved: 0, rfisDrafted: 0, status: 'issues' },
    lastActivity: 'E-200 uploading...',
  },
];

const MOCK_DOCUMENTS: ProjectDocument[] = [
  { id: 'd1', name: 'A-001 - Cover Sheet', type: 'drawing', division: '01', discipline: 'Architectural', status: 'processed', pageCount: 1, uploadDate: '2026-02-10', conflictCount: 0 },
  { id: 'd2', name: 'A-100 - Floor Plans L1', type: 'drawing', division: '08', discipline: 'Architectural', status: 'processed', pageCount: 4, uploadDate: '2026-02-10', conflictCount: 2 },
  { id: 'd3', name: 'S-100 - Foundation Plan', type: 'drawing', division: '03', discipline: 'Structural', status: 'processed', pageCount: 3, uploadDate: '2026-02-10', conflictCount: 1 },
  { id: 'd4', name: 'FP-001 - Fire Protection L1', type: 'drawing', division: '21', discipline: 'Fire Protection', status: 'processed', pageCount: 2, uploadDate: '2026-02-11', conflictCount: 3 },
  { id: 'd5', name: 'P-001 - Plumbing Plan L1', type: 'drawing', division: '22', discipline: 'Plumbing', status: 'processed', pageCount: 2, uploadDate: '2026-02-11', conflictCount: 2 },
  { id: 'd6', name: 'M-001 - HVAC Plan L1', type: 'drawing', division: '23', discipline: 'Mechanical', status: 'processed', pageCount: 3, uploadDate: '2026-02-11', conflictCount: 2 },
  { id: 'd7', name: 'E-001 - Electrical Plan L1', type: 'drawing', division: '26', discipline: 'Electrical', status: 'processed', pageCount: 3, uploadDate: '2026-02-12', conflictCount: 4 },
  { id: 's1', name: 'Div 08 - Openings', type: 'spec', division: '08', status: 'processed', pageCount: 32, uploadDate: '2026-02-10', conflictCount: 1 },
  { id: 's2', name: 'Div 09 - Finishes', type: 'spec', division: '09', status: 'processed', pageCount: 28, uploadDate: '2026-02-10', conflictCount: 0 },
  { id: 'a1', name: 'Addendum 1', type: 'addendum', division: '21', status: 'processed', pageCount: 8, uploadDate: '2026-02-13', conflictCount: 3 },
];

const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: 'VCT Flooring - Standard', category: 'Flooring', division: '09', manufacturer: 'Armstrong', modelNumber: '51899', quantity: '12,450 SF', sources: [{ documentId: 's2', documentName: 'Div 09 - Finishes', documentType: 'spec', location: 'Section 096500' }] },
  { id: 'm2', name: 'Patient Room Door', category: 'Doors', division: '08', manufacturer: 'Assa Abloy', modelNumber: 'HP-4400', quantity: '48 ea', sources: [{ documentId: 's1', documentName: 'Div 08 - Openings', documentType: 'spec', location: 'Section 081400' }] },
];

const DisciplineIcon = ({ discipline, className = "w-4 h-4" }: { discipline: string; className?: string }) => {
  switch (discipline) {
    case 'Architectural': return <Building2 className={className} />;
    case 'Structural': return <HardHat className={className} />;
    case 'Fire Protection': return <Flame className={className} />;
    case 'Plumbing': return <Droplets className={className} />;
    case 'Mechanical': return <Thermometer className={className} />;
    case 'Electrical': return <Zap className={className} />;
    default: return <FileText className={className} />;
  }
};

const MaterialIcon = ({ category, className = "w-4 h-4" }: { category: string; className?: string }) => {
  switch (category) {
    case 'Flooring': return <Hash className={className} />;
    case 'Doors': return <DoorOpen className={className} />;
    case 'HVAC Equipment': return <Thermometer className={className} />;
    case 'Lighting': return <Lightbulb className={className} />;
    case 'Electrical Equipment': return <Zap className={className} />;
    case 'Fire Protection': return <Flame className={className} />;
    case 'Plumbing Fixtures': return <Droplets className={className} />;
    default: return <Package className={className} />;
  }
};

const MiniProgress = ({ progress, status }: { progress: number; status: string }) => {
  const getColor = () => {
    if (status === 'complete') return 'bg-[#4ADE80]';
    if (status === 'issues') return 'bg-[#FBBF24]';
    if (status === 'partial') return 'bg-[#5E6AD2]';
    return 'bg-[#6B7280]';
  };
  return (
    <div className="w-full">
      <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${getColor()} transition-all duration-500`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export function ContextPanel({ selectedScopes, completedItems, onItemClick, activeContextId }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<'scope' | 'documents' | 'materials'>('scope');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Drawings']));
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string | 'all'>('all');
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());

  const filteredTrades = selectedScopes.length === 0 ? MOCK_TRADE_COVERAGE : MOCK_TRADE_COVERAGE.filter(trade => selectedScopes.includes(trade.division));
  const filteredDocs = selectedScopes.length === 0 ? MOCK_DOCUMENTS : MOCK_DOCUMENTS.filter(doc => doc.division && selectedScopes.includes(doc.division));
  let filteredMaterials = selectedScopes.length === 0 ? MOCK_MATERIALS : MOCK_MATERIALS.filter(mat => selectedScopes.includes(mat.division));
  if (selectedMaterialCategory !== 'all') filteredMaterials = filteredMaterials.filter(mat => mat.category === selectedMaterialCategory);

  const drawingsByDiscipline = filteredDocs.filter(doc => doc.type === 'drawing').reduce((acc, doc) => {
    const discipline = doc.discipline || 'Other';
    if (!acc[discipline]) acc[discipline] = [];
    acc[discipline].push(doc);
    return acc;
  }, {} as Record<string, ProjectDocument[]>);

  const materialsByCategory = filteredMaterials.reduce((acc, mat) => {
    if (!acc[mat.category]) acc[mat.category] = [];
    acc[mat.category].push(mat);
    return acc;
  }, {} as Record<string, Material[]>);

  const isCompleted = (id: string, type: 'drawing' | 'spec' | 'material') => {
    if (type === 'drawing' || type === 'spec') return completedItems.documents.includes(id);
    return completedItems.materials.includes(id);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const toggleTrade = (division: string) => {
    setExpandedTrades(prev => {
      const next = new Set(prev);
      if (next.has(division)) next.delete(division);
      else next.add(division);
      return next;
    });
  };

  return (
    <div className="w-[300px] min-w-[300px] bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col">
      <div className="h-14 border-b border-[#2A2A2A] flex">
        <TabButton label="Scope" icon={<LayoutGrid className="w-4 h-4" />} count={filteredTrades.length} isActive={activeTab === 'scope'} onClick={() => setActiveTab('scope')} />
        <TabButton label="Docs" icon={<FolderOpen className="w-4 h-4" />} count={filteredDocs.length} isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
        <TabButton label="Mats" icon={<Package className="w-4 h-4" />} count={filteredMaterials.length} isActive={activeTab === 'materials'} onClick={() => setActiveTab('materials')} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'scope' && (
          <div className="p-3 space-y-3">
            {filteredTrades.map(trade => (
              <div key={trade.division} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                <button onClick={() => toggleTrade(trade.division)} className="w-full p-3 flex items-center justify-between hover:bg-[#252525] transition-fast">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-mono text-[#5E6AD2]">{trade.division}</span>
                    <span className="text-[14px] font-medium text-white/90">{trade.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8A8F98]">{trade.overallProgress}%</span>
                    <div className="w-16 h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#5E6AD2] rounded-full" style={{ width: `${trade.overallProgress}%` }} />
                    </div>
                    {expandedTrades.has(trade.division) ? <ChevronDown className="w-4 h-4 text-[#6B7280]" /> : <ChevronRight className="w-4 h-4 text-[#6B7280]" />}
                  </div>
                </button>

                <div className="px-3 pb-2">
                  <div className="grid grid-cols-5 gap-1.5">
                    <TradeSection label="Draw" section={trade.drawings} />
                    <TradeSection label="Spec" section={trade.specs} />
                    <TradeSection label="Sched" section={trade.schedules} />
                    <TradeSection label="Qty" section={trade.quantities} />
                    <TradeSection label="Check" section={trade.crossCheck} />
                  </div>
                </div>

                {expandedTrades.has(trade.division) && (
                  <div className="border-t border-[#2A2A2A] p-3 space-y-2">
                    <div className="text-[10px] uppercase text-[#6B7280] tracking-wider">Drawings</div>
                    {trade.drawings.documents.map(doc => {
                      const isActive = activeContextId === doc.id;
                      const isDone = completedItems.documents.includes(doc.id);
                      return (
                        <div key={doc.id} onClick={() => onItemClick({ id: doc.id, name: doc.name, type: 'drawing' })} className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-[11px] ${isActive ? 'bg-[#5E6AD2]/20 text-white' : 'hover:bg-[#252525] text-white/70'}`}>
                          {isDone ? <CheckCircle2 className="w-3 h-3 text-[#4ADE80]" /> : <FileText className={`w-3 h-3 ${isActive ? 'text-[#5E6AD2]' : 'text-[#6B7280]'}`} />}
                          <span className="flex-1 truncate">{doc.name}</span>
                          {doc.conflictCount > 0 && <span className="text-[#FBBF24]">{doc.conflictCount}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-3">
            <div className="mb-4">
              <button onClick={() => toggleSection('Drawings')} className="flex items-center gap-2 w-full py-2 text-left hover:bg-[#1A1A1A] rounded px-2 transition-fast">
                {expandedSections.has('Drawings') ? <ChevronDown className="w-4 h-4 text-[#6B7280]" /> : <ChevronRight className="w-4 h-4 text-[#6B7280]" />}
                <FileText className="w-4 h-4 text-[#5E6AD2]" />
                <span className="font-medium text-[14px]">Drawings</span>
                <span className="text-[12px] text-[#6B7280] ml-auto">({Object.values(drawingsByDiscipline).flat().length})</span>
              </button>
              
              {expandedSections.has('Drawings') && (
                <div className="ml-2 space-y-1 mt-1">
                  {Object.entries(drawingsByDiscipline).map(([discipline, docs]) => (
                    <div key={discipline} className="border-l border-[#2A2A2A] ml-4 pl-3">
                      <button onClick={() => toggleSection(`disc-${discipline}`)} className="flex items-center gap-2 w-full py-1.5 text-left hover:bg-[#1A1A1A] rounded px-2 transition-fast">
                        {expandedSections.has(`disc-${discipline}`) ? <ChevronDown className="w-3 h-3 text-[#6B7280]" /> : <ChevronRight className="w-3 h-3 text-[#6B7280]" />}
                        <DisciplineIcon discipline={discipline} className="w-3.5 h-3.5 text-[#8A8F98]" />
                        <span className="text-[12px] text-[#8A8F98]">{discipline}</span>
                        <span className="text-[11px] text-[#6B7280] ml-auto">({docs.length})</span>
                      </button>
                      
                      {expandedSections.has(`disc-${discipline}`) && (
                        <div className="ml-6 space-y-0.5 mt-1">
                          {docs.map(doc => {
                            const isActive = activeContextId === doc.id;
                            const isDone = isCompleted(doc.id, 'drawing');
                            return (
                              <div key={doc.id} onClick={() => onItemClick({ id: doc.id, name: doc.name, type: 'drawing' })} className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer group ${isActive ? 'bg-[#5E6AD2]/20 border border-[#5E6AD2]' : 'hover:bg-[#1A1A1A]'}`}>
                                {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" /> : <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#5E6AD2]' : 'text-[#6B7280] group-hover:text-[#5E6AD2]'}`} />}
                                <span className={`text-[11px] truncate flex-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{doc.name}</span>
                                {(doc.conflictCount || 0) > 0 && <span className="text-[10px] text-[#FBBF24] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{doc.conflictCount}</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-[12px] text-[#8A8F98] py-2 px-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Specifications</span>
                <span className="text-[11px] ml-auto">({filteredDocs.filter(d => d.type === 'spec').length})</span>
              </div>
              <div className="ml-6 space-y-0.5">
                {filteredDocs.filter(d => d.type === 'spec').map(spec => {
                  const isActive = activeContextId === spec.id;
                  const isDone = isCompleted(spec.id, 'spec');
                  return (
                    <div key={spec.id} onClick={() => onItemClick({ id: spec.id, name: spec.name, type: 'spec' })} className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer group ${isActive ? 'bg-[#5E6AD2]/20 border border-[#5E6AD2]' : 'hover:bg-[#1A1A1A]'}`}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" /> : <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#5E6AD2]' : 'text-[#6B7280] group-hover:text-[#5E6AD2]'}`} />}
                      <span className={`text-[11px] truncate flex-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{spec.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="p-3">
            <div className="mb-4">
              <div className="text-[11px] text-[#6B7280] mb-2">Filter by category:</div>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => setSelectedMaterialCategory('all')} className={`px-2 py-1 rounded text-[10px] transition-fast ${selectedMaterialCategory === 'all' ? 'bg-[#5E6AD2] text-white' : 'bg-[#2A2A2A] text-[#8A8F98] hover:bg-[#3A3A3A]'}`}>All</button>
                {Object.keys(materialsByCategory).map(cat => (
                  <button key={cat} onClick={() => setSelectedMaterialCategory(cat)} className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-fast ${selectedMaterialCategory === cat ? 'bg-[#5E6AD2] text-white' : 'bg-[#2A2A2A] text-[#8A8F98] hover:bg-[#3A3A3A]'}`}>
                    <MaterialIcon category={cat} className="w-3 h-3" />
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {Object.entries(materialsByCategory).map(([category, materials]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 py-2">
                  <MaterialIcon category={category} className="w-4 h-4 text-[#5E6AD2]" />
                  <span className="font-medium text-[13px]">{category}</span>
                  <span className="text-[11px] text-[#6B7280]">({materials.length})</span>
                </div>
                <div className="ml-4 space-y-2">
                  {materials.map(material => {
                    const isActive = activeContextId === material.id;
                    const isDone = isCompleted(material.id, 'material');
                    return (
                      <div key={material.id} onClick={() => onItemClick({ id: material.id, name: material.name, type: 'material' })} className={`p-3 rounded border cursor-pointer transition-fast ${isActive ? 'bg-[#5E6AD2]/10 border-[#5E6AD2]' : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'}`}>
                        <div className="flex items-start gap-2">
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" /> : <Package className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-[#5E6AD2]' : 'text-[#6B7280]'}`} />}
                          <div className="flex-1 min-w-0">
                            <div className={`text-[13px] font-medium truncate ${isActive ? 'text-white' : 'text-white/90'}`}>{material.name}</div>
                            <div className="text-[11px] text-[#6B7280]">{material.manufacturer} • {material.modelNumber}</div>
                            <div className="text-[11px] text-[#5E6AD2] mt-1">{material.quantity}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type SectionData = 
  | { total: number; processed: number; status: string; documents: { id: string; name: string; status: string; conflictCount: number }[] }
  | { sections: string[]; completedSections: string[]; status: string }
  | { types: string[]; completed: string[]; status: string }
  | { extracted: boolean; itemCount: number; confidence: number; status: string }
  | { conflictsFound: number; conflictsResolved: number; rfisDrafted: number; status: string };

function TradeSection({ label, section }: { label: string; section: SectionData }) {
  let progress = 0;
  if ('total' in section && 'processed' in section) {
    progress = Math.round((section.processed / section.total) * 100);
  } else if ('sections' in section && 'completedSections' in section) {
    progress = Math.round((section.completedSections.length / section.sections.length) * 100) || 0;
  } else if ('types' in section && 'completed' in section) {
    progress = Math.round((section.completed.length / section.types.length) * 100) || 0;
  } else if ('confidence' in section) {
    progress = section.confidence;
  } else if ('conflictsFound' in section) {
    progress = section.conflictsFound > 0 ? 0 : 100;
  }
  
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-[#6B7280] uppercase">{label}</span>
      </div>
      <MiniProgress progress={progress} status={section.status} />
    </div>
  );
}

function TabButton({ label, icon, count, isActive, onClick }: { label: string; icon: React.ReactNode; count: number; isActive: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-medium border-b-2 transition-fast ${isActive ? 'border-[#5E6AD2] text-white bg-[#5E6AD2]/5' : 'border-transparent text-[#8A8F98] hover:text-white/90 hover:bg-[#1A1A1A]'}`}>
      {icon}
      <span>{label}</span>
      <span className="text-[9px] text-[#6B7280]">({count})</span>
    </button>
  );
}

export default ContextPanel;
