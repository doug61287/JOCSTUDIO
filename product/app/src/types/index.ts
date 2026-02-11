export interface Point {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  type: 'line' | 'polyline' | 'count' | 'area' | 'space';
  points: Point[];
  value: number; // LF for lines, count for counts, SF for areas/spaces
  unit: string;
  label?: string;
  jocItem?: JOCItem;
  color: string;
  groupId?: string; // Reference to parent group
  // Space-specific fields
  spaceName?: string;
  perimeter?: number; // LF for spaces
  finishes?: SpaceFinish[];
}

export interface MeasurementGroup {
  id: string;
  name: string;
  color: string;
  expanded: boolean;
  order: number;
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
  groups: MeasurementGroup[];
  coefficient: number;
  createdAt: Date;
}

export type Tool = 'select' | 'pan' | 'text' | 'line' | 'polyline' | 'count' | 'area' | 'space' | 'calibrate';
