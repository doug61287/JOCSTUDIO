import { useState, useEffect, useCallback } from 'react'
import { UploadZone } from './components/UploadZone'
import { ChatInterface } from './components/ChatInterface'
import { DocumentList } from './components/DocumentList'
import { Header } from './components/Header'
import { uploadDocument, getDocumentStatus, askQuestion } from './api/client'

export interface Document {
  id: string
  name: string
  pages: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { page: number; section?: string; text: string }[]
  timestamp: Date
}

function App() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Poll for document status updates
  const pollDocumentStatus = useCallback(async (docId: string) => {
    const maxAttempts = 60 // 2 minutes max
    let attempts = 0

    const poll = async () => {
      try {
        const status = await getDocumentStatus(docId)
        setDocuments(prev => 
          prev.map(d => 
            d.id === docId 
              ? { ...d, status: status.status, pages: status.pages }
              : d
          )
        )

        if (status.status === 'processing' && attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 2000)
        }
      } catch (err) {
        console.error('Failed to poll status:', err)
      }
    }

    poll()
  }, [])

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      // Add placeholder document
      const tempId = crypto.randomUUID()
      const newDoc: Document = {
        id: tempId,
        name: file.name,
        pages: 0,
        uploadedAt: new Date(),
        status: 'processing'
      }
      setDocuments(prev => [...prev, newDoc])

      try {
        // Upload to backend
        const response = await uploadDocument(file)
        
        // Update with real ID
        setDocuments(prev => 
          prev.map(d => 
            d.id === tempId 
              ? { ...d, id: response.id, pages: response.pages, status: response.status }
              : d
          )
        )

        // Poll for completion
        pollDocumentStatus(response.id)
      } catch (err) {
        console.error('Upload failed:', err)
        setDocuments(prev => 
          prev.map(d => 
            d.id === tempId 
              ? { ...d, status: 'error' }
              : d
          )
        )
      }
    }
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const response = await askQuestion(content)
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        sources: response.sources.map(s => ({
          page: s.pageNumber,
          section: s.section,
          text: s.excerpt
        })),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Query failed:', err)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="min-h-screen bg-estinator-bg flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar - Documents */}
        <aside className="w-80 border-r border-estinator-border flex flex-col">
          <div className="p-4 border-b border-estinator-border">
            <h2 className="text-sm font-semibold text-estinator-muted uppercase tracking-wider">
              Project Documents
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <UploadZone onUpload={handleUpload} />
            <DocumentList 
              documents={documents} 
              onRemove={handleRemoveDocument}
            />
          </div>
        </aside>

        {/* Main - Chat */}
        <main className="flex-1 flex flex-col">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            hasDocuments={documents.some(d => d.status === 'ready')}
          />
        </main>
      </div>
    </div>
  )
}

export default App
