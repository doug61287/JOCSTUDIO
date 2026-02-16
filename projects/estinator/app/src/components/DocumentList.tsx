import type { Document } from '../App'

interface DocumentListProps {
  documents: Document[]
  onRemove: (id: string) => void
}

export function DocumentList({ documents, onRemove }: DocumentListProps) {
  if (documents.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => (
        <div
          key={doc.id}
          className="bg-estinator-surface border border-estinator-border rounded-lg p-3 group"
        >
          <div className="flex items-start gap-3">
            <div className="text-xl">
              {doc.status === 'processing' ? '⏳' : doc.status === 'ready' ? '📄' : '❌'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-estinator-text truncate">
                {doc.name}
              </div>
              <div className="text-xs text-estinator-muted mt-0.5">
                {doc.status === 'processing' ? (
                  'Processing...'
                ) : doc.status === 'ready' ? (
                  `${doc.pages} pages • Ready`
                ) : (
                  'Failed to process'
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(doc.id)}
              className="opacity-0 group-hover:opacity-100 text-estinator-muted hover:text-estinator-accent transition-all"
            >
              ✕
            </button>
          </div>
          
          {doc.status === 'processing' && (
            <div className="mt-2 h-1 bg-estinator-border rounded-full overflow-hidden">
              <div className="h-full bg-estinator-accent rounded-full animate-pulse w-2/3" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
