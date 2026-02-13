import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from './stores/projectStore';
import { Toolbar } from './components/Toolbar';
import { PDFViewer } from './components/PDFViewer';
import { MeasurementPanel } from './components/MeasurementPanel';
import { DropZone } from './components/DropZone';
import { CalibrationDialog } from './components/CalibrationDialog';
import { TranslationMachine } from './components/TranslationMachine';
import { AssemblyContextBar } from './components/AssemblyContextBar';
import { SchedulePanel } from './components/SchedulePanel';

function App() {
  const { project, setPdfUrl, setProject, addMeasurement, activeAssembly, setActiveAssembly } = useProjectStore();
  const [showCalibration, setShowCalibration] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle selecting a JOC item from the translator
  const handleJocItemSelect = useCallback((item: { taskCode: string; description: string; unit: string; unitCost: number }) => {
    // Create a new measurement with the JOC item
    const newMeasurement = {
      id: `m-${Date.now()}`,
      type: 'count' as const,
      points: [{ x: 0, y: 0 }],
      value: 1,
      unit: item.unit,
      label: item.description,
      color: '#22c55e',
      pageNumber: 1,
      jocItem: {
        taskCode: item.taskCode,
        description: item.description,
        unit: item.unit,
        unitCost: item.unitCost,
      },
    };
    addMeasurement(newMeasurement);
    setShowTranslator(false);
  }, [addMeasurement]);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      // Set project name from filename
      const name = file.name.replace('.pdf', '').replace(/_/g, ' ');
      setProject({
        ...project!,
        name,
        pdfFile: file,
        pdfUrl: url,
      });
    } else {
      alert('Please upload a PDF file');
    }
  }, [setPdfUrl, setProject, project]);

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
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="h-12 bg-gray-900 border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">📐</span>
          <h1 className="text-lg font-bold text-white">JOCHero</h1>
          <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold rounded">
            BETA
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Project Name */}
          {project?.pdfUrl && (
            <div className="hidden sm:block text-sm text-white/60 max-w-[200px] truncate">
              {project?.name}
            </div>
          )}
          
          {/* Schedule Extraction Button */}
          {project?.pdfUrl && (
            <button
              onClick={() => setShowSchedules(!showSchedules)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                showSchedules 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
              }`}
            >
              <span>📋</span>
              <span className="hidden sm:inline">Schedules</span>
            </button>
          )}
          
          {/* Translation Machine Button */}
          <button
            onClick={() => setShowTranslator(!showTranslator)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
              showTranslator 
                ? 'bg-amber-500 text-black' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400'
            }`}
          >
            <span>🔮</span>
            <span className="hidden sm:inline">Translate</span>
          </button>
          
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-all"
          >
            <span>📄</span>
            <span className="hidden sm:inline">Upload PDF</span>
          </button>
          
          {/* Help Link */}
          <Link
            to="/help"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
            title="Help & Guides"
          >
            ❓
          </Link>
          
          {/* Insights Dashboard Link */}
          <Link
            to="/insights"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
            title="Learning Insights"
          >
            📊
          </Link>
          
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {/* User Menu */}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            L
          </div>
          
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

      {/* Assembly Context Bar - "What are you measuring?" */}
      {project?.pdfUrl && (
        <AssemblyContextBar
          selectedAssembly={activeAssembly}
          onSelectAssembly={setActiveAssembly}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden bg-gray-900 min-h-0">
        {/* PDF Viewer */}
        <div
          className="flex-1 min-w-0 relative"
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

      {/* Status Bar */}
      <footer className="h-6 bg-gray-900 border-t border-white/10 flex items-center justify-between px-4 text-xs text-white/40">
        <div className="flex items-center gap-4">
          <span>Scale: {project?.scale.toFixed(1)} px/ft</span>
          <span>•</span>
          <span>{project?.measurements.length || 0} measurements</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Press H for help</span>
          <span>•</span>
          <span>JOCHero v1.0 Beta</span>
        </div>
      </footer>

      {/* Calibration Dialog */}
      {showCalibration && (
        <CalibrationDialog onClose={() => setShowCalibration(false)} />
      )}

      {/* Translation Machine Panel */}
      {showTranslator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4">
            <button
              onClick={() => setShowTranslator(false)}
              className="absolute -top-12 right-0 px-3 py-1 text-white/60 hover:text-white text-sm flex items-center gap-1"
            >
              <span>ESC to close</span>
              <span className="text-lg">✕</span>
            </button>
            <TranslationMachine 
              onSelectItem={handleJocItemSelect}
              className="shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Schedule Extraction Panel */}
      {showSchedules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl mx-4 h-[80vh]">
            <button
              onClick={() => setShowSchedules(false)}
              className="absolute -top-12 right-0 px-3 py-1 text-white/60 hover:text-white text-sm flex items-center gap-1"
            >
              <span>ESC to close</span>
              <span className="text-lg">✕</span>
            </button>
            <div className="h-full rounded-xl overflow-hidden shadow-2xl">
              <SchedulePanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
