import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useShallow } from 'zustand/react/shallow';
import type { Tool } from '../types';

interface ToolbarProps {
  onCalibrate: () => void;
}

const measureTools: { id: Tool; icon: string; label: string; shortcut: string }[] = [
  { id: 'line', icon: '📏', label: 'Measure Length', shortcut: 'L' },
  { id: 'count', icon: '🔢', label: 'Count Items', shortcut: 'C' },
  { id: 'area', icon: '⬛', label: 'Measure Area', shortcut: 'A' },
  { id: 'space', icon: '🏠', label: 'Define Space/Room', shortcut: 'S' },
];

export function Toolbar({ onCalibrate }: ToolbarProps) {
  const { activeTool, setActiveTool, zoom, setZoom, projectName, scale } = useProjectStore(
    useShallow((state) => ({
      activeTool: state.activeTool,
      setActiveTool: state.setActiveTool,
      zoom: state.zoom,
      setZoom: state.setZoom,
      projectName: state.project?.name || 'New Project',
      scale: state.project?.scale ?? 0,
    }))
  );
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard shortcuts
  if (typeof window !== 'undefined') {
    window.onkeydown = (e) => {
      if (e.target instanceof HTMLInputElement) return;
      
      const key = e.key.toUpperCase();
      
      // View tools
      if (key === 'V') { setActiveTool('select'); e.preventDefault(); return; }
      if (key === 'H') { setActiveTool('pan'); e.preventDefault(); return; }
      if (key === 'T') { setActiveTool('text'); e.preventDefault(); return; }
      
      // Measure tools
      const tool = measureTools.find(t => t.shortcut === key);
      if (tool) {
        setActiveTool(tool.id);
        e.preventDefault();
        return;
      }
      
      // Zoom shortcuts
      if (e.key === '=' || e.key === '+') setZoom(Math.min(5, zoom + 0.1));
      if (e.key === '-') setZoom(Math.max(0.1, zoom - 0.1));
      if (e.key === '0') setZoom(1);
      if (e.key === 'Escape') setActiveTool('select');
    };
  }

  return (
    <div className="h-12 bg-[#2d2d30] border-b border-[#3f3f46] flex items-center px-3 gap-2 flex-shrink-0 overflow-x-auto">
      {/* Logo & Project Name */}
      <div className="flex items-center gap-2 pr-3 border-r border-white/10">
        <span className="text-lg">📐</span>
        <div className="hidden sm:block">
          <div className="text-sm font-medium text-white">{projectName}</div>
        </div>
      </div>

      {/* Measurement Tools */}
      <div className="flex items-center gap-0.5 px-2">
        {measureTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`relative group flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all text-sm
              ${activeTool === tool.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                : 'hover:bg-white/10 text-white/70'}`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <span>{tool.icon}</span>
            <span className="hidden lg:inline">{tool.label}</span>
            
            {/* Shortcut badge */}
            <span className={`hidden sm:inline-flex items-center justify-center w-5 h-5 rounded text-xs font-mono
              ${activeTool === tool.id ? 'bg-white/20' : 'bg-white/5'}`}>
              {tool.shortcut}
            </span>
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Calibrate Button */}
      <button
        onClick={onCalibrate}
        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm
          ${scale > 1 
            ? 'hover:bg-white/10 text-white/70' 
            : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 animate-pulse'}`}
        title="Calibrate Scale"
      >
        <span>📐</span>
        <span className="hidden sm:inline">Calibrate</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Scale Info */}
      <div className="hidden md:flex items-center gap-2 text-xs text-white/50 pr-2 border-r border-white/10">
        <span>Scale:</span>
        <span className={scale > 1 ? 'text-green-400' : 'text-yellow-400'}>
          {scale > 1 
            ? `${scale.toFixed(1)} px/ft` 
            : 'Not Set'}
        </span>
      </div>

      {/* Quick Zoom Display */}
      <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1">
        <span className="text-xs font-mono text-white/60">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Help */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-white/60"
        title="Keyboard Shortcuts"
      >
        ⌨️
      </button>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="absolute top-14 right-4 bg-[#252526] border border-[#3f3f46] rounded-lg p-4 shadow-xl z-50 text-sm">
          <h3 className="font-bold mb-3 text-white">⌨️ Keyboard Shortcuts</h3>
          <div className="space-y-1.5">
            <div className="text-white/50 text-xs uppercase tracking-wide mt-2">View</div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Select</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">V</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Pan</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">H</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Text Select</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">T</kbd>
            </div>
            
            <div className="text-white/50 text-xs uppercase tracking-wide mt-3">Measure</div>
            {measureTools.map((t) => (
              <div key={t.id} className="flex justify-between gap-8">
                <span className="text-white/60">{t.label}</span>
                <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">{t.shortcut}</kbd>
              </div>
            ))}
            
            <div className="text-white/50 text-xs uppercase tracking-wide mt-3">Zoom</div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Zoom In</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">+</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Zoom Out</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">−</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Reset Zoom</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">0</kbd>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-white/60">Cancel</span>
              <kbd className="px-2 py-0.5 bg-white/10 rounded font-mono text-xs">Esc</kbd>
            </div>
          </div>
          <button
            onClick={() => setShowShortcuts(false)}
            className="mt-3 w-full text-center text-xs text-white/40 hover:text-white"
          >
            Click to close
          </button>
        </div>
      )}
    </div>
  );
}
