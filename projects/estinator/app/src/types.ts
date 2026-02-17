export interface Project {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  status: 'active' | 'archived' | 'completed';
  dueDate?: string;
  cycle: {
    currentWeek: number;
    totalWeeks: number;
  };
}

export interface RFI {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'resolved' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId: string;
  source: string;
  createdAt: string;
  assignedTo?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'schedule' | 'other';
  uploadedAt: string;
  size: string;
}

export type ViewType = 'rfis' | 'documents' | 'timeline' | 'settings';

export interface Shortcut {
  key: string;
  description: string;
  modifiers?: ('cmd' | 'shift' | 'alt' | 'ctrl')[];
}
