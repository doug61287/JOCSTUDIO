import { useProjectStore } from '../stores/projectStore';
import { useShallow } from 'zustand/react/shallow';
import type { Tool } from '../types';
import {
  Hand,
  MousePointer,
  Type,
  ZoomIn,
  ZoomOut,
  Maximize,
  Square,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Scale,
} from 'lucide-react';

interface BottomToolbarProps {
  pageNum: number;
  numPages: number;
  onPageChange: (page: number) => void;
  onFitToWidth: () => void;
  onFitToPage: () => void;
  onZoomChange: (newZoom: number) => void;
  pageSize?: { width: number; height: number };
}

const viewTools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'pan', icon: <Hand className="w-4 h-4" />, label: 'Pan', shortcut: 'H' },
  { id: 'select', icon: <MousePointer className="w-4 h-4" />, label: 'Select', shortcut: 'V' },
  { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Select Text', shortcut: 'T' },
];

export function BottomToolbar({ 
  pageNum, 
  numPages, 
  onPageChange, 
  onFitToWidth, 
  onFitToPage,
  onZoomChange,
  pageSize 
}: BottomToolbarProps) {
  const { activeTool, setActiveTool, zoom, scale } = useProjectStore(
    useShallow((state) => ({
      activeTool: state.activeTool,
      setActiveTool: state.setActiveTool,
      zoom: state.zoom,
      scale: state.project?.scale ?? 0,
    }))
  );

  const goToFirst = () => onPageChange(1);
  const goToPrev = () => onPageChange(Math.max(1, pageNum - 1));
  const goToNext = () => onPageChange(Math.min(numPages, pageNum + 1));
  const goToLast = () => onPageChange(numPages);

  // Calculate page dimensions in inches (assuming 72 DPI base)
  const pageSizeInches = pageSize ? {
    width: (pageSize.width / 72).toFixed(1),
    height: (pageSize.height / 72).toFixed(1)
  } : null;

  // Zoom presets
  const zoomPresets = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="h-12 bg-gray-900/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center px-3 gap-2 text-sm select-none">
      {/* Left Section - View Tools */}
      <div className="flex items-center bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
        {viewTools.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-md transition-all duration-150
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-white/40 hover:text-white hover:bg-white/[0.06]'
                }
              `}
              title={`${tool.label} (${tool.shortcut})`}
            >
              {tool.icon}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/[0.08]" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        {/* Zoom Dropdown */}
        <div className="relative group">
          <button className="h-8 px-3 flex items-center gap-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-150 font-mono text-sm tabular-nums min-w-[70px] justify-center">
            {Math.round(zoom * 100)}%
          </button>
          {/* Dropdown */}
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/[0.08] rounded-lg shadow-xl overflow-hidden py-1">
              {zoomPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onZoomChange(preset)}
                  className={`
                    w-full px-4 py-1.5 text-left text-sm font-mono transition-colors
                    ${Math.abs(zoom - preset) < 0.05 
                      ? 'bg-blue-600 text-white' 
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Fit Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFitToWidth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          title="Fit to Width"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button
          onClick={onFitToPage}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          title="Fit to Page"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Page Navigation - Centered */}
      <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
        <button
          onClick={goToFirst}
          disabled={pageNum <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
          title="First Page"
        >
          <ChevronFirst className="w-4 h-4" />
        </button>
        <button
          onClick={goToPrev}
          disabled={pageNum <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {/* Page Input */}
        <div className="flex items-center gap-2 px-2">
          <input
            type="number"
            min={1}
            max={numPages}
            value={pageNum}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onPageChange(Math.min(numPages, Math.max(1, val)));
            }}
            className="w-12 h-7 px-2 bg-white/[0.03] border border-white/[0.06] rounded-md text-center text-sm text-white font-mono tabular-nums focus:outline-none focus:border-white/20 transition-colors"
          />
          <span className="text-white/30 text-sm">of</span>
          <span className="text-white/60 text-sm font-mono tabular-nums">{numPages}</span>
        </div>

        <button
          onClick={goToNext}
          disabled={pageNum >= numPages}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={goToLast}
          disabled={pageNum >= numPages}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
          title="Last Page"
        >
          <ChevronLast className="w-4 h-4" />
        </button>
      </div>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Right Section - Scale & Page Info */}
      <div className="flex items-center gap-3 text-sm">
        {/* Scale Status */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${scale > 1 
            ? 'bg-emerald-500/10 border border-emerald-500/20' 
            : 'bg-amber-500/10 border border-amber-500/20'
          }
        `}>
          <Scale className={`w-3.5 h-3.5 ${scale > 1 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className={`font-medium tabular-nums ${scale > 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {scale > 1 ? `${scale.toFixed(1)} px/ft` : 'Not Set'}
          </span>
        </div>

        {/* Page Size */}
        {pageSizeInches && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06]">
            <span className="text-white/30">Size:</span>
            <span className="text-white/60 font-mono tabular-nums">
              {pageSizeInches.width}" × {pageSizeInches.height}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
