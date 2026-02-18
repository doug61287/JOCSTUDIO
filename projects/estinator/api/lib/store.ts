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

// ── Seed real workspace projects ──────────────────────────────────────────────
// These are our actual active projects. New projects/issues added via the UI
// persist for the lifetime of the serverless instance (warm cache).
// TODO: migrate to Vercel Postgres/Supabase for true persistence.

function seedWorkspace() {
  if (global.__SEEDED__) return;
  if (projects.size > 0) return;

  const now = new Date().toISOString();

  const workspaceProjects: Project[] = [
    {
      id: 'proj-jochero',
      name: 'JOCHero',
      owner: 'Doug + Bai',
      location: 'jocstudio.vercel.app · jochero.com',
      status: 'active',
      progress: 75,
      documentCount: 0,
      openIssues: 3,
      selectedScopes: [],
      createdAt: now,
      lastActive: 'Today',
    },
    {
      id: 'proj-builderbrain',
      name: 'BuilderBrain',
      owner: 'Doug + Bai',
      location: 'estinator.vercel.app',
      status: 'active',
      progress: 55,
      documentCount: 0,
      openIssues: 5,
      selectedScopes: [],
      createdAt: now,
      lastActive: 'Today',
    },
    {
      id: 'proj-pod',
      name: 'POD Agent',
      owner: 'Doug + Bai',
      location: 'skills/pod-agent · Etsy/Printify pipeline',
      status: 'active',
      progress: 40,
      documentCount: 0,
      openIssues: 6,
      selectedScopes: [],
      createdAt: now,
      lastActive: 'Today',
    },
    {
      id: 'proj-hobart',
      name: 'Hobart',
      owner: 'Doug + Bai',
      location: 'WhatsApp job search bot · +19284137385',
      status: 'active',
      progress: 70,
      documentCount: 0,
      openIssues: 4,
      selectedScopes: [],
      createdAt: now,
      lastActive: 'Today',
    },
  ];

  const workspaceIssues: Record<string, Issue[]> = {
    'proj-jochero': [
      {
        id: 'ji-1', projectId: 'proj-jochero', status: 'open', priority: 'high',
        title: 'Demo with second FP/Plumbing contractor',
        description: 'First demo validated — "Definitely on to something!" Need second round to refine pitch and land first paying design partner. Target mid-size MEP or GC in NYC.',
        trade: 'Sales', createdAt: now,
      },
      {
        id: 'ji-2', projectId: 'proj-jochero', status: 'open', priority: 'medium',
        title: 'Add HVAC / Division 23 assemblies',
        description: 'Next trade after FP + Plumbing. Map duct, VAV, FCU, AHU tasks from H+H catalogue. Follow same pattern as fire-protection-assemblies.ts.',
        trade: 'Engineering', createdAt: now,
      },
      {
        id: 'ji-3', projectId: 'proj-jochero', status: 'open', priority: 'medium',
        title: 'Add Electrical / Division 26 assemblies',
        description: 'Map conduit, panel, device, lighting tasks from H+H catalogue. Completes the major MEP trade set (FP ✅ Plumbing ✅ HVAC → Electrical).',
        trade: 'Engineering', createdAt: now,
      },
    ],
    'proj-builderbrain': [
      {
        id: 'bb-1', projectId: 'proj-builderbrain', status: 'open', priority: 'high',
        title: 'Vision extraction for drawing packages',
        description: 'Step 2 of C→B→A plan. Parse real drawing index from uploaded PDFs using Claude vision API. Sheet list auto-populates from PDF instead of being manually entered.',
        trade: 'Backend', createdAt: now,
      },
      {
        id: 'bb-2', projectId: 'proj-builderbrain', status: 'open', priority: 'high',
        title: 'Replace in-memory store with persistent DB',
        description: 'Global Maps reset on Vercel cold starts — data disappears between sessions. Migrate to Supabase or Vercel Postgres. Projects, docs, issues, conversations all need true persistence.',
        trade: 'Backend', createdAt: now,
      },
      {
        id: 'bb-3', projectId: 'proj-builderbrain', status: 'open', priority: 'high',
        title: 'Find first design partner (equity deal)',
        description: 'Palantir model: design partner gets equity in outcomes in exchange for access + feedback. Use JOCHero demo as the foot in the door. Target NYC MEP sub or mid-size GC.',
        trade: 'Sales', createdAt: now,
      },
      {
        id: 'bb-4', projectId: 'proj-builderbrain', status: 'open', priority: 'medium',
        title: 'Embed 18GB training corpus for RAG',
        description: '2,190 PDFs at training-data/ (Bellevue, Jacobi + real project docs). Embed into vector store so AI answers are grounded in real construction documents.',
        trade: 'AI/ML', createdAt: now,
      },
      {
        id: 'bb-5', projectId: 'proj-builderbrain', status: 'open', priority: 'medium',
        title: 'Trade coverage scoring from real uploads',
        description: 'Scope tab shows empty state. Compute real trade coverage % when docs are uploaded: parse discipline from filename/content → assign to CSI division → update progress bars.',
        trade: 'Frontend', createdAt: now,
      },
    ],
    'proj-pod': [
      {
        id: 'pod-1', projectId: 'proj-pod', status: 'open', priority: 'high',
        title: '⏳ DOUG: Get IDEOGRAM_API_KEY',
        description: 'Module 2 (design-gen.js) is blocked. Sign up at ideogram.ai — free tier gives 25 images/day. Add IDEOGRAM_API_KEY to skills/pod-agent/.env. Unblocks AI design generation.',
        trade: 'Blocked — Doug', createdAt: now,
      },
      {
        id: 'pod-2', projectId: 'proj-pod', status: 'open', priority: 'high',
        title: '⏳ DOUG: Get PRINTIFY_API_KEY',
        description: 'Modules 3 + 5 (mockup-engine.js, publisher.js) are blocked. Get at printify.com → Account → Connections → API. Add PRINTIFY_API_KEY to .env. Unblocks mockup creation.',
        trade: 'Blocked — Doug', createdAt: now,
      },
      {
        id: 'pod-3', projectId: 'proj-pod', status: 'open', priority: 'high',
        title: '⏳ DOUG: Get ETSY_API_KEY + ETSY_ACCESS_TOKEN',
        description: 'Module 4 (publisher.js) is blocked. Register app at developer.etsy.com → generate API key + OAuth access token. Add both to .env. Unblocks Etsy draft listing creation.',
        trade: 'Blocked — Doug', createdAt: now,
      },
      {
        id: 'pod-4', projectId: 'proj-pod', status: 'open', priority: 'high',
        title: 'Run full 7-module pipeline (cat-mom)',
        description: 'Once all 3 API keys are added: run ./skills/pod-agent/scripts/run-pipeline.sh cat-mom. All modules fire: trend → design → mockup → listing → advertorial → publish → track.',
        trade: 'Launch', createdAt: now,
      },
      {
        id: 'pod-5', projectId: 'proj-pod', status: 'open', priority: 'medium',
        title: 'Host advertorials on GitHub Pages',
        description: 'Module 7 generates HTML in generated/advertorials/. Push to GitHub Pages for a static host. Each listing gets its own URL. Wire into Meta ad campaigns.',
        trade: 'Marketing', createdAt: now,
      },
      {
        id: 'pod-6', projectId: 'proj-pod', status: 'open', priority: 'medium',
        title: 'Launch first Meta ad campaign (cat-mom)',
        description: 'Target: women 28-50, interests cats + Etsy + gifts. Use meta_ad_hook from generated/advertorials/*.json as ad copy. Budget: $10-20/day test. Measure CTR + CVR.',
        trade: 'Marketing', createdAt: now,
      },
    ],
    'proj-hobart': [
      {
        id: 'hb-1', projectId: 'proj-hobart', status: 'open', priority: 'high',
        title: '⏳ DOUG: Activate WhatsApp (QR scan needed)',
        description: 'Hobart is fully built and configured but WhatsApp connection is not active. Steps: (1) run "openclaw gateway restart" in terminal, (2) scan QR code that appears on screen, (3) +19284137385 goes live. Takes ~2 minutes.',
        trade: 'Blocked — Doug', createdAt: now,
      },
      {
        id: 'hb-2', projectId: 'proj-hobart', status: 'open', priority: 'high',
        title: 'Generate first 5 invite codes + send to testers',
        description: 'Hobart is invite-only ("someone trusted you with a code" vibe). Generate 5 codes and give to trade workers in your network. Track usage, gather feedback on job match quality.',
        trade: 'Growth', createdAt: now,
      },
      {
        id: 'hb-3', projectId: 'proj-hobart', status: 'open', priority: 'medium',
        title: 'Test Hobart with a real job seeker',
        description: 'Invite one trade worker to actually use the bot. Validate: job search is relevant, company research is useful, interview prep lands. Iterate on job-search.js based on feedback.',
        trade: 'Testing', createdAt: now,
      },
      {
        id: 'hb-4', projectId: 'proj-hobart', status: 'open', priority: 'low',
        title: 'Add LinkedIn + ZipRecruiter job sources',
        description: 'Currently using JobSpy (hybrid Indeed scraping). Adding LinkedIn and ZipRecruiter improves match coverage for trade/construction roles. Update job-search.js sources array.',
        trade: 'Backend', createdAt: now,
      },
    ],
  };

  workspaceProjects.forEach(p => {
    projects.set(p.id, p);
    contexts.set(p.id, { scopes: [], documents: [], materials: [] });
    issues.set(p.id, workspaceIssues[p.id] ?? []);
    uploadedDocuments.set(p.id, []);
  });

  global.__SEEDED__ = true;
}

seedWorkspace();
