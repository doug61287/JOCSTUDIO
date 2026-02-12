import { create } from 'zustand';
import type { Project, Measurement, MeasurementGroup, Tool, JOCItem, Flag } from '../types';
import { DEFAULT_COMPLEXITY_FACTORS } from '../utils/complexityFactors';

interface ProjectState {
  project: Project | null;
  activeTool: Tool;
  selectedMeasurement: string | null;
  zoom: number;
  // Sticky item - persists selection across clicks
  activeJOCItem: JOCItem | null;
  activeGroupId: string | null;
  
  // Actions
  setProject: (project: Project) => void;
  setPdfUrl: (url: string) => void;
  setScale: (scale: number) => void;
  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  addMeasurement: (measurement: Measurement) => void;
  updateMeasurement: (id: string, updates: Partial<Measurement>) => void;
  deleteMeasurement: (id: string) => void;
  selectMeasurement: (id: string | null) => void;
  assignJOCItem: (measurementId: string, item: JOCItem) => void;
  setCoefficient: (coef: number) => void;
  // Sticky item actions
  setActiveJOCItem: (item: JOCItem | null) => void;
  setActiveGroupId: (groupId: string | null) => void;
  // Group actions
  addGroup: (group: MeasurementGroup) => void;
  updateGroup: (id: string, updates: Partial<MeasurementGroup>) => void;
  deleteGroup: (id: string) => void;
  assignToGroup: (measurementId: string, groupId: string | undefined) => void;
  // Flag actions - "Flag, don't assume!"
  addFlag: (flag: Flag) => void;
  updateFlag: (id: string, updates: Partial<Flag>) => void;
  deleteFlag: (id: string) => void;
  resolveFlag: (id: string, resolution: string) => void;
  flagMeasurement: (measurementId: string, flag: Flag) => void;
  // Complexity factor actions - "Handle separately at the end"
  toggleComplexityFactor: (factorId: string) => void;
  updateComplexityMultiplier: (factorId: string, multiplier: number) => void;
}

// Auto-load test drawing in dev mode
const DEV_TEST_PDF = import.meta.env.DEV ? '/test-drawing.pdf' : undefined;

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    id: 'demo',
    name: 'Bellevue ED Ambulance Bay',
    pdfUrl: DEV_TEST_PDF,
    scale: 18, // 1/4" = 1'-0" at 72 DPI ≈ 18 px/ft (adjust via calibration)
    measurements: [],
    groups: [],
    flags: [],
    coefficient: 1.0,
    complexityFactors: DEFAULT_COMPLEXITY_FACTORS.map(f => ({ ...f })),
    createdAt: new Date(),
  },
  activeTool: 'select',
  selectedMeasurement: null,
  zoom: 1,
  // Sticky item state - select once, click many times
  activeJOCItem: null,
  activeGroupId: null,

  setProject: (project) => set({ project }),
  
  setPdfUrl: (url) => set((state) => ({
    project: state.project ? { ...state.project, pdfUrl: url } : null
  })),
  
  setScale: (scale) => set((state) => ({
    project: state.project ? { ...state.project, scale } : null
  })),
  
  setActiveTool: (tool) => set({ activeTool: tool }),
  
  setZoom: (zoom) => set({ zoom }),
  
  addMeasurement: (measurement) => set((state) => ({
    project: state.project ? {
      ...state.project,
      measurements: [...state.project.measurements, measurement]
    } : null
  })),
  
  updateMeasurement: (id, updates) => set((state) => ({
    project: state.project ? {
      ...state.project,
      measurements: state.project.measurements.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      )
    } : null
  })),
  
  deleteMeasurement: (id) => set((state) => ({
    project: state.project ? {
      ...state.project,
      measurements: state.project.measurements.filter((m) => m.id !== id)
    } : null,
    selectedMeasurement: state.selectedMeasurement === id ? null : state.selectedMeasurement
  })),
  
  selectMeasurement: (id) => set({ selectedMeasurement: id }),
  
  assignJOCItem: (measurementId, item) => set((state) => ({
    project: state.project ? {
      ...state.project,
      measurements: state.project.measurements.map((m) =>
        m.id === measurementId ? { ...m, jocItem: item } : m
      )
    } : null
  })),
  
  setCoefficient: (coef) => set((state) => ({
    project: state.project ? { ...state.project, coefficient: coef } : null
  })),

  // Sticky item - select JOC item once, apply to multiple measurements
  setActiveJOCItem: (item) => set({ activeJOCItem: item }),
  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),

  // Group management
  addGroup: (group) => set((state) => ({
    project: state.project ? {
      ...state.project,
      groups: [...state.project.groups, group]
    } : null
  })),

  updateGroup: (id, updates) => set((state) => ({
    project: state.project ? {
      ...state.project,
      groups: state.project.groups.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      )
    } : null
  })),

  deleteGroup: (id) => set((state) => ({
    project: state.project ? {
      ...state.project,
      groups: state.project.groups.filter((g) => g.id !== id),
      // Unassign measurements from deleted group
      measurements: state.project.measurements.map((m) =>
        m.groupId === id ? { ...m, groupId: undefined } : m
      )
    } : null
  })),

  assignToGroup: (measurementId, groupId) => set((state) => ({
    project: state.project ? {
      ...state.project,
      measurements: state.project.measurements.map((m) =>
        m.id === measurementId ? { ...m, groupId } : m
      )
    } : null
  })),

  // Flag management - "Flag, don't assume!"
  addFlag: (flag) => set((state) => ({
    project: state.project ? {
      ...state.project,
      flags: [...(state.project.flags || []), flag]
    } : null
  })),

  updateFlag: (id, updates) => set((state) => ({
    project: state.project ? {
      ...state.project,
      flags: (state.project.flags || []).map((f) =>
        f.id === id ? { ...f, ...updates } : f
      )
    } : null
  })),

  deleteFlag: (id) => set((state) => ({
    project: state.project ? {
      ...state.project,
      flags: (state.project.flags || []).filter((f) => f.id !== id),
      // Remove flag reference from measurements
      measurements: state.project.measurements.map((m) =>
        m.flagId === id ? { ...m, flagId: undefined } : m
      )
    } : null
  })),

  resolveFlag: (id, resolution) => set((state) => ({
    project: state.project ? {
      ...state.project,
      flags: (state.project.flags || []).map((f) =>
        f.id === id ? { ...f, status: 'resolved' as const, resolution, resolvedAt: new Date() } : f
      )
    } : null
  })),

  flagMeasurement: (measurementId, flag) => set((state) => ({
    project: state.project ? {
      ...state.project,
      flags: [...(state.project.flags || []), flag],
      measurements: state.project.measurements.map((m) =>
        m.id === measurementId ? { ...m, flagId: flag.id } : m
      )
    } : null
  })),

  // Complexity factor actions - "Handle separately at the end"
  toggleComplexityFactor: (factorId) => set((state) => ({
    project: state.project ? {
      ...state.project,
      complexityFactors: (state.project.complexityFactors || []).map((f) =>
        f.id === factorId ? { ...f, enabled: !f.enabled } : f
      )
    } : null
  })),

  updateComplexityMultiplier: (factorId, multiplier) => set((state) => ({
    project: state.project ? {
      ...state.project,
      complexityFactors: (state.project.complexityFactors || []).map((f) =>
        f.id === factorId ? { ...f, multiplier } : f
      )
    } : null
  })),
}));
