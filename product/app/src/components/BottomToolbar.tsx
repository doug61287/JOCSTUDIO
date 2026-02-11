import { useProjectStore } from '../stores/projectStore';
import { useShallow } from 'zustand/react/shallow';
import type { Tool } from '../types';

interface BottomToolbarProps {
  pageNum: number;
  numPages: number;
  onPageChange: (page: number) => void;
  onFitToWidth: () => void;
  onFitToPage: () => void;
  onZoomChange: (newZoom: number) => void;
  pageSize?: { width: number; height: number };
}

const viewTools: { id: Tool; icon: string; label: string; shortcut: string }[] = [
  { id: 'pan', icon: '✋', label: 'Pan', shortcut: 'H' },
  { id: 'select', icon: '⬚', label: 'Select', shortcut: 'V' },
  { id: 'text', icon: 'T', label: 'Select Text', shortcut: 'T' },
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
    width: (pageSize.width / 72).toFixed(2),
    height: (pageSize.height / 72).toFixed(2)
  } : null;

  return (
    <div className="h-10 bg-[#2d2d30] border-t border-[#3f3f46] flex items-center px-2 gap-1 text-xs select-none">
      {/* Left Section - View Tools */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-white/10">
        {viewTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`w-8 h-7 flex items-center justify-center rounded transition-all
              ${activeTool === tool.id 
                ? 'bg-blue-600 text-white' 
                : 'hover:bg-white/10 text-white/70'}`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {tool.id === 'select' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
              </svg>
            ) : tool.id === 'pan' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            ) : (
              <span className="font-bold text-sm">T</span>
            )}
          </button>
        ))}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
        <button
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
          title="Zoom Out (-)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
          title="Zoom In (+)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button
          onClick={onFitToWidth}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
          title="Fit Width"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
        <button
          onClick={onFitToPage}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-white/70"
          title="Fit Page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          </svg>
        </button>
      </div>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Page Navigation - Centered */}
      <div className="flex items-center gap-1 px-2">
        {/* First Page */}
        <button
          onClick={goToFirst}
          disabled={pageNum <= 1}
          className="w-6 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
          title="First Page"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"/>
          </svg>
        </button>
        {/* Previous Page */}
        <button
          onClick={goToPrev}
          disabled={pageNum <= 1}
          className="w-6 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
          title="Previous Page"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
        </button>
        
        {/* Page Input */}
        <div className="flex items-center gap-1.5 px-2">
          <input
            type="number"
            min={1}
            max={numPages}
            value={pageNum}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onPageChange(Math.min(numPages, Math.max(1, val)));
            }}
            className="w-14 h-6 px-2 bg-[#1e1e1e] border border-[#3f3f46] rounded text-center text-xs text-white"
          />
          <span className="text-white/50">of {numPages}</span>
        </div>

        {/* Next Page */}
        <button
          onClick={goToNext}
          disabled={pageNum >= numPages}
          className="w-6 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
          title="Next Page"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
          </svg>
        </button>
        {/* Last Page */}
        <button
          onClick={goToLast}
          disabled={pageNum >= numPages}
          className="w-6 h-7 flex items-center justify-center rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
          title="Last Page"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/>
          </svg>
        </button>
      </div>

      {/* Center Spacer */}
      <div className="flex-1" />

      {/* Right Section - Scale & Page Info */}
      <div className="flex items-center gap-3 pl-2 border-l border-white/10 text-white/50">
        {/* Scale Status */}
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <span className={scale > 1 ? 'text-green-400' : 'text-yellow-400'}>
            {scale > 1 ? `${scale.toFixed(1)} px/ft` : 'Scale Not Set'}
          </span>
        </div>

        {/* Zoom Percentage */}
        <span className="font-mono">{Math.round(zoom * 100)}%</span>

        {/* Page Size */}
        {pageSizeInches && (
          <span className="font-mono">{pageSizeInches.width} x {pageSizeInches.height} in</span>
        )}
      </div>
    </div>
  );
}
