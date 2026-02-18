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

// ── Empty state — ready for real construction projects ───────────────────────
// No seed data. Projects are created by users via the UI.
// Data persists only within the same warm serverless instance.
// TODO: migrate to Vercel Postgres for true persistence across cold starts.
