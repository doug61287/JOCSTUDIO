import { useState } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  FolderOpen, 
  Package, 
  ChevronDown, 
  ChevronRight,
  Building2,
  HardHat,
  Flame,
  Droplets,
  Thermometer,
  Zap,
  Hash,
  DoorOpen,
  Lightbulb,
  CheckCircle2,
  Clock,
  FileQuestion
} from 'lucide-react';
import type { Issue, IssueStatus, Project } from '../types';

interface ContextPanelProps {
  issues: Issue[];
  activeProject: Project;
  selectedScopes: string[];
  onIssueStatusChange: (issueId: string, status: IssueStatus) => void;
  onDocumentClick?: (document: ProjectDocument) => void;
  onMaterialClick?: (material: Material) => void;
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
  {
    id: 'm1',
    name: 'VCT Flooring - Standard',
    category: 'Flooring',
    division: '09',
    manufacturer: 'Armstrong',
    modelNumber: '51899',
    quantity: '12,450 SF',
    sources: [
      { documentId: 's2', documentName: 'Div 09 - Finishes', documentType: 'spec', location: 'Section 096500' },
    ],
  },
  {
    id: 'm2',
    name: 'Patient Room Door',
    category: 'Doors',
    division: '08',
    manufacturer: 'Assa Abloy',
    modelNumber: 'HP-4400',
    quantity: '48 ea',
    sources: [
      { documentId: 's1', documentName: 'Div 08 - Openings', documentType: 'spec', location: 'Section 081400' },
    ],
  },
];

// Discipline icon mapping
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

// Material category icons
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

// Document type icons
const DocumentIcon = ({ type, className = "w-4 h-4" }: { type: string; className?: string }) => {
  switch (type) {
    case 'drawing': return <FileText className={className} />;
    case 'spec': return <FileText className={className} />;
    case 'addendum': return <FileText className={className} />;
    case 'rfi': return <FileQuestion className={className} />;
    default: return <FileText className={className} />;
  }
};

// Status icon
const StatusIcon = ({ status, className = "w-4 h-4" }: { status: string; className?: string }) => {
  switch (status) {
    case 'processed': return <CheckCircle2 className={`${className} text-[#4ADE80]`} />;
    case 'processing': return <Clock className={`${className} text-[#FBBF24]`} />;
    case 'pending': return <Clock className={`${className} text-[#6B7280]`} />;
    default: return <FileText className={className} />;
  }
};

export function ContextPanel({ issues, selectedScopes }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'documents' | 'materials'>('documents');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Drawings']));
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string | 'all'>('all');

  const filteredDocs = selectedScopes.length === 0 
    ? MOCK_DOCUMENTS 
    : MOCK_DOCUMENTS.filter(doc => doc.division && selectedScopes.includes(doc.division));

  let filteredMaterials = selectedScopes.length === 0 
    ? MOCK_MATERIALS 
    : MOCK_MATERIALS.filter(mat => selectedScopes.includes(mat.division));
  
  if (selectedMaterialCategory !== 'all') {
    filteredMaterials = filteredMaterials.filter(mat => mat.category === selectedMaterialCategory);
  }

  const drawingsByDiscipline = filteredDocs
    .filter(doc => doc.type === 'drawing')
    .reduce((acc, doc) => {
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <div className="w-[450px] min-w-[450px] bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
      {/* Tabs */}
      <div className="h-14 border-b border-[#2A2A2A] flex">
        <TabButton 
          label="Issues" 
          icon={<AlertTriangle className="w-4 h-4" />}
          count={issues.length} 
          isActive={activeTab === 'issues'} 
          onClick={() => setActiveTab('issues')} 
        />
        <TabButton 
          label="Documents" 
          icon={<FolderOpen className="w-4 h-4" />}
          count={filteredDocs.length} 
          isActive={activeTab === 'documents'} 
          onClick={() => setActiveTab('documents')} 
        />
        <TabButton 
          label="Materials" 
          icon={<Package className="w-4 h-4" />}
          count={filteredMaterials.length} 
          isActive={activeTab === 'materials'} 
          onClick={() => setActiveTab('materials')} 
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'documents' && (
          <>
            {/* Drawings */}
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
                          {docs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[#1A1A1A] cursor-pointer group">
                              <DocumentIcon type={doc.type} className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#5E6AD2]" />
                              <span className="text-[11px] text-white/70 group-hover:text-white truncate">{doc.name}</span>
                              {doc.conflictCount ? (
                                <span className="text-[10px] text-[#FBBF24] ml-auto flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {doc.conflictCount}
                                </span>
                              ) : (
                                <StatusIcon status={doc.status} className="w-3.5 h-3.5 ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="mb-4">
              <div className="flex items-center gap-2 py-2 px-2 text-[#8A8F98]">
                <FileText className="w-4 h-4" />
                <span className="text-[13px]">Specifications</span>
                <span className="text-[12px] ml-auto">({filteredDocs.filter(d => d.type === 'spec').length})</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'materials' && (
          <>
            {/* Category Filter */}
            <div className="mb-4">
              <div className="text-[11px] text-[#6B7280] mb-2">Filter by category:</div>
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => setSelectedMaterialCategory('all')}
                  className={`px-2 py-1 rounded text-[10px] transition-fast ${selectedMaterialCategory === 'all' ? 'bg-[#5E6AD2] text-white' : 'bg-[#2A2A2A] text-[#8A8F98] hover:bg-[#3A3A3A]'}`}
                >
                  All
                </button>
                {Object.keys(materialsByCategory).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedMaterialCategory(cat)}
                    className={`px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-fast ${selectedMaterialCategory === cat ? 'bg-[#5E6AD2] text-white' : 'bg-[#2A2A2A] text-[#8A8F98] hover:bg-[#3A3A3A]'}`}
                  >
                    <MaterialIcon category={cat} className="w-3 h-3" />
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials List */}
            {Object.entries(materialsByCategory).map(([category, materials]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 py-2">
                  <MaterialIcon category={category} className="w-4 h-4 text-[#5E6AD2]" />
                  <span className="font-medium text-[13px]">{category}</span>
                  <span className="text-[11px] text-[#6B7280]">({materials.length})</span>
                </div>
                <div className="ml-4 space-y-2">
                  {materials.map(material => (
                    <div key={material.id} className="p-3 rounded bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] cursor-pointer transition-fast">
                      <div className="text-[13px] font-medium text-white/90">{material.name}</div>
                      <div className="text-[11px] text-[#6B7280]">{material.manufacturer} • {material.modelNumber}</div>
                      <div className="text-[11px] text-[#5E6AD2] mt-1">{material.quantity}</div>
                      <div className="mt-2 pt-2 border-t border-[#2A2A2A] space-y-1">
                        {material.sources.map((src, idx) => (
                          <div key={idx} className="text-[10px] text-[#8A8F98] flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            <span className="truncate">{src.documentName}</span>
                            <span className="text-[#6B7280]">→</span>
                            <span className="text-[#5E6AD2]">{src.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ label, icon, count, isActive, onClick }: { label: string; icon: React.ReactNode; count: number; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-medium border-b-2 transition-fast ${
        isActive ? 'border-[#5E6AD2] text-white bg-[#5E6AD2]/5' : 'border-transparent text-[#8A8F98] hover:text-white/90 hover:bg-[#1A1A1A]'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className="text-[10px] text-[#6B7280]">({count})</span>
    </button>
  );
}
