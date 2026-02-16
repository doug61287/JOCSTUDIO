import { useState, useRef, useEffect } from 'react'
import type { Message } from '../App'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  isProcessing: boolean
  hasDocuments: boolean
}

export function ChatInterface({ 
  messages, 
  onSendMessage, 
  isProcessing,
  hasDocuments 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing && hasDocuments) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const suggestedQuestions = [
    "What are the liquidated damages?",
    "Summarize Division 22 requirements",
    "What changed in Addendum 2?",
    "List owner-furnished equipment",
    "What's the warranty period for HVAC?",
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-estinator-text mb-2">
              What do you need to know?
            </h2>
            <p className="text-estinator-muted mb-6 max-w-md">
              {hasDocuments 
                ? "Ask me anything about your project documents. I'll find the answer and show you where it came from."
                : "Upload your project documents (specs, drawings, addenda) to get started."
              }
            </p>
            
            {hasDocuments && (
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(q)}
                    className="px-3 py-2 bg-estinator-surface border border-estinator-border rounded-lg text-sm text-estinator-text hover:border-estinator-accent hover:text-estinator-accent transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`message-enter flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-estinator-accent text-white'
                      : 'bg-estinator-surface border border-estinator-border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-estinator-border/50">
                      <div className="text-xs text-estinator-muted mb-2">Sources:</div>
                      {message.sources.map((source, i) => (
                        <div 
                          key={i}
                          className="text-xs bg-estinator-bg/50 rounded px-2 py-1.5 mb-1"
                        >
                          <span className="text-estinator-accent">
                            Page {source.page}
                          </span>
                          {source.section && (
                            <span className="text-estinator-muted">
                              {' • '}Section {source.section}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start message-enter">
                <div className="bg-estinator-surface border border-estinator-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-estinator-muted">
                    <div className="w-2 h-2 bg-estinator-accent rounded-full animate-pulse" />
                    Searching documents...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-estinator-border p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasDocuments ? "Ask about your project documents..." : "Upload documents to start asking questions..."}
              disabled={!hasDocuments || isProcessing}
              rows={1}
              className="w-full bg-estinator-surface border border-estinator-border rounded-xl px-4 py-3 pr-12 text-sm text-estinator-text placeholder-estinator-muted resize-none focus:outline-none focus:border-estinator-accent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || !hasDocuments || isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-estinator-accent rounded-lg flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 transition-colors"
            >
              ↑
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
