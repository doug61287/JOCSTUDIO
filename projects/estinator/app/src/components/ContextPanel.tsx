import { useState, useRef, useEffect } from 'react';
import { FileText, FolderOpen, Package, ChevronDown, ChevronRight, Building2, HardHat, Flame, Droplets, Thermometer, Zap, Hash, DoorOpen, Lightbulb, CheckCircle2, LayoutGrid, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { contextApi } from '../lib/api.js';
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

// Drawing package with nested sheets (extracted from drawing index)
export interface DrawingSheet {
  id: string;
  sheetNumber: string;
  title: string;
  discipline: string;
  page: number; // Page number in the PDF
  status: 'processed' | 'processing' | 'pending';
  conflictCount?: number;
}

export interface DrawingPackage {
  id: string;
  name: string; // Original filename
  type: 'package';
  discipline?: string; // Primary discipline (MEP, Architectural, etc.)
  status: 'processed' | 'processing' | 'pending';
  pageCount: number;
  uploadDate: string;
  sheets: DrawingSheet[]; // Extracted from drawing index
  conflictCount?: number; // Sum of all sheet conflicts
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

// No mock data — all content comes from real uploaded documents.

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

export function ContextPanel({ selectedScopes, completedItems, onItemClick, activeContextId, activeProject }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<'scope' | 'documents' | 'materials'>('scope');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Drawings', 'Packages']));
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string | 'all'>('all');
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set(['pkg-1'])); // First package expanded by default
  const [expandedPackageDisciplines, setExpandedPackageDisciplines] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [realDocuments, setRealDocuments] = useState<ProjectDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real documents from API
  useEffect(() => {
    const fetchContext = async () => {
      if (!activeProject) return;
      setIsLoadingDocs(true);
      try {
        const context = await contextApi.getItems(activeProject.id);
        if (context.documents) {
          setRealDocuments(context.documents.map((d: { id: string; name: string; type: string; status: string; uploadDate: string; conflictCount?: number }) => ({
            id: d.id,
            name: d.name,
            type: d.type === 'drawing' ? 'drawing' : d.type === 'spec' ? 'spec' : 'addendum',
            status: d.status as 'processed' | 'processing' | 'pending',
            uploadDate: d.uploadDate,
            conflictCount: d.conflictCount || 0,
            discipline: 'General'
          })));
        }
      } catch (err) {
        console.error('Failed to fetch context:', err);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchContext();
  }, [activeProject]);

  // All data comes from real uploaded documents — no mock data
  const filteredTrades: TradeCoverage[] = []; // Populated when trade coverage analysis is implemented
  const filteredDocs = selectedScopes.length === 0
    ? realDocuments
    : realDocuments.filter(doc => doc.division && selectedScopes.includes(doc.division));
  const filteredMaterials: Material[] = []; // Populated when material extraction is implemented
  const uploadedPackages: DrawingPackage[] = []; // Populated when drawing package extraction is implemented

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

  const togglePackage = (packageId: string) => {
    setExpandedPackages(prev => {
      const next = new Set(prev);
      if (next.has(packageId)) next.delete(packageId);
      else next.add(packageId);
      return next;
    });
  };

  const togglePackageDiscipline = (key: string) => {
    setExpandedPackageDisciplines(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Group sheets by discipline within a package
  const groupSheetsByDiscipline = (sheets: DrawingSheet[]) => {
    return sheets.reduce((acc, sheet) => {
      const disc = sheet.discipline || 'Other';
      if (!acc[disc]) acc[disc] = [];
      acc[disc].push(sheet);
      return acc;
    }, {} as Record<string, DrawingSheet[]>);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProject) return;

    setIsUploading(true);
    const uploadedFiles: Array<{ id: string; name: string; status: string; uploadDate: string; blobUrl?: string; type?: string; conflictCount?: number }> = [];
    const failedFiles: string[] = [];

    for (const file of Array.from(files)) {
      try {
        // Use FormData for multipart upload — supports large files (50MB+)
        const formData = new FormData();
        formData.append('projectId', activeProject.id);
        formData.append('name', file.name);
        formData.append('file', file);

        const response = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData,
          // No Content-Type header — browser sets it with boundary for multipart
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        uploadedFiles.push(result.document);
      } catch (err) {
        console.error(`Upload failed for ${file.name}:`, err);
        failedFiles.push(file.name);
      }
    }

    setIsUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add to local state immediately
    if (uploadedFiles.length > 0) {
      const newDocs: ProjectDocument[] = uploadedFiles.map((d) => ({
        id: d.id,
        name: d.name,
        type: 'drawing', // Default to drawing, can refine later
        status: d.status as 'processed' | 'processing' | 'pending',
        uploadDate: d.uploadDate,
        conflictCount: d.conflictCount || 0,
        discipline: 'General',
      }));
      setRealDocuments(prev => [...newDocs, ...prev]);
    }

    // Show result
    const total = uploadedFiles.length;
    if (total > 0 && failedFiles.length === 0) {
      alert(`✅ ${total} file(s) uploaded and stored!\nProcessing will begin shortly.`);
    } else if (total > 0) {
      alert(`Uploaded ${total} file(s). Failed: ${failedFiles.join(', ')}`);
    } else {
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="w-full lg:w-[300px] lg:min-w-[300px] bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col h-full touch-pan-y">
      <div className="h-14 border-b border-[#2A2A2A] flex shrink-0">
        <TabButton label="Scope" icon={<LayoutGrid className="w-4 h-4" />} count={filteredTrades.length} isActive={activeTab === 'scope'} onClick={() => setActiveTab('scope')} />
        <TabButton label="Docs" icon={<FolderOpen className="w-4 h-4" />} count={filteredDocs.length} isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
        <TabButton label="Mats" icon={<Package className="w-4 h-4" />} count={filteredMaterials.length} isActive={activeTab === 'materials'} onClick={() => setActiveTab('materials')} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
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
            {/* Upload Button */}
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.dwg,.dxf,.doc,.docx,.txt,.rtf,.xls,.xlsx,.csv"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#5E6AD2]/10 hover:bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 rounded-lg text-[#5E6AD2] font-medium text-sm transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </>
                )}
              </button>
              <p className="text-[10px] text-[#6B7280] text-center mt-2">
                PDF, DWG, Word, Excel (multiple files OK)
              </p>
            </div>

            {/* Uploaded Documents (Real) */}
            {realDocuments.length > 0 && (
              <div className="mb-4">
                <div className="text-[12px] text-[#8A8F98] py-2 px-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4ADE80]" />
                  <span>Uploaded Documents</span>
                  <span className="text-[11px] ml-auto">({realDocuments.length})</span>
                </div>
                <div className="ml-6 space-y-0.5">
                  {realDocuments.map(doc => {
                    const isActive = activeContextId === doc.id;
                    const isDone = isCompleted(doc.id, 'drawing');
                    return (
                      <div key={doc.id} onClick={() => onItemClick({ id: doc.id, name: doc.name, type: doc.type as 'drawing' | 'spec' | 'schedule' | 'material' })} className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer group ${isActive ? 'bg-[#5E6AD2]/20 border border-[#5E6AD2]' : 'hover:bg-[#1A1A1A]'}`}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" /> : <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#5E6AD2]' : 'text-[#6B7280] group-hover:text-[#5E6AD2]'}`} />}
                        <span className={`text-[11px] truncate flex-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{doc.name}</span>
                        {doc.status === 'processing' && <span className="text-[10px] text-[#FBBF24]">processing</span>}
                        {(doc.conflictCount || 0) > 0 && <span className="text-[10px] text-[#FBBF24] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{doc.conflictCount}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoadingDocs && realDocuments.length === 0 && (
              <div className="flex items-center justify-center py-8 text-[#6B7280]">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading documents...</span>
              </div>
            )}

            {/* Drawing Packages with Nested Sheets */}
            <div className="mb-4">
              <button onClick={() => toggleSection('Packages')} className="flex items-center gap-2 w-full py-2 text-left hover:bg-[#1A1A1A] rounded px-2 transition-fast">
                {expandedSections.has('Packages') ? <ChevronDown className="w-4 h-4 text-[#6B7280]" /> : <ChevronRight className="w-4 h-4 text-[#6B7280]" />}
                <FolderOpen className="w-4 h-4 text-[#5E6AD2]" />
                <span className="font-medium text-[14px]">Drawing Packages</span>
                <span className="text-[12px] text-[#6B7280] ml-auto">({uploadedPackages.length})</span>
              </button>
              
              {expandedSections.has('Packages') && (
                <div className="space-y-2 mt-2">
                  {uploadedPackages.map(pkg => {
                    const isPackageExpanded = expandedPackages.has(pkg.id);
                    const sheetsByDiscipline = groupSheetsByDiscipline(pkg.sheets);
                    const totalConflicts = pkg.sheets.reduce((sum, s) => sum + (s.conflictCount || 0), 0);
                    
                    return (
                      <div key={pkg.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
                        {/* Package Header */}
                        <button 
                          onClick={() => togglePackage(pkg.id)} 
                          className="w-full p-3 flex items-center gap-3 hover:bg-[#252525] transition-fast"
                        >
                          {isPackageExpanded ? 
                            <ChevronDown className="w-4 h-4 text-[#6B7280] shrink-0" /> : 
                            <ChevronRight className="w-4 h-4 text-[#6B7280] shrink-0" />
                          }
                          <FolderOpen className={`w-4 h-4 shrink-0 ${pkg.status === 'processing' ? 'text-[#FBBF24]' : 'text-[#5E6AD2]'}`} />
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium text-white/90 truncate">{pkg.name}</span>
                              {pkg.status === 'processing' && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-[#FBBF24]/20 text-[#FBBF24] rounded shrink-0">processing</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-0.5">
                              <span>{pkg.sheets.length} sheets</span>
                              <span>{pkg.pageCount} pages</span>
                              {pkg.discipline && <span className="text-[#8A8F98]">{pkg.discipline}</span>}
                            </div>
                          </div>
                          {totalConflicts > 0 && (
                            <span className="text-[11px] text-[#FBBF24] flex items-center gap-1 shrink-0">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {totalConflicts}
                            </span>
                          )}
                        </button>
                        
                        {/* Expanded: Sheets grouped by discipline */}
                        {isPackageExpanded && (
                          <div className="border-t border-[#2A2A2A]">
                            {Object.entries(sheetsByDiscipline).map(([discipline, sheets]) => {
                              const discKey = `${pkg.id}-${discipline}`;
                              const isDiscExpanded = expandedPackageDisciplines.has(discKey);
                              const discConflicts = sheets.reduce((sum, s) => sum + (s.conflictCount || 0), 0);
                              
                              return (
                                <div key={discKey} className="border-b border-[#2A2A2A] last:border-b-0">
                                  {/* Discipline Header */}
                                  <button 
                                    onClick={() => togglePackageDiscipline(discKey)}
                                    className="w-full px-4 py-2 flex items-center gap-2 hover:bg-[#252525] transition-fast"
                                  >
                                    {isDiscExpanded ? 
                                      <ChevronDown className="w-3 h-3 text-[#6B7280]" /> : 
                                      <ChevronRight className="w-3 h-3 text-[#6B7280]" />
                                    }
                                    <DisciplineIcon discipline={discipline} className="w-3.5 h-3.5 text-[#8A8F98]" />
                                    <span className="text-[12px] text-[#8A8F98]">{discipline}</span>
                                    <span className="text-[11px] text-[#6B7280] ml-auto">{sheets.length} sheets</span>
                                    {discConflicts > 0 && (
                                      <span className="text-[10px] text-[#FBBF24]">{discConflicts}</span>
                                    )}
                                  </button>
                                  
                                  {/* Individual Sheets */}
                                  {isDiscExpanded && (
                                    <div className="px-4 pb-2 space-y-0.5">
                                      {sheets.map(sheet => {
                                        const isActive = activeContextId === sheet.id;
                                        const isDone = completedItems.documents.includes(sheet.id);
                                        const sheetName = `${sheet.sheetNumber} - ${sheet.title}`;
                                        
                                        return (
                                          <div 
                                            key={sheet.id} 
                                            onClick={() => onItemClick({ id: sheet.id, name: sheetName, type: 'drawing' })} 
                                            className={`flex items-center gap-2 py-1.5 px-2 ml-5 rounded cursor-pointer group ${
                                              isActive ? 'bg-[#5E6AD2]/20 border border-[#5E6AD2]' : 'hover:bg-[#252525]'
                                            }`}
                                          >
                                            {isDone ? (
                                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                                            ) : sheet.status === 'processing' ? (
                                              <Loader2 className="w-3.5 h-3.5 text-[#FBBF24] animate-spin shrink-0" />
                                            ) : sheet.status === 'pending' ? (
                                              <FileText className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                                            ) : (
                                              <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#5E6AD2]' : 'text-[#6B7280] group-hover:text-[#5E6AD2]'}`} />
                                            )}
                                            <span className="text-[11px] font-mono text-[#5E6AD2] shrink-0">{sheet.sheetNumber}</span>
                                            <span className={`text-[11px] truncate flex-1 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                                              {sheet.title}
                                            </span>
                                            <span className="text-[10px] text-[#6B7280] shrink-0">p.{sheet.page}</span>
                                            {(sheet.conflictCount || 0) > 0 && (
                                              <span className="text-[10px] text-[#FBBF24] flex items-center gap-0.5 shrink-0">
                                                <AlertCircle className="w-3 h-3" />
                                                {sheet.conflictCount}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-4">
              <button onClick={() => toggleSection('Drawings')} className="flex items-center gap-2 w-full py-2 text-left hover:bg-[#1A1A1A] rounded px-2 transition-fast">
                {expandedSections.has('Drawings') ? <ChevronDown className="w-4 h-4 text-[#6B7280]" /> : <ChevronRight className="w-4 h-4 text-[#6B7280]" />}
                <FileText className="w-4 h-4 text-[#5E6AD2]" />
                <span className="font-medium text-[14px]">Sample Drawings</span>
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
                <span>Sample Specifications</span>
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
