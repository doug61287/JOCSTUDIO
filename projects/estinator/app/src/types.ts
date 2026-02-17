export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

export interface Source {
  name: string;
  page: string;
  type: 'drawing' | 'spec' | 'schedule' | 'addendum';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  documentCount: number;
}
