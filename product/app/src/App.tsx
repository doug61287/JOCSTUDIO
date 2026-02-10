import { useState, useCallback, useRef, useEffect } from 'react';
import { useProjectStore } from './stores/projectStore';
import { Toolbar } from './components/Toolbar';
import { PDFViewer } from './components/PDFViewer';
import { MeasurementPanel } from './components/MeasurementPanel';
import { DropZone } from './components/DropZone';
import { CalibrationDialog } from './components/CalibrationDialog';

function App() {
  const { project, setPdfUrl } = useProjectStore();
  const [showCalibration, setShowCalibration] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      alert('Please upload a PDF file');
    }
  }, [setPdfUrl]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-14 bg-gray-900/50 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📐</span>
          <h1 className="text-xl font-bold">JOCHero</h1>
          <span className="px-2 py-0.5 bg-yellow-400 text-blue-900 text-xs font-bold rounded">BETA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">{project?.name || 'New Project'}</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-sm"
          >
            Upload PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar onCalibrate={() => setShowCalibration(true)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div
          className="flex-1 relative"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {project?.pdfUrl ? (
            <PDFViewer />
          ) : (
            <DropZone onFileSelect={handleFileSelect} />
          )}
        </div>

        {/* Right Panel */}
        <MeasurementPanel />
      </div>

      {/* Calibration Dialog */}
      {showCalibration && (
        <CalibrationDialog onClose={() => setShowCalibration(false)} />
      )}
    </div>
  );
}

export default App;
