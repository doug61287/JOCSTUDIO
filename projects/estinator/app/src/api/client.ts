const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export interface UploadResponse {
  id: string
  name: string
  pages: number
  status: 'processing' | 'ready' | 'error'
  chunks: number
}

export interface DocumentStatus {
  id: string
  projectId: string
  name: string
  pages: number
  status: 'processing' | 'ready' | 'error'
  uploadedAt: string
}

export interface QueryResponse {
  answer: string
  sources: {
    documentName: string
    pageNumber: number
    section?: string
    excerpt: string
  }[]
}

/**
 * Upload a document
 */
export async function uploadDocument(
  file: File, 
  projectId: string = 'default'
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Failed to upload document')
  }

  return response.json()
}

/**
 * Check document status
 */
export async function getDocumentStatus(id: string): Promise<DocumentStatus> {
  const response = await fetch(`${API_BASE}/documents/${id}/status`)
  
  if (!response.ok) {
    throw new Error('Failed to get document status')
  }

  return response.json()
}

/**
 * Ask a question
 */
export async function askQuestion(
  question: string,
  projectId: string = 'default'
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question, projectId })
  })

  if (!response.ok) {
    throw new Error('Failed to get answer')
  }

  return response.json()
}

/**
 * List project documents
 */
export async function listDocuments(
  projectId: string = 'default'
): Promise<DocumentStatus[]> {
  const response = await fetch(`${API_BASE}/documents/project/${projectId}`)
  
  if (!response.ok) {
    throw new Error('Failed to list documents')
  }

  return response.json()
}

/**
 * Delete a document
 */
export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw new Error('Failed to delete document')
  }
}
