export interface Point {
  x: number;
  y: number;
}

export interface Measurement {
  id: string;
  type: 'line' | 'count' | 'area';
  points: Point[];
  value: number; // LF for lines, count for counts, SF for areas
  unit: string;
  label?: string;
  jocItem?: JOCItem;
  color: string;
}

export interface JOCItem {
  code: string;
  description: string;
  unit: string;
  unitPrice: number;
  division: string;
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

export type Tool = 'select' | 'pan' | 'line' | 'count' | 'area' | 'calibrate';
