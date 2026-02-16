import { useCallback, useState } from 'react'

interface UploadZoneProps {
  onUpload: (files: File[]) => void
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf'
    )
    if (files.length > 0) {
      onUpload(files)
    }
  }, [onUpload])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onUpload(files)
    }
    e.target.value = '' // Reset for re-upload of same file
  }, [onUpload])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
        ${isDragging 
          ? 'border-estinator-accent bg-estinator-accent/10' 
          : 'border-estinator-border hover:border-estinator-muted'
        }
      `}
    >
      <input
        type="file"
        accept=".pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-3xl mb-2">📄</div>
        <div className="text-sm text-estinator-text font-medium">
          Drop PDFs here
        </div>
        <div className="text-xs text-estinator-muted mt-1">
          Specs, drawings, addenda
        </div>
      </label>
    </div>
  )
}
