/**
 * Custom Assembly Store
 * Manages user-created assemblies with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export interface CustomAssemblyItem {
  id: string;
  taskCode: string;
  description: string;
  unit: string;
  unitCost: number;
  quantityFactor: number;          // 1.0 = same as measurement
  quantityType: 'factor' | 'fixed' | 'input';
  fixedQty?: number;
  role: 'primary' | 'typical' | 'optional' | 'companion';
  notes?: string;
}

export interface CustomAssembly {
  id: string;
  name: string;
  description?: string;
  category: 'plumbing' | 'fire' | 'electrical' | 'general' | 'custom';
  createdAt: string;
  updatedAt: string;
  createdBy: 'user' | 'system' | 'shared';
  source?: {
    project: string;
    drawingRef?: string;
  };
  items: CustomAssemblyItem[];
  keywords: string[];
  applicableTo: ('count' | 'line' | 'area')[];
  isFavorite?: boolean;
}

// ============================================
// PRE-BUILT ASSEMBLIES (From real project patterns)
// ============================================

const PREBUILT_ASSEMBLIES: CustomAssembly[] = [
  // Fire Protection - from Jacobi sample
  {
    id: 'prebuilt-fp-sprinkler-coverage',
    name: 'Sprinkler Coverage (Head + Escutcheon)',
    description: 'Standard sprinkler head with escutcheon plate',
    category: 'fire',
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
    createdBy: 'system',
    source: { project: 'Jacobi Medical Center', drawingRef: 'FP-101' },
    keywords: ['sprinkler', 'head', 'pendant', 'pendent', 'coverage'],
    applicableTo: ['count'],
    items: [
      {
        id: 'head',
        taskCode: '21131300-0074',
        description: 'Pendent Sprinkler Head, Brass, 1/2" Orifice',
        unit: 'EA',
        unitCost: 101.97,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'primary',
      },
      {
        id: 'escutcheon',
        taskCode: '21131300-0211',
        description: 'Chrome Escutcheon Plate',
        unit: 'EA',
        unitCost: 18.53,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'typical',
        notes: '1 escutcheon per head',
      },
    ],
  },
  {
    id: 'prebuilt-fp-cpvc-run',
    name: 'CPVC Fire Pipe Run (3" with Fittings)',
    description: '3" CPVC pipe with elbow and tee allowances',
    category: 'fire',
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
    createdBy: 'system',
    source: { project: 'Jacobi Medical Center', drawingRef: 'FP-101' },
    keywords: ['cpvc', 'pipe', 'fire', 'sprinkler', '3 inch', '3"'],
    applicableTo: ['line'],
    items: [
      {
        id: 'pipe',
        taskCode: '21134100-0009',
        description: '3" Schedule 40 CPVC Fire Sprinkler Pipe',
        unit: 'LF',
        unitCost: 28.69,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'primary',
      },
      {
        id: 'elbow',
        taskCode: '21134100-0017',
        description: '3" CPVC 90° Elbow',
        unit: 'EA',
        unitCost: 117.82,
        quantityFactor: 0.05,
        quantityType: 'factor',
        role: 'companion',
        notes: '~1 elbow per 20 LF',
      },
      {
        id: 'tee',
        taskCode: '21134100-0033',
        description: '3" CPVC Tee',
        unit: 'EA',
        unitCost: 172.62,
        quantityFactor: 0.03,
        quantityType: 'factor',
        role: 'companion',
        notes: '~1 tee per 33 LF',
      },
    ],
  },
  
  // Plumbing - common patterns
  {
    id: 'prebuilt-plumb-bathroom-roughin',
    name: 'Bathroom Rough-In Package',
    description: 'Complete bathroom rough-in: WC + Lavatory + Floor Drain',
    category: 'plumbing',
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
    createdBy: 'system',
    keywords: ['bathroom', 'restroom', 'toilet', 'lav', 'rough-in', 'rough in'],
    applicableTo: ['count'],
    items: [
      {
        id: 'wc',
        taskCode: '22131300-0003',
        description: 'Floor Mounted WC Rough-In, Cast Iron',
        unit: 'EA',
        unitCost: 1336.56,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'primary',
      },
      {
        id: 'lav',
        taskCode: '22421613-0005',
        description: 'Wall Hung Lavatory, Vitreous China',
        unit: 'EA',
        unitCost: 872.14,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'primary',
      },
      {
        id: 'faucet',
        taskCode: '22413900-0009',
        description: 'Lavatory Faucet, Chrome',
        unit: 'EA',
        unitCost: 203.97,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'typical',
      },
      {
        id: 'floordrain',
        taskCode: '22131913-0003',
        description: 'Floor Drain, 6" Bronze Top',
        unit: 'EA',
        unitCost: 961.24,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'typical',
      },
      {
        id: 'flushvalve',
        taskCode: '22424300-0002',
        description: 'Manual Flush Valve, Sloan',
        unit: 'EA',
        unitCost: 352.54,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'typical',
      },
    ],
  },
  {
    id: 'prebuilt-plumb-water-heater',
    name: 'Water Heater Installation Complete',
    description: 'Electric water heater with all connections and accessories',
    category: 'plumbing',
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
    createdBy: 'system',
    keywords: ['water heater', 'hot water', 'hwh', 'electric'],
    applicableTo: ['count'],
    items: [
      {
        id: 'heater',
        taskCode: '22333016-0003',
        description: '40 Gallon Electric Water Heater',
        unit: 'EA',
        unitCost: 1565.35,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'primary',
      },
      {
        id: 'valves',
        taskCode: '22052300-0005',
        description: '1" Bronze Gate Valve',
        unit: 'EA',
        unitCost: 206.58,
        quantityFactor: 2.0,
        quantityType: 'factor',
        role: 'typical',
        notes: 'Inlet and outlet isolation valves',
      },
      {
        id: 'flexconnector',
        taskCode: '22111900-0005',
        description: 'Flexible Connector',
        unit: 'EA',
        unitCost: 45.00,
        quantityFactor: 2.0,
        quantityType: 'factor',
        role: 'typical',
      },
    ],
  },
  {
    id: 'prebuilt-plumb-galv-water',
    name: 'Galvanized Water Line (with Fittings)',
    description: '1" galvanized domestic water pipe with fittings',
    category: 'plumbing',
    createdAt: '2026-02-12T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
    createdBy: 'system',
    keywords: ['galvanized', 'galv', 'water', 'domestic', 'pipe', '1 inch', '1"'],
    applicableTo: ['line'],
    items: [
      {
        id: 'pipe',
        taskCode: '22111600-0004',
        description: '1" Schedule 40 Galvanized Steel Pipe',
        unit: 'LF',
        unitCost: 30.74,
        quantityFactor: 1.0,
        quantityType: 'factor',
        role: 'primary',
      },
      {
        id: 'elbow',
        taskCode: '22111600-0050',
        description: '1" Galvanized 90° Elbow',
        unit: 'EA',
        unitCost: 18.50,
        quantityFactor: 0.05,
        quantityType: 'factor',
        role: 'companion',
        notes: '~1 elbow per 20 LF',
      },
      {
        id: 'tee',
        taskCode: '22111600-0055',
        description: '1" Galvanized Tee',
        unit: 'EA',
        unitCost: 22.50,
        quantityFactor: 0.03,
        quantityType: 'factor',
        role: 'companion',
        notes: '~1 tee per 33 LF',
      },
    ],
  },
];

// ============================================
// STORE INTERFACE
// ============================================

interface CustomAssemblyState {
  assemblies: CustomAssembly[];
  
  // Actions
  addAssembly: (assembly: Omit<CustomAssembly, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAssembly: (id: string, updates: Partial<CustomAssembly>) => void;
  deleteAssembly: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Queries
  getAssembly: (id: string) => CustomAssembly | undefined;
  searchAssemblies: (query: string) => CustomAssembly[];
  getByCategory: (category: CustomAssembly['category']) => CustomAssembly[];
  getFavorites: () => CustomAssembly[];
  
  // Import/Export
  exportAssemblies: () => string;
  importAssemblies: (json: string, mode: 'merge' | 'replace') => number;
  
  // Initialize with prebuilt
  initializePrebuilt: () => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useCustomAssemblyStore = create<CustomAssemblyState>()(
  persist(
    (set, get) => ({
      assemblies: [],
      
      addAssembly: (assembly) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();
        
        const newAssembly: CustomAssembly = {
          ...assembly,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          assemblies: [...state.assemblies, newAssembly],
        }));
        
        return id;
      },
      
      updateAssembly: (id, updates) => {
        set((state) => ({
          assemblies: state.assemblies.map((a) =>
            a.id === id
              ? { ...a, ...updates, updatedAt: new Date().toISOString() }
              : a
          ),
        }));
      },
      
      deleteAssembly: (id) => {
        set((state) => ({
          assemblies: state.assemblies.filter((a) => a.id !== id),
        }));
      },
      
      toggleFavorite: (id) => {
        set((state) => ({
          assemblies: state.assemblies.map((a) =>
            a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
          ),
        }));
      },
      
      getAssembly: (id) => {
        return get().assemblies.find((a) => a.id === id);
      },
      
      searchAssemblies: (query) => {
        const q = query.toLowerCase().trim();
        if (!q) return get().assemblies;
        
        return get().assemblies.filter((a) => {
          const nameMatch = a.name.toLowerCase().includes(q);
          const keywordMatch = a.keywords.some((k) => k.toLowerCase().includes(q));
          const descMatch = a.description?.toLowerCase().includes(q);
          return nameMatch || keywordMatch || descMatch;
        });
      },
      
      getByCategory: (category) => {
        return get().assemblies.filter((a) => a.category === category);
      },
      
      getFavorites: () => {
        return get().assemblies.filter((a) => a.isFavorite);
      },
      
      exportAssemblies: () => {
        const userAssemblies = get().assemblies.filter((a) => a.createdBy === 'user');
        return JSON.stringify({
          version: '1.0',
          exportedAt: new Date().toISOString(),
          assemblies: userAssemblies,
        }, null, 2);
      },
      
      importAssemblies: (json, mode) => {
        try {
          const data = JSON.parse(json);
          const imported = data.assemblies as CustomAssembly[];
          
          if (mode === 'replace') {
            // Keep system assemblies, replace user assemblies
            const systemAssemblies = get().assemblies.filter((a) => a.createdBy === 'system');
            set({ assemblies: [...systemAssemblies, ...imported] });
          } else {
            // Merge - add new, skip duplicates by name
            const existingNames = new Set(get().assemblies.map((a) => a.name));
            const newAssemblies = imported.filter((a) => !existingNames.has(a.name));
            set((state) => ({
              assemblies: [...state.assemblies, ...newAssemblies],
            }));
          }
          
          return imported.length;
        } catch (e) {
          console.error('Failed to import assemblies:', e);
          return 0;
        }
      },
      
      initializePrebuilt: () => {
        const existing = get().assemblies;
        const existingIds = new Set(existing.map((a) => a.id));
        
        // Add prebuilt assemblies that don't already exist
        const newPrebuilt = PREBUILT_ASSEMBLIES.filter((a) => !existingIds.has(a.id));
        
        if (newPrebuilt.length > 0) {
          set((state) => ({
            assemblies: [...state.assemblies, ...newPrebuilt],
          }));
        }
      },
    }),
    {
      name: 'jochero-custom-assemblies',
      version: 1,
    }
  )
);

// Initialize prebuilt assemblies on first load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useCustomAssemblyStore.getState().initializePrebuilt();
  }, 100);
}
