import { create } from 'zustand';
import type { Project, Measurement, MeasurementGroup, Tool, JOCItem } from '../types';

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
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    id: 'demo',
    name: 'New Project',
    scale: 10, // 10 pixels = 1 foot default
    measurements: [],
    groups: [],
    coefficient: 1.0,
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
}));
