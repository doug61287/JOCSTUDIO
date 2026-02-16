/**
 * Project Brain - Unified Document Intelligence
 * 
 * Combines text extraction (specs) and vision analysis (drawings)
 * into a single queryable knowledge base.
 */

import Anthropic from '@anthropic-ai/sdk'
import { embedQuery, embedChunks, type EmbeddedChunk } from './embeddings.js'
import { storeChunks, searchChunks, type SearchResult } from './vectorStore.js'
import type { SheetAnalysis, ScheduleData } from './visionAnalyzer.js'
import type { DocumentChunk } from './pdfProcessor.js'
import { buildRoomIndex, generateRoomSummary, type ProjectRoomIndex, type RoomScope } from './roomScope.js'

// Lazy initialization
let anthropic: Anthropic | null = null

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required')
    }
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropic
}

// ============================================================
// TYPES
// ============================================================

export type DocumentType = 'specification' | 'drawing' | 'addendum' | 'contract' | 'general'

export interface ProjectDocument {
  id: string
  name: string
  type: DocumentType
  pages: number
  uploadedAt: Date
}

export interface ProjectBrain {
  projectId: string
  projectName: string
  
  // Documents
  documents: ProjectDocument[]
  
  // Indexed content
  textChunkCount: number
  sheetAnalysisCount: number
  
  // Aggregated data
  roomIndex: ProjectRoomIndex | null
  
  // Stats
  lastUpdated: Date
}

export interface BrainAnswer {
  answer: string
  confidence: 'high' | 'medium' | 'low'
  sources: {
    type: 'text' | 'drawing' | 'schedule' | 'room'
    documentName: string
    location: string  // Page number, sheet number, or room number
    excerpt: string
  }[]
  relatedQuestions?: string[]
}

// ============================================================
// STORAGE
// ============================================================

// In-memory storage (upgrade to proper DB for production)
const brains: Map<string, ProjectBrain> = new Map()
const sheetAnalyses: Map<string, SheetAnalysis[]> = new Map()

// ============================================================
// CORE FUNCTIONS
// ============================================================

/**
 * Initialize or get a project brain
 */
export function getOrCreateBrain(projectId: string, projectName: string): ProjectBrain {
  if (!brains.has(projectId)) {
    brains.set(projectId, {
      projectId,
      projectName,
      documents: [],
      textChunkCount: 0,
      sheetAnalysisCount: 0,
      roomIndex: null,
      lastUpdated: new Date()
    })
    sheetAnalyses.set(projectId, [])
  }
  return brains.get(projectId)!
}

/**
 * Add text document to brain (specs, addenda, contracts)
 */
export async function addTextDocument(
  projectId: string,
  document: {
    id: string
    name: string
    type: DocumentType
    pages: number
    chunks: DocumentChunk[]
  }
): Promise<void> {
  const brain = brains.get(projectId)
  if (!brain) throw new Error('Project brain not found')
  
  // Embed and store chunks
  const embedded = await embedChunks(document.chunks)
  storeChunks(projectId, embedded)
  
  // Update brain
  brain.documents.push({
    id: document.id,
    name: document.name,
    type: document.type,
    pages: document.pages,
    uploadedAt: new Date()
  })
  brain.textChunkCount += document.chunks.length
  brain.lastUpdated = new Date()
}

/**
 * Add drawing analysis to brain
 */
export async function addDrawingAnalysis(
  projectId: string,
  documentId: string,
  documentName: string,
  analyses: SheetAnalysis[]
): Promise<void> {
  const brain = brains.get(projectId)
  if (!brain) throw new Error('Project brain not found')
  
  // Store analyses
  const existing = sheetAnalyses.get(projectId) || []
  sheetAnalyses.set(projectId, [...existing, ...analyses])
  
  // Create text chunks from analyses for RAG
  const analysisChunks: DocumentChunk[] = analyses.map(a => ({
    id: a.id,
    documentId,
    documentName,
    content: a.searchableText,
    pageNumber: a.pageNumber,
    section: a.sheetNumber,
    chunkIndex: a.pageNumber
  }))
  
  // Embed and store
  const embedded = await embedChunks(analysisChunks)
  storeChunks(projectId, embedded)
  
  // Update brain
  if (!brain.documents.find(d => d.id === documentId)) {
    brain.documents.push({
      id: documentId,
      name: documentName,
      type: 'drawing',
      pages: analyses.length,
      uploadedAt: new Date()
    })
  }
  brain.sheetAnalysisCount += analyses.length
  brain.lastUpdated = new Date()
  
  // Rebuild room index
  rebuildRoomIndex(projectId)
}

/**
 * Rebuild the room index from all sheet analyses
 */
function rebuildRoomIndex(projectId: string): void {
  const brain = brains.get(projectId)
  const sheets = sheetAnalyses.get(projectId)
  
  if (brain && sheets) {
    brain.roomIndex = buildRoomIndex(sheets)
  }
}

// ============================================================
// QUERY ENGINE
// ============================================================

const BRAIN_SYSTEM_PROMPT = `You are Estinator's Project Brain - an AI that has analyzed all project documents (specifications and drawings) and can answer questions about them.

Your knowledge includes:
- Specification documents (materials, methods, requirements)
- Drawing sheets (plans, details, sections, schedules)
- Room-by-room scope (finishes, doors, equipment)
- Cross-references between documents

Guidelines:
1. Answer based ONLY on the provided document excerpts
2. Cite specific sources (document name, page/sheet, section)
3. If information spans multiple sources, synthesize them
4. If something isn't in the documents, say so clearly
5. For schedules, provide specific values from the extracted data
6. Note any conflicts between documents (spec vs drawing, addendum changes)

Use construction industry terminology. Be precise with values and requirements.`

/**
 * Answer a question using the full project brain
 */
export async function queryBrain(
  projectId: string,
  question: string
): Promise<BrainAnswer> {
  const brain = brains.get(projectId)
  if (!brain) {
    return {
      answer: "Project not found. Please upload documents first.",
      confidence: 'low',
      sources: []
    }
  }
  
  // Detect question type for specialized handling
  const questionType = classifyQuestion(question)
  
  // Build context based on question type
  let context = ''
  const sources: BrainAnswer['sources'] = []
  
  // 1. Always do RAG search
  const queryEmbedding = await embedQuery(question)
  const ragResults = searchChunks(projectId, queryEmbedding, 8)
  
  if (ragResults.length > 0) {
    context += '## Document Excerpts\n\n'
    for (const result of ragResults) {
      const source = {
        type: result.chunk.section?.match(/^[A-Z]-\d/) ? 'drawing' : 'text' as 'text' | 'drawing',
        documentName: result.chunk.documentName,
        location: result.chunk.section 
          ? `Sheet ${result.chunk.section}` 
          : `Page ${result.chunk.pageNumber}`,
        excerpt: result.chunk.content.slice(0, 300)
      }
      sources.push(source)
      
      context += `[${source.type.toUpperCase()}: ${source.documentName}, ${source.location}]\n`
      context += result.chunk.content + '\n\n---\n\n'
    }
  }
  
  // 2. For room-specific questions, add room scope data
  if (questionType === 'room' && brain.roomIndex) {
    const roomContext = await getRoomContext(question, brain.roomIndex)
    if (roomContext) {
      context += '\n## Room Scope Data\n\n' + roomContext.text
      sources.push(...roomContext.sources)
    }
  }
  
  // 3. For schedule questions, add raw schedule data
  if (questionType === 'schedule') {
    const scheduleContext = getScheduleContext(projectId, question)
    if (scheduleContext) {
      context += '\n## Schedule Data\n\n' + scheduleContext.text
      sources.push(...scheduleContext.sources)
    }
  }
  
  // No context found
  if (!context) {
    return {
      answer: "I don't have enough information to answer this question. Please make sure relevant documents have been uploaded.",
      confidence: 'low',
      sources: []
    }
  }
  
  // Generate answer
  const response = await getAnthropic().messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: BRAIN_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Based on the following project information, answer this question: "${question}"

${context}

Provide a clear, specific answer citing the sources. If information conflicts between documents, note that.`
    }]
  })
  
  const answer = response.content[0].type === 'text' 
    ? response.content[0].text 
    : "Unable to generate answer."
  
  // Determine confidence
  const confidence = sources.length >= 3 ? 'high' : sources.length >= 1 ? 'medium' : 'low'
  
  // Generate related questions
  const relatedQuestions = generateRelatedQuestions(question, questionType)
  
  return {
    answer,
    confidence,
    sources,
    relatedQuestions
  }
}

/**
 * Classify the type of question being asked
 */
function classifyQuestion(question: string): 'general' | 'room' | 'schedule' | 'requirement' | 'location' {
  const lower = question.toLowerCase()
  
  // Room-specific patterns
  if (lower.match(/room\s+\d+|finishes?\s+(for|in)|what('s|\s+is)\s+in\s+room/)) {
    return 'room'
  }
  
  // Schedule patterns
  if (lower.match(/schedule|all\s+doors|all\s+rooms|list\s+of|how\s+many/)) {
    return 'schedule'
  }
  
  // Requirement patterns
  if (lower.match(/require|specification|shall|must|need\s+to/)) {
    return 'requirement'
  }
  
  // Location patterns
  if (lower.match(/where\s+is|locate|which\s+sheet|find/)) {
    return 'location'
  }
  
  return 'general'
}

/**
 * Get room-specific context
 */
async function getRoomContext(
  question: string,
  roomIndex: ProjectRoomIndex
): Promise<{ text: string; sources: BrainAnswer['sources'] } | null> {
  // Extract room number from question
  const roomMatch = question.match(/room\s+(\d+[A-Za-z]?)/i)
  if (!roomMatch) return null
  
  const roomNumber = roomMatch[1].toUpperCase()
  const room = roomIndex.rooms.get(roomNumber)
  
  if (!room) return null
  
  const summary = generateRoomSummary(room, roomIndex)
  
  return {
    text: summary,
    sources: [{
      type: 'room',
      documentName: 'Room Scope Index',
      location: `Room ${roomNumber}`,
      excerpt: `${room.roomName} - ${room.finishes?.floor || 'no finish data'}`
    }]
  }
}

/**
 * Get schedule-specific context
 */
function getScheduleContext(
  projectId: string,
  question: string
): { text: string; sources: BrainAnswer['sources'] } | null {
  const sheets = sheetAnalyses.get(projectId)
  if (!sheets) return null
  
  const lower = question.toLowerCase()
  const sources: BrainAnswer['sources'] = []
  const parts: string[] = []
  
  for (const sheet of sheets) {
    for (const schedule of sheet.schedules) {
      // Match schedule type to question
      const relevant = (
        (lower.includes('door') && schedule.type === 'door') ||
        (lower.includes('finish') && schedule.type === 'finish') ||
        (lower.includes('window') && schedule.type === 'window') ||
        (lower.includes('equipment') && schedule.type === 'equipment') ||
        (lower.includes('plumbing') && schedule.type === 'plumbing') ||
        (lower.includes('fixture') && schedule.type === 'plumbing')
      )
      
      if (relevant) {
        parts.push(`### ${schedule.name} (Sheet ${sheet.sheetNumber})`)
        parts.push(`Columns: ${schedule.columns.join(', ')}`)
        parts.push(`Entries: ${schedule.rows.length}`)
        
        // Include first few rows as sample
        const sample = schedule.rows.slice(0, 10)
        for (const row of sample) {
          parts.push(JSON.stringify(row))
        }
        if (schedule.rows.length > 10) {
          parts.push(`... and ${schedule.rows.length - 10} more entries`)
        }
        
        sources.push({
          type: 'schedule',
          documentName: sheet.sheetTitle,
          location: `Sheet ${sheet.sheetNumber}`,
          excerpt: `${schedule.name}: ${schedule.rows.length} entries`
        })
      }
    }
  }
  
  if (parts.length === 0) return null
  
  return { text: parts.join('\n'), sources }
}

/**
 * Generate related follow-up questions
 */
function generateRelatedQuestions(question: string, type: string): string[] {
  const related: string[] = []
  
  const roomMatch = question.match(/room\s+(\d+)/i)
  if (roomMatch) {
    const roomNum = roomMatch[1]
    related.push(
      `What are the finishes for Room ${roomNum}?`,
      `What doors serve Room ${roomNum}?`,
      `What equipment is in Room ${roomNum}?`
    )
  }
  
  if (type === 'schedule') {
    related.push(
      'What are all the fire-rated doors?',
      'Which rooms have carpet flooring?',
      'List all plumbing fixtures'
    )
  }
  
  if (type === 'requirement') {
    related.push(
      'What warranty requirements apply?',
      'Are there liquidated damages?',
      'What submittals are required?'
    )
  }
  
  return related.slice(0, 3)
}

// Functions already exported at declaration
