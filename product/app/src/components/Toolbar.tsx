import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useShallow } from 'zustand/react/shallow';
import type { Tool } from '../types';
import {
  Ruler,
  Pencil,
  Hash,
  Square,
  Home,
  Scale,
  Keyboard,
  X,
  MousePointer,
  Hand,
  Type,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';

interface ToolbarProps {
  onCalibrate: () => void;
}

const measureTools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'line', icon: <Ruler className="w-4 h-4" />, label: 'Length', shortcut: 'L' },
  { id: 'polyline', icon: <Pencil className="w-4 h-4" />, label: 'Polyline', shortcut: 'P' },
  { id: 'count', icon: <Hash className="w-4 h-4" />, label: 'Count', shortcut: 'C' },
  { id: 'area', icon: <Square className="w-4 h-4" />, label: 'Area', shortcut: 'A' },
  { id: 'space', icon: <Home className="w-4 h-4" />, label: 'Room', shortcut: 'S' },
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
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
      if (e.key === '=' || e.key === '+') { setZoom(Math.min(5, zoom + 0.1)); e.preventDefault(); }
      if (e.key === '-') { setZoom(Math.max(0.1, zoom - 0.1)); e.preventDefault(); }
      if (e.key === '0') { setZoom(1); e.preventDefault(); }
      if (e.key === 'Escape') setActiveTool('select');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, setZoom, setActiveTool]);

  return (
    <div className="h-14 bg-gray-900/95 backdrop-blur-xl border-b border-white/[0.08] flex items-center px-4 gap-3 flex-shrink-0">
      {/* Logo & Project Name */}
      <div className="flex items-center gap-3 pr-4 border-r border-white/[0.08]">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Ruler className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white">{projectName}</p>
          <p className="text-xs text-white/40">JOCHero Takeoff</p>
        </div>
      </div>

      {/* Measurement Tools */}
      <div className="flex items-center bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
        {measureTools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`
                relative flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-150
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }
              `}
              title={`${tool.label} (${tool.shortcut})`}
            >
              {tool.icon}
              <span className="hidden lg:inline text-sm font-medium">{tool.label}</span>
              <kbd className={`
                hidden sm:inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-mono font-semibold
                ${isActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-white/40'}
              `}>
                {tool.shortcut}
              </kbd>
            </button>
          );
        })}
      </div>

      {/* Calibrate Button */}
      <button
        onClick={onCalibrate}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-150 text-sm font-medium
          ${scale > 1 
            ? 'bg-white/[0.03] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.06]' 
            : 'bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30'
          }
        `}
        title="Calibrate Scale"
      >
        <Scale className="w-4 h-4" />
        <span className="hidden sm:inline">Calibrate</span>
        {!scale || scale <= 1 && (
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Scale Info */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
        <Scale className="w-3.5 h-3.5 text-white/40" />
        <span className={`text-sm font-medium tabular-nums ${scale > 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {scale > 1 ? `${scale.toFixed(1)} px/ft` : 'Not calibrated'}
        </span>
      </div>

      {/* Help */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className={`
          w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
          ${showShortcuts 
            ? 'bg-blue-600 text-white' 
            : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06]'
          }
        `}
        title="Keyboard Shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowShortcuts(false)} 
          />
          <div className="absolute top-16 right-4 w-72 bg-gray-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-white/60" />
                <span className="font-semibold text-sm">Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* View Section */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">View</p>
                <div className="space-y-1">
                  {[
                    { icon: <MousePointer className="w-3.5 h-3.5" />, label: 'Select', key: 'V' },
                    { icon: <Hand className="w-3.5 h-3.5" />, label: 'Pan', key: 'H' },
                    { icon: <Type className="w-3.5 h-3.5" />, label: 'Text Select', key: 'T' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 text-white/60">
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <kbd className="px-2 py-0.5 bg-white/[0.06] rounded text-xs font-mono text-white/50">{item.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measure Section */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Measure</p>
                <div className="space-y-1">
                  {measureTools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 text-white/60">
                        {tool.icon}
                        <span className="text-sm">{tool.label}</span>
                      </div>
                      <kbd className="px-2 py-0.5 bg-white/[0.06] rounded text-xs font-mono text-white/50">{tool.shortcut}</kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zoom Section */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Zoom</p>
                <div className="space-y-1">
                  {[
                    { icon: <ZoomIn className="w-3.5 h-3.5" />, label: 'Zoom In', key: '+' },
                    { icon: <ZoomOut className="w-3.5 h-3.5" />, label: 'Zoom Out', key: '−' },
                    { icon: <RotateCcw className="w-3.5 h-3.5" />, label: 'Reset Zoom', key: '0' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 text-white/60">
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <kbd className="px-2 py-0.5 bg-white/[0.06] rounded text-xs font-mono text-white/50">{item.key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
