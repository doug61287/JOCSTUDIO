export interface Point {
  x: number;
  y: number;
}

export interface MeasurementStyle {
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineWidth: number; // 1-6
  fontSize: number; // 10-18
  showValue: boolean;
  showItemName: boolean;
  showCost: boolean;
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
  style?: MeasurementStyle; // Formatting options
  // Space-specific fields
  spaceName?: string;
  perimeter?: number; // LF for spaces
  finishes?: SpaceFinish[];
}

// Default formatting style
export const DEFAULT_STYLE: MeasurementStyle = {
  lineStyle: 'solid',
  lineWidth: 3,
  fontSize: 12,
  showValue: true,
  showItemName: true,
  showCost: false,
};

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
