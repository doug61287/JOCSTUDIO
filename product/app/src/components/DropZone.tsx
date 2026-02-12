import { useCallback, useState, useRef } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load the demo drawing (Bellevue ED Ambulance Bay)
  const handleLoadDemo = useCallback(async () => {
    setLoadingDemo(true);
    try {
      const response = await fetch('/test-drawing.pdf');
      const blob = await response.blob();
      const file = new File([blob], 'Bellevue-ED-Ambulance-Bay.pdf', { type: 'application/pdf' });
      onFileSelect(file);
    } catch (error) {
      console.error('Failed to load demo:', error);
      alert('Failed to load demo drawing');
    } finally {
      setLoadingDemo(false);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`h-full flex items-center justify-center p-8 transition-all ${
        isDragging ? 'bg-blue-600/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`max-w-lg w-full p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer
          ${isDragging ? 'border-blue-400 bg-blue-600/10' : 'border-white/20 hover:border-white/40'}`}
        onClick={handleClick}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold mb-2">Upload Construction Drawing</h2>
          <p className="text-white/60 mb-6">
            Drag & drop a PDF file here, or click to browse
          </p>
          <div className="flex flex-col gap-3 items-center">
            <button className="btn btn-primary">
              Choose PDF File
            </button>
            <span className="text-white/40 text-sm">or</span>
            <button 
              onClick={(e) => { e.stopPropagation(); handleLoadDemo(); }}
              disabled={loadingDemo}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {loadingDemo ? '⏳ Loading...' : '🏥 Load Demo: Bellevue ED'}
            </button>
          </div>
          <p className="text-sm text-white/40 mt-4">
            Supported: PDF files up to 50MB
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
