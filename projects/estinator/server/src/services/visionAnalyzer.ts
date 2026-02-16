import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'

// Lazy initialization
let anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required for vision analysis')
    }
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropic
}

// ============================================================
// TYPES
// ============================================================

export type SheetType = 
  | 'plan' 
  | 'detail' 
  | 'section' 
  | 'elevation'
  | 'schedule'
  | 'diagram' 
  | 'cover'
  | 'general_notes'
  | 'specification'  // Text-heavy page
  | 'unknown'

export interface RoomInfo {
  number: string
  name: string
  area?: string
}

export interface EquipmentTag {
  tag: string
  type: string
  description?: string
  location?: string
}

export interface Dimension {
  value: string
  unit: string
  context: string
}

export interface DrawingNote {
  number?: string
  text: string
  importance: 'critical' | 'standard' | 'info'
}

export interface CrossReference {
  type: 'detail' | 'section' | 'spec' | 'sheet'
  reference: string
  context: string
}

export type ScheduleType = 
  | 'finish'           // Room finish schedule
  | 'door'             // Door schedule
  | 'window'           // Window schedule
  | 'wall'             // Wall type schedule
  | 'hardware'         // Door hardware schedule
  | 'plumbing'         // Plumbing fixture schedule
  | 'equipment'        // General equipment
  | 'mechanical'       // HVAC equipment
  | 'diffuser'         // Air diffuser/grille schedule
  | 'electrical'       // Electrical equipment
  | 'lighting'         // Lighting fixture schedule
  | 'panel'            // Electrical panel schedule
  | 'fire_protection'  // Fire protection devices
  | 'ceiling'          // Reflected ceiling plan legend/schedule
  | 'casework'         // Millwork/casework schedule
  | 'signage'          // Signage schedule
  | 'other'

export interface ScheduleData {
  name: string
  type: ScheduleType
  columns: string[]
  rows: Record<string, string>[]
  legend?: Record<string, string>  // For finish codes, types, etc.
}

export interface SheetAnalysis {
  id: string
  documentId: string
  pageNumber: number
  
  // Sheet identification
  sheetNumber: string
  sheetTitle: string
  sheetType: SheetType
  discipline: 'architectural' | 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'fire_protection' | 'civil' | 'general'
  
  // Extracted content
  rooms: RoomInfo[]
  equipment: EquipmentTag[]
  dimensions: Dimension[]
  notes: DrawingNote[]
  crossReferences: CrossReference[]
  schedules: ScheduleData[]
  
  // For RAG
  summary: string
  searchableText: string
  
  // Metadata
  confidence: number
  analyzedAt: Date
}

// ============================================================
// PROMPTS
// ============================================================

const SHEET_CLASSIFICATION_PROMPT = `You are a construction document analyzer. Analyze this drawing sheet and extract key information.

Respond in JSON format:
{
  "sheetNumber": "A-101",
  "sheetTitle": "FIRST FLOOR PLAN",
  "sheetType": "plan|detail|section|elevation|schedule|diagram|cover|general_notes|specification|unknown",
  "discipline": "architectural|structural|mechanical|electrical|plumbing|fire_protection|civil|general",
  "confidence": 0.95,
  "summary": "First floor architectural plan showing offices, corridors, and restrooms. Key features include..."
}

Focus on:
- Reading the title block (usually bottom right or right side)
- Identifying the drawing type from content
- Noting the overall purpose/scope of the sheet`

const PLAN_EXTRACTION_PROMPT = `You are a construction plan analyzer. Extract detailed information from this floor plan.

Respond in JSON format:
{
  "rooms": [
    {"number": "101", "name": "OFFICE", "area": "150 SF"}
  ],
  "equipment": [
    {"tag": "AHU-1", "type": "Air Handling Unit", "location": "Mechanical Room 105"}
  ],
  "dimensions": [
    {"value": "24", "unit": "feet", "context": "corridor width"}
  ],
  "notes": [
    {"number": "1", "text": "All walls to be Type A unless noted", "importance": "critical"}
  ],
  "crossReferences": [
    {"type": "detail", "reference": "3/A-501", "context": "wall section at corridor"},
    {"type": "spec", "reference": "09 91 13", "context": "paint requirements"}
  ]
}

Extract ALL visible:
- Room numbers and names
- Equipment tags/labels
- Key dimensions
- Drawing notes (especially numbered notes)
- References to other sheets or specifications`

const SCHEDULE_EXTRACTION_PROMPT = `You are a construction schedule extractor. This image contains a schedule table. Extract ALL data from the schedule.

Respond in JSON format:
{
  "schedules": [
    {
      "name": "DOOR SCHEDULE",
      "type": "door|finish|window|equipment|plumbing|electrical|wall|other",
      "columns": ["DOOR NO.", "SIZE", "TYPE", "FRAME", "HARDWARE SET", "FIRE RATING", "REMARKS"],
      "rows": [
        {"DOOR NO.": "101", "SIZE": "3'-0\" x 7'-0\"", "TYPE": "A", "FRAME": "HM", "HARDWARE SET": "1", "FIRE RATING": "20 MIN", "REMARKS": ""},
        {"DOOR NO.": "102", "SIZE": "3'-0\" x 7'-0\"", "TYPE": "B", "FRAME": "WD", "HARDWARE SET": "2", "FIRE RATING": "-", "REMARKS": "Pair with 102A"}
      ]
    }
  ]
}

IMPORTANT:
- Extract EVERY row in the schedule, not just examples
- Preserve exact values as shown
- Include all columns even if some cells are empty
- For finish schedules, capture floor, wall, ceiling, and base finishes for each room
- For door schedules, capture all hardware and rating info`

const FINISH_SCHEDULE_PROMPT = `You are extracting a FINISH SCHEDULE from a construction drawing. This schedule shows finishes for each room.

Respond in JSON format:
{
  "schedules": [
    {
      "name": "ROOM FINISH SCHEDULE",
      "type": "finish",
      "columns": ["ROOM NO.", "ROOM NAME", "FLOOR", "BASE", "NORTH WALL", "EAST WALL", "SOUTH WALL", "WEST WALL", "CEILING", "CEILING HT.", "REMARKS"],
      "rows": [
        {
          "ROOM NO.": "101",
          "ROOM NAME": "OFFICE",
          "FLOOR": "CPT-1",
          "BASE": "RB-1",
          "NORTH WALL": "PT-1",
          "EAST WALL": "PT-1",
          "SOUTH WALL": "PT-2",
          "WEST WALL": "PT-1",
          "CEILING": "ACT-1",
          "CEILING HT.": "9'-0\"",
          "REMARKS": ""
        }
      ]
    }
  ],
  "finishLegend": {
    "CPT-1": "Carpet Tile - Shaw Contract",
    "PT-1": "Paint - Eggshell",
    "ACT-1": "Acoustic Ceiling Tile 2x2"
  }
}

Extract EVERY room from the schedule. Also extract the finish legend/key if visible.`

// ============================================================
// SPECIALIZED SCHEDULE PROMPTS
// ============================================================

const DOOR_SCHEDULE_PROMPT = `Extract the DOOR SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "DOOR SCHEDULE",
    "type": "door",
    "columns": ["DOOR NO.", "ROOM", "SIZE", "TYPE", "FRAME", "HARDWARE SET", "FIRE RATING", "GLAZING", "REMARKS"],
    "rows": [
      {"DOOR NO.": "101", "ROOM": "101", "SIZE": "3'-0\" x 7'-0\"", "TYPE": "A", "FRAME": "HM", "HARDWARE SET": "1", "FIRE RATING": "20 MIN", "GLAZING": "-", "REMARKS": ""}
    ],
    "legend": {
      "TYPE A": "Solid core wood door",
      "HM": "Hollow Metal Frame"
    }
  }]
}

Extract ALL doors. Include door types legend if shown.`

const WINDOW_SCHEDULE_PROMPT = `Extract the WINDOW SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "WINDOW SCHEDULE",
    "type": "window",
    "columns": ["MARK", "SIZE", "TYPE", "FRAME", "GLAZING", "SILL HT.", "HEAD HT.", "REMARKS"],
    "rows": [
      {"MARK": "A", "SIZE": "4'-0\" x 5'-0\"", "TYPE": "Fixed", "FRAME": "Aluminum", "GLAZING": "1\" IGU", "SILL HT.": "3'-0\"", "HEAD HT.": "8'-0\"", "REMARKS": "Low-E coating"}
    ],
    "legend": {
      "IGU": "Insulated Glass Unit"
    }
  }]
}

Extract ALL windows including types and glazing specs.`

const WALL_TYPE_SCHEDULE_PROMPT = `Extract the WALL TYPE SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "WALL TYPE SCHEDULE",
    "type": "wall",
    "columns": ["TYPE", "DESCRIPTION", "THICKNESS", "STC RATING", "FIRE RATING", "CONSTRUCTION"],
    "rows": [
      {"TYPE": "A", "DESCRIPTION": "Interior Partition", "THICKNESS": "4-7/8\"", "STC RATING": "45", "FIRE RATING": "1-HR", "CONSTRUCTION": "3-5/8\" metal studs @ 16\" o.c., 5/8\" GWB each side"}
    ]
  }]
}

Extract ALL wall types with full construction descriptions.`

const HARDWARE_SCHEDULE_PROMPT = `Extract the HARDWARE SCHEDULE (door hardware sets) from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "HARDWARE SCHEDULE",
    "type": "hardware",
    "columns": ["SET NO.", "HINGES", "LOCKSET", "CLOSER", "STOP", "KICK PLATE", "REMARKS"],
    "rows": [
      {"SET NO.": "1", "HINGES": "3 - 4.5\" x 4.5\" BB", "LOCKSET": "Cylindrical passage", "CLOSER": "LCN 4041", "STOP": "Wall bumper", "KICK PLATE": "10\" SS", "REMARKS": "Office entry"}
    ]
  }]
}

Extract ALL hardware sets with complete hardware items.`

const PLUMBING_FIXTURE_PROMPT = `Extract the PLUMBING FIXTURE SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "PLUMBING FIXTURE SCHEDULE",
    "type": "plumbing",
    "columns": ["MARK", "FIXTURE TYPE", "MANUFACTURER", "MODEL", "CONNECTION", "REMARKS"],
    "rows": [
      {"MARK": "WC-1", "FIXTURE TYPE": "Water Closet", "MANUFACTURER": "Kohler", "MODEL": "K-3575", "CONNECTION": "Floor mount, 12\" rough-in", "REMARKS": "ADA compliant"},
      {"MARK": "LAV-1", "FIXTURE TYPE": "Lavatory", "MANUFACTURER": "American Standard", "MODEL": "0496.221", "CONNECTION": "Wall hung", "REMARKS": "With P-trap"}
    ]
  }]
}

Extract ALL fixtures with manufacturers and models.`

const LIGHTING_SCHEDULE_PROMPT = `Extract the LIGHTING FIXTURE SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "LIGHTING FIXTURE SCHEDULE",
    "type": "lighting",
    "columns": ["TYPE", "MANUFACTURER", "CATALOG NO.", "DESCRIPTION", "LAMP", "VOLTAGE", "MOUNTING", "REMARKS"],
    "rows": [
      {"TYPE": "A", "MANUFACTURER": "Lithonia", "CATALOG NO.": "2RT5 28T5", "DESCRIPTION": "2x4 Recessed Troffer", "LAMP": "(2) 28W T5", "VOLTAGE": "120V", "MOUNTING": "Recessed", "REMARKS": ""}
    ]
  }]
}

Extract ALL lighting types with complete specifications.`

const PANEL_SCHEDULE_PROMPT = `Extract the ELECTRICAL PANEL SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "PANEL SCHEDULE",
    "type": "panel",
    "columns": ["CKT", "LOAD DESCRIPTION", "VA", "BREAKER", "PHASE"],
    "rows": [
      {"CKT": "1", "LOAD DESCRIPTION": "Receptacles - Room 101", "VA": "1800", "BREAKER": "20A", "PHASE": "A"},
      {"CKT": "3", "LOAD DESCRIPTION": "Lighting - Corridor", "VA": "1200", "BREAKER": "20A", "PHASE": "B"}
    ],
    "legend": {
      "PANEL": "LP-1",
      "VOLTAGE": "120/208V 3PH",
      "MAIN": "100A MLO",
      "FED FROM": "MDP"
    }
  }]
}

Extract ALL circuits and panel info.`

const DIFFUSER_SCHEDULE_PROMPT = `Extract the DIFFUSER/GRILLE SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "DIFFUSER SCHEDULE",
    "type": "diffuser",
    "columns": ["MARK", "TYPE", "SIZE", "CFM", "MANUFACTURER", "MODEL", "REMARKS"],
    "rows": [
      {"MARK": "SD-1", "TYPE": "Supply Diffuser", "SIZE": "24x24", "CFM": "400", "MANUFACTURER": "Titus", "MODEL": "TMS", "REMARKS": "Ceiling mount"},
      {"MARK": "RG-1", "TYPE": "Return Grille", "SIZE": "24x12", "CFM": "350", "MANUFACTURER": "Titus", "MODEL": "350RL", "REMARKS": ""}
    ]
  }]
}

Extract ALL diffusers and grilles.`

const MECHANICAL_EQUIPMENT_PROMPT = `Extract the MECHANICAL EQUIPMENT SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "MECHANICAL EQUIPMENT SCHEDULE",
    "type": "mechanical",
    "columns": ["TAG", "DESCRIPTION", "MANUFACTURER", "MODEL", "CAPACITY", "ELECTRICAL", "LOCATION", "REMARKS"],
    "rows": [
      {"TAG": "AHU-1", "DESCRIPTION": "Air Handling Unit", "MANUFACTURER": "Trane", "MODEL": "CLCP", "CAPACITY": "5000 CFM", "ELECTRICAL": "460V/3PH/60Hz, 7.5HP", "LOCATION": "Mech Room 105", "REMARKS": ""},
      {"TAG": "EF-1", "DESCRIPTION": "Exhaust Fan", "MANUFACTURER": "Greenheck", "MODEL": "CSP-A390", "CAPACITY": "1200 CFM", "ELECTRICAL": "120V/1PH, 1/4HP", "LOCATION": "Roof", "REMARKS": "Toilet exhaust"}
    ]
  }]
}

Extract ALL HVAC equipment with full specifications.`

const FIRE_PROTECTION_PROMPT = `Extract the FIRE PROTECTION DEVICE SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "FIRE PROTECTION SCHEDULE",
    "type": "fire_protection",
    "columns": ["SYMBOL", "DEVICE TYPE", "MANUFACTURER", "MODEL", "COVERAGE", "MOUNTING", "REMARKS"],
    "rows": [
      {"SYMBOL": "●", "DEVICE TYPE": "Smoke Detector", "MANUFACTURER": "Notifier", "MODEL": "FSP-851", "COVERAGE": "900 SF", "MOUNTING": "Ceiling", "REMARKS": "Addressable"},
      {"SYMBOL": "▲", "DEVICE TYPE": "Sprinkler Head", "MANUFACTURER": "Tyco", "MODEL": "TY-FRB", "COVERAGE": "Standard", "MOUNTING": "Pendant", "REMARKS": "Quick response"}
    ]
  }]
}

Extract ALL fire protection devices.`

const CASEWORK_SCHEDULE_PROMPT = `Extract the CASEWORK/MILLWORK SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "CASEWORK SCHEDULE",
    "type": "casework",
    "columns": ["MARK", "TYPE", "SIZE", "MATERIAL", "FINISH", "HARDWARE", "LOCATION", "REMARKS"],
    "rows": [
      {"MARK": "BC-1", "TYPE": "Base Cabinet", "SIZE": "36\"W x 24\"D x 34.5\"H", "MATERIAL": "Plastic Laminate", "FINISH": "Wilsonart 7949", "HARDWARE": "European hinges", "LOCATION": "Break Room", "REMARKS": ""},
      {"MARK": "UC-1", "TYPE": "Upper Cabinet", "SIZE": "36\"W x 12\"D x 30\"H", "MATERIAL": "Plastic Laminate", "FINISH": "Wilsonart 7949", "HARDWARE": "Adj. shelves", "LOCATION": "Break Room", "REMARKS": ""}
    ]
  }]
}

Extract ALL casework/millwork items.`

const CEILING_SCHEDULE_PROMPT = `Extract the CEILING SCHEDULE or REFLECTED CEILING PLAN LEGEND from this drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "CEILING SCHEDULE",
    "type": "ceiling",
    "columns": ["TYPE", "DESCRIPTION", "MANUFACTURER", "MODEL/SIZE", "FINISH", "HEIGHT", "REMARKS"],
    "rows": [
      {"TYPE": "ACT-1", "DESCRIPTION": "Acoustic Ceiling Tile", "MANUFACTURER": "Armstrong", "MODEL/SIZE": "2x2 Tegular", "FINISH": "White", "HEIGHT": "9'-0\" AFF", "REMARKS": "NRC 0.70"},
      {"TYPE": "GWB-1", "DESCRIPTION": "Gypsum Wallboard", "MANUFACTURER": "-", "MODEL/SIZE": "5/8\" Type X", "FINISH": "Paint: SW7015", "HEIGHT": "Varies", "REMARKS": "Level 4 finish"}
    ]
  }]
}

Extract ceiling types and heights.`

const SIGNAGE_SCHEDULE_PROMPT = `Extract the SIGNAGE SCHEDULE from this construction drawing.

Respond in JSON format:
{
  "schedules": [{
    "name": "SIGNAGE SCHEDULE",
    "type": "signage",
    "columns": ["MARK", "TYPE", "SIZE", "MESSAGE", "MOUNTING", "LOCATION", "REMARKS"],
    "rows": [
      {"MARK": "S-1", "TYPE": "Room ID", "SIZE": "6\"x8\"", "MESSAGE": "Room name + number", "MOUNTING": "Wall", "LOCATION": "All rooms", "REMARKS": "ADA tactile + braille"},
      {"MARK": "S-2", "TYPE": "Directional", "SIZE": "12\"x4\"", "MESSAGE": "EXIT", "MOUNTING": "Ceiling", "LOCATION": "Corridors", "REMARKS": "Illuminated"}
    ]
  }]
}

Extract ALL signage requirements.`

// Map of schedule types to their specialized prompts
const SCHEDULE_PROMPTS: Record<string, string> = {
  'finish': FINISH_SCHEDULE_PROMPT,
  'door': DOOR_SCHEDULE_PROMPT,
  'window': WINDOW_SCHEDULE_PROMPT,
  'wall': WALL_TYPE_SCHEDULE_PROMPT,
  'hardware': HARDWARE_SCHEDULE_PROMPT,
  'plumbing': PLUMBING_FIXTURE_PROMPT,
  'lighting': LIGHTING_SCHEDULE_PROMPT,
  'panel': PANEL_SCHEDULE_PROMPT,
  'diffuser': DIFFUSER_SCHEDULE_PROMPT,
  'mechanical': MECHANICAL_EQUIPMENT_PROMPT,
  'fire_protection': FIRE_PROTECTION_PROMPT,
  'casework': CASEWORK_SCHEDULE_PROMPT,
  'ceiling': CEILING_SCHEDULE_PROMPT,
  'signage': SIGNAGE_SCHEDULE_PROMPT
}

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Analyze a drawing sheet using vision
 */
export async function analyzeSheet(
  imageBase64: string,
  documentId: string,
  pageNumber: number,
  mimeType: string = 'image/png'
): Promise<SheetAnalysis> {
  const id = uuidv4()
  
  // Step 1: Classify the sheet
  const classification = await classifySheet(imageBase64, mimeType)
  
  // Step 2: Deep extraction based on type
  let extraction: Partial<SheetAnalysis> = {
    rooms: [],
    equipment: [],
    dimensions: [],
    notes: [],
    crossReferences: [],
    schedules: []
  }
  
  if (classification.sheetType === 'plan') {
    extraction = await extractFromPlan(imageBase64, mimeType)
  } else if (classification.sheetType === 'schedule') {
    extraction = await extractSchedules(imageBase64, mimeType)
  } else if (classification.sheetType === 'detail' || classification.sheetType === 'section') {
    extraction = await extractFromDetail(imageBase64, mimeType)
  }
  
  // Build searchable text for RAG
  const searchableText = buildSearchableText(classification, extraction)
  
  return {
    id,
    documentId,
    pageNumber,
    sheetNumber: classification.sheetNumber,
    sheetTitle: classification.sheetTitle,
    sheetType: classification.sheetType,
    discipline: classification.discipline,
    rooms: extraction.rooms || [],
    equipment: extraction.equipment || [],
    dimensions: extraction.dimensions || [],
    notes: extraction.notes || [],
    crossReferences: extraction.crossReferences || [],
    schedules: extraction.schedules || [],
    summary: classification.summary,
    searchableText,
    confidence: classification.confidence,
    analyzedAt: new Date()
  }
}

/**
 * Classify a sheet type and extract basic info
 */
async function classifySheet(
  imageBase64: string,
  mimeType: string
): Promise<{
  sheetNumber: string
  sheetTitle: string
  sheetType: SheetType
  discipline: SheetAnalysis['discipline']
  summary: string
  confidence: number
}> {
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
            data: imageBase64
          }
        },
        { type: 'text', text: SHEET_CLASSIFICATION_PROMPT }
      ]
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse classification:', e)
  }

  return {
    sheetNumber: 'UNKNOWN',
    sheetTitle: 'Unknown Sheet',
    sheetType: 'unknown',
    discipline: 'general',
    summary: text,
    confidence: 0.5
  }
}

/**
 * Extract details from floor plans
 */
async function extractFromPlan(
  imageBase64: string,
  mimeType: string
): Promise<Partial<SheetAnalysis>> {
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
            data: imageBase64
          }
        },
        { type: 'text', text: PLAN_EXTRACTION_PROMPT }
      ]
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse plan extraction:', e)
  }

  return {}
}

/**
 * Extract schedules from schedule sheets
 */
async function extractSchedules(
  imageBase64: string,
  mimeType: string
): Promise<Partial<SheetAnalysis>> {
  // First, determine what type(s) of schedule are on this sheet
  const classifyResponse = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
            data: imageBase64
          }
        },
        { 
          type: 'text', 
          text: `What type(s) of schedule are shown on this sheet? Reply with a comma-separated list using ONLY these types:
finish, door, window, wall, hardware, plumbing, lighting, panel, diffuser, mechanical, electrical, fire_protection, casework, ceiling, signage, equipment, other

Example responses:
- "door, hardware"
- "finish"
- "mechanical, diffuser"
- "lighting, panel"` 
        }
      ]
    }]
  })

  const rawTypes = classifyResponse.content[0].type === 'text' 
    ? classifyResponse.content[0].text.toLowerCase().trim() 
    : 'other'

  // Parse schedule types (handles comma-separated and single)
  const scheduleTypes = rawTypes
    .split(/[,\n]+/)
    .map(t => t.trim().replace(/[^a-z_]/g, ''))
    .filter(t => t.length > 0)
  
  console.log(`Detected schedule types: ${scheduleTypes.join(', ')}`)

  // If multiple schedule types, we may need multiple extractions
  // For now, pick the best prompt or use generic if unknown
  let prompt = SCHEDULE_EXTRACTION_PROMPT
  
  // Use the most specific prompt available
  for (const scheduleType of scheduleTypes) {
    if (SCHEDULE_PROMPTS[scheduleType]) {
      prompt = SCHEDULE_PROMPTS[scheduleType]
      break
    }
  }
  
  // For sheets with multiple schedules, use a combined approach
  if (scheduleTypes.length > 1) {
    prompt = `This sheet contains multiple schedules: ${scheduleTypes.join(', ')}. 
    
Extract ALL schedules visible on this sheet. Respond in JSON format:
{
  "schedules": [
    {
      "name": "SCHEDULE NAME",
      "type": "${scheduleTypes[0]}",
      "columns": ["COL1", "COL2", ...],
      "rows": [{...}, {...}],
      "legend": {"CODE": "Description"}
    }
  ]
}

For each schedule:
- Extract EVERY row (not just examples)
- Preserve exact values as shown
- Include any legend/key that explains codes
- Set the correct "type" for each schedule`
  }

  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000, // Large schedules need more tokens
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
            data: imageBase64
          }
        },
        { type: 'text', text: prompt }
      ]
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      console.log(`Extracted ${result.schedules?.length || 0} schedules`)
      return result
    }
  } catch (e) {
    console.error('Failed to parse schedule extraction:', e)
  }

  return { schedules: [] }
}

/**
 * Extract from detail/section drawings
 */
async function extractFromDetail(
  imageBase64: string,
  mimeType: string
): Promise<Partial<SheetAnalysis>> {
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
            data: imageBase64
          }
        },
        { 
          type: 'text', 
          text: `Extract from this detail/section drawing:
{
  "dimensions": [{"value": "2", "unit": "inches", "context": "gypsum board thickness"}],
  "notes": [{"text": "note content", "importance": "critical|standard|info"}],
  "equipment": [{"tag": "tag", "type": "type", "description": "desc"}],
  "crossReferences": [{"type": "spec", "reference": "09 21 16", "context": "metal framing"}]
}

Extract all visible dimensions, notes, equipment tags, and specification references.`
        }
      ]
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse detail extraction:', e)
  }

  return {}
}

/**
 * Build searchable text for RAG embedding
 */
function buildSearchableText(
  classification: { sheetNumber: string; sheetTitle: string; summary: string },
  extraction: Partial<SheetAnalysis>
): string {
  const parts: string[] = [
    `Sheet ${classification.sheetNumber}: ${classification.sheetTitle}`,
    classification.summary
  ]

  // Add rooms
  if (extraction.rooms?.length) {
    parts.push('Rooms: ' + extraction.rooms.map(r => `${r.number} ${r.name}`).join(', '))
  }

  // Add equipment
  if (extraction.equipment?.length) {
    parts.push('Equipment: ' + extraction.equipment.map(e => `${e.tag} (${e.type})`).join(', '))
  }

  // Add notes
  if (extraction.notes?.length) {
    parts.push('Notes: ' + extraction.notes.map(n => n.text).join('; '))
  }

  // Add schedule summaries
  if (extraction.schedules?.length) {
    for (const schedule of extraction.schedules) {
      parts.push(`${schedule.name}: ${schedule.rows.length} entries`)
      // Include key data for searchability
      if (schedule.type === 'finish') {
        parts.push('Rooms in schedule: ' + schedule.rows.map(r => r['ROOM NO.'] || r['ROOM']).filter(Boolean).join(', '))
      } else if (schedule.type === 'door') {
        parts.push('Doors: ' + schedule.rows.map(r => r['DOOR NO.'] || r['MARK']).filter(Boolean).join(', '))
      }
    }
  }

  return parts.join('\n')
}

/**
 * Process all pages of a PDF as images for vision analysis
 */
export async function analyzeDrawingSet(
  pages: { pageNumber: number; imageBase64: string; mimeType: string }[],
  documentId: string,
  onProgress?: (current: number, total: number) => void
): Promise<SheetAnalysis[]> {
  const results: SheetAnalysis[] = []
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    onProgress?.(i + 1, pages.length)
    
    try {
      const analysis = await analyzeSheet(
        page.imageBase64,
        documentId,
        page.pageNumber,
        page.mimeType
      )
      results.push(analysis)
    } catch (error) {
      console.error(`Failed to analyze page ${page.pageNumber}:`, error)
      // Continue with other pages
    }
    
    // Rate limiting - be nice to the API
    if (i < pages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  
  return results
}
