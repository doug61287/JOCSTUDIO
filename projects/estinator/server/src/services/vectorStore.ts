import type { EmbeddedChunk } from './embeddings.js'

export interface SearchResult {
  chunk: EmbeddedChunk
  score: number
}

// In-memory store (upgrade to LanceDB for persistence)
const store: Map<string, EmbeddedChunk[]> = new Map()

/**
 * Store embedded chunks for a project
 */
export function storeChunks(projectId: string, chunks: EmbeddedChunk[]): void {
  const existing = store.get(projectId) || []
  store.set(projectId, [...existing, ...chunks])
}

/**
 * Search for similar chunks
 */
export function searchChunks(
  projectId: string,
  queryEmbedding: number[],
  topK: number = 5
): SearchResult[] {
  const chunks = store.get(projectId) || []
  
  if (chunks.length === 0) {
    return []
  }

  // Calculate cosine similarity for each chunk
  const scored = chunks.map(chunk => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }))

  // Sort by score and return top K
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

/**
 * Get all documents in a project
 */
export function getDocuments(projectId: string): string[] {
  const chunks = store.get(projectId) || []
  const docs = new Set(chunks.map(c => c.documentName))
  return Array.from(docs)
}

/**
 * Remove a document from a project
 */
export function removeDocument(projectId: string, documentId: string): void {
  const chunks = store.get(projectId) || []
  const filtered = chunks.filter(c => c.documentId !== documentId)
  store.set(projectId, filtered)
}

/**
 * Clear all data for a project
 */
export function clearProject(projectId: string): void {
  store.delete(projectId)
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
