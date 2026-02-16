import OpenAI from 'openai'
import type { DocumentChunk } from './pdfProcessor.js'

const EMBEDDING_MODEL = 'text-embedding-3-small'

// Lazy initialization to avoid startup errors
let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for embeddings')
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openai
}

export interface EmbeddedChunk extends DocumentChunk {
  embedding: number[]
}

/**
 * Generate embeddings for document chunks
 */
export async function embedChunks(
  chunks: DocumentChunk[]
): Promise<EmbeddedChunk[]> {
  const embeddedChunks: EmbeddedChunk[] = []

  // Process in batches of 100 (OpenAI limit)
  const batchSize = 100
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    const texts = batch.map(c => c.content)

    const response = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts
    })

    for (let j = 0; j < batch.length; j++) {
      embeddedChunks.push({
        ...batch[j],
        embedding: response.data[j].embedding
      })
    }
  }

  return embeddedChunks
}

/**
 * Generate embedding for a query
 */
export async function embedQuery(query: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: query
  })

  return response.data[0].embedding
}
