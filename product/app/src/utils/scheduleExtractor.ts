/**
 * Schedule Extractor
 * 
 * Extracts door, finish, and partition schedules from PDF text.
 * Based on Blueprint architecture patterns.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Schedule types
export interface DoorScheduleEntry {
  mark: string;           // Door mark (e.g., "101", "A")
  width: string;          // Width (e.g., "3'-0\"")
  height: string;         // Height (e.g., "7'-0\"")
  type: string;           // Door type (e.g., "A", "HM-1")
  material: string;       // Material (e.g., "HM", "WD", "AL")
  glazing?: string;       // Glazing type
  hardware?: string;      // Hardware set
  fireRating?: string;    // Fire rating (e.g., "90 MIN", "20 MIN")
  frame?: string;         // Frame type
  remarks?: string;       // Additional notes
}

export interface FinishScheduleEntry {
  roomNumber: string;     // Room number/mark
  roomName: string;       // Room name
  floor?: string;         // Floor finish (e.g., "VCT", "CT-1")
  base?: string;          // Base finish
  walls?: string;         // Wall finish (e.g., "PT-1", "CMU")
  ceiling?: string;       // Ceiling finish (e.g., "ACT-1")
  ceilingHeight?: string; // Ceiling height
  remarks?: string;
}

export interface PartitionScheduleEntry {
  type: string;           // Partition type (e.g., "A", "P-1")
  description: string;    // Full description
  studs?: string;         // Stud type/size
  layers?: string;        // GWB layers
  insulation?: string;    // Insulation type
  fireRating?: string;    // Fire rating
  stcRating?: string;     // STC rating
  height?: string;        // Max height
}

export interface ExtractedSchedules {
  doors: DoorScheduleEntry[];
  finishes: FinishScheduleEntry[];
  partitions: PartitionScheduleEntry[];
  rawText: string;
  pageNumber?: number;
}

/**
 * Extract text from a specific PDF page
 */
export async function extractPageText(pdfUrl: string, pageNumber: number): Promise<string> {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  
  // Sort text items by position (top to bottom, left to right)
  const items = textContent.items as { str: string; transform: number[] }[];
  
  // Group by Y position (rows)
  const rows: Map<number, { x: number; text: string }[]> = new Map();
  
  items.forEach(item => {
    const y = Math.round(item.transform[5] / 10) * 10; // Round to nearest 10
    const x = item.transform[4];
    
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y)!.push({ x, text: item.str });
  });
  
  // Sort rows by Y (descending for PDF coordinates) and items by X
  const sortedRows = Array.from(rows.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([_, items]) => 
      items.sort((a, b) => a.x - b.x)
           .map(i => i.text)
           .join('\t')
    );
  
  return sortedRows.join('\n');
}

/**
 * Detect if a page likely contains a schedule
 */
export function detectScheduleType(text: string): 'door' | 'finish' | 'partition' | null {
  const upperText = text.toUpperCase();
  
  // Door schedule indicators
  if (upperText.includes('DOOR SCHEDULE') || 
      (upperText.includes('DOOR') && upperText.includes('MARK') && upperText.includes('TYPE'))) {
    return 'door';
  }
  
  // Finish schedule indicators
  if (upperText.includes('FINISH SCHEDULE') || 
      upperText.includes('ROOM FINISH') ||
      (upperText.includes('ROOM') && upperText.includes('FLOOR') && upperText.includes('CEILING'))) {
    return 'finish';
  }
  
  // Partition schedule indicators
  if (upperText.includes('PARTITION SCHEDULE') || 
      upperText.includes('PARTITION TYPE') ||
      upperText.includes('WALL TYPE')) {
    return 'partition';
  }
  
  return null;
}

/**
 * Parse door schedule from text
 */
export function parseDoorSchedule(text: string): DoorScheduleEntry[] {
  const doors: DoorScheduleEntry[] = [];
  const lines = text.split('\n');
  
  // Find header row
  let headerIndex = -1;
  let headers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('MARK') && (line.includes('WIDTH') || line.includes('SIZE') || line.includes('TYPE'))) {
      headerIndex = i;
      headers = lines[i].split('\t').map(h => h.trim().toUpperCase());
      break;
    }
  }
  
  if (headerIndex === -1) return doors;
  
  // Map header positions
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes('MARK') || h.includes('NO')) colMap.mark = i;
    if (h.includes('WIDTH') || h.includes('W')) colMap.width = i;
    if (h.includes('HEIGHT') || h.includes('H')) colMap.height = i;
    if (h.includes('TYPE')) colMap.type = i;
    if (h.includes('MATERIAL') || h.includes('MAT')) colMap.material = i;
    if (h.includes('GLAZ')) colMap.glazing = i;
    if (h.includes('HARDWARE') || h.includes('HDW')) colMap.hardware = i;
    if (h.includes('FIRE') || h.includes('RATING')) colMap.fireRating = i;
    if (h.includes('FRAME')) colMap.frame = i;
    if (h.includes('REMARK') || h.includes('NOTE')) colMap.remarks = i;
  });
  
  // Parse data rows
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split('\t').map(c => c.trim());
    if (cols.length < 2 || !cols[colMap.mark ?? 0]) continue;
    
    const entry: DoorScheduleEntry = {
      mark: cols[colMap.mark ?? 0] || '',
      width: cols[colMap.width ?? 1] || '',
      height: cols[colMap.height ?? 2] || '',
      type: cols[colMap.type ?? 3] || '',
      material: cols[colMap.material ?? 4] || '',
      glazing: colMap.glazing !== undefined ? cols[colMap.glazing] : undefined,
      hardware: colMap.hardware !== undefined ? cols[colMap.hardware] : undefined,
      fireRating: colMap.fireRating !== undefined ? cols[colMap.fireRating] : undefined,
      frame: colMap.frame !== undefined ? cols[colMap.frame] : undefined,
      remarks: colMap.remarks !== undefined ? cols[colMap.remarks] : undefined,
    };
    
    // Only add if mark looks like a door mark
    if (entry.mark && entry.mark.length <= 10) {
      doors.push(entry);
    }
  }
  
  return doors;
}

/**
 * Parse finish schedule from text
 */
export function parseFinishSchedule(text: string): FinishScheduleEntry[] {
  const finishes: FinishScheduleEntry[] = [];
  const lines = text.split('\n');
  
  let headerIndex = -1;
  let headers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if ((line.includes('ROOM') || line.includes('NO')) && 
        (line.includes('FLOOR') || line.includes('WALL') || line.includes('CEILING'))) {
      headerIndex = i;
      headers = lines[i].split('\t').map(h => h.trim().toUpperCase());
      break;
    }
  }
  
  if (headerIndex === -1) return finishes;
  
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes('NO') || h.includes('NUMBER') || h.includes('RM')) colMap.roomNumber = i;
    if (h.includes('NAME') || h.includes('ROOM NAME')) colMap.roomName = i;
    if (h.includes('FLOOR') && !h.includes('BASE')) colMap.floor = i;
    if (h.includes('BASE')) colMap.base = i;
    if (h.includes('WALL')) colMap.walls = i;
    if (h.includes('CEILING') && !h.includes('HT') && !h.includes('HEIGHT')) colMap.ceiling = i;
    if (h.includes('CEILING') && (h.includes('HT') || h.includes('HEIGHT'))) colMap.ceilingHeight = i;
    if (h.includes('REMARK') || h.includes('NOTE')) colMap.remarks = i;
  });
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split('\t').map(c => c.trim());
    if (cols.length < 2) continue;
    
    const entry: FinishScheduleEntry = {
      roomNumber: cols[colMap.roomNumber ?? 0] || '',
      roomName: cols[colMap.roomName ?? 1] || '',
      floor: colMap.floor !== undefined ? cols[colMap.floor] : undefined,
      base: colMap.base !== undefined ? cols[colMap.base] : undefined,
      walls: colMap.walls !== undefined ? cols[colMap.walls] : undefined,
      ceiling: colMap.ceiling !== undefined ? cols[colMap.ceiling] : undefined,
      ceilingHeight: colMap.ceilingHeight !== undefined ? cols[colMap.ceilingHeight] : undefined,
      remarks: colMap.remarks !== undefined ? cols[colMap.remarks] : undefined,
    };
    
    if (entry.roomNumber || entry.roomName) {
      finishes.push(entry);
    }
  }
  
  return finishes;
}

/**
 * Parse partition schedule from text
 */
export function parsePartitionSchedule(text: string): PartitionScheduleEntry[] {
  const partitions: PartitionScheduleEntry[] = [];
  const lines = text.split('\n');
  
  let headerIndex = -1;
  let headers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('TYPE') && (line.includes('DESCRIPTION') || line.includes('STUD') || line.includes('GWB'))) {
      headerIndex = i;
      headers = lines[i].split('\t').map(h => h.trim().toUpperCase());
      break;
    }
  }
  
  if (headerIndex === -1) return partitions;
  
  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes('TYPE') && !h.includes('STUD')) colMap.type = i;
    if (h.includes('DESCRIPTION') || h.includes('DESC')) colMap.description = i;
    if (h.includes('STUD')) colMap.studs = i;
    if (h.includes('LAYER') || h.includes('GWB') || h.includes('GYPSUM')) colMap.layers = i;
    if (h.includes('INSUL')) colMap.insulation = i;
    if (h.includes('FIRE') || h.includes('RATING')) colMap.fireRating = i;
    if (h.includes('STC')) colMap.stcRating = i;
    if (h.includes('HEIGHT') || h.includes('HT')) colMap.height = i;
  });
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const cols = lines[i].split('\t').map(c => c.trim());
    if (cols.length < 2) continue;
    
    const entry: PartitionScheduleEntry = {
      type: cols[colMap.type ?? 0] || '',
      description: cols[colMap.description ?? 1] || '',
      studs: colMap.studs !== undefined ? cols[colMap.studs] : undefined,
      layers: colMap.layers !== undefined ? cols[colMap.layers] : undefined,
      insulation: colMap.insulation !== undefined ? cols[colMap.insulation] : undefined,
      fireRating: colMap.fireRating !== undefined ? cols[colMap.fireRating] : undefined,
      stcRating: colMap.stcRating !== undefined ? cols[colMap.stcRating] : undefined,
      height: colMap.height !== undefined ? cols[colMap.height] : undefined,
    };
    
    if (entry.type) {
      partitions.push(entry);
    }
  }
  
  return partitions;
}

/**
 * Extract all schedules from a PDF
 */
export async function extractSchedulesFromPDF(pdfUrl: string): Promise<ExtractedSchedules> {
  const result: ExtractedSchedules = {
    doors: [],
    finishes: [],
    partitions: [],
    rawText: '',
  };
  
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const numPages = pdf.numPages;
    
    // Scan all pages for schedules
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const text = await extractPageText(pdfUrl, pageNum);
      const scheduleType = detectScheduleType(text);
      
      if (scheduleType) {
        result.rawText += `\n--- Page ${pageNum} (${scheduleType}) ---\n${text}`;
        result.pageNumber = pageNum;
        
        switch (scheduleType) {
          case 'door':
            result.doors.push(...parseDoorSchedule(text));
            break;
          case 'finish':
            result.finishes.push(...parseFinishSchedule(text));
            break;
          case 'partition':
            result.partitions.push(...parsePartitionSchedule(text));
            break;
        }
      }
    }
  } catch (error) {
    console.error('Error extracting schedules:', error);
  }
  
  return result;
}

/**
 * Quick scan for schedule pages (returns page numbers)
 */
export async function findSchedulePages(pdfUrl: string): Promise<{ page: number; type: string }[]> {
  const schedulePages: { page: number; type: string }[] = [];
  
  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const text = await extractPageText(pdfUrl, pageNum);
      const scheduleType = detectScheduleType(text);
      
      if (scheduleType) {
        schedulePages.push({ page: pageNum, type: scheduleType });
      }
    }
  } catch (error) {
    console.error('Error scanning for schedules:', error);
  }
  
  return schedulePages;
}
