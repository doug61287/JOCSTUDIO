import { useState } from 'react';
import type { Issue, IssueStatus, Project } from '../types';

interface ContextPanelProps {
  issues: Issue[];
  activeProject: Project;
  selectedScopes: string[];
  onIssueStatusChange: (issueId: string, status: IssueStatus) => void;
  onDocumentClick?: (document: ProjectDocument) => void;
}

// Mock document types
export interface ProjectDocument {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'addendum' | 'rfi';
  division?: string;
  category?: string;
  status: 'processed' | 'processing' | 'pending';
  pageCount?: number;
  uploadDate: string;
  conflictCount?: number;
}

// Mock documents data - in real app, this comes from backend
const MOCK_DOCUMENTS: ProjectDocument[] = [
  // Architectural Drawings (Division 08, 09)
  { id: 'd1', name: 'A-001 - Cover Sheet', type: 'drawing', division: '01', category: 'Architectural', status: 'processed', pageCount: 1, uploadDate: '2026-02-10', conflictCount: 0 },
  { id: 'd2', name: 'A-100 - Floor Plans Level 1', type: 'drawing', division: '08', category: 'Architectural', status: 'processed', pageCount: 4, uploadDate: '2026-02-10', conflictCount: 2 },
  { id: 'd3', name: 'A-101 - Floor Plans Level 2', type: 'drawing', division: '08', category: 'Architectural', status: 'processed', pageCount: 4, uploadDate: '2026-02-10', conflictCount: 1 },
  { id: 'd4', name: 'A-200 - Elevations', type: 'drawing', division: '08', category: 'Architectural', status: 'processed', pageCount: 6, uploadDate: '2026-02-10', conflictCount: 0 },
  { id: 'd5', name: 'A-300 - Sections', type: 'drawing', division: '08', category: 'Architectural', status: 'processing', pageCount: 8, uploadDate: '2026-02-10', conflictCount: 0 },
  
  // Fire Protection Drawings (Division 21)
  { id: 'd6', name: 'FP-001 - Fire Protection Plan L1', type: 'drawing', division: '21', category: 'Fire Protection', status: 'processed', pageCount: 2, uploadDate: '2026-02-11', conflictCount: 3 },
  { id: 'd7', name: 'FP-002 - Fire Protection Plan L2', type: 'drawing', division: '21', category: 'Fire Protection', status: 'processed', pageCount: 2, uploadDate: '2026-02-11', conflictCount: 1 },
  { id: 'd8', name: 'FP-100 - Sprinkler Riser Diagram', type: 'drawing', division: '21', category: 'Fire Protection', status: 'processed', pageCount: 3, uploadDate: '2026-02-11', conflictCount: 0 },
  
  // Plumbing Drawings (Division 22)
  { id: 'd9', name: 'P-001 - Plumbing Plan L1', type: 'drawing', division: '22', category: 'Plumbing', status: 'processed', pageCount: 2, uploadDate: '2026-02-11', conflictCount: 2 },
  { id: 'd10', name: 'P-002 - Plumbing Plan L2', type: 'drawing', division: '22', category: 'Plumbing', status: 'processed', pageCount: 2, uploadDate: '2026-02-11', conflictCount: 0 },
  { id: 'd11', name: 'P-100 - Plumbing Riser', type: 'drawing', division: '22', category: 'Plumbing', status: 'processing', pageCount: 3, uploadDate: '2026-02-11', conflictCount: 0 },
  
  // Electrical Drawings (Division 26)
  { id: 'd12', name: 'E-001 - Electrical Plan L1', type: 'drawing', division: '26', category: 'Electrical', status: 'processed', pageCount: 3, uploadDate: '2026-02-12', conflictCount: 4 },
  { id: 'd13', name: 'E-002 - Electrical Plan L2', type: 'drawing', division: '26', category: 'Electrical', status: 'processed', pageCount: 3, uploadDate: '2026-02-12', conflictCount: 1 },
  { id: 'd14', name: 'E-100 - Panel Schedules', type: 'drawing', division: '26', category: 'Electrical', status: 'processed', pageCount: 5, uploadDate: '2026-02-12', conflictCount: 2 },
  { id: 'd15', name: 'E-200 - Lighting Plans', type: 'drawing', division: '26', category: 'Electrical', status: 'pending', pageCount: 4, uploadDate: '2026-02-12', conflictCount: 0 },
  
  // Specifications
  { id: 's1', name: 'Div 01 - General Requirements', type: 'spec', division: '01', status: 'processed', pageCount: 45, uploadDate: '2026-02-10', conflictCount: 0 },
  { id: 's2', name: 'Div 08 - Openings', type: 'spec', division: '08', status: 'processed', pageCount: 32, uploadDate: '2026-02-10', conflictCount: 1 },
  { id: 's3', name: 'Div 09 - Finishes', type: 'spec', division: '09', status: 'processed', pageCount: 28, uploadDate: '2026-02-10', conflictCount: 0 },
  { id: 's4', name: 'Div 21 - Fire Suppression', type: 'spec', division: '21', status: 'processed', pageCount: 24, uploadDate: '2026-02-11', conflictCount: 2 },
  { id: 's5', name: 'Div 22 - Plumbing', type: 'spec', division: '22', status: 'processed', pageCount: 36, uploadDate: '2026-02-11', conflictCount: 1 },
  { id: 's6', name: 'Div 26 - Electrical', type: 'spec', division: '26', status: 'processing', pageCount: 52, uploadDate: '2026-02-12', conflictCount: 0 },
  
  // Addenda
  { id: 'a1', name: 'Addendum 1 - FP Modifications', type: 'addendum', division: '21', status: 'processed', pageCount: 8, uploadDate: '2026-02-13', conflictCount: 3 },
  { id: 'a2', name: 'Addendum 2 - Electrical Updates', type: 'addendum', division: '26', status: 'processed', pageCount: 12, uploadDate: '2026-02-14', conflictCount: 2 },
  
  // RFIs
  { id: 'r1', name: 'RFI-001 - Sprinkler Coverage', type: 'rfi', division: '21', status: 'processed', uploadDate: '2026-02-13', conflictCount: 0 },
  { id: 'r2', name: 'RFI-002 - Panel Coordination', type: 'rfi', division: '26', status: 'processed', uploadDate: '2026-02-14', conflictCount: 0 },
];

const statusColors: Record<IssueStatus, { bg: string; text: string; dot: string }> = {
  open: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]', dot: 'bg-[#FBBF24]' },
  blocked: { bg: 'bg-[#EF4444]/10', text: 'text-[#EF4444]', dot: 'bg-[#EF4444]' },
  resolved: { bg: 'bg-[#4ADE80]/10', text: 'text-[#4ADE80]', dot: 'bg-[#4ADE80]' },
};

const tradeEmojis: Record<string, string> = {
  Electrical: '⚡',
  Mechanical: '🌡️',
  Plumbing: '🚿',
  Structural: '🏗️',
  Hardware: '🚪',
  General: '📋',
};

const documentTypeEmojis: Record<string, string> = {
  drawing: '📐',
  spec: '📄',
  addendum: '📎',
  rfi: '❓',
};

const documentStatusColors: Record<string, { bg: string; text: string }> = {
  processed: { bg: 'bg-[#4ADE80]/10', text: 'text-[#4ADE80]' },
  processing: { bg: 'bg-[#FBBF24]/10', text: 'text-[#FBBF24]' },
  pending: { bg: 'bg-[#6B7280]/10', text: 'text-[#6B7280]' },
};

export function ContextPanel({ 
  issues, 
  activeProject, 
  selectedScopes,
  onIssueStatusChange,
  onDocumentClick 
}: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'documents'>('issues');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Drawings', 'Specs']));

  // Filter documents by selected scopes
  const filteredDocuments = selectedScopes.length === 0 
    ? MOCK_DOCUMENTS 
    : MOCK_DOCUMENTS.filter(doc => doc.division && selectedScopes.includes(doc.division));

  // Group documents by category
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    let category = 'Other';
    if (doc.type === 'drawing') category = 'Drawings';
    else if (doc.type === 'spec') category = 'Specs';
    else if (doc.type === 'addendum') category = 'Addenda';
    else if (doc.type === 'rfi') category = 'RFIs';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, ProjectDocument[]>);

  const projectIssues = issues.filter(i => i.projectId === activeProject.id);
  const filteredIssues = filterStatus === 'all' 
    ? projectIssues 
    : projectIssues.filter(i => i.status === filterStatus);
  
  const openCount = projectIssues.filter(i => i.status === 'open').length;
  const blockedCount = projectIssues.filter(i => i.status === 'blocked').length;
  const resolvedCount = projectIssues.filter(i => i.status === 'resolved').length;
  const totalConflictCount = filteredDocuments.reduce((sum, doc) => sum + (doc.conflictCount || 0), 0);

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  return (
    <div className="w-[320px] min-w-[320px] bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
      {/* Tab Header */}
      <div className="h-14 border-b border-[#2A2A2A] flex">
        <TabButton 
          label="Issues"
          icon="🚩"
          count={projectIssues.length}
          isActive={activeTab === 'issues'}
          onClick={() => setActiveTab('issues')}
        />
        <TabButton 
          label="Documents"
          icon="📁"
          count={filteredDocuments.length}
          isActive={activeTab === 'documents'}
          onClick={() => setActiveTab('documents')}
        />
      </div>

      {/* Content Area */}
      {activeTab === 'issues' ? (
        <>
          {/* Issue Filters */}
          <div className="flex border-b border-[#2A2A2A]">
            <FilterTab 
              label="Blocked" 
              count={blockedCount} 
              color="text-[#EF4444]"
              isActive={filterStatus === 'blocked'}
              onClick={() => setFilterStatus('blocked')}
            />
            <FilterTab 
              label="Open" 
              count={openCount} 
              color="text-[#FBBF24]"
              isActive={filterStatus === 'open'}
              onClick={() => setFilterStatus('open')}
            />
            <FilterTab 
              label="Resolved" 
              count={resolvedCount} 
              color="text-[#4ADE80]"
              isActive={filterStatus === 'resolved'}
              onClick={() => setFilterStatus('resolved')}
            />
            <FilterTab 
              label="All" 
              count={projectIssues.length} 
              color="text-[#8A8F98]"
              isActive={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
            />
          </div>

          {/* Issues List */}
          <div className="flex-1 overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#8A8F98]">
                <span className="text-3xl mb-2">✅</span>
                <p className="text-[14px]">No {filterStatus !== 'all' ? filterStatus : ''} issues</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {filteredIssues.map(issue => (
                  <IssueCard 
                    key={issue.id}
                    issue={issue}
                    isSelected={issue.id === selectedIssueId}
                    onClick={() => setSelectedIssueId(issue.id === selectedIssueId ? null : issue.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* By Trade Summary */}
          <div className="p-3 border-t border-[#2A2A2A]">
            <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2">
              By Trade
            </div>
            <div className="space-y-1">
              {['Electrical', 'Mechanical', 'Plumbing'].map(trade => {
                const count = projectIssues.filter(i => i.trade === trade && i.status !== 'resolved').length;
                if (count === 0) return null;
                return (
                  <div key={trade} className="flex items-center justify-between text-[13px]">
                    <span className="text-[#8A8F98]">{tradeEmojis[trade]} {trade}</span>
                    <span className="text-white/90">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Documents Header */}
          <div className="px-4 py-3 border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#8A8F98]">
                {selectedScopes.length > 0 
                  ? `${filteredDocuments.length} docs in scope`
                  : `${filteredDocuments.length} total documents`
                }
              </span>
              {totalConflictCount > 0 && (
                <span className="text-[12px] text-[#FBBF24]">
                  ⚠️ {totalConflictCount} conflicts
                </span>
              )}
            </div>
            {selectedScopes.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                <span className="text-[11px] text-[#6B7280]">Filtering:</span>
                {selectedScopes.map(scope => (
                  <span key={scope} className="text-[10px] px-1.5 py-0.5 bg-[#5E6AD2]/20 text-[#5E6AD2] rounded">
                    Div {scope}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-3">
            {Object.entries(documentsByCategory).map(([category, docs]) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center justify-between w-full py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">
                      {expandedCategories.has(category) ? '▼' : '▶'}
                    </span>
                    <span className="text-[13px] font-medium text-white/90">{category}</span>
                    <span className="text-[11px] text-[#6B7280]">({docs.length})</span>
                  </div>
                  {category === 'Drawings' && docs.some(d => d.conflictCount && d.conflictCount > 0) && (
                    <span className="text-[11px] text-[#FBBF24]">
                      {docs.reduce((sum, d) => sum + (d.conflictCount || 0), 0)} conflicts
                    </span>
                  )}
                </button>
                
                {expandedCategories.has(category) && (
                  <div className="ml-5 space-y-1 mt-1">
                    {docs.map(doc => (
                      <DocumentRow 
                        key={doc.id}
                        document={doc}
                        onClick={() => onDocumentClick?.(doc)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Processing Status Footer */}
          <div className="p-3 border-t border-[#2A2A2A]">
            <div className="text-[11px] font-semibold text-[#8A8F98] uppercase tracking-wider mb-2">
              Processing Status
            </div>
            <div className="space-y-1">
              <StatusRow label="Processed" count={filteredDocuments.filter(d => d.status === 'processed').length} color="text-[#4ADE80]" />
              <StatusRow label="Processing" count={filteredDocuments.filter(d => d.status === 'processing').length} color="text-[#FBBF24]" />
              <StatusRow label="Pending" count={filteredDocuments.filter(d => d.status === 'pending').length} color="text-[#6B7280]" />
            </div>
          </div>
        </>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && activeTab === 'issues' && (
        <IssueDetailModal 
          issue={selectedIssue}
          onClose={() => setSelectedIssueId(null)}
          onStatusChange={onIssueStatusChange}
        />
      )}
    </div>
  );
}

// Component: Tab Button
interface TabButtonProps {
  label: string;
  icon: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, icon, count, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-[14px] font-medium transition-fast border-b-2 ${
        isActive 
          ? 'border-[#5E6AD2] text-white bg-[#5E6AD2]/5' 
          : 'border-transparent text-[#8A8F98] hover:text-white/90 hover:bg-[#1A1A1A]'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span className="text-[12px] text-[#6B7280]">({count})</span>
    </button>
  );
}

// Component: Filter Tab
interface FilterTabProps {
  label: string;
  count: number;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterTab({ label, count, color, isActive, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 px-2 text-[12px] font-medium transition-fast border-b-2 ${
        isActive 
          ? `border-[#5E6AD2] text-white` 
          : 'border-transparent text-[#8A8F98] hover:text-white/90'
      }`}
    >
      <span className={isActive ? color : ''}>{label}</span>
      <span className="ml-1.5 text-[#6B7280]">({count})</span>
    </button>
  );
}

// Component: Document Row
interface DocumentRowProps {
  document: ProjectDocument;
  onClick?: () => void;
}

function DocumentRow({ document, onClick }: DocumentRowProps) {
  const statusStyle = documentStatusColors[document.status];
  
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-[#1A1A1A] transition-fast text-left group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[14px]">{documentTypeEmojis[document.type]}</span>
        <div className="min-w-0">
          <div className="text-[12px] text-white/90 truncate group-hover:text-[#5E6AD2] transition-fast">
            {document.name}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#6B7280]">
            {document.division && <span>Div {document.division}</span>}
            {document.pageCount && <span>{document.pageCount} pgs</span>}
            <span className={`px-1 rounded ${statusStyle.bg} ${statusStyle.text}`}>
              {document.status}
            </span>
          </div>
        </div>
      </div>
      
      {document.conflictCount && document.conflictCount > 0 && (
        <span className="flex items-center gap-1 text-[11px] text-[#FBBF24] shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {document.conflictCount}
        </span>
      )}
    </button>
  );
}

// Component: Status Row
interface StatusRowProps {
  label: string;
  count: number;
  color: string;
}

function StatusRow({ label, count, color }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-[#8A8F98]">{label}</span>
      <span className={color}>{count}</span>
    </div>
  );
}

// Component: Issue Card
interface IssueCardProps {
  issue: Issue;
  isSelected: boolean;
  onClick: () => void;
}

function IssueCard({ issue, isSelected, onClick }: IssueCardProps) {
  const colors = statusColors[issue.status];
  
  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-fast ${
        isSelected 
          ? 'bg-[#5E6AD2]/10 border-[#5E6AD2]' 
          : 'bg-[#1A1A1A] border-[#2A2A2A] hover:border-[#3A3A3A]'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1.5 ${colors.dot}`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-medium text-white/90 leading-snug line-clamp-2">
            {issue.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] text-[#8A8F98]">{tradeEmojis[issue.trade]} {issue.trade}</span>
            {issue.sourceDocument && (
              <>
                <span className="text-[#2A2A2A]">•</span>
                <span className="text-[11px] text-[#8A8F98] truncate">{issue.sourceDocument}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Issue Detail Modal
interface IssueDetailModalProps {
  issue: Issue;
  onClose: () => void;
  onStatusChange: (issueId: string, status: IssueStatus) => void;
}

function IssueDetailModal({ issue, onClose, onStatusChange }: IssueDetailModalProps) {
  const colors = statusColors[issue.status];
  
  return (
    <div className="absolute inset-0 z-20 bg-[#0D0D0D]/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${colors.text}`}>
              {issue.status}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[#2A2A2A] text-[#8A8F98]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <h3 className="text-[16px] font-semibold text-white/90 mb-3">{issue.title}</h3>
        
        <div className="space-y-3 text-[13px]">
          <div>
            <span className="text-[#8A8F98]">Trade: </span>
            <span>{tradeEmojis[issue.trade]} {issue.trade}</span>
          </div>
          {issue.sourceDocument && (
            <div>
              <span className="text-[#8A8F98]">Source: </span>
              <span>{issue.sourceDocument}</span>
            </div>
          )}
          <div>
            <span className="text-[#8A8F98]">Created: </span>
            <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          {issue.status !== 'resolved' && (
            <button
              onClick={() => {
                onStatusChange(issue.id, 'resolved');
                onClose();
              }}
              className="flex-1 py-2 bg-[#4ADE80]/10 hover:bg-[#4ADE80]/20 border border-[#4ADE80]/30 rounded-lg text-[13px] font-medium text-[#4ADE80] transition-fast"
            >
              Mark Resolved
            </button>
          )}
          <button className="flex-1 py-2 bg-[#5E6AD2] hover:bg-[#6872E3] rounded-lg text-[13px] font-medium text-white transition-fast">
            Draft RFI
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContextPanel;
