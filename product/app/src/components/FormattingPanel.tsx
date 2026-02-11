import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { MeasurementStyle } from '../types';
import { DEFAULT_STYLE } from '../types';

// Preset colors (Kreo-inspired palette)
const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7', // violet
];

interface FormattingPanelProps {
  measurementId: string;
  onClose: () => void;
}

export function FormattingPanel({ measurementId, onClose }: FormattingPanelProps) {
  const { project, updateMeasurement } = useProjectStore();
  const measurement = project?.measurements.find(m => m.id === measurementId);
  
  if (!measurement) return null;
  
  const style = measurement.style || DEFAULT_STYLE;
  const [color, setColor] = useState(measurement.color);
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted'>(style.lineStyle);
  const [lineWidth, setLineWidth] = useState(style.lineWidth);
  const [fontSize, setFontSize] = useState(style.fontSize);
  const [showValue, setShowValue] = useState(style.showValue);
  const [showItemName, setShowItemName] = useState(style.showItemName);
  const [showCost, setShowCost] = useState(style.showCost);
  const [customColor, setCustomColor] = useState(color);

  const handleApply = () => {
    updateMeasurement(measurementId, {
      color,
      style: {
        lineStyle,
        lineWidth,
        fontSize,
        showValue,
        showItemName,
        showCost,
      }
    });
    onClose();
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    setCustomColor(newColor);
    // Apply immediately for preview
    updateMeasurement(measurementId, { color: newColor });
  };

  const handleStyleChange = (updates: Partial<MeasurementStyle>) => {
    const newStyle = { ...style, ...updates };
    if (updates.lineStyle !== undefined) setLineStyle(updates.lineStyle);
    if (updates.lineWidth !== undefined) setLineWidth(updates.lineWidth);
    if (updates.fontSize !== undefined) setFontSize(updates.fontSize);
    if (updates.showValue !== undefined) setShowValue(updates.showValue);
    if (updates.showItemName !== undefined) setShowItemName(updates.showItemName);
    if (updates.showCost !== undefined) setShowCost(updates.showCost);
    
    // Apply immediately for preview
    updateMeasurement(measurementId, { style: newStyle });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl w-[360px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span>🎨</span> Format Measurement
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-xl">×</button>
        </div>

        <div className="p-4 space-y-5">
          {/* Color Picker */}
          <div>
            <label className="text-sm text-white/60 mb-2 block">Color</label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Custom:</span>
              <input
                type="color"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-10 h-8 rounded cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 text-sm font-mono uppercase"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Line Style */}
          <div>
            <label className="text-sm text-white/60 mb-2 block">Line Style</label>
            <div className="flex gap-2">
              {(['solid', 'dashed', 'dotted'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStyleChange({ lineStyle: s })}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    lineStyle === s 
                      ? 'border-blue-500 bg-blue-500/20 text-white' 
                      : 'border-white/10 hover:border-white/30 text-white/60'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div 
                      className="w-full h-0.5"
                      style={{ 
                        borderTop: `3px ${s} ${color}`,
                      }}
                    />
                    <span className="text-xs capitalize">{s}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Line Width */}
          <div>
            <label className="text-sm text-white/60 mb-2 flex items-center justify-between">
              <span>Line Thickness</span>
              <span className="text-white font-medium">{lineWidth}px</span>
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={lineWidth}
              onChange={(e) => handleStyleChange({ lineWidth: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>Thin</span>
              <span>Thick</span>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm text-white/60 mb-2 flex items-center justify-between">
              <span>Label Size</span>
              <span className="text-white font-medium">{fontSize}px</span>
            </label>
            <input
              type="range"
              min="10"
              max="18"
              value={fontSize}
              onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Display Toggles */}
          <div>
            <label className="text-sm text-white/60 mb-3 block">Display Options</label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-sm text-white">Show Measurement Value</span>
                <input
                  type="checkbox"
                  checked={showValue}
                  onChange={(e) => handleStyleChange({ showValue: e.target.checked })}
                  className="w-5 h-5 rounded accent-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-sm text-white">Show Item Name</span>
                <input
                  type="checkbox"
                  checked={showItemName}
                  onChange={(e) => handleStyleChange({ showItemName: e.target.checked })}
                  className="w-5 h-5 rounded accent-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                <span className="text-sm text-white">Show Cost</span>
                <input
                  type="checkbox"
                  checked={showCost}
                  onChange={(e) => handleStyleChange({ showCost: e.target.checked })}
                  className="w-5 h-5 rounded accent-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-lg border border-white/10 text-white/60 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact inline formatting bar (for quick access)
export function QuickFormatBar({ measurementId }: { measurementId: string }) {
  const { project, updateMeasurement } = useProjectStore();
  const measurement = project?.measurements.find(m => m.id === measurementId);
  
  if (!measurement) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-800 rounded-lg border border-white/10">
      {/* Quick color swatches */}
      {PRESET_COLORS.slice(0, 6).map((c) => (
        <button
          key={c}
          onClick={() => updateMeasurement(measurementId, { color: c })}
          className={`w-6 h-6 rounded transition-all ${
            measurement.color === c ? 'ring-2 ring-white' : 'hover:scale-110'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
      <div className="w-px h-4 bg-white/20 mx-1" />
      {/* Quick line styles */}
      <button
        onClick={() => updateMeasurement(measurementId, { 
          style: { ...measurement.style || DEFAULT_STYLE, lineStyle: 'solid' } 
        })}
        className={`w-6 h-6 rounded flex items-center justify-center ${
          (measurement.style?.lineStyle || 'solid') === 'solid' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
        title="Solid"
      >
        <div className="w-4 border-t-2 border-current" />
      </button>
      <button
        onClick={() => updateMeasurement(measurementId, { 
          style: { ...measurement.style || DEFAULT_STYLE, lineStyle: 'dashed' } 
        })}
        className={`w-6 h-6 rounded flex items-center justify-center ${
          measurement.style?.lineStyle === 'dashed' ? 'bg-white/20' : 'hover:bg-white/10'
        }`}
        title="Dashed"
      >
        <div className="w-4 border-t-2 border-dashed border-current" />
      </button>
    </div>
  );
}
