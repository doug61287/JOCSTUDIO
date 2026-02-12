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
  pageNumber: number; // PDF page this measurement belongs to (1-indexed)
  name?: string; // User-defined takeoff name (e.g., "Wall Demo/Patch Back")
  label?: string; // Legacy - use name instead
  jocItem?: JOCItem; // Legacy single item - use jocItems instead
  jocItems?: JOCItem[]; // Multiple JOC items for this measurement
  color: string;
  groupId?: string; // Reference to parent group
  style?: MeasurementStyle; // Formatting options
  flagId?: string; // Link to a flag if this measurement has one
  visible?: boolean; // Visibility toggle for canvas display
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

// Flag types - "Flag, don't assume!"
export type FlagType = 'assumption' | 'question' | 'rfi' | 'discrepancy' | 'missing' | 'verify';

export interface Flag {
  id: string;
  type: FlagType;
  title: string;
  description?: string;
  measurementId?: string; // Link to specific measurement
  pageNumber?: number; // Drawing page reference
  status: 'open' | 'resolved' | 'deferred';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export const FLAG_COLORS: Record<FlagType, string> = {
  assumption: '#f59e0b', // amber
  question: '#3b82f6',   // blue
  rfi: '#8b5cf6',        // purple
  discrepancy: '#ef4444', // red
  missing: '#ec4899',    // pink
  verify: '#06b6d4',     // cyan
};

export const FLAG_ICONS: Record<FlagType, string> = {
  assumption: '⚠️',
  question: '❓',
  rfi: '📋',
  discrepancy: '🔴',
  missing: '❌',
  verify: '🔍',
};

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

// Import complexity factor type
import type { ComplexityFactor } from '../utils/complexityFactors';

export interface Project {
  id: string;
  name: string;
  pdfFile?: File;
  pdfUrl?: string;
  scale: number; // pixels per foot
  measurements: Measurement[];
  groups: MeasurementGroup[];
  flags: Flag[]; // "Flag, don't assume!"
  coefficient: number;
  complexityFactors?: ComplexityFactor[]; // "Handle separately at the end"
  createdAt: Date;
}

export type Tool = 'select' | 'pan' | 'text' | 'line' | 'polyline' | 'count' | 'area' | 'space' | 'calibrate';

// ============================================
// ASSEMBLY SYSTEM - The Translation Engine
// ============================================

// A single item in an assembly with quantity modifier
export interface AssemblyItem {
  jocItem: JOCItem;
  quantityFactor: number; // Multiplier (1.0 = same as measurement, 2.0 = double, etc.)
  notes?: string; // e.g., "2 coats", "both sides"
}

// A reusable assembly/recipe of JOC items
export interface Assembly {
  id: string;
  name: string; // User-facing name: "Wall Patch", "Door Install"
  description?: string;
  category: AssemblyCategory;
  keywords: string[]; // Search/match terms: ["wall", "patch", "drywall", "gypsum", "repair"]
  items: AssemblyItem[];
  applicableTo: ('line' | 'area' | 'count' | 'space')[]; // What measurement types this applies to
  createdBy: 'system' | 'user';
  usageCount?: number; // Track popularity
}

export type AssemblyCategory = 
  | 'demolition'
  | 'carpentry'
  | 'drywall'
  | 'flooring'
  | 'ceiling'
  | 'doors'
  | 'painting'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'fire-protection'
  | 'general'
  | 'custom';
