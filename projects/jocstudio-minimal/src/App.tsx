import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// ==================== TYPES ====================

type MeasurementType = 'count' | 'length' | 'area' | 'volume'

interface Point {
  id: string
  x: number
  y: number
}

interface Marker extends Point {
  label: string
}

interface LineSegment {
  points: Point[]
  totalLength: number // in LF (using scale factor)
}

interface AreaPolygon {
  points: Point[]
  totalArea: number // in SF
}

interface VolumeData {
  area: AreaPolygon
  depth: number // in feet
  totalVolume: number // in CF
}

interface Measurement {
  id: string
  name: string
  type: MeasurementType
  layerId: string
  spaceId?: string
  parentId?: string
  // Count data
  count: number
  markers: Marker[]
  // Length data
  lineSegments: LineSegment[]
  // Area data
  areaPolygons: AreaPolygon[]
  // Volume data
  volumeData: VolumeData[]
  // JOC data
  jocCode?: string
  jocDescription?: string
  jocPrice?: number
  jocUnit?: string
}

interface Layer {
  id: string
  name: string
  color: string
  visible: boolean
  locked: boolean
}

interface Space {
  id: string
  name: string
  boundary: Point[]
  color: string
}

interface Sheet {
  id: string
  name: string
  pageNumber: number
}

interface Project {
  id: string
  name: string
  client: string
  date: string
  description: string
  measurements: Measurement[]
  layers: Layer[]
  spaces: Space[]
  sheets: Sheet[]
  scaleFactor: number // pixels to feet
}

// ==================== CONSTANTS ====================

const MEP_CATALOG = [
  { code: '21 13 16 00-0100', unit: 'EA', description: 'Sprinkler Head, Pendant, Standard Response, 155°F, Chrome', unitPrice: 45.50 },
  { code: '21 13 16 00-0101', unit: 'EA', description: 'Sprinkler Head, Pendant, Standard Response, 175°F, Chrome', unitPrice: 48.25 },
  { code: '21 13 16 00-0200', unit: 'EA', description: 'Sprinkler Head, Upright, Standard Response, 155°F, Chrome', unitPrice: 43.25 },
  { code: '21 13 16 00-1100', unit: 'EA', description: 'Sprinkler Head, Pendant, Quick Response, 155°F, Chrome', unitPrice: 52.00 },
  { code: '21 13 16 00-2100', unit: 'EA', description: 'Sprinkler Head, Concealed, 155°F, White Cover Plate', unitPrice: 78.50 },
  { code: '21 13 13 00-0281', unit: 'LF', description: "2' Long, 3/4\" Stainless Steel Flexible Sprinkler Piping", unitPrice: 89.41 },
  { code: '21 13 13 00-0282', unit: 'LF', description: "3' Long, 3/4\" Stainless Steel Flexible Sprinkler Piping", unitPrice: 98.35 },
  { code: '21 13 13 00-1001', unit: 'LF', description: '1" Black Steel Pipe, Schedule 40', unitPrice: 8.50 },
  { code: '21 13 13 00-1002', unit: 'LF', description: '2" Black Steel Pipe, Schedule 40', unitPrice: 14.75 },
  { code: '21 13 19 00-1001', unit: 'EA', description: 'Gate Valve, OS&Y, 4", Flanged, Cast Iron', unitPrice: 485.00 },
  { code: '21 13 19 00-2001', unit: 'EA', description: 'Butterfly Valve, 4", Grooved, with Tamper Switch', unitPrice: 385.00 },
  { code: '21 13 19 00-5001', unit: 'EA', description: 'Flow Switch, 2" IPS, Water Flow Detector', unitPrice: 185.00 },
  { code: '26 52 16 00-1100', unit: 'EA', description: 'Smoke Detector, Photoelectric, Ceiling Mount', unitPrice: 145.00 },
  { code: '26 52 16 00-3100', unit: 'EA', description: 'Horn/Strobe, Wall Mount, White, 15/75 cd', unitPrice: 185.00 },
  { code: '26 05 33 00-1001', unit: 'LF', description: 'EMT Conduit, 3/4", Galvanized Steel', unitPrice: 4.50 },
  { code: '26 05 33 00-1002', unit: 'LF', description: 'EMT Conduit, 1", Galvanized Steel', unitPrice: 6.25 },
  { code: '31 23 16 00-1001', unit: 'CF', description: 'Excavation, Earth, Machine', unitPrice: 2.50 },
  { code: '31 23 16 00-2001', unit: 'CF', description: 'Trenching, 24" Wide x 36" Deep', unitPrice: 4.25 },
  { code: '32 12 16 00-1001', unit: 'SF', description: 'Asphalt Paving, 2" Thick', unitPrice: 3.75 },
  { code: '32 13 13 00-1001', unit: 'SF', description: 'Concrete Slab, 4" Thick, 3000 PSI', unitPrice: 8.50 },
]

const DEFAULT_LAYERS: Layer[] = [
  { id: 'layer-1', name: 'Sprinkler Heads', color: '#ef4444', visible: true, locked: false },
  { id: 'layer-2', name: 'Piping', color: '#3b82f6', visible: true, locked: false },
  { id: 'layer-3', name: 'Fire Alarm', color: '#f59e0b', visible: true, locked: false },
  { id: 'layer-4', name: 'Electrical', color: '#8b5cf6', visible: true, locked: false },
]

const LAYER_COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

const THEME = {
  trustBlue: '#1e40af',
  trustBlueDark: '#1e3a8a',
  trustBlueSoft: 'rgba(30, 64, 175, 0.1)',
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  accentGreen: '#059669',
  accentAmber: '#d97706',
  accentRed: '#dc2626',
}

const STORAGE_KEY = 'jocstudio-project'

// ==================== UTILITY FUNCTIONS ====================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function calculateDistance(p1: Point, p2: Point, scaleFactor: number): number {
  const dx = (p2.x - p1.x) * scaleFactor
  const dy = (p2.y - p1.y) * scaleFactor
  return Math.sqrt(dx * dx + dy * dy)
}

function calculatePolygonArea(points: Point[], scaleFactor: number): number {
  if (points.length < 3) return 0
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += (points[i].x * scaleFactor) * (points[j].y * scaleFactor)
    area -= (points[j].x * scaleFactor) * (points[i].y * scaleFactor)
  }
  return Math.abs(area / 2)
}

function getMeasurementValue(m: Measurement): number {
  switch (m.type) {
    case 'count':
      return m.count
    case 'length':
      return m.lineSegments.reduce((sum, seg) => sum + seg.totalLength, 0)
    case 'area':
      return m.areaPolygons.reduce((sum, poly) => sum + poly.totalArea, 0)
    case 'volume':
      return m.volumeData.reduce((sum, vol) => sum + vol.totalVolume, 0)
    default:
      return 0
  }
}

function getMeasurementUnit(type: MeasurementType, jocUnit?: string): string {
  if (jocUnit) return jocUnit
  switch (type) {
    case 'count': return 'EA'
    case 'length': return 'LF'
    case 'area': return 'SF'
    case 'volume': return 'CF'
  }
}

function exportToCSV(project: Project, measurements: Measurement[]): void {
  const headers = ['Item', 'Layer', 'Space', 'Type', 'Quantity', 'Unit', 'JOC Code', 'Description', 'Unit Price', 'Total']
  const rows = measurements.map(m => {
    const layer = project.layers.find(l => l.id === m.layerId)
    const space = project.spaces.find(s => s.id === m.spaceId)
    const qty = getMeasurementValue(m)
    const unit = getMeasurementUnit(m.type, m.jocUnit)
    const total = (m.jocPrice || 0) * qty
    return [
      m.name,
      layer?.name || '',
      space?.name || '',
      m.type.toUpperCase(),
      qty.toFixed(2),
      unit,
      m.jocCode || '',
      m.jocDescription || '',
      m.jocPrice?.toFixed(2) || '',
      total.toFixed(2)
    ]
  })
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '_')}_takeoff.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ==================== HOOKS ====================

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(newValue))
      return newValue
    })
  }, [key])

  return [storedValue, setValue]
}

// ==================== COMPONENTS ====================

interface LayersPanelProps {
  layers: Layer[]
  onUpdate: (layers: Layer[]) => void
  selectedLayerId: string
  onSelect: (id: string) => void
  isMobile: boolean
}

function LayersPanel({ layers, onUpdate, selectedLayerId, onSelect, isMobile }: LayersPanelProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const addLayer = () => {
    if (!newName.trim()) return
    const newLayer: Layer = {
      id: generateId(),
      name: newName.trim(),
      color: LAYER_COLORS[layers.length % LAYER_COLORS.length],
      visible: true,
      locked: false
    }
    onUpdate([...layers, newLayer])
    setNewName('')
    setIsAdding(false)
  }

  const toggleVisibility = (id: string) => {
    onUpdate(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
  }

  const toggleLock = (id: string) => {
    onUpdate(layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l))
  }

  const updateColor = (id: string, color: string) => {
    onUpdate(layers.map(l => l.id === id ? { ...l, color } : l))
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Layers</span>
        <button onClick={() => setIsAdding(true)} style={{
          padding: '4px 10px', fontSize: 12, borderRadius: 6,
          border: `1px solid ${THEME.trustBlue}`, background: 'transparent',
          color: THEME.trustBlue, cursor: 'pointer'
        }}>+ Add</button>
      </div>
      
      {isAdding && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Layer name..."
            style={{
              flex: 1, padding: '8px 10px', fontSize: 13, borderRadius: 6,
              border: `1px solid ${THEME.borderSubtle}`, background: THEME.bgTertiary
            }}
            onKeyDown={e => e.key === 'Enter' && addLayer()}
            autoFocus
          />
          <button onClick={addLayer} style={{
            padding: '8px 12px', fontSize: 12, borderRadius: 6,
            border: 'none', background: THEME.trustBlue, color: 'white', cursor: 'pointer'
          }}>✓</button>
        </div>
      )}

      {layers.map(layer => (
        <div
          key={layer.id}
          onClick={() => onSelect(layer.id)}
          style={{
            padding: isMobile ? 12 : 10,
            marginBottom: 6,
            borderRadius: 8,
            background: selectedLayerId === layer.id ? THEME.trustBlueSoft : THEME.bgTertiary,
            border: `1px solid ${selectedLayerId === layer.id ? THEME.trustBlue : THEME.borderSubtle}`,
            cursor: 'pointer',
            opacity: layer.visible ? 1 : 0.5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              onClick={e => { e.stopPropagation(); }}
              style={{
                width: 20, height: 20, borderRadius: 4,
                background: layer.color, cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input
                type="color"
                value={layer.color}
                onChange={e => updateColor(layer.id, e.target.value)}
                style={{
                  position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer'
                }}
              />
            </div>
            <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{layer.name}</span>
            <button
              onClick={e => { e.stopPropagation(); toggleVisibility(layer.id) }}
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14, opacity: layer.visible ? 1 : 0.4
              }}
            >{layer.visible ? '👁️' : '👁️‍🗨️'}</button>
            <button
              onClick={e => { e.stopPropagation(); toggleLock(layer.id) }}
              style={{
                width: 28, height: 28, borderRadius: 6,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 14
              }}
            >{layer.locked ? '🔒' : '🔓'}</button>
          </div>
        </div>
      ))}
    </div>
  )
}

interface SpacesPanelProps {
  spaces: Space[]
  onUpdate: (spaces: Space[]) => void
  selectedSpaceId: string | null
  onSelect: (id: string | null) => void
  isDefiningSpace: boolean
  onStartDefining: () => void
  isMobile: boolean
}

function SpacesPanel({ spaces, onUpdate, selectedSpaceId, onSelect, isDefiningSpace, onStartDefining, isMobile }: SpacesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startEdit = (space: Space) => {
    setEditingId(space.id)
    setEditName(space.name)
  }

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return
    onUpdate(spaces.map(s => s.id === editingId ? { ...s, name: editName.trim() } : s))
    setEditingId(null)
    setEditName('')
  }

  const deleteSpace = (id: string) => {
    onUpdate(spaces.filter(s => s.id !== id))
    if (selectedSpaceId === id) onSelect(null)
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Spaces & Rooms</span>
        <button 
          onClick={onStartDefining} 
          disabled={isDefiningSpace}
          style={{
            padding: '4px 10px', fontSize: 12, borderRadius: 6,
            border: `1px solid ${isDefiningSpace ? THEME.textTertiary : THEME.trustBlue}`,
            background: isDefiningSpace ? THEME.bgTertiary : 'transparent',
            color: isDefiningSpace ? THEME.textTertiary : THEME.trustBlue, 
            cursor: isDefiningSpace ? 'not-allowed' : 'pointer'
          }}
        >{isDefiningSpace ? 'Drawing...' : '+ Define'}</button>
      </div>

      <button
        onClick={() => onSelect(null)}
        style={{
          width: '100%', padding: isMobile ? 12 : 10, marginBottom: 6,
          borderRadius: 8, textAlign: 'left',
          background: selectedSpaceId === null ? THEME.trustBlueSoft : THEME.bgTertiary,
          border: `1px solid ${selectedSpaceId === null ? THEME.trustBlue : THEME.borderSubtle}`,
          cursor: 'pointer', fontSize: 13, fontWeight: 500
        }}
      >All Spaces</button>

      {spaces.map(space => (
        <div
          key={space.id}
          onClick={() => onSelect(space.id)}
          style={{
            padding: isMobile ? 12 : 10,
            marginBottom: 6,
            borderRadius: 8,
            background: selectedSpaceId === space.id ? THEME.trustBlueSoft : THEME.bgTertiary,
            border: `1px solid ${selectedSpaceId === space.id ? THEME.trustBlue : THEME.borderSubtle}`,
            cursor: 'pointer'
          }}
        >
          {editingId === space.id ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                style={{
                  flex: 1, padding: '6px 8px', fontSize: 13, borderRadius: 4,
                  border: `1px solid ${THEME.borderSubtle}`
                }}
                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                autoFocus
              />
              <button onClick={saveEdit} style={{
                padding: '6px 10px', fontSize: 12, borderRadius: 4,
                border: 'none', background: THEME.trustBlue, color: 'white', cursor: 'pointer'
              }}>✓</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 16, height: 16, borderRadius: 3,
                background: space.color, opacity: 0.6
              }} />
              <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{space.name}</span>
              <button
                onClick={e => { e.stopPropagation(); startEdit(space) }}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12
                }}
              >✏️</button>
              <button
                onClick={e => { e.stopPropagation(); deleteSpace(space.id) }}
                style={{
                  width: 24, height: 24, borderRadius: 4,
                  border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12
                }}
              >🗑️</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

interface ProjectInfoPanelProps {
  project: Project
  onUpdate: (project: Project) => void
  onExport: () => void
  onSave: () => void
  onLoad: () => void
  isMobile: boolean
}

function ProjectInfoPanel({ project, onUpdate, onExport, onSave, onLoad, isMobile }: ProjectInfoPanelProps) {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: THEME.textSecondary, display: 'block', marginBottom: 4 }}>Project Name</label>
        <input
          value={project.name}
          onChange={e => onUpdate({ ...project, name: e.target.value })}
          style={{
            width: '100%', padding: '8px 10px', fontSize: 14, borderRadius: 6,
            border: `1px solid ${THEME.borderSubtle}`, background: THEME.bgTertiary
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: THEME.textSecondary, display: 'block', marginBottom: 4 }}>Client</label>
        <input
          value={project.client}
          onChange={e => onUpdate({ ...project, client: e.target.value })}
          style={{
            width: '100%', padding: '8px 10px', fontSize: 14, borderRadius: 6,
            border: `1px solid ${THEME.borderSubtle}`, background: THEME.bgTertiary
          }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: THEME.textSecondary, display: 'block', marginBottom: 4 }}>Date</label>
        <input
          type="date"
          value={project.date}
          onChange={e => onUpdate({ ...project, date: e.target.value })}
          style={{
            width: '100%', padding: '8px 10px', fontSize: 14, borderRadius: 6,
            border: `1px solid ${THEME.borderSubtle}`, background: THEME.bgTertiary
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, color: THEME.textSecondary, display: 'block', marginBottom: 4 }}>Scale Factor (px/ft)</label>
        <input
          type="number"
          value={project.scaleFactor}
          onChange={e => onUpdate({ ...project, scaleFactor: parseFloat(e.target.value) || 1 })}
          style={{
            width: '100%', padding: '8px 10px', fontSize: 14, borderRadius: 6,
            border: `1px solid ${THEME.borderSubtle}`, background: THEME.bgTertiary
          }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onSave} style={{
          padding: isMobile ? 14 : 12, borderRadius: 8,
          border: 'none', background: THEME.trustBlue, color: 'white',
          fontWeight: 600, cursor: 'pointer', fontSize: 14
        }}>💾 Save Project</button>
        <button onClick={onLoad} style={{
          padding: isMobile ? 14 : 12, borderRadius: 8,
          border: `1px solid ${THEME.trustBlue}`, background: 'transparent',
          color: THEME.trustBlue, fontWeight: 600, cursor: 'pointer', fontSize: 14
        }}>📂 Load Project</button>
        <button onClick={onExport} style={{
          padding: isMobile ? 14 : 12, borderRadius: 8,
          border: `1px solid ${THEME.accentGreen}`, background: 'transparent',
          color: THEME.accentGreen, fontWeight: 600, cursor: 'pointer', fontSize: 14
        }}>📊 Export CSV</button>
      </div>
    </div>
  )
}

interface MeasurementItemProps {
  measurement: Measurement
  layer: Layer | undefined
  space: Space | undefined
  children: Measurement[]
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggleExpand: () => void
  onUpdateCount: (delta: number) => void
  onAssignJoc: () => void
  onDelete: () => void
  isMobile: boolean
}

function MeasurementItem({
  measurement: m, layer, space, children, isSelected, isExpanded,
  onSelect, onToggleExpand, onUpdateCount, onAssignJoc, onDelete, isMobile
}: MeasurementItemProps) {
  const value = getMeasurementValue(m)
  const unit = getMeasurementUnit(m.type, m.jocUnit)
  const hasChildren = children.length > 0
  const childrenTotal = children.reduce((sum, c) => sum + getMeasurementValue(c) * (c.jocPrice || 0), 0)
  const itemTotal = value * (m.jocPrice || 0)
  const rollupTotal = itemTotal + childrenTotal

  const typeIcon = {
    count: '📍',
    length: '📏',
    area: '⬛',
    volume: '📦'
  }[m.type]

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        onClick={onSelect}
        style={{
          padding: isMobile ? 14 : 12,
          borderRadius: 8,
          background: isSelected ? THEME.trustBlueSoft : THEME.bgTertiary,
          border: `2px solid ${isSelected ? THEME.trustBlue : (layer?.color || THEME.borderSubtle)}`,
          cursor: 'pointer',
          borderLeft: `4px solid ${layer?.color || THEME.trustBlue}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasChildren && (
            <button
              onClick={e => { e.stopPropagation(); onToggleExpand() }}
              style={{
                width: 24, height: 24, borderRadius: 4,
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 12, transform: isExpanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.2s'
              }}
            >▶</button>
          )}
          <span style={{ fontSize: 16 }}>{typeIcon}</span>
          <span style={{ flex: 1, fontWeight: 600, fontSize: isMobile ? 15 : 14 }}>{m.name}</span>
          
          {m.type === 'count' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={(e) => { e.stopPropagation(); onUpdateCount(-1) }} style={{
                width: isMobile ? 32 : 26, height: isMobile ? 32 : 26,
                fontSize: isMobile ? 16 : 14, borderRadius: 6,
                border: `1px solid ${THEME.borderSubtle}`,
                background: THEME.bgSecondary, cursor: 'pointer'
              }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: isMobile ? 16 : 14 }}>{m.count}</span>
              <button onClick={(e) => { e.stopPropagation(); onUpdateCount(1) }} style={{
                width: isMobile ? 32 : 26, height: isMobile ? 32 : 26,
                fontSize: isMobile ? 16 : 14, borderRadius: 6,
                border: `1px solid ${THEME.borderSubtle}`,
                background: THEME.bgSecondary, cursor: 'pointer'
              }}>+</button>
            </div>
          )}
          
          {m.type !== 'count' && (
            <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 14 }}>
              {value.toFixed(1)} {unit}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          {layer && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: layer.color + '20', color: layer.color
            }}>{layer.name}</span>
          )}
          {space && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: THEME.bgSecondary, color: THEME.textSecondary
            }}>{space.name}</span>
          )}
        </div>

        {m.jocCode ? (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: THEME.trustBlue }}>{m.jocCode}</div>
            <div style={{ fontSize: 12, color: THEME.textSecondary, marginTop: 2 }}>{m.jocDescription}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: THEME.accentGreen }}>
                ${itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              {hasChildren && (
                <span style={{ fontSize: 12, color: THEME.textSecondary }}>
                  Total: ${rollupTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={(e) => { e.stopPropagation(); onAssignJoc() }} style={{
              fontSize: 12, padding: '6px 12px', borderRadius: 6,
              border: `1px dashed ${THEME.trustBlue}`, background: 'transparent',
              color: THEME.trustBlue, cursor: 'pointer'
            }}>+ Assign JOC</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete() }} style={{
              fontSize: 12, padding: '6px 12px', borderRadius: 6,
              border: `1px solid ${THEME.accentRed}`, background: 'transparent',
              color: THEME.accentRed, cursor: 'pointer'
            }}>🗑️</button>
          </div>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div style={{ marginLeft: 20, marginTop: 8, paddingLeft: 12, borderLeft: `2px solid ${layer?.color || THEME.borderSubtle}` }}>
          {children.map(child => {
            const childValue = getMeasurementValue(child)
            const childUnit = getMeasurementUnit(child.type, child.jocUnit)
            return (
              <div key={child.id} style={{
                padding: 8, marginBottom: 4, borderRadius: 6,
                background: THEME.bgSecondary, fontSize: 13
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{child.name}</span>
                  <span style={{ fontWeight: 600 }}>{childValue.toFixed(1)} {childUnit}</span>
                </div>
                {child.jocPrice && (
                  <div style={{ fontSize: 12, color: THEME.accentGreen, marginTop: 2 }}>
                    ${(childValue * child.jocPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==================== MAIN APP ====================

export default function App() {
  const isMobile = useIsMobile()
  
  // PDF State
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(isMobile ? 0.6 : 1)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Project State
  const [project, setProject] = useLocalStorage<Project>(STORAGE_KEY, {
    id: generateId(),
    name: 'New Project',
    client: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    measurements: [],
    layers: DEFAULT_LAYERS,
    spaces: [],
    sheets: [],
    scaleFactor: 10 // 10 pixels = 1 foot default
  })

  // UI State
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null)
  const [selectedLayerId, setSelectedLayerId] = useState(project.layers[0]?.id || '')
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<MeasurementType | 'space' | 'select'>('count')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [showJocPicker, setShowJocPicker] = useState(false)
  const [jocSearch, setJocSearch] = useState('')
  const [sidebarTab, setSidebarTab] = useState<'measurements' | 'layers' | 'spaces' | 'project'>('measurements')

  // Drawing state for lines/areas/spaces
  const [currentPoints, setCurrentPoints] = useState<Point[]>([])
  const [isDefiningSpace, setIsDefiningSpace] = useState(false)

  // Derived state
  const measurements = project.measurements
  const layers = project.layers
  const spaces = project.spaces

  const setMeasurements = useCallback((fn: (prev: Measurement[]) => Measurement[]) => {
    setProject(prev => ({ ...prev, measurements: fn(prev.measurements) }))
  }, [setProject])

  const setLayers = useCallback((newLayers: Layer[]) => {
    setProject(prev => ({ ...prev, layers: newLayers }))
  }, [setProject])

  const setSpaces = useCallback((newSpaces: Space[]) => {
    setProject(prev => ({ ...prev, spaces: newSpaces }))
  }, [setProject])

  // Filter measurements by space
  const filteredMeasurements = useMemo(() => {
    let filtered = measurements
    if (selectedSpaceId) {
      filtered = filtered.filter(m => m.spaceId === selectedSpaceId)
    }
    // Only show parent-level items (children are nested)
    return filtered.filter(m => !m.parentId)
  }, [measurements, selectedSpaceId])

  // Get children for a measurement
  const getChildren = useCallback((parentId: string) => {
    return measurements.filter(m => m.parentId === parentId)
  }, [measurements])

  // Visible measurements based on layer visibility
  const visibleMeasurements = useMemo(() => {
    const visibleLayerIds = new Set(layers.filter(l => l.visible).map(l => l.id))
    return measurements.filter(m => visibleLayerIds.has(m.layerId))
  }, [measurements, layers])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') return
    setPdfLoading(true)
    setPdfError(null)
    setPdfFile(file)
    setPdfUrl(URL.createObjectURL(file))
    // Create default sheets
    setProject(prev => ({
      ...prev,
      sheets: [{ id: '1', name: file.name, pageNumber: 1 }]
    }))
  }, [setProject])

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setPdfLoading(false)
    setPdfError(null)
    setNumPages(numPages)
    // Update sheets for all pages
    setProject(prev => ({
      ...prev,
      sheets: Array.from({ length: numPages }, (_, i) => ({
        id: String(i + 1),
        name: `Sheet ${i + 1}`,
        pageNumber: i + 1
      }))
    }))
  }

  function onDocumentLoadError(error: Error) {
    setPdfLoading(false)
    setPdfError(`Failed to load PDF: ${error.message}`)
    console.error('PDF load error:', error)
  }

  const addMeasurement = useCallback((type: MeasurementType = 'count') => {
    const typeNames = { count: 'Count', length: 'Length', area: 'Area', volume: 'Volume' }
    const existingOfType = measurements.filter(m => m.type === type).length
    const newMeasurement: Measurement = {
      id: generateId(),
      name: `${typeNames[type]} ${existingOfType + 1}`,
      type,
      layerId: selectedLayerId,
      spaceId: selectedSpaceId || undefined,
      count: 0,
      markers: [],
      lineSegments: [],
      areaPolygons: [],
      volumeData: []
    }
    setMeasurements(prev => [...prev, newMeasurement])
    setSelectedMeasurement(newMeasurement.id)
    setActiveTool(type)
  }, [measurements, selectedLayerId, selectedSpaceId, setMeasurements])

  const addChildMeasurement = useCallback((parentId: string, type: MeasurementType = 'count') => {
    const parent = measurements.find(m => m.id === parentId)
    if (!parent) return
    const existingChildren = measurements.filter(m => m.parentId === parentId).length
    const newMeasurement: Measurement = {
      id: generateId(),
      name: `${parent.name} - Child ${existingChildren + 1}`,
      type,
      layerId: parent.layerId,
      spaceId: parent.spaceId,
      parentId,
      count: 0,
      markers: [],
      lineSegments: [],
      areaPolygons: [],
      volumeData: []
    }
    setMeasurements(prev => [...prev, newMeasurement])
    setSelectedMeasurement(newMeasurement.id)
  }, [measurements, setMeasurements])

  const handlePdfClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newPoint: Point = { id: generateId(), x, y }

    // Space definition mode
    if (isDefiningSpace) {
      setCurrentPoints(prev => [...prev, newPoint])
      return
    }

    const selectedM = measurements.find(m => m.id === selectedMeasurement)
    const layer = layers.find(l => l.id === selectedM?.layerId)
    
    if (layer?.locked) return

    // Count mode
    if (activeTool === 'count' && selectedMeasurement) {
      const newMarker: Marker = {
        ...newPoint,
        label: String((selectedM?.count || 0) + 1)
      }
      setMeasurements(prev => prev.map(m => {
        if (m.id === selectedMeasurement) {
          return { ...m, count: m.count + 1, markers: [...m.markers, newMarker] }
        }
        return m
      }))
    }

    // Length mode
    if (activeTool === 'length' && selectedMeasurement) {
      setCurrentPoints(prev => [...prev, newPoint])
    }

    // Area mode
    if (activeTool === 'area' && selectedMeasurement) {
      setCurrentPoints(prev => [...prev, newPoint])
    }

    // Volume mode (same as area, depth is set separately)
    if (activeTool === 'volume' && selectedMeasurement) {
      setCurrentPoints(prev => [...prev, newPoint])
    }
  }, [selectedMeasurement, activeTool, measurements, layers, isDefiningSpace, setMeasurements])

  // Complete current line/area/volume
  const completeShape = useCallback(() => {
    if (currentPoints.length < 2) {
      setCurrentPoints([])
      return
    }

    if (isDefiningSpace && currentPoints.length >= 3) {
      const newSpace: Space = {
        id: generateId(),
        name: `Space ${spaces.length + 1}`,
        boundary: currentPoints,
        color: LAYER_COLORS[spaces.length % LAYER_COLORS.length]
      }
      setSpaces([...spaces, newSpace])
      setCurrentPoints([])
      setIsDefiningSpace(false)
      return
    }

    const selectedM = measurements.find(m => m.id === selectedMeasurement)
    if (!selectedM) {
      setCurrentPoints([])
      return
    }

    if (activeTool === 'length') {
      let totalLength = 0
      for (let i = 0; i < currentPoints.length - 1; i++) {
        totalLength += calculateDistance(currentPoints[i], currentPoints[i + 1], project.scaleFactor / 100)
      }
      const newSegment: LineSegment = { points: [...currentPoints], totalLength }
      setMeasurements(prev => prev.map(m => {
        if (m.id === selectedMeasurement) {
          return { ...m, lineSegments: [...m.lineSegments, newSegment] }
        }
        return m
      }))
    }

    if (activeTool === 'area' && currentPoints.length >= 3) {
      const totalArea = calculatePolygonArea(currentPoints, project.scaleFactor / 100)
      const newPolygon: AreaPolygon = { points: [...currentPoints], totalArea }
      setMeasurements(prev => prev.map(m => {
        if (m.id === selectedMeasurement) {
          return { ...m, areaPolygons: [...m.areaPolygons, newPolygon] }
        }
        return m
      }))
    }

    if (activeTool === 'volume' && currentPoints.length >= 3) {
      const totalArea = calculatePolygonArea(currentPoints, project.scaleFactor / 100)
      const depth = parseFloat(prompt('Enter depth in feet:', '3') || '3')
      const newVolume: VolumeData = {
        area: { points: [...currentPoints], totalArea },
        depth,
        totalVolume: totalArea * depth
      }
      setMeasurements(prev => prev.map(m => {
        if (m.id === selectedMeasurement) {
          return { ...m, volumeData: [...m.volumeData, newVolume] }
        }
        return m
      }))
    }

    setCurrentPoints([])
  }, [currentPoints, selectedMeasurement, activeTool, project.scaleFactor, measurements, spaces, isDefiningSpace, setMeasurements, setSpaces])

  // Cancel current drawing
  const cancelDrawing = useCallback(() => {
    setCurrentPoints([])
    setIsDefiningSpace(false)
  }, [])

  const updateCount = useCallback((id: string, delta: number) => {
    setMeasurements(prev => prev.map(m => {
      if (m.id === id) {
        const newCount = Math.max(0, m.count + delta)
        return {
          ...m,
          count: newCount,
          markers: delta > 0
            ? [...m.markers, { id: generateId(), x: 50, y: 50, label: String(newCount) }]
            : m.markers.slice(0, -1)
        }
      }
      return m
    }))
  }, [setMeasurements])

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id && m.parentId !== id))
    if (selectedMeasurement === id) setSelectedMeasurement(null)
  }, [selectedMeasurement, setMeasurements])

  const assignJoc = useCallback((measurementId: string, item: typeof MEP_CATALOG[0]) => {
    setMeasurements(prev => prev.map(m =>
      m.id === measurementId ? {
        ...m,
        jocCode: item.code,
        jocDescription: item.description,
        jocPrice: item.unitPrice,
        jocUnit: item.unit
      } : m
    ))
    setShowJocPicker(false)
  }, [setMeasurements])

  const filteredCatalog = MEP_CATALOG.filter(item =>
    item.description.toLowerCase().includes(jocSearch.toLowerCase()) ||
    item.code.includes(jocSearch)
  )

  // Totals
  const totalCost = measurements.reduce((sum, m) => sum + (m.jocPrice || 0) * getMeasurementValue(m), 0)
  const totalCounts = measurements.filter(m => m.type === 'count').reduce((sum, m) => sum + m.count, 0)
  const totalLength = measurements.filter(m => m.type === 'length').reduce((sum, m) => sum + getMeasurementValue(m), 0)
  const totalArea = measurements.filter(m => m.type === 'area').reduce((sum, m) => sum + getMeasurementValue(m), 0)

  const saveProject = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    alert('Project saved!')
  }, [project])

  const loadProject = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const loaded = JSON.parse(saved) as Project
      setProject(loaded)
      alert('Project loaded!')
    }
  }, [setProject])

  const handleExport = useCallback(() => {
    exportToCSV(project, measurements)
  }, [project, measurements])

  // Landing screen
  if (!pdfFile || !pdfUrl) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${THEME.bgPrimary} 0%, ${THEME.bgTertiary} 100%)`,
        color: THEME.textPrimary,
        padding: isMobile ? 24 : 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{
            width: isMobile ? 56 : 48,
            height: isMobile ? 56 : 48,
            background: `linear-gradient(135deg, ${THEME.trustBlue}, ${THEME.trustBlueDark})`,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 28 : 24,
            color: 'white',
            fontWeight: 700
          }}>J</div>
          <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 700 }}>JOCstudio</h1>
        </div>
        <p style={{
          color: THEME.textSecondary,
          marginBottom: isMobile ? 32 : 40,
          fontSize: isMobile ? 15 : 16,
          textAlign: 'center'
        }}>Professional Construction Takeoff • Kreo-Style Tools</p>

        <label style={{
          padding: isMobile ? '48px 32px' : '60px 80px',
          border: `2px dashed ${THEME.trustBlue}`,
          borderRadius: 16,
          cursor: 'pointer',
          background: THEME.bgSecondary,
          textAlign: 'center',
          maxWidth: isMobile ? '90%' : 'auto'
        }}>
          <div style={{ fontSize: isMobile ? '3.5rem' : '3rem', marginBottom: 16 }}>📋</div>
          <p style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', fontWeight: 500 }}>Drop PDF drawings here</p>
          <p style={{
            fontSize: isMobile ? 14 : 15,
            color: THEME.textTertiary,
            marginTop: 8
          }}>or tap to browse</p>
          <input type="file" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>

        <div style={{ marginTop: 32, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['📍 Count', '📏 Length', '⬛ Area', '📦 Volume'].map(tool => (
            <span key={tool} style={{
              padding: '8px 16px', borderRadius: 8,
              background: THEME.bgSecondary, fontSize: 14,
              color: THEME.textSecondary
            }}>{tool}</span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: THEME.bgPrimary }}>
      {/* Top Bar */}
      <div style={{
        height: isMobile ? 56 : 60,
        background: `linear-gradient(to right, ${THEME.trustBlueDark}, ${THEME.trustBlue})`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 24px',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: isMobile ? 16 : 18, flexShrink: 0 }}>JOCstudio</span>
          <span style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: isMobile ? 12 : 14,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{project.name || pdfFile.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {isMobile && (
            <button onClick={() => setShowMobileSidebar(true)} style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.15)', color: 'white',
              border: '1px solid rgba(255,255,255,0.25)',
              fontWeight: 600, cursor: 'pointer', fontSize: 13
            }}>📋 {measurements.length}</button>
          )}
          
          {/* Add measurement dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => addMeasurement(activeTool as MeasurementType || 'count')} style={{
              padding: isMobile ? '10px 14px' : '10px 18px',
              borderRadius: 8,
              background: 'white', color: THEME.trustBlue,
              border: 'none', fontWeight: 600, cursor: 'pointer',
              fontSize: isMobile ? 13 : 14
            }}>{isMobile ? '+' : '+ New Measurement'}</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar - Desktop: always visible, Mobile: overlay */}
        {(!isMobile || showMobileSidebar) && (
          <div style={{
            width: isMobile ? '85%' : 320,
            maxWidth: 360,
            background: THEME.bgSecondary,
            borderRight: `1px solid ${THEME.borderSubtle}`,
            display: 'flex',
            flexDirection: 'column',
            position: isMobile ? 'absolute' : 'relative',
            zIndex: isMobile ? 50 : 1,
            height: '100%',
            boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.3)' : 'none'
          }}>
            {isMobile && (
              <div style={{
                padding: 16,
                borderBottom: `1px solid ${THEME.borderSubtle}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, color: THEME.trustBlue }}>Takeoff Panel</span>
                <button onClick={() => setShowMobileSidebar(false)} style={{
                  width: 32, height: 32, borderRadius: 6,
                  border: 'none', background: THEME.bgTertiary,
                  cursor: 'pointer', fontSize: 18
                }}>✕</button>
              </div>
            )}

            {/* Sidebar Tabs */}
            <div style={{
              display: 'flex', borderBottom: `1px solid ${THEME.borderSubtle}`,
              background: THEME.bgTertiary
            }}>
              {(['measurements', 'layers', 'spaces', 'project'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSidebarTab(tab)}
                  style={{
                    flex: 1, padding: isMobile ? 14 : 12,
                    border: 'none', cursor: 'pointer',
                    background: sidebarTab === tab ? THEME.bgSecondary : 'transparent',
                    color: sidebarTab === tab ? THEME.trustBlue : THEME.textSecondary,
                    fontWeight: sidebarTab === tab ? 600 : 400,
                    fontSize: isMobile ? 11 : 12,
                    borderBottom: sidebarTab === tab ? `2px solid ${THEME.trustBlue}` : '2px solid transparent'
                  }}
                >
                  {tab === 'measurements' && '📋'}
                  {tab === 'layers' && '📑'}
                  {tab === 'spaces' && '🏠'}
                  {tab === 'project' && '⚙️'}
                  <br />{tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {sidebarTab === 'measurements' && (
                <div style={{ padding: 8 }}>
                  {/* Quick add buttons */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, padding: '0 4px' }}>
                    {(['count', 'length', 'area', 'volume'] as MeasurementType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => addMeasurement(type)}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 6,
                          border: `1px solid ${THEME.borderSubtle}`,
                          background: THEME.bgTertiary, cursor: 'pointer',
                          fontSize: 11, display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: 2
                        }}
                      >
                        <span style={{ fontSize: 16 }}>
                          {type === 'count' ? '📍' : type === 'length' ? '📏' : type === 'area' ? '⬛' : '📦'}
                        </span>
                        <span>{type}</span>
                      </button>
                    ))}
                  </div>

                  {filteredMeasurements.map(m => {
                    const layer = layers.find(l => l.id === m.layerId)
                    const space = spaces.find(s => s.id === m.spaceId)
                    const children = getChildren(m.id)
                    return (
                      <MeasurementItem
                        key={m.id}
                        measurement={m}
                        layer={layer}
                        space={space}
                        children={children}
                        isSelected={selectedMeasurement === m.id}
                        isExpanded={expandedItems.has(m.id)}
                        onSelect={() => {
                          setSelectedMeasurement(m.id)
                          setActiveTool(m.type)
                          if (isMobile) setShowMobileSidebar(false)
                        }}
                        onToggleExpand={() => {
                          setExpandedItems(prev => {
                            const next = new Set(prev)
                            if (next.has(m.id)) next.delete(m.id)
                            else next.add(m.id)
                            return next
                          })
                        }}
                        onUpdateCount={(delta) => updateCount(m.id, delta)}
                        onAssignJoc={() => {
                          setSelectedMeasurement(m.id)
                          setShowJocPicker(true)
                          if (isMobile) setShowMobileSidebar(false)
                        }}
                        onDelete={() => deleteMeasurement(m.id)}
                        isMobile={isMobile}
                      />
                    )
                  })}

                  {filteredMeasurements.length === 0 && (
                    <div style={{
                      padding: 24, textAlign: 'center',
                      color: THEME.textTertiary, fontSize: 14
                    }}>
                      No measurements yet.<br />
                      Use the buttons above to add one.
                    </div>
                  )}

                  {/* Add child button for selected measurement */}
                  {selectedMeasurement && (
                    <div style={{ padding: 8, borderTop: `1px solid ${THEME.borderSubtle}`, marginTop: 8 }}>
                      <button
                        onClick={() => addChildMeasurement(selectedMeasurement, 'count')}
                        style={{
                          width: '100%', padding: 10, borderRadius: 6,
                          border: `1px dashed ${THEME.textTertiary}`,
                          background: 'transparent', cursor: 'pointer',
                          fontSize: 13, color: THEME.textSecondary
                        }}
                      >+ Add Child to Selected</button>
                    </div>
                  )}
                </div>
              )}

              {sidebarTab === 'layers' && (
                <LayersPanel
                  layers={layers}
                  onUpdate={setLayers}
                  selectedLayerId={selectedLayerId}
                  onSelect={setSelectedLayerId}
                  isMobile={isMobile}
                />
              )}

              {sidebarTab === 'spaces' && (
                <SpacesPanel
                  spaces={spaces}
                  onUpdate={setSpaces}
                  selectedSpaceId={selectedSpaceId}
                  onSelect={setSelectedSpaceId}
                  isDefiningSpace={isDefiningSpace}
                  onStartDefining={() => {
                    setIsDefiningSpace(true)
                    setCurrentPoints([])
                    if (isMobile) setShowMobileSidebar(false)
                  }}
                  isMobile={isMobile}
                />
              )}

              {sidebarTab === 'project' && (
                <ProjectInfoPanel
                  project={project}
                  onUpdate={setProject}
                  onExport={handleExport}
                  onSave={saveProject}
                  onLoad={loadProject}
                  isMobile={isMobile}
                />
              )}
            </div>

            {/* Summary Footer */}
            <div style={{
              padding: 12, borderTop: `1px solid ${THEME.borderSubtle}`,
              background: THEME.bgTertiary, fontSize: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>Counts: {totalCounts}</span>
                <span>Length: {totalLength.toFixed(0)} LF</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Area: {totalArea.toFixed(0)} SF</span>
                <span style={{ fontWeight: 700, color: THEME.accentGreen }}>
                  Est: ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PDF Canvas */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'auto',
          padding: isMobile ? 12 : 20,
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Mobile Overlay Backdrop */}
          {isMobile && showMobileSidebar && (
            <div
              onClick={() => setShowMobileSidebar(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 40
              }}
            />
          )}

          {/* Tools Panel */}
          <div style={{
            position: 'absolute',
            right: isMobile ? 12 : 24,
            top: isMobile ? 12 : 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 10
          }}>
            {([
              { tool: 'select', icon: '👆', label: 'Select' },
              { tool: 'count', icon: '📍', label: 'Count' },
              { tool: 'length', icon: '📏', label: 'Length' },
              { tool: 'area', icon: '⬛', label: 'Area' },
              { tool: 'volume', icon: '📦', label: 'Volume' },
              { tool: 'space', icon: '🏠', label: 'Space' }
            ] as const).map(({ tool, icon, label }) => (
              <button
                key={tool}
                onClick={() => {
                  if (tool === 'space') {
                    setIsDefiningSpace(true)
                    setCurrentPoints([])
                  } else {
                    setActiveTool(tool)
                    setIsDefiningSpace(false)
                  }
                }}
                title={label}
                style={{
                  width: isMobile ? 48 : 44,
                  height: isMobile ? 48 : 44,
                  borderRadius: 10,
                  background: (activeTool === tool || (tool === 'space' && isDefiningSpace)) ? THEME.trustBlue : 'white',
                  color: (activeTool === tool || (tool === 'space' && isDefiningSpace)) ? 'white' : THEME.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: isMobile ? 22 : 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >{icon}</button>
            ))}
          </div>

          {/* Drawing mode indicator */}
          {(currentPoints.length > 0 || isDefiningSpace) && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: isMobile ? 12 : 24,
              transform: 'translateX(-50%)',
              background: THEME.trustBlue,
              color: 'white',
              padding: '10px 20px',
              borderRadius: 8,
              zIndex: 10,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <span style={{ fontSize: 14 }}>
                {isDefiningSpace ? '🏠 Defining Space' : activeTool === 'length' ? '📏 Drawing Line' : '⬛ Drawing Area'}
                {' '}({currentPoints.length} points)
              </span>
              <button onClick={completeShape} style={{
                padding: '6px 14px', borderRadius: 6,
                border: 'none', background: 'white', color: THEME.trustBlue,
                fontWeight: 600, cursor: 'pointer', fontSize: 13
              }}>Complete</button>
              <button onClick={cancelDrawing} style={{
                padding: '6px 14px', borderRadius: 6,
                border: '1px solid white', background: 'transparent', color: 'white',
                fontWeight: 600, cursor: 'pointer', fontSize: 13
              }}>Cancel</button>
            </div>
          )}

          {/* Sheets Navigation (left side) */}
          {project.sheets.length > 1 && !isMobile && (
            <div style={{
              position: 'absolute',
              left: 24,
              top: 24,
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 10,
              maxHeight: 300,
              overflow: 'auto'
            }}>
              {project.sheets.map(sheet => (
                <button
                  key={sheet.id}
                  onClick={() => setCurrentPage(sheet.pageNumber)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    border: 'none',
                    borderBottom: `1px solid ${THEME.borderSubtle}`,
                    background: currentPage === sheet.pageNumber ? THEME.trustBlueSoft : 'transparent',
                    color: currentPage === sheet.pageNumber ? THEME.trustBlue : THEME.textSecondary,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: 13
                  }}
                >{sheet.name}</button>
              ))}
            </div>
          )}

          {/* PDF Document */}
          <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
            {pdfLoading && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                color: THEME.textSecondary
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  border: `4px solid ${THEME.borderSubtle}`,
                  borderTop: `4px solid ${THEME.trustBlue}`,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: 16
                }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p>Loading PDF...</p>
              </div>
            )}
            
            {pdfError && (
              <div style={{
                padding: 24,
                background: '#fee2e2',
                border: '1px solid #ef4444',
                borderRadius: 12,
                color: '#dc2626',
                maxWidth: 400,
                textAlign: 'center'
              }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>❌ Error Loading PDF</p>
                <p style={{ fontSize: 14 }}>{pdfError}</p>
                <button 
                  onClick={() => { setPdfError(null); setPdfUrl(null); setPdfFile(null); }}
                  style={{
                    marginTop: 16,
                    padding: '8px 16px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Try Another PDF
                </button>
              </div>
            )}
            
            {!pdfLoading && !pdfError && (
            <Document 
              file={pdfUrl} 
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
            >
              <div
                ref={pageRef}
                onClick={handlePdfClick}
                style={{
                  position: 'relative',
                  cursor: activeTool !== 'select' || isDefiningSpace ? 'crosshair' : 'default',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  touchAction: 'manipulation'
                }}
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  width={isMobile ? Math.min(window.innerWidth - 40, 600) : undefined}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />

                {/* Render spaces */}
                {spaces.map(space => (
                  <svg
                    key={space.id}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    <polygon
                      points={space.boundary.map(p => `${p.x}%,${p.y}%`).join(' ')}
                      fill={space.color + '20'}
                      stroke={space.color}
                      strokeWidth={2}
                      strokeDasharray="5,5"
                    />
                    <text
                      x={`${space.boundary.reduce((sum, p) => sum + p.x, 0) / space.boundary.length}%`}
                      y={`${space.boundary.reduce((sum, p) => sum + p.y, 0) / space.boundary.length}%`}
                      fill={space.color}
                      fontSize={12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontWeight: 600 }}
                    >{space.name}</text>
                  </svg>
                ))}

                {/* Render current drawing points */}
                {currentPoints.length > 0 && (
                  <svg
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      pointerEvents: 'none'
                    }}
                  >
                    {/* Lines between points */}
                    {currentPoints.length > 1 && (
                      <polyline
                        points={currentPoints.map(p => `${p.x}%,${p.y}%`).join(' ')}
                        fill="none"
                        stroke={isDefiningSpace ? '#10b981' : THEME.trustBlue}
                        strokeWidth={2}
                      />
                    )}
                    {/* Points */}
                    {currentPoints.map((p) => (
                      <circle
                        key={p.id}
                        cx={`${p.x}%`}
                        cy={`${p.y}%`}
                        r={6}
                        fill={isDefiningSpace ? '#10b981' : THEME.trustBlue}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </svg>
                )}

                {/* Render markers for visible measurements */}
                {visibleMeasurements.map(m => {
                  const layer = layers.find(l => l.id === m.layerId)
                  const color = layer?.color || THEME.trustBlue
                  const isSelected = selectedMeasurement === m.id

                  return (
                    <div key={m.id}>
                      {/* Count markers */}
                      {m.type === 'count' && m.markers.map((marker, idx) => (
                        <div
                          key={marker.id}
                          style={{
                            position: 'absolute',
                            left: `${marker.x}%`,
                            top: `${marker.y}%`,
                            width: isMobile ? 28 : 24,
                            height: isMobile ? 28 : 24,
                            background: color,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: isMobile ? 11 : 10,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: isSelected ? `0 0 0 3px ${color}40` : '0 2px 6px rgba(0,0,0,0.3)',
                            border: '2px solid white',
                            opacity: isSelected ? 1 : 0.8
                          }}
                        >{idx + 1}</div>
                      ))}

                      {/* Line segments */}
                      {m.type === 'length' && m.lineSegments.map((seg, segIdx) => (
                        <svg
                          key={segIdx}
                          style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none'
                          }}
                        >
                          <polyline
                            points={seg.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill="none"
                            stroke={color}
                            strokeWidth={isSelected ? 3 : 2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {seg.points.map((p, i) => (
                            <circle
                              key={i}
                              cx={`${p.x}%`}
                              cy={`${p.y}%`}
                              r={isSelected ? 5 : 4}
                              fill={color}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </svg>
                      ))}

                      {/* Area polygons */}
                      {m.type === 'area' && m.areaPolygons.map((poly, polyIdx) => (
                        <svg
                          key={polyIdx}
                          style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none'
                          }}
                        >
                          <polygon
                            points={poly.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill={color + (isSelected ? '40' : '20')}
                            stroke={color}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                        </svg>
                      ))}

                      {/* Volume (similar to area but with pattern) */}
                      {m.type === 'volume' && m.volumeData.map((vol, volIdx) => (
                        <svg
                          key={volIdx}
                          style={{
                            position: 'absolute',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            pointerEvents: 'none'
                          }}
                        >
                          <defs>
                            <pattern id={`hatch-${m.id}-${volIdx}`} patternUnits="userSpaceOnUse" width="8" height="8">
                              <path d="M0,8 L8,0" stroke={color} strokeWidth="1" opacity="0.5" />
                            </pattern>
                          </defs>
                          <polygon
                            points={vol.area.points.map(p => `${p.x}%,${p.y}%`).join(' ')}
                            fill={`url(#hatch-${m.id}-${volIdx})`}
                            stroke={color}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                        </svg>
                      ))}
                    </div>
                  )
                })}
              </div>
            </Document>
            )}
          </div>

          {/* Page controls */}
          <div style={{
            position: 'fixed',
            bottom: isMobile ? 12 : 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '8px 12px' : '10px 16px',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 20,
            alignItems: 'center'
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                padding: isMobile ? '10px 14px' : '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: currentPage <= 1 ? THEME.bgTertiary : THEME.trustBlue,
                color: currentPage <= 1 ? THEME.textTertiary : 'white',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? 18 : 14,
                fontWeight: 600
              }}
            >←</button>
            <span style={{
              fontSize: isMobile ? 15 : 14,
              fontWeight: 500,
              minWidth: isMobile ? 100 : 80,
              textAlign: 'center'
            }}>Page {currentPage} of {numPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              style={{
                padding: isMobile ? '10px 14px' : '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: currentPage >= numPages ? THEME.bgTertiary : THEME.trustBlue,
                color: currentPage >= numPages ? THEME.textTertiary : 'white',
                cursor: currentPage >= numPages ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? 18 : 14,
                fontWeight: 600
              }}
            >→</button>
            <div style={{ width: 1, height: 24, background: THEME.borderSubtle, margin: '0 4px' }} />
            <button
              onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
              style={{
                padding: isMobile ? '10px 14px' : '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: THEME.bgTertiary,
                cursor: 'pointer',
                fontSize: isMobile ? 18 : 14,
                fontWeight: 600
              }}
            >−</button>
            <span style={{
              fontSize: isMobile ? 15 : 14,
              fontWeight: 500,
              minWidth: isMobile ? 50 : 40,
              textAlign: 'center'
            }}>{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.1))}
              style={{
                padding: isMobile ? '10px 14px' : '8px 12px',
                borderRadius: 8,
                border: 'none',
                background: THEME.bgTertiary,
                cursor: 'pointer',
                fontSize: isMobile ? 18 : 14,
                fontWeight: 600
              }}
            >+</button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        height: isMobile ? 48 : 40,
        background: THEME.bgSecondary,
        borderTop: `1px solid ${THEME.borderSubtle}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 16px' : '0 24px',
        fontSize: isMobile ? 13 : 12
      }}>
        <span style={{ fontWeight: 500 }}>
          {totalCounts} counts | {totalLength.toFixed(0)} LF | {totalArea.toFixed(0)} SF | 
          Est: ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
        <span style={{ color: THEME.textSecondary }}>
          {activeTool === 'select' ? 'Select mode' :
            activeTool === 'count' ? 'Click to count' :
              activeTool === 'length' ? 'Click points, then Complete' :
                activeTool === 'area' ? 'Click polygon points' :
                  'Click to define volume area'}
        </span>
      </div>

      {/* JOC Picker Modal */}
      {showJocPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: isMobile ? '100%' : 540,
            maxHeight: isMobile ? '85vh' : '75vh',
            background: 'white',
            borderRadius: isMobile ? '16px 16px 0 0' : 12,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{
              padding: isMobile ? '20px 16px 16px' : 16,
              borderBottom: `1px solid ${THEME.borderSubtle}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: isMobile ? 18 : 16 }}>Select JOC Item</h3>
              <button
                onClick={() => setShowJocPicker(false)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  border: 'none', background: THEME.bgTertiary,
                  cursor: 'pointer', fontSize: 20
                }}
              >✕</button>
            </div>
            <div style={{ padding: isMobile ? '0 16px' : '0 16px' }}>
              <input
                type="text"
                placeholder="Search by code or description..."
                value={jocSearch}
                onChange={(e) => setJocSearch(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: isMobile ? 16 : 12,
                  padding: isMobile ? '14px 16px' : '10px 12px',
                  fontSize: isMobile ? 16 : 14,
                  borderRadius: 10,
                  border: `1px solid ${THEME.borderSubtle}`,
                  background: THEME.bgTertiary
                }}
              />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? 12 : 12 }}>
              {filteredCatalog.map(item => (
                <button
                  key={item.code}
                  onClick={() => selectedMeasurement && assignJoc(selectedMeasurement, item)}
                  style={{
                    width: '100%',
                    padding: isMobile ? 16 : 12,
                    textAlign: 'left',
                    marginBottom: 8,
                    borderRadius: 10,
                    border: `1px solid ${THEME.borderSubtle}`,
                    background: THEME.bgTertiary,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: THEME.trustBlue, fontSize: isMobile ? 12 : 11, fontWeight: 600 }}>{item.code}</div>
                      <div style={{ fontSize: isMobile ? 14 : 13, marginTop: 4, color: THEME.textPrimary }}>{item.description}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 16 }}>
                      <div style={{ color: THEME.accentGreen, fontWeight: 700, fontSize: isMobile ? 16 : 14 }}>
                        ${item.unitPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: THEME.textTertiary }}>per {item.unit}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
