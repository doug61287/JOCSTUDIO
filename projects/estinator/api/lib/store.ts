/**
 * Shared in-memory storage for serverless functions.
 * Persists as long as the function instance is warm.
 * For production, replace with Redis or a database.
 */
import type { Project, UploadedDocument, Issue, ConversationMessage } from './types';

export type { Project };

// Typed context shape
interface ProjectContext {
  scopes: { division: string; name: string; progress: number }[];
  documents: { id: string; name: string; type: string; status: string; conflictCount: number }[];
  materials: { id: string; name: string; category: string }[];
}

// Use global to persist across requests in the same warm instance
declare global {
  var __PROJECTS__: Map<string, Project> | undefined;
  var __CONTEXTS__: Map<string, ProjectContext> | undefined;
  var __CONVERSATIONS__: Map<string, ConversationMessage[]> | undefined;
  var __ISSUES__: Map<string, Issue[]> | undefined;
  var __UPLOADED_DOCS__: Map<string, UploadedDocument[]> | undefined;
  var __SEEDED__: boolean | undefined;
}

export const projects = global.__PROJECTS__ ?? new Map<string, Project>();
export const contexts = global.__CONTEXTS__ ?? new Map<string, ProjectContext>();
export const conversations = global.__CONVERSATIONS__ ?? new Map<string, ConversationMessage[]>();
export const issues = global.__ISSUES__ ?? new Map<string, Issue[]>();
export const uploadedDocuments = global.__UPLOADED_DOCS__ ?? new Map<string, UploadedDocument[]>();

// Store in global to persist across requests
global.__PROJECTS__ = projects;
global.__CONTEXTS__ = contexts;
global.__CONVERSATIONS__ = conversations;
global.__ISSUES__ = issues;
global.__UPLOADED_DOCS__ = uploadedDocuments;

// ── DEMO: Bellevue Hospital ED Ambulance Bay ────────────────────────────────
// Real drawing package with MEP conflicts for estimator demo

function seedDemoProject() {
  if (global.__SEEDED__) return;
  
  const now = new Date().toISOString();
  const demoId = 'proj-demo';
  
  if (projects.size > 0) return;

  const demoProject: Project = {
    id: demoId,
    name: 'Bellevue Hospital - ED Ambulance Bay',
    owner: 'NYC Health + Hospitals',
    location: 'New York, NY',
    status: 'active',
    progress: 68,
    documentCount: 1,
    openIssues: 4,
    selectedScopes: ['21', '22', '26'],
    createdAt: now,
    lastActive: 'Just now',
  };

  // Real ambulance bay drawing package (42 sheets)
  const ambulanceBayPackage = {
    id: 'pkg-ambulance-001',
    name: '11202402_Drawings_Part1.pdf',
    type: 'package' as const,
    discipline: 'Multi',
    status: 'processed' as const,
    pageCount: 42,
    uploadDate: '2026-02-18',
    conflictCount: 4,
    sheets: [
      // Architectural
      { id: 's1', sheetNumber: 'A-001', title: 'Cover Sheet & Drawing Index', discipline: 'Architectural', page: 1, status: 'processed' as const, conflictCount: 0 },
      { id: 's2', sheetNumber: 'A-101', title: 'Ambulance Bay Floor Plan - Level 1', discipline: 'Architectural', page: 2, status: 'processed' as const, conflictCount: 0 },
      { id: 's3', sheetNumber: 'A-102', title: 'Ambulance Bay Ceiling Plan', discipline: 'Architectural', page: 3, status: 'processed' as const, conflictCount: 2 },
      { id: 's4', sheetNumber: 'A-201', title: 'Ambulance Bay Section & Details', discipline: 'Architectural', page: 4, status: 'processed' as const, conflictCount: 0 },
      { id: 's5', sheetNumber: 'A-301', title: 'Ambulance Bay Enlarged Plans', discipline: 'Architectural', page: 5, status: 'processed' as const, conflictCount: 0 },
      // Fire Protection
      { id: 's6', sheetNumber: 'FP-001', title: 'Fire Protection Site Plan', discipline: 'Fire Protection', page: 12, status: 'processed' as const, conflictCount: 0 },
      { id: 's7', sheetNumber: 'FP-101', title: 'Sprinkler Plan - Ambulance Bay', discipline: 'Fire Protection', page: 13, status: 'processed' as const, conflictCount: 1 },
      { id: 's8', sheetNumber: 'FP-102', title: 'Sprinkler Riser Diagram', discipline: 'Fire Protection', page: 14, status: 'processed' as const, conflictCount: 0 },
      // Plumbing
      { id: 's9', sheetNumber: 'P-001', title: 'Plumbing Site Plan', discipline: 'Plumbing', page: 18, status: 'processed' as const, conflictCount: 0 },
      { id: 's10', sheetNumber: 'P-101', title: 'Plumbing Plan - Level 1', discipline: 'Plumbing', page: 19, status: 'processed' as const, conflictCount: 0 },
      { id: 's11', sheetNumber: 'P-201', title: 'Medical Gas & Vacuum Plan', discipline: 'Plumbing', page: 20, status: 'processing' as const, conflictCount: 0 },
      // Electrical
      { id: 's12', sheetNumber: 'E-001', title: 'Electrical Site Plan', discipline: 'Electrical', page: 25, status: 'processed' as const, conflictCount: 0 },
      { id: 's13', sheetNumber: 'E-101', title: 'Lighting Plan - Ambulance Bay', discipline: 'Electrical', page: 26, status: 'processed' as const, conflictCount: 2 },
      { id: 's14', sheetNumber: 'E-102', title: 'Power Plan - Ambulance Bay', discipline: 'Electrical', page: 27, status: 'processed' as const, conflictCount: 0 },
      { id: 's15', sheetNumber: 'E-201', title: 'Panel Schedules & One-Line', discipline: 'Electrical', page: 28, status: 'processed' as const, conflictCount: 1 },
      { id: 's16', sheetNumber: 'E-301', title: 'Fire Alarm Plan', discipline: 'Electrical', page: 29, status: 'processed' as const, conflictCount: 0 },
    ],
  };

  // Real conflicts based on typical ambulance bay MEP coordination
  const ambulanceBayIssues: Issue[] = [
    {
      id: 'issue-001',
      projectId: demoId,
      title: 'Ceiling Space Conflict: Sprinklers vs. Lighting vs. Medical Gas',
      description: 'A-102 ceiling plan shows 10\' AFF ceiling. FP-101 requires sprinkler heads at 8\'6" AFF. E-101 shows light fixtures at 9\' AFF. P-201 shows medical gas drops from ceiling. All trades competing for same 18" of ceiling space. Coordination required.',
      status: 'open',
      priority: 'high',
      trade: 'MEP Coordination',
      sourceDocument: 'A-102, FP-101, E-101, P-201',
      createdAt: now,
      contextId: 's3',
      contextType: 'drawing',
    },
    {
      id: 'issue-002',
      projectId: demoId,
      title: 'Ambulance Bay Clearance: Light fixtures below 13\'6" requirement',
      description: 'Architectural section A-201 requires 13\'6" minimum clear height for ambulance access. E-101 shows (4) pendant light fixtures in ambulance parking area at 12\'8" AFF - 10" below minimum clearance. Fixtures need to be relocated or changed to recessed.',
      status: 'open',
      priority: 'high',
      trade: 'Electrical',
      sourceDocument: 'A-201, E-101',
      createdAt: now,
      contextId: 's13',
      contextType: 'drawing',
    },
    {
      id: 'issue-003',
      projectId: demoId,
      title: 'Panel E-201: 42 circuits shown, only 36 spaces available',
      description: 'Panel Schedule on E-201 shows 42 single-pole circuits assigned to Panel EP-A. Panel E-201 one-line diagram shows 42-space panel with 6 spaces dedicated to 2-pole breakers, leaving only 36 spaces for single-pole. Circuit count exceeds capacity by 6.',
      status: 'open',
      priority: 'high',
      trade: 'Electrical',
      sourceDocument: 'E-201',
      createdAt: now,
      contextId: 's15',
      contextType: 'drawing',
    },
    {
      id: 'issue-004',
      projectId: demoId,
      title: 'RFI-001: Emergency power for medical gas alarm panels',
      description: 'E-301 shows fire alarm devices on emergency power. P-201 shows medical gas alarm panels but no indication of emergency power connection per NFPA 99. Specification Division 22 00 00 requires medical gas alarms on life safety branch. Confirm power source.',
      status: 'open',
      priority: 'medium',
      trade: 'Electrical/Plumbing',
      isRFI: true,
      rfiId: 'RFI-001',
      rfiStatus: 'draft',
      sourceDocument: 'P-201, E-301, Spec Div 22',
      createdAt: now,
    },
  ];

  // Documents
  const demoDocs = [
    { id: 'doc-001', name: '11202402_Drawings_Part1.pdf', type: 'drawing', status: 'processed', conflictCount: 4 },
  ];

  projects.set(demoId, demoProject);
  contexts.set(demoId, {
    scopes: [
      { division: '21', name: 'Fire Suppression', progress: 75 },
      { division: '22', name: 'Plumbing', progress: 60 },
      { division: '26', name: 'Electrical', progress: 55 },
    ],
    documents: demoDocs,
    materials: [],
  });
  
  // Store the package in a custom context field for demo
  (contexts.get(demoId) as any).packages = [ambulanceBayPackage];
  issues.set(demoId, ambulanceBayIssues);
  uploadedDocuments.set(demoId, []);

  global.__SEEDED__ = true;
  console.log('✅ Demo project seeded: Bellevue Hospital - ED Ambulance Bay');
}

seedDemoProject();
