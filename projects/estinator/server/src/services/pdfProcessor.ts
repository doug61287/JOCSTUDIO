import pdf from 'pdf-parse'
import { v4 as uuidv4 } from 'uuid'

export interface DocumentChunk {
  id: string
  documentId: string
  documentName: string
  content: string
  pageNumber: number
  section?: string
  chunkIndex: number
}

export interface ProcessedDocument {
  id: string
  name: string
  pages: number
  chunks: DocumentChunk[]
  processedAt: Date
}

const CHUNK_SIZE = 1000 // characters
const CHUNK_OVERLAP = 200

/**
 * Extract text from PDF and chunk it for embedding
 */
export async function processPDF(
  buffer: Buffer, 
  fileName: string
): Promise<ProcessedDocument> {
  const docId = uuidv4()
  
  // Parse PDF
  const data = await pdf(buffer)
  const text = data.text
  const pages = data.numpages

  // Split into chunks
  const chunks = chunkText(text, docId, fileName)

  return {
    id: docId,
    name: fileName,
    pages,
    chunks,
    processedAt: new Date()
  }
}

/**
 * Split text into overlapping chunks for better context retrieval
 */
function chunkText(
  text: string, 
  documentId: string, 
  documentName: string
): DocumentChunk[] {
  const chunks: DocumentChunk[] = []
  
  // Clean up text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Split into paragraphs first
  const paragraphs = cleanText.split(/\n\n+/)
  
  let currentChunk = ''
  let chunkIndex = 0
  let estimatedPage = 1

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed chunk size, save current chunk
    if (currentChunk.length + paragraph.length > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        id: uuidv4(),
        documentId,
        documentName,
        content: currentChunk.trim(),
        pageNumber: estimatedPage,
        section: extractSection(currentChunk),
        chunkIndex: chunkIndex++
      })
      
      // Start new chunk with overlap
      const words = currentChunk.split(' ')
      const overlapWords = words.slice(-Math.floor(CHUNK_OVERLAP / 5))
      currentChunk = overlapWords.join(' ') + '\n\n'
    }
    
    currentChunk += paragraph + '\n\n'
    
    // Rough page estimation (about 3000 chars per page)
    estimatedPage = Math.floor(currentChunk.length / 3000) + 1
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: uuidv4(),
      documentId,
      documentName,
      content: currentChunk.trim(),
      pageNumber: estimatedPage,
      section: extractSection(currentChunk),
      chunkIndex: chunkIndex
    })
  }

  return chunks
}

/**
 * Try to extract CSI section number from text
 */
function extractSection(text: string): string | undefined {
  // Common patterns: "22 05 00", "SECTION 22 05 00", "220500"
  const patterns = [
    /SECTION\s+(\d{2}\s*\d{2}\s*\d{2})/i,
    /(\d{2}\s+\d{2}\s+\d{2})/,
    /DIVISION\s+(\d{1,2})/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].replace(/\s+/g, ' ').trim()
    }
  }

  return undefined
}
