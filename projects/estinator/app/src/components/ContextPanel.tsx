import { useState } from 'react';
import type { Issue, IssueStatus, Project } from '../types';

interface ContextPanelProps {
  issues: Issue[];
  activeProject: Project;
  selectedScopes: string[];
  onIssueStatusChange: (issueId: string, status: IssueStatus) => void;
  onDocumentClick?: (document: ProjectDocument) => void;
  onProductClick?: (product: Product) => void;
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

export interface Product {
  id: string;
  name: string;
  category: string;
  division: string;
  manufacturer?: string;
  modelNumber?: string;
  quantity?: string;
  sources: ProductSource[];
}

export interface ProductSource {
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

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
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
    id: 'p2',
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

const disciplineEmojis: Record<string, string> = {
  'Architectural': '🏛️', 'Structural': '🏗️', 'Fire Protection': '🔥',
  'Plumbing': '🚿', 'Mechanical': '🌡️', 'Electrical': '⚡',
};

const productCategoryEmojis: Record<string, string> = {
  'Flooring': '🟫', 'Doors': '🚪', 'HVAC Equipment': '🌡️',
  'Lighting': '💡', 'Electrical Equipment': '⚡', 'Fire Protection': '🔥', 'Plumbing Fixtures': '🚿',
};

export function ContextPanel({ issues, selectedScopes }: ContextPanelProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'documents' | 'products'>('documents');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Drawings']));
  const [selectedProductCategory, setSelectedProductCategory] = useState<string | 'all'>('all');

  const filteredDocs = selectedScopes.length === 0 
    ? MOCK_DOCUMENTS 
    : MOCK_DOCUMENTS.filter(doc => doc.division && selectedScopes.includes(doc.division));

  let filteredProducts = selectedScopes.length === 0 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(prod => selectedScopes.includes(prod.division));
  
  if (selectedProductCategory !== 'all') {
    filteredProducts = filteredProducts.filter(prod => prod.category === selectedProductCategory);
  }

  const drawingsByDiscipline = filteredDocs
    .filter(doc => doc.type === 'drawing')
    .reduce((acc, doc) => {
      const discipline = doc.discipline || 'Other';
      if (!acc[discipline]) acc[discipline] = [];
      acc[discipline].push(doc);
      return acc;
    }, {} as Record<string, ProjectDocument[]>);

  const productsByCategory = filteredProducts.reduce((acc, prod) => {
    if (!acc[prod.category]) acc[prod.category] = [];
    acc[prod.category].push(prod);
    return acc;
  }, {} as Record<string, Product[]>);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <div className="w-[300px] min-w-[300px] bg-[#0D0D0D] border-l border-[#2A2A2A] flex flex-col">
      {/* Tabs */}
      <div className="h-14 border-b border-[#2A2A2A] flex">
        <TabButton label="Issues" icon="🚩" count={issues.length} isActive={activeTab === 'issues'} onClick={() => setActiveTab('issues')} />
        <TabButton label="Documents" icon="📁" count={filteredDocs.length} isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
        <TabButton label="Products" icon="📦" count={filteredProducts.length} isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'documents' && (
          <>
            {/* Drawings */}
            <div className="mb-4">
              <button onClick={() => toggleSection('Drawings')} className="flex items-center gap-2 w-full py-2 text-left">
                <span>{expandedSections.has('Drawings') ? '▼' : '▶'}</span>
                <span className="font-medium">Drawings</span>
                <span className="text-[#6B7280]">({Object.values(drawingsByDiscipline).flat().length})</span>
              </button>
              
              {expandedSections.has('Drawings') && (
                <div className="ml-4 space-y-2">
                  {Object.entries(drawingsByDiscipline).map(([discipline, docs]) => (
                    <div key={discipline} className="border-l-2 border-[#2A2A2A] pl-3">
                      <button onClick={() => toggleSection(`disc-${discipline}`)} className="flex items-center gap-2 w-full py-1 text-left">
                        <span className="text-[12px]">{expandedSections.has(`disc-${discipline}`) ? '▼' : '▶'}</span>
                        <span className="text-[12px] text-[#8A8F98]">{disciplineEmojis[discipline]} {discipline}</span>
                        <span className="text-[11px] text-[#6B7280]">({docs.length})</span>
                      </button>
                      
                      {expandedSections.has(`disc-${discipline}`) && (
                        <div className="ml-4 space-y-1">
                          {docs.map(doc => (
                            <div key={doc.id} className="text-[11px] text-white/80 py-1">{doc.name}</div>
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
              <div className="text-[12px] text-[#8A8F98] py-2">📄 Specifications ({filteredDocs.filter(d => d.type === 'spec').length})</div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <>
            {/* Category Filter */}
            <div className="mb-4">
              <div className="text-[11px] text-[#6B7280] mb-2">Filter by category:</div>
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => setSelectedProductCategory('all')}
                  className={`px-2 py-1 rounded text-[10px] ${selectedProductCategory === 'all' ? 'bg-[#5E6AD2] text-white' : 'bg-[#2A2A2A] text-[#8A8F98]'}`}
                >
                  All
                </button>
                {Object.keys(productsByCategory).map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedProductCategory(cat)}
                    className={`px-2 py-1 rounded text-[10px] ${selectedProductCategory === cat ? 'bg-[#5E6AD2] text-white' : 'bg-[#2A2A2A] text-[#8A8F98]'}`}
                  >
                    {productCategoryEmojis[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List */}
            {Object.entries(productsByCategory).map(([category, products]) => (
              <div key={category} className="mb-4">
                <div className="flex items-center gap-2 py-2">
                  <span>{productCategoryEmojis[category]}</span>
                  <span className="font-medium text-[13px]">{category}</span>
                  <span className="text-[11px] text-[#6B7280]">({products.length})</span>
                </div>
                <div className="ml-4 space-y-2">
                  {products.map(product => (
                    <div key={product.id} className="p-2 rounded bg-[#1A1A1A] border border-[#2A2A2A]">
                      <div className="text-[12px] font-medium text-white/90">{product.name}</div>
                      <div className="text-[10px] text-[#6B7280]">{product.manufacturer} {product.modelNumber}</div>
                      <div className="text-[10px] text-[#5E6AD2]">Qty: {product.quantity}</div>
                      <div className="mt-2 space-y-1">
                        {product.sources.map((src, idx) => (
                          <div key={idx} className="text-[9px] text-[#8A8F98] flex items-center gap-1">
                            <span>📄</span>
                            <span>{src.documentName}</span>
                            <span className="text-[#6B7280]">→ {src.location}</span>
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

function TabButton({ label, icon, count, isActive, onClick }: { label: string; icon: string; count: number; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 py-3 text-[12px] font-medium border-b-2 ${
        isActive ? 'border-[#5E6AD2] text-white bg-[#5E6AD2]/5' : 'border-transparent text-[#8A8F98]'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span className="text-[10px] text-[#6B7280]">({count})</span>
    </button>
  );
}
