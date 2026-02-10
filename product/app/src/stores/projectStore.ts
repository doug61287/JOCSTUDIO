import { create } from 'zustand';
import type { Project, Measurement, Tool, JOCItem } from '../types';

interface ProjectState {
  project: Project | null;
  activeTool: Tool;
  selectedMeasurement: string | null;
  zoom: number;
  
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
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    id: 'demo',
    name: 'New Project',
    scale: 10, // 10 pixels = 1 foot default
    measurements: [],
    coefficient: 1.0,
    createdAt: new Date(),
  },
  activeTool: 'select',
  selectedMeasurement: null,
  zoom: 1,

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
}));
