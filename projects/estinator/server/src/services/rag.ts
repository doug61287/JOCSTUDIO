import OpenAI from 'openai'
import { embedQuery } from './embeddings.js'
import { searchChunks, type SearchResult } from './vectorStore.js'

// Lazy initialization
let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return openai
}

export interface RAGResponse {
  answer: string
  sources: {
    documentName: string
    pageNumber: number
    section?: string
    excerpt: string
  }[]
}

const SYSTEM_PROMPT = `You are Estinator, an AI assistant specialized in construction project documents. You help estimators quickly find information in specs, drawings, and addenda.

Your role:
- Answer questions based ONLY on the provided document excerpts
- Be precise and cite specific requirements, values, or specifications
- If the information isn't in the excerpts, say so clearly
- Use construction industry terminology appropriately
- When relevant, note the section/division the information comes from

Format your answers clearly. If listing requirements, use bullet points. If explaining a process, be step-by-step.`

/**
 * Answer a question using RAG
 */
export async function answerQuestion(
  projectId: string,
  question: string
): Promise<RAGResponse> {
  // 1. Embed the question
  const queryEmbedding = await embedQuery(question)

  // 2. Search for relevant chunks
  const results = searchChunks(projectId, queryEmbedding, 5)

  if (results.length === 0) {
    return {
      answer: "I don't have any documents to search. Please upload your project documents first.",
      sources: []
    }
  }

  // 3. Build context from chunks
  const context = results
    .map((r, i) => `[Source ${i + 1}: ${r.chunk.documentName}, Page ${r.chunk.pageNumber}${r.chunk.section ? `, Section ${r.chunk.section}` : ''}]\n${r.chunk.content}`)
    .join('\n\n---\n\n')

  // 4. Generate answer with LLM
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: `Based on the following document excerpts, answer this question: "${question}"

Document Excerpts:
${context}

Answer the question based on these excerpts. If the information isn't present, say so.`
      }
    ],
    temperature: 0.3,
    max_tokens: 1000
  })

  const answer = response.choices[0]?.message?.content || "I couldn't generate an answer."

  // 5. Format sources
  const sources = results.map(r => ({
    documentName: r.chunk.documentName,
    pageNumber: r.chunk.pageNumber,
    section: r.chunk.section,
    excerpt: r.chunk.content.slice(0, 200) + '...'
  }))

  return { answer, sources }
}
