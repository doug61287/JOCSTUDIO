/**
 * Room Scope Aggregator
 * 
 * Combines data from multiple schedules to build a complete picture
 * of each room's scope of work.
 */

import type { ScheduleData, SheetAnalysis, ScheduleType } from './visionAnalyzer.js'

// ============================================================
// TYPES
// ============================================================

export interface RoomScope {
  roomNumber: string
  roomName: string
  area?: string
  
  // From finish schedule
  finishes?: {
    floor?: string
    base?: string
    walls?: Record<string, string>
    ceiling?: string
    ceilingHeight?: string
  }
  
  // From door schedule
  doors?: {
    doorNumber: string
    size: string
    type: string
    frame: string
    hardware: string
    fireRating?: string
    glazing?: string
    remarks?: string
  }[]
  
  // From window schedule
  windows?: {
    mark: string
    size: string
    type: string
    frame: string
    glazing: string
    sillHeight?: string
    headHeight?: string
    remarks?: string
  }[]
  
  // From plumbing fixture schedule
  plumbingFixtures?: {
    tag: string
    type: string
    manufacturer?: string
    model?: string
    connection?: string
  }[]
  
  // From mechanical/HVAC
  mechanical?: {
    diffusers?: { mark: string; type: string; size: string; cfm: string }[]
    equipment?: { tag: string; type: string; capacity?: string }[]
  }
  
  // From electrical
  electrical?: {
    panelCircuits?: { circuit: string; description: string }[]
    lightingTypes?: string[]
  }
  
  // From fire protection
  fireProtection?: {
    devices?: { type: string; coverage: string; mounting: string }[]
  }
  
  // From casework/millwork
  casework?: {
    mark: string
    type: string
    size: string
    material: string
    finish: string
  }[]
  
  // From signage
  signage?: {
    mark: string
    type: string
    message?: string
  }[]
  
  // General equipment
  equipment?: {
    tag: string
    type: string
    description: string
    source: string
  }[]
  
  // Cross-references
  relatedSheets: string[]
  specSections: string[]
}

export interface ProjectRoomIndex {
  rooms: Map<string, RoomScope>
  
  // Legends/Keys
  finishLegend: Record<string, string>
  doorTypes: Record<string, string>
  windowTypes: Record<string, string>
  wallTypes: Record<string, string>
  hardwareSets: Record<string, string>
  lightingTypes: Record<string, string>
  ceilingTypes: Record<string, string>
  
  // Non-room-specific data
  panels: Record<string, any>  // Panel name -> panel data
  mechanicalEquipment: any[]   // Building-wide equipment
}

// ============================================================
// HELPERS
// ============================================================

function getOrCreateRoom(index: ProjectRoomIndex, roomNumber: string): RoomScope {
  const normalized = roomNumber.toString().trim().toUpperCase()
  
  if (!index.rooms.has(normalized)) {
    index.rooms.set(normalized, {
      roomNumber: normalized,
      roomName: '',
      relatedSheets: [],
      specSections: []
    })
  }
  
  return index.rooms.get(normalized)!
}

function extractRoomNumber(value: string): string | null {
  if (!value) return null
  // Handle various formats: "101", "ROOM 101", "101A", etc.
  const match = value.toString().match(/(\d+[A-Za-z]?)/)
  return match ? match[1].toUpperCase() : null
}

// ============================================================
// SCHEDULE PARSERS
// ============================================================

function parseFinishSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  // Extract legend if present
  if (schedule.legend) {
    Object.assign(index.finishLegend, schedule.legend)
  }
  
  for (const row of schedule.rows) {
    const roomNum = extractRoomNumber(
      row['ROOM NO.'] || row['ROOM NUMBER'] || row['ROOM'] || row['NO.'] || row['RM']
    )
    if (!roomNum) continue
    
    const room = getOrCreateRoom(index, roomNum)
    room.roomName = row['ROOM NAME'] || row['NAME'] || room.roomName
    
    room.finishes = {
      floor: row['FLOOR'] || row['FLOOR FINISH'] || row['FLR'],
      base: row['BASE'] || row['BASE FINISH'],
      ceiling: row['CEILING'] || row['CLG'] || row['CEILING FINISH'],
      ceilingHeight: row['CEILING HT.'] || row['CLG HT'] || row['HEIGHT'] || row['CLG. HT.'],
      walls: {}
    }
    
    // Parse wall finishes
    const wallKeys = Object.keys(row).filter(k => 
      k.toUpperCase().includes('WALL') || 
      ['NORTH', 'SOUTH', 'EAST', 'WEST', 'N', 'S', 'E', 'W'].includes(k.toUpperCase())
    )
    
    for (const key of wallKeys) {
      if (row[key]) {
        room.finishes.walls![key.toUpperCase()] = row[key]
      }
    }
    
    if (row['WALLS'] && Object.keys(room.finishes.walls!).length === 0) {
      room.finishes.walls!['ALL'] = row['WALLS']
    }
  }
}

function parseDoorSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  if (schedule.legend) {
    Object.assign(index.doorTypes, schedule.legend)
  }
  
  for (const row of schedule.rows) {
    const doorNum = row['DOOR NO.'] || row['DOOR'] || row['MARK'] || row['NO.']
    if (!doorNum) continue
    
    const roomNum = extractRoomNumber(
      row['FROM ROOM'] || row['ROOM'] || row['FROM'] || doorNum
    )
    
    if (roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.doors) room.doors = []
      
      room.doors.push({
        doorNumber: doorNum,
        size: row['SIZE'] || row['OPENING SIZE'] || '',
        type: row['TYPE'] || row['DOOR TYPE'] || '',
        frame: row['FRAME'] || row['FRAME TYPE'] || '',
        hardware: row['HARDWARE SET'] || row['HDWR'] || row['HW'] || row['HARDWARE'] || '',
        fireRating: row['FIRE RATING'] || row['RATING'] || row['LABEL'],
        glazing: row['GLAZING'] || row['LITE'] || row['VISION'],
        remarks: row['REMARKS'] || row['NOTES'] || ''
      })
    }
    
    // Build legends
    const doorType = row['TYPE'] || row['DOOR TYPE']
    const doorDesc = row['TYPE DESCRIPTION'] || row['DESCRIPTION']
    if (doorType && doorDesc) {
      index.doorTypes[doorType] = doorDesc
    }
    
    const hwSet = row['HARDWARE SET'] || row['HDWR']
    const hwDesc = row['HARDWARE DESCRIPTION'] || row['HW DESC']
    if (hwSet && hwDesc) {
      index.hardwareSets[hwSet] = hwDesc
    }
  }
}

function parseWindowSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  if (schedule.legend) {
    Object.assign(index.windowTypes, schedule.legend)
  }
  
  for (const row of schedule.rows) {
    const mark = row['MARK'] || row['WINDOW'] || row['TYPE'] || row['NO.']
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'])
    
    if (mark && roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.windows) room.windows = []
      
      room.windows.push({
        mark,
        size: row['SIZE'] || row['OPENING SIZE'] || '',
        type: row['TYPE'] || row['WINDOW TYPE'] || '',
        frame: row['FRAME'] || row['FRAME TYPE'] || 'Aluminum',
        glazing: row['GLAZING'] || row['GLASS'] || '',
        sillHeight: row['SILL HT.'] || row['SILL HEIGHT'] || row['SILL'],
        headHeight: row['HEAD HT.'] || row['HEAD HEIGHT'] || row['HEAD'],
        remarks: row['REMARKS'] || ''
      })
    }
  }
}

function parseWallTypeSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const wallType = row['TYPE'] || row['WALL TYPE'] || row['MARK']
    if (wallType) {
      const desc = row['DESCRIPTION'] || row['CONSTRUCTION'] || ''
      const thickness = row['THICKNESS'] || ''
      const rating = row['FIRE RATING'] || row['STC RATING'] || ''
      
      index.wallTypes[wallType] = `${desc}${thickness ? ` (${thickness})` : ''}${rating ? ` [${rating}]` : ''}`
    }
  }
}

function parseHardwareSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const setNo = row['SET NO.'] || row['SET'] || row['HARDWARE SET']
    if (setNo) {
      const parts = []
      if (row['HINGES']) parts.push(`Hinges: ${row['HINGES']}`)
      if (row['LOCKSET']) parts.push(`Lock: ${row['LOCKSET']}`)
      if (row['CLOSER']) parts.push(`Closer: ${row['CLOSER']}`)
      if (row['STOP']) parts.push(`Stop: ${row['STOP']}`)
      
      index.hardwareSets[setNo] = parts.join('; ') || row['DESCRIPTION'] || ''
    }
  }
}

function parsePlumbingSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const tag = row['MARK'] || row['TAG'] || row['FIXTURE']
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'])
    
    if (tag && roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.plumbingFixtures) room.plumbingFixtures = []
      
      room.plumbingFixtures.push({
        tag,
        type: row['FIXTURE TYPE'] || row['TYPE'] || row['DESCRIPTION'] || '',
        manufacturer: row['MANUFACTURER'] || row['MFR'],
        model: row['MODEL'] || row['MODEL NO.'] || row['CATALOG NO.'],
        connection: row['CONNECTION'] || row['ROUGH-IN']
      })
    }
  }
}

function parseLightingSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const lightType = row['TYPE'] || row['MARK'] || row['SYMBOL']
    if (lightType) {
      const desc = [
        row['DESCRIPTION'],
        row['MANUFACTURER'],
        row['CATALOG NO.'],
        row['LAMP']
      ].filter(Boolean).join(' - ')
      
      index.lightingTypes[lightType] = desc || row['DESCRIPTION'] || ''
    }
  }
}

function parsePanelSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  const panelName = schedule.legend?.['PANEL'] || schedule.name.match(/PANEL\s+(\S+)/i)?.[1] || 'PANEL'
  
  index.panels[panelName] = {
    voltage: schedule.legend?.['VOLTAGE'],
    main: schedule.legend?.['MAIN'],
    fedFrom: schedule.legend?.['FED FROM'],
    circuits: schedule.rows.map(row => ({
      circuit: row['CKT'] || row['CIRCUIT'],
      description: row['LOAD DESCRIPTION'] || row['DESCRIPTION'] || row['LOAD'],
      breaker: row['BREAKER'] || row['BKR'],
      phase: row['PHASE']
    }))
  }
  
  // Try to associate circuits with rooms
  for (const row of schedule.rows) {
    const desc = row['LOAD DESCRIPTION'] || row['DESCRIPTION'] || ''
    const roomMatch = desc.match(/room\s*(\d+)/i)
    if (roomMatch) {
      const room = getOrCreateRoom(index, roomMatch[1])
      if (!room.electrical) room.electrical = {}
      if (!room.electrical.panelCircuits) room.electrical.panelCircuits = []
      
      room.electrical.panelCircuits.push({
        circuit: `${panelName}-${row['CKT'] || row['CIRCUIT']}`,
        description: desc
      })
    }
  }
}

function parseDiffuserSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const mark = row['MARK'] || row['TAG'] || row['SYMBOL']
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'] || row['AREA'])
    
    if (mark && roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.mechanical) room.mechanical = { diffusers: [], equipment: [] }
      if (!room.mechanical.diffusers) room.mechanical.diffusers = []
      
      room.mechanical.diffusers.push({
        mark,
        type: row['TYPE'] || row['DIFFUSER TYPE'] || '',
        size: row['SIZE'] || row['NECK SIZE'] || '',
        cfm: row['CFM'] || row['AIRFLOW'] || ''
      })
    }
  }
}

function parseMechanicalSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const tag = row['TAG'] || row['EQUIPMENT'] || row['MARK']
    const roomNum = extractRoomNumber(row['LOCATION'] || row['ROOM'] || row['AREA'])
    
    const equipment = {
      tag: tag || '',
      type: row['DESCRIPTION'] || row['TYPE'] || row['EQUIPMENT TYPE'] || '',
      capacity: row['CAPACITY'] || row['CFM'] || row['TONS'] || row['MBH'] || '',
      electrical: row['ELECTRICAL'] || row['ELEC'] || '',
      manufacturer: row['MANUFACTURER'] || row['MFR'] || ''
    }
    
    if (roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.mechanical) room.mechanical = { diffusers: [], equipment: [] }
      if (!room.mechanical.equipment) room.mechanical.equipment = []
      room.mechanical.equipment.push(equipment)
    } else {
      // Building-wide equipment
      index.mechanicalEquipment.push(equipment)
    }
  }
}

function parseFireProtectionSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'] || row['AREA'])
    
    if (roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.fireProtection) room.fireProtection = { devices: [] }
      if (!room.fireProtection.devices) room.fireProtection.devices = []
      
      room.fireProtection.devices.push({
        type: row['DEVICE TYPE'] || row['TYPE'] || row['DESCRIPTION'] || '',
        coverage: row['COVERAGE'] || row['SPACING'] || '',
        mounting: row['MOUNTING'] || row['MOUNT'] || ''
      })
    }
  }
}

function parseCaseworkSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const mark = row['MARK'] || row['TAG'] || row['NO.']
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'])
    
    if (mark && roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.casework) room.casework = []
      
      room.casework.push({
        mark,
        type: row['TYPE'] || row['DESCRIPTION'] || '',
        size: row['SIZE'] || row['DIMENSIONS'] || '',
        material: row['MATERIAL'] || '',
        finish: row['FINISH'] || ''
      })
    }
  }
}

function parseCeilingSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const ceilingType = row['TYPE'] || row['MARK'] || row['SYMBOL']
    if (ceilingType) {
      const desc = [
        row['DESCRIPTION'],
        row['MANUFACTURER'],
        row['MODEL/SIZE'] || row['SIZE'],
        row['HEIGHT']
      ].filter(Boolean).join(' - ')
      
      index.ceilingTypes[ceilingType] = desc || row['DESCRIPTION'] || ''
    }
  }
}

function parseSignageSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'])
    
    if (roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.signage) room.signage = []
      
      room.signage.push({
        mark: row['MARK'] || row['TYPE'] || row['SYMBOL'] || '',
        type: row['TYPE'] || row['DESCRIPTION'] || '',
        message: row['MESSAGE'] || row['TEXT'] || ''
      })
    }
  }
}

function parseEquipmentSchedule(schedule: ScheduleData, index: ProjectRoomIndex): void {
  for (const row of schedule.rows) {
    const tag = row['TAG'] || row['EQUIPMENT'] || row['MARK'] || row['NO.']
    const roomNum = extractRoomNumber(row['ROOM'] || row['LOCATION'] || row['AREA'])
    
    if (tag && roomNum) {
      const room = getOrCreateRoom(index, roomNum)
      if (!room.equipment) room.equipment = []
      
      room.equipment.push({
        tag,
        type: row['TYPE'] || row['EQUIPMENT TYPE'] || '',
        description: row['DESCRIPTION'] || row['DESC'] || '',
        source: schedule.name
      })
    }
  }
}

// ============================================================
// MAIN FUNCTION
// ============================================================

/**
 * Build a complete room scope index from analyzed sheets
 */
export function buildRoomIndex(sheets: SheetAnalysis[]): ProjectRoomIndex {
  const index: ProjectRoomIndex = {
    rooms: new Map(),
    finishLegend: {},
    doorTypes: {},
    windowTypes: {},
    wallTypes: {},
    hardwareSets: {},
    lightingTypes: {},
    ceilingTypes: {},
    panels: {},
    mechanicalEquipment: []
  }
  
  // Parse all schedules
  for (const sheet of sheets) {
    for (const schedule of sheet.schedules) {
      const parseFunc = SCHEDULE_PARSERS[schedule.type]
      if (parseFunc) {
        try {
          parseFunc(schedule, index)
        } catch (e) {
          console.error(`Failed to parse ${schedule.type} schedule:`, e)
        }
      }
    }
    
    // Also add rooms found in plans
    for (const room of sheet.rooms) {
      const r = getOrCreateRoom(index, room.number)
      if (room.name && !r.roomName) {
        r.roomName = room.name
      }
      if (room.area && !r.area) {
        r.area = room.area
      }
      if (!r.relatedSheets.includes(sheet.sheetNumber)) {
        r.relatedSheets.push(sheet.sheetNumber)
      }
    }
  }
  
  return index
}

// Parser map
const SCHEDULE_PARSERS: Record<ScheduleType, (schedule: ScheduleData, index: ProjectRoomIndex) => void> = {
  'finish': parseFinishSchedule,
  'door': parseDoorSchedule,
  'window': parseWindowSchedule,
  'wall': parseWallTypeSchedule,
  'hardware': parseHardwareSchedule,
  'plumbing': parsePlumbingSchedule,
  'lighting': parseLightingSchedule,
  'panel': parsePanelSchedule,
  'diffuser': parseDiffuserSchedule,
  'mechanical': parseMechanicalSchedule,
  'electrical': parseEquipmentSchedule, // Generic for now
  'fire_protection': parseFireProtectionSchedule,
  'casework': parseCaseworkSchedule,
  'ceiling': parseCeilingSchedule,
  'signage': parseSignageSchedule,
  'equipment': parseEquipmentSchedule,
  'other': parseEquipmentSchedule // Fallback
}

/**
 * Get complete scope for a specific room
 */
export function getRoomScope(index: ProjectRoomIndex, roomNumber: string): RoomScope | null {
  const normalized = roomNumber.toString().trim().toUpperCase()
  return index.rooms.get(normalized) || null
}

/**
 * Search rooms by various criteria
 */
export function searchRooms(
  index: ProjectRoomIndex,
  query: {
    name?: string
    hasFinish?: string
    hasDoorType?: string
    hasEquipment?: string
    hasPlumbing?: boolean
    hasMechanical?: boolean
  }
): RoomScope[] {
  const results: RoomScope[] = []
  
  for (const room of index.rooms.values()) {
    let matches = true
    
    if (query.name) {
      matches = matches && room.roomName.toLowerCase().includes(query.name.toLowerCase())
    }
    
    if (query.hasFinish && room.finishes) {
      const finishValues = [
        room.finishes.floor,
        room.finishes.base,
        room.finishes.ceiling,
        ...Object.values(room.finishes.walls || {})
      ].filter(Boolean)
      matches = matches && finishValues.some(f => f?.includes(query.hasFinish!))
    }
    
    if (query.hasDoorType && room.doors) {
      matches = matches && room.doors.some(d => d.type === query.hasDoorType)
    }
    
    if (query.hasEquipment && room.equipment) {
      matches = matches && room.equipment.some(e => 
        e.type.toLowerCase().includes(query.hasEquipment!.toLowerCase()) ||
        e.tag.toLowerCase().includes(query.hasEquipment!.toLowerCase())
      )
    }
    
    if (query.hasPlumbing) {
      matches = matches && (room.plumbingFixtures?.length || 0) > 0
    }
    
    if (query.hasMechanical) {
      matches = matches && (
        (room.mechanical?.diffusers?.length || 0) > 0 ||
        (room.mechanical?.equipment?.length || 0) > 0
      )
    }
    
    if (matches) {
      results.push(room)
    }
  }
  
  return results
}

/**
 * Generate a scope summary for a room (useful for RAG context)
 */
export function generateRoomSummary(room: RoomScope, legend: ProjectRoomIndex): string {
  const parts: string[] = [`## Room ${room.roomNumber}: ${room.roomName}`]
  if (room.area) parts.push(`Area: ${room.area}`)
  
  // Finishes
  if (room.finishes) {
    const f = room.finishes
    parts.push('\n### Finishes')
    if (f.floor) {
      const desc = legend.finishLegend[f.floor] || f.floor
      parts.push(`- Floor: ${f.floor}${desc !== f.floor ? ` (${desc})` : ''}`)
    }
    if (f.base) {
      const desc = legend.finishLegend[f.base] || f.base
      parts.push(`- Base: ${f.base}${desc !== f.base ? ` (${desc})` : ''}`)
    }
    if (f.ceiling) {
      const desc = legend.ceilingTypes[f.ceiling] || legend.finishLegend[f.ceiling] || f.ceiling
      parts.push(`- Ceiling: ${f.ceiling}${desc !== f.ceiling ? ` (${desc})` : ''} at ${f.ceilingHeight || 'standard'}`)
    }
    if (f.walls && Object.keys(f.walls).length > 0) {
      const wallDescs = Object.entries(f.walls)
        .map(([dir, code]) => {
          const desc = legend.finishLegend[code] || code
          return `${dir}: ${code}${desc !== code ? ` (${desc})` : ''}`
        })
        .join(', ')
      parts.push(`- Walls: ${wallDescs}`)
    }
  }
  
  // Doors
  if (room.doors && room.doors.length > 0) {
    parts.push(`\n### Doors (${room.doors.length})`)
    for (const door of room.doors) {
      const typeDesc = legend.doorTypes[door.type] || ''
      const hwDesc = legend.hardwareSets[door.hardware] || ''
      const rating = door.fireRating ? ` [${door.fireRating}]` : ''
      parts.push(`- ${door.doorNumber}: ${door.size}, Type ${door.type}${typeDesc ? ` (${typeDesc})` : ''}, HW Set ${door.hardware}${hwDesc ? ` (${hwDesc})` : ''}${rating}`)
    }
  }
  
  // Windows
  if (room.windows && room.windows.length > 0) {
    parts.push(`\n### Windows (${room.windows.length})`)
    for (const win of room.windows) {
      parts.push(`- ${win.mark}: ${win.size}, ${win.type}, ${win.glazing}`)
    }
  }
  
  // Plumbing
  if (room.plumbingFixtures && room.plumbingFixtures.length > 0) {
    parts.push(`\n### Plumbing Fixtures (${room.plumbingFixtures.length})`)
    for (const fix of room.plumbingFixtures) {
      const mfr = fix.manufacturer ? ` by ${fix.manufacturer}` : ''
      const model = fix.model ? ` (${fix.model})` : ''
      parts.push(`- ${fix.tag}: ${fix.type}${mfr}${model}`)
    }
  }
  
  // Mechanical
  if (room.mechanical) {
    if (room.mechanical.diffusers && room.mechanical.diffusers.length > 0) {
      parts.push(`\n### HVAC Diffusers (${room.mechanical.diffusers.length})`)
      for (const diff of room.mechanical.diffusers) {
        parts.push(`- ${diff.mark}: ${diff.type} ${diff.size}, ${diff.cfm} CFM`)
      }
    }
    if (room.mechanical.equipment && room.mechanical.equipment.length > 0) {
      parts.push(`\n### Mechanical Equipment`)
      for (const eq of room.mechanical.equipment) {
        parts.push(`- ${eq.tag}: ${eq.type}${eq.capacity ? `, ${eq.capacity}` : ''}`)
      }
    }
  }
  
  // Electrical
  if (room.electrical?.panelCircuits && room.electrical.panelCircuits.length > 0) {
    parts.push(`\n### Electrical Circuits`)
    for (const ckt of room.electrical.panelCircuits) {
      parts.push(`- ${ckt.circuit}: ${ckt.description}`)
    }
  }
  
  // Fire Protection
  if (room.fireProtection?.devices && room.fireProtection.devices.length > 0) {
    parts.push(`\n### Fire Protection`)
    for (const dev of room.fireProtection.devices) {
      parts.push(`- ${dev.type}: ${dev.coverage}, ${dev.mounting}`)
    }
  }
  
  // Casework
  if (room.casework && room.casework.length > 0) {
    parts.push(`\n### Casework/Millwork (${room.casework.length})`)
    for (const cw of room.casework) {
      parts.push(`- ${cw.mark}: ${cw.type}, ${cw.size}, ${cw.material} - ${cw.finish}`)
    }
  }
  
  // Signage
  if (room.signage && room.signage.length > 0) {
    parts.push(`\n### Signage`)
    for (const sign of room.signage) {
      parts.push(`- ${sign.mark}: ${sign.type}${sign.message ? ` - "${sign.message}"` : ''}`)
    }
  }
  
  // Equipment
  if (room.equipment && room.equipment.length > 0) {
    parts.push(`\n### Equipment`)
    for (const eq of room.equipment) {
      parts.push(`- ${eq.tag}: ${eq.type || eq.description}`)
    }
  }
  
  // Related sheets
  if (room.relatedSheets.length > 0) {
    parts.push(`\n### Related Sheets: ${room.relatedSheets.join(', ')}`)
  }
  
  return parts.join('\n')
}
