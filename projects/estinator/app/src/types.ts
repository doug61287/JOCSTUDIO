// Types
export interface Room {
  id: string;
  number: string;
  name: string;
  area: number;
  finishes: {
    floor: string;
    walls: string;
    ceiling: string;
  };
  doors: Door[];
  issues: number;
  thumbnail: string;
}

export interface Door {
  id: string;
  number: string;
  size: string;
  type: string;
  hardware?: string;
}

export interface Insight {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: string;
  title: string;
  description: string;
  roomNumbers?: string[];
  action: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'drawing' | 'spec' | 'addendum';
  status: 'analyzed' | 'processing' | 'error';
  size: string;
  issues?: number;
  thumbnail: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  rooms: number;
  doors: number;
  issues: number;
  documents: number;
  lastUpdated: string;
  thumbnail: string;
}

export type ViewMode = 'grid' | 'list';
export type TabType = 'overview' | 'rooms' | 'documents' | 'insights';
