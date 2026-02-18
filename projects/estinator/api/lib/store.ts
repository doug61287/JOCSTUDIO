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

// ── Demo project for presentations ───────────────────────────────────────────
// Pre-loaded with a Drawing Package for immediate demo use.
// Real user projects are created via the UI and persist within the warm instance.
// TODO: migrate to Vercel Postgres for true persistence across cold starts.

function seedDemoProject() {
  if (global.__SEEDED__) return;
  
  const now = new Date().toISOString();
  const demoId = 'proj-demo';
  
  // Only seed if no projects exist
  if (projects.size > 0) return;

  const demoProject: Project = {
    id: demoId,
    name: 'Demo: Metropolitan Medical Center',
    owner: 'NYC Health + Hospitals',
    location: 'Manhattan, NY',
    status: 'active',
    progress: 65,
    documentCount: 1,
    openIssues: 3,
    selectedScopes: ['21', '22', '26'],
    createdAt: now,
    lastActive: 'Just now',
  };

  // Pre-loaded drawing package for instant demo
  const demoPackage = {
    id: 'pkg-demo-mep',
    name: 'MEP Drawing Package - Phase 1',
    type: 'package' as const,
    discipline: 'MEP',
    status: 'processed' as const,
    pageCount: 47,
    uploadDate: '2026-02-18',
    conflictCount: 4,
    sheets: [
      { id: 'demo-e001', sheetNumber: 'E-001', title: 'Electrical Site Plan', discipline: 'Electrical', page: 1, status: 'processed' as const, conflictCount: 1 },
      { id: 'demo-e101', sheetNumber: 'E-101', title: 'Lighting Plan Level 1', discipline: 'Electrical', page: 2, status: 'processed' as const, conflictCount: 0 },
      { id: 'demo-e102', sheetNumber: 'E-102', title: 'Lighting Plan Level 2', discipline: 'Electrical', page: 3, status: 'processed' as const, conflictCount: 2 },
      { id: 'demo-e201', sheetNumber: 'E-201', title: 'Panel Schedules', discipline: 'Electrical', page: 6, status: 'processed' as const, conflictCount: 1 },
      { id: 'demo-p001', sheetNumber: 'P-001', title: 'Plumbing Site Plan', discipline: 'Plumbing', page: 12, status: 'processed' as const, conflictCount: 0 },
      { id: 'demo-p101', sheetNumber: 'P-101', title: 'Plumbing Plan Level 1', discipline: 'Plumbing', page: 13, status: 'processed' as const, conflictCount: 0 },
      { id: 'demo-fp001', sheetNumber: 'FP-001', title: 'Fire Protection Site Plan', discipline: 'Fire Protection', page: 20, status: 'processed' as const, conflictCount: 0 },
      { id: 'demo-fp101', sheetNumber: 'FP-101', title: 'Sprinkler Plan Level 1', discipline: 'Fire Protection', page: 21, status: 'processing' as const, conflictCount: 0 },
    ],
  };

  // Demo issues
  const demoIssues: Issue[] = [
    {
      id: 'demo-issue-1',
      projectId: demoId,
      title: 'Panel E-201 shows 42 circuits but riser indicates 36 spaces',
      description: 'Conflict between panel schedule and riser diagram. Need clarification from electrical engineer.',
      status: 'open',
      priority: 'high',
      trade: 'Electrical',
      sourceDocument: 'E-201 Panel Schedules',
      createdAt: now,
      contextId: 'demo-e201',
      contextType: 'drawing',
    },
    {
      id: 'demo-issue-2',
      projectId: demoId,
      title: 'Sprinkler head coverage gap in Room 205',
      description: 'Drawing FP-101 shows insufficient head coverage. May need additional heads or layout revision.',
      status: 'open',
      priority: 'medium',
      trade: 'Fire Protection',
      sourceDocument: 'FP-101 Sprinkler Plan',
      createdAt: now,
      contextId: 'demo-fp101',
      contextType: 'drawing',
    },
    {
      id: 'demo-rfi-1',
      projectId: demoId,
      title: 'RFI-001: Voltage specification discrepancy',
      description: 'Spec calls for 480V, single line shows 208V. Which is correct?',
      status: 'open',
      priority: 'high',
      trade: 'Electrical',
      isRFI: true,
      rfiId: 'RFI-001',
      rfiStatus: 'draft',
      createdAt: now,
    },
  ];

  // Demo documents
  const demoDocs = [
    { id: 'doc-demo-1', name: 'MEP Drawing Package - Phase 1.pdf', type: 'drawing', status: 'processed', conflictCount: 4 },
  ];

  projects.set(demoId, demoProject);
  contexts.set(demoId, {
    scopes: [
      { division: '21', name: 'Fire Suppression', progress: 80 },
      { division: '22', name: 'Plumbing', progress: 60 },
      { division: '26', name: 'Electrical', progress: 55 },
    ],
    documents: demoDocs,
    materials: [],
  });
  
  // Store the package in a custom context field for demo
  (contexts.get(demoId) as any).packages = [demoPackage];
  issues.set(demoId, demoIssues);
  uploadedDocuments.set(demoId, []);

  global.__SEEDED__ = true;
  console.log('✅ Demo project seeded: Metropolitan Medical Center');
}

seedDemoProject();
