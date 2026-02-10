import { useProjectStore } from '../stores/projectStore';
import type { Tool } from '../types';

interface ToolbarProps {
  onCalibrate: () => void;
}

const tools: { id: Tool; icon: string; label: string }[] = [
  { id: 'select', icon: '👆', label: 'Select' },
  { id: 'pan', icon: '✋', label: 'Pan' },
  { id: 'line', icon: '📏', label: 'Measure Line' },
  { id: 'count', icon: '🔢', label: 'Count Items' },
  { id: 'area', icon: '⬛', label: 'Measure Area' },
];

export function Toolbar({ onCalibrate }: ToolbarProps) {
  const { activeTool, setActiveTool, zoom, setZoom } = useProjectStore();

  return (
    <div className="h-12 bg-gray-900/30 border-b border-white/10 flex items-center px-4 gap-2">
      {/* Tool Buttons */}
      <div className="flex items-center gap-1 mr-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
            title={tool.label}
          >
            <span className="text-lg">{tool.icon}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/20" />

      {/* Calibrate Button */}
      <button
        onClick={onCalibrate}
        className="tool-btn flex items-center gap-2 px-3"
        title="Calibrate Scale"
      >
        <span>📐</span>
        <span className="text-sm">Calibrate</span>
      </button>

      <div className="w-px h-6 bg-white/20" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          className="tool-btn"
          title="Zoom Out"
        >
          ➖
        </button>
        <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
          className="tool-btn"
          title="Zoom In"
        >
          ➕
        </button>
        <button
          onClick={() => setZoom(1)}
          className="tool-btn text-sm px-2"
          title="Reset Zoom"
        >
          Fit
        </button>
      </div>
    </div>
  );
}
