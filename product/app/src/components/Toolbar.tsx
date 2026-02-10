import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Tool } from '../types';

interface ToolbarProps {
  onCalibrate: () => void;
}

const tools: { id: Tool; icon: string; label: string; shortcut: string }[] = [
  { id: 'select', icon: '👆', label: 'Select', shortcut: 'V' },
  { id: 'pan', icon: '✋', label: 'Pan', shortcut: 'H' },
  { id: 'line', icon: '📏', label: 'Measure Length', shortcut: 'L' },
  { id: 'count', icon: '🔢', label: 'Count Items', shortcut: 'C' },
  { id: 'area', icon: '⬛', label: 'Measure Area', shortcut: 'A' },
];

export function Toolbar({ onCalibrate }: ToolbarProps) {
  const { activeTool, setActiveTool, zoom, setZoom, project } = useProjectStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  if (typeof window !== 'undefined') {
    window.onkeydown = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      
      const key = e.key.toUpperCase();
      const tool = tools.find(t => t.shortcut === key);
      if (tool) {
        setActiveTool(tool.id);
        e.preventDefault();
      }
      
      // Zoom shortcuts
      if (e.key === '=' || e.key === '+') setZoom(Math.min(4, zoom + 0.25));
      if (e.key === '-') setZoom(Math.max(0.25, zoom - 0.25));
      if (e.key === '0') setZoom(1);
      if (e.key === 'Escape') setActiveTool('select');
    };
  }

  return (
    <div className="h-14 bg-gray-900/80 backdrop-blur border-b border-white/10 flex items-center px-4 gap-3">
      {/* Logo & Project Name */}
      <div className="flex items-center gap-3 pr-4 border-r border-white/10">
        <span className="text-xl">📐</span>
        <div className="hidden sm:block">
          <div className="text-sm font-medium">{project?.name || 'New Project'}</div>
          <div className="text-xs text-white/40">Scale: {project?.scale.toFixed(1)} px/ft</div>
        </div>
      </div>

      {/* Tool Buttons */}
      <div className="flex items-center gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`relative group flex items-center gap-2 px-3 py-2 rounded-lg transition-all
              ${activeTool === tool.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 text-white/70'}`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className="hidden md:inline text-sm">{tool.label}</span>
            
            {/* Shortcut badge */}
            <span className={`hidden sm:inline-flex items-center justify-center w-5 h-5 rounded text-xs font-mono
              ${activeTool === tool.id ? 'bg-white/20' : 'bg-white/5'}`}>
              {tool.shortcut}
            </span>
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-white/10" />

      {/* Calibrate Button */}
      <button
        onClick={onCalibrate}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
        title="Calibrate Scale"
      >
        <span>📐</span>
        <span className="hidden sm:inline text-sm">Calibrate</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
          title="Zoom Out (-)"
        >
          −
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-3 h-8 text-sm font-mono hover:bg-white/10 rounded min-w-[60px]"
          title="Reset Zoom (0)"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(Math.min(4, zoom + 0.25))}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10"
          title="Zoom In (+)"
        >
          +
        </button>
      </div>

      {/* Help */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60"
        title="Keyboard Shortcuts"
      >
        ⌨️
      </button>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="absolute top-16 right-4 bg-gray-800 border border-white/10 rounded-xl p-4 shadow-xl z-50">
          <h3 className="font-bold mb-3">⌨️ Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm">
            {tools.map((t) => (
              <div key={t.id} className="flex justify-between gap-8">
                <span className="text-white/60">{t.label}</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">{t.shortcut}</kbd>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 mt-2">
              <div className="flex justify-between gap-8">
                <span className="text-white/60">Zoom In</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">+</kbd>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-white/60">Zoom Out</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">−</kbd>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-white/60">Reset Zoom</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">0</kbd>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-white/60">Cancel</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono">Esc</kbd>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowShortcuts(false)}
            className="mt-3 w-full text-center text-sm text-white/40 hover:text-white"
          >
            Click anywhere to close
          </button>
        </div>
      )}
    </div>
  );
}
