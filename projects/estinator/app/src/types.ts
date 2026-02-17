export interface Project {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  status: 'open' | 'submitted' | 'closed';
  dueDate?: string;
  cycle: {
    currentWeek: number;
    totalWeeks: number;
  };
  // Project details
  owner?: string;
  location?: string;
  address?: string;
  // Selected CSI scopes
  selectedScopes?: string[];
}

export type IssueStatus = 'open' | 'blocked' | 'resolved';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  trade: string;
  sourceDocument?: string;
  createdAt: string;
  resolvedAt?: string;
  // Link back to chat
  conversationId?: string;
  messageId?: string;
  // RFI tracking
  isRFI?: boolean;
  rfiId?: string;
  rfiStatus?: 'draft' | 'sent' | 'responded' | 'closed';
  // Context linking
  contextId?: string; // ID of drawing/spec/material this issue is about
  contextType?: 'drawing' | 'spec' | 'schedule' | 'material';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  // For rich content
  findings?: Finding[];
  // Actions taken
  flaggedAsIssue?: boolean;
  issueId?: string;
}

export interface Finding {
  id: string;
  number: number;
  title: string;
  description?: string;
  source?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'schedule' | 'other';
  uploadedAt: string;
  size: string;
}

export type ViewType = 'chat' | 'issues' | 'documents' | 'settings';

export interface Shortcut {
  key: string;
  description: string;
  modifiers?: ('cmd' | 'shift' | 'alt' | 'ctrl')[];
}
