export interface Point {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  type: 'line' | 'count' | 'area' | 'space';
  points: Point[];
  value: number; // LF for lines, count for counts, SF for areas/spaces
  unit: string;
  label?: string;
  jocItem?: JOCItem;
  color: string;
  // Space-specific fields
  spaceName?: string;
  perimeter?: number; // LF for spaces
  finishes?: SpaceFinish[];
}

export interface SpaceFinish {
  id: string;
  type: 'floor' | 'wall' | 'ceiling' | 'base' | 'paint';
  jocItem?: JOCItem;
  quantity: number; // auto-calculated from space
  unit: string;
}

export interface JOCItem {
  taskCode: string;      // JOC task code (e.g., "09290513-0045")
  code?: string;         // Alias for taskCode (backwards compatibility)
  description: string;
  unit: string;
  unitCost: number;      // Cost per unit
  unitPrice?: number;    // Alias for unitCost (backwards compatibility)
  division?: string;     // CSI division (optional)
}

export interface Project {
  id: string;
  name: string;
  pdfFile?: File;
  pdfUrl?: string;
  scale: number; // pixels per foot
  measurements: Measurement[];
  coefficient: number;
  createdAt: Date;
}

export type Tool = 'select' | 'pan' | 'line' | 'count' | 'area' | 'space' | 'calibrate';
