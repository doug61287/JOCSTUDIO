import { useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';

interface CalibrationDialogProps {
  onClose: () => void;
}

// Common architectural scales
// At 72 DPI baseline, 1 inch = 72 pixels
// Our PDF renders at 1.5x zoom, so 1 inch = 108 pixels
// Scale format: "drawing distance" = "real distance"
// e.g., 1/4" = 1'-0" means 0.25 inches on paper = 1 foot real
const SCALE_PRESETS = [
  { label: '1/16" = 1\'-0"', ratio: 1/16, description: 'Very small scale - site plans' },
  { label: '1/8" = 1\'-0"', ratio: 1/8, description: 'Small scale - floor plans' },
  { label: '3/16" = 1\'-0"', ratio: 3/16, description: 'Small-medium scale' },
  { label: '1/4" = 1\'-0"', ratio: 1/4, description: 'Standard floor plans' },
  { label: '3/8" = 1\'-0"', ratio: 3/8, description: 'Enlarged plans' },
  { label: '1/2" = 1\'-0"', ratio: 1/2, description: 'Details, sections' },
  { label: '3/4" = 1\'-0"', ratio: 3/4, description: 'Large details' },
  { label: '1" = 1\'-0"', ratio: 1, description: 'Full size details' },
  { label: '1-1/2" = 1\'-0"', ratio: 1.5, description: 'Large scale details' },
  { label: '3" = 1\'-0"', ratio: 3, description: 'Very large details' },
];

// Engineering scales (1" = X feet)
const ENGINEERING_PRESETS = [
  { label: '1" = 10\'', ratio: 1/10, description: 'Site plans' },
  { label: '1" = 20\'', ratio: 1/20, description: 'Site plans' },
  { label: '1" = 30\'', ratio: 1/30, description: 'Civil plans' },
  { label: '1" = 40\'', ratio: 1/40, description: 'Civil plans' },
  { label: '1" = 50\'', ratio: 1/50, description: 'Large site plans' },
  { label: '1" = 100\'', ratio: 1/100, description: 'Very large sites' },
];

type CalibrationMode = 'preset' | 'measure' | 'manual';

export function CalibrationDialog({ onClose }: CalibrationDialogProps) {
  const { project, setScale, zoom } = useProjectStore();
  const [mode, setMode] = useState<CalibrationMode>('preset');
  const [scaleType, setScaleType] = useState<'architectural' | 'engineering'>('architectural');
  
  // Manual mode
  const [knownDistance, setKnownDistance] = useState('10');
  const [pixelDistance, setPixelDistance] = useState('100');
  
  // Selected preset
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  
  // PDF DPI estimation (most PDFs are 72 or 150 DPI)
  const [pdfDpi, setPdfDpi] = useState(72);

  // Calculate pixels per foot from a scale ratio
  // ratio = inches on paper per foot real
  // At 72 DPI: 1 inch = 72 pixels
  // With zoom factor and PDF DPI consideration
  const calculatePixelsPerFoot = useCallback((ratio: number) => {
    // Base calculation: ratio inches per foot * DPI * render zoom
    const renderScale = 1.5; // Our PDF viewer renders at 1.5x
    const basePixelsPerInch = pdfDpi * renderScale * zoom;
    return ratio * basePixelsPerInch;
  }, [pdfDpi, zoom]);

  const handlePresetSelect = useCallback((index: number, presets: typeof SCALE_PRESETS) => {
    setSelectedPreset(index);
    const preset = presets[index];
    const pixelsPerFoot = calculatePixelsPerFoot(preset.ratio);
    setScale(pixelsPerFoot);
  }, [calculatePixelsPerFoot, setScale]);

  const handleManualCalibrate = useCallback(() => {
    const known = parseFloat(knownDistance);
    const pixels = parseFloat(pixelDistance);
    
    if (known > 0 && pixels > 0) {
      const scale = pixels / known; // pixels per foot
      setScale(scale);
      onClose();
    }
  }, [knownDistance, pixelDistance, setScale, onClose]);

  const activePresets = scaleType === 'architectural' ? SCALE_PRESETS : ENGINEERING_PRESETS;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📐 Set Drawing Scale
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
          >
            ✕
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setMode('preset')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'preset' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            📋 Presets
          </button>
          <button
            onClick={() => setMode('measure')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'measure' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            📏 Measure
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'manual' ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            ✏️ Manual
          </button>
        </div>

        {/* Preset Mode */}
        {mode === 'preset' && (
          <div className="space-y-4">
            {/* Scale Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => { setScaleType('architectural'); setSelectedPreset(null); }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  scaleType === 'architectural' 
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-400' 
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                🏛️ Architectural
              </button>
              <button
                onClick={() => { setScaleType('engineering'); setSelectedPreset(null); }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  scaleType === 'engineering' 
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-400' 
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                🔧 Engineering
              </button>
            </div>

            {/* PDF DPI Setting */}
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/60">PDF DPI:</span>
              <div className="flex gap-2">
                {[72, 96, 150, 300].map((dpi) => (
                  <button
                    key={dpi}
                    onClick={() => setPdfDpi(dpi)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      pdfDpi === dpi
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {dpi}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Presets Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {activePresets.map((preset, idx) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(idx, activePresets)}
                  className={`p-3 rounded-lg text-left transition-all border ${
                    selectedPreset === idx
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="font-mono font-bold text-sm">{preset.label}</div>
                  <div className="text-xs text-white/50 mt-1">{preset.description}</div>
                </button>
              ))}
            </div>

            {selectedPreset !== null && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <div className="text-sm text-green-400">✓ Scale applied!</div>
                <div className="text-xs text-white/60 mt-1">
                  {project?.scale.toFixed(1)} pixels per foot
                </div>
              </div>
            )}

            <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3">
              <div className="text-sm font-medium text-amber-400">💡 Tip</div>
              <div className="text-sm text-white/80 mt-1">
                Check your drawing's title block for the scale notation. 
                If measurements seem off, try the "Measure" tab to calibrate from a known dimension.
              </div>
            </div>
          </div>
        )}

        {/* Measure Mode - Interactive calibration */}
        {mode === 'measure' && (
          <div className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <h3 className="font-bold text-blue-400 mb-2">📏 Interactive Calibration</h3>
              <ol className="text-sm text-white/80 space-y-2">
                <li>1. Find a dimension line on your drawing with a known length (e.g., "10'-0"")</li>
                <li>2. Close this dialog</li>
                <li>3. Use the <strong>Line tool (L)</strong> to draw from one end to the other</li>
                <li>4. Note the pixel length shown</li>
                <li>5. Come back here and enter both values below</li>
              </ol>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Real Distance (feet)
                </label>
                <input
                  type="number"
                  value={knownDistance}
                  onChange={(e) => setKnownDistance(e.target.value)}
                  placeholder="10"
                  className="w-full"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Measured Pixels
                </label>
                <input
                  type="number"
                  value={pixelDistance}
                  onChange={(e) => setPixelDistance(e.target.value)}
                  placeholder="180"
                  className="w-full"
                />
              </div>
            </div>

            <button
              onClick={handleManualCalibrate}
              className="w-full btn btn-primary"
            >
              Set Scale from Measurement
            </button>
          </div>
        )}

        {/* Manual Mode */}
        {mode === 'manual' && (
          <div className="space-y-4">
            <p className="text-white/60 text-sm">
              If you know the exact pixels-per-foot ratio, enter it directly:
            </p>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pixels per Foot
              </label>
              <input
                type="number"
                value={project?.scale || 10}
                onChange={(e) => setScale(parseFloat(e.target.value) || 10)}
                placeholder="18"
                className="w-full"
                step="0.1"
              />
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-sm text-white/60">Current Scale</div>
              <div className="text-lg font-bold font-mono">
                {project?.scale.toFixed(2)} px/ft
              </div>
              <div className="text-xs text-white/40 mt-1">
                1 foot = {project?.scale.toFixed(1)} pixels on screen
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
          >
            {selectedPreset !== null || mode === 'manual' ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
