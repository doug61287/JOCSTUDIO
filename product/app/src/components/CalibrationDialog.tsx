import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';

interface CalibrationDialogProps {
  onClose: () => void;
}

export function CalibrationDialog({ onClose }: CalibrationDialogProps) {
  const { project, setScale } = useProjectStore();
  const [knownDistance, setKnownDistance] = useState('10');
  const [pixelDistance, setPixelDistance] = useState('100');

  const handleCalibrate = () => {
    const known = parseFloat(knownDistance);
    const pixels = parseFloat(pixelDistance);
    
    if (known > 0 && pixels > 0) {
      const scale = pixels / known; // pixels per foot
      setScale(scale);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-white/10">
        <h2 className="text-xl font-bold mb-4">📐 Calibrate Scale</h2>
        
        <p className="text-white/60 mb-6 text-sm">
          To get accurate measurements, we need to know the scale of your drawing.
          Measure a known distance (like a wall dimension) on the drawing.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Known Distance (feet)
            </label>
            <input
              type="number"
              value={knownDistance}
              onChange={(e) => setKnownDistance(e.target.value)}
              placeholder="e.g., 10"
              className="w-full"
              step="0.1"
            />
            <p className="text-xs text-white/40 mt-1">
              Enter the real-world distance in feet
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Pixel Distance
            </label>
            <input
              type="number"
              value={pixelDistance}
              onChange={(e) => setPixelDistance(e.target.value)}
              placeholder="e.g., 100"
              className="w-full"
            />
            <p className="text-xs text-white/40 mt-1">
              Use the Line tool to measure the same distance in pixels
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-sm text-white/60">Current Scale</div>
            <div className="text-lg font-bold">
              {project?.scale.toFixed(1)} pixels/foot
            </div>
          </div>

          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-400">💡 Tip</div>
            <div className="text-sm text-white/80 mt-1">
              Look for a dimension line on your drawing with a known measurement,
              like "10'-0"" or "12 ft". Measure that line on screen to calibrate.
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleCalibrate}
            className="btn btn-primary flex-1"
          >
            Set Scale
          </button>
        </div>
      </div>
    </div>
  );
}
