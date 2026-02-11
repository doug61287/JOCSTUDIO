import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Point, Measurement } from '../types';
import { 
  distance, 
  pixelsToFeet, 
  generateId, 
  getMeasurementColor,
  calculatePolygonArea,
  calculatePolygonPerimeter,
  calculatePolylineLength
} from '../utils/geometry';
import {
  applySnap,
  getSnapIndicatorStyle,
  DEFAULT_SNAP_SETTINGS,
  type SnapSettings,
  type SnapResult
} from '../utils/snapEngine';

interface MeasurementCanvasProps {
  width: number;
  height: number;
}

export function MeasurementCanvas({ width, height }: MeasurementCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    project, 
    activeTool, 
    addMeasurement, 
    selectedMeasurement,
    selectMeasurement 
  } = useProjectStore();
  
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [snapResult, setSnapResult] = useState<SnapResult | null>(null);
  const [snapSettings, setSnapSettings] = useState<SnapSettings>(DEFAULT_SNAP_SETTINGS);
  const [showSnapIndicator] = useState(true);

  // Get snapped position for current mouse position
  const getSnappedPoint = useCallback((rawPoint: Point): Point => {
    if (!project || !snapSettings.enabled) return rawPoint;
    
    const activePoint = tempPoints.length > 0 ? tempPoints[tempPoints.length - 1] : undefined;
    const result = applySnap(rawPoint, project.measurements, snapSettings, activePoint);
    setSnapResult(result);
    return result.point;
  }, [project, snapSettings, tempPoints]);

  // Draw all measurements and snap indicators
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project || width <= 0 || height <= 0) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    
    // Clip to canvas bounds
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
    
    // Draw existing measurements
    project.measurements.forEach((m) => {
      const isSelected = m.id === selectedMeasurement;
      ctx.strokeStyle = isSelected ? '#FFD700' : m.color;
      ctx.fillStyle = m.color + '40';
      ctx.lineWidth = isSelected ? 3 : 2;
      
      if (m.type === 'line' && m.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        ctx.lineTo(m.points[1].x, m.points[1].y);
        ctx.stroke();
        
        // Draw endpoints
        m.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Draw length label
        const midX = (m.points[0].x + m.points[1].x) / 2;
        const midY = (m.points[0].y + m.points[1].y) / 2;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(`${m.value.toFixed(1)} LF`, midX + 10, midY - 10);
        ctx.fillText(`${m.value.toFixed(1)} LF`, midX + 10, midY - 10);
      }
      
      // Draw polyline (multi-segment line for perimeters)
      if (m.type === 'polyline' && m.points.length >= 2) {
        ctx.strokeStyle = isSelected ? '#FFD700' : m.color;
        ctx.lineWidth = isSelected ? 4 : 3;
        ctx.setLineDash([]);
        
        // Draw the polyline segments
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        
        // Draw vertices with segment lengths
        m.points.forEach((p, idx) => {
          // Draw vertex marker
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw segment length label
          if (idx < m.points.length - 1 && project) {
            const nextP = m.points[idx + 1];
            const segLen = pixelsToFeet(distance(p, nextP), project.scale);
            const midX = (p.x + nextP.x) / 2;
            const midY = (p.y + nextP.y) / 2;
            
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = m.color;
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.strokeText(`${segLen.toFixed(1)}'`, midX, midY - 8);
            ctx.fillText(`${segLen.toFixed(1)}'`, midX, midY - 8);
          }
        });
        
        // Draw total length badge at end
        const lastP = m.points[m.points.length - 1];
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 1;
        
        // Badge background
        const totalText = `Total: ${m.value.toFixed(1)} LF`;
        const textWidth = ctx.measureText(totalText).width;
        ctx.fillStyle = m.color;
        ctx.fillRect(lastP.x + 10, lastP.y - 20, textWidth + 12, 22);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.fillText(totalText, lastP.x + 16, lastP.y - 5);
      }
      
      // Draw count markers (Kreo-style)
      if (m.type === 'count') {
        m.points.forEach((p, idx) => {
          // Outer ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = m.color + '30';
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#FFD700' : m.color;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.stroke();
          
          // Inner circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
          
          // Number
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(idx + 1), p.x, p.y);
        });
        
        // Draw count badge
        if (m.points.length > 0) {
          const lastP = m.points[m.points.length - 1];
          ctx.font = 'bold 12px sans-serif';
          const countText = `${m.value} EA`;
          const textWidth = ctx.measureText(countText).width;
          
          // Badge background
          ctx.fillStyle = m.color;
          ctx.fillRect(lastP.x + 16, lastP.y - 12, textWidth + 10, 20);
          ctx.fillStyle = 'white';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(countText, lastP.x + 21, lastP.y - 2);
        }
      }
      
      if (m.type === 'area' && m.points.length >= 3) {
        ctx.fillStyle = m.color + '40';
        ctx.strokeStyle = isSelected ? '#FFD700' : m.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw vertices
        m.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
        });
        
        // Draw area label at centroid
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(`${m.value.toFixed(1)} SF`, cx, cy);
        ctx.fillText(`${m.value.toFixed(1)} SF`, cx, cy);
      }
      
      // Draw spaces (rooms)
      if (m.type === 'space' && m.points.length >= 3) {
        ctx.fillStyle = m.color + '30';
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFD700' : m.color;
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw vertices
        m.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = m.color;
          ctx.fill();
        });
        
        // Draw room name and measurements at centroid
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        
        // Background for text
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(cx - 60, cy - 35, 120, 50);
        
        // Room name
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = m.color;
        ctx.textAlign = 'center';
        ctx.fillText(m.spaceName || 'Space', cx, cy - 15);
        
        // Area and perimeter
        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`${m.value.toFixed(1)} SF`, cx, cy + 2);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`${m.perimeter?.toFixed(1) || 0} LF perim.`, cx, cy + 18);
      }
    });
    
    // Draw temporary points and preview
    if (tempPoints.length > 0 || mousePos) {
      const currentColor = getMeasurementColor(activeTool as 'line' | 'polyline' | 'count' | 'area' | 'space');
      ctx.strokeStyle = currentColor;
      ctx.fillStyle = currentColor + '40';
      ctx.lineWidth = 2;
      
      // Get snapped mouse position
      const displayPos = mousePos ? getSnappedPoint(mousePos) : null;
      
      if (activeTool === 'line' && tempPoints.length === 1 && displayPos) {
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        ctx.lineTo(displayPos.x, displayPos.y);
        ctx.stroke();
        
        // Draw endpoint markers
        ctx.beginPath();
        ctx.arc(tempPoints[0].x, tempPoints[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Show live measurement
        const d = distance(tempPoints[0], displayPos);
        const feet = pixelsToFeet(d, project.scale);
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 3;
        ctx.strokeText(`${feet.toFixed(1)} LF`, displayPos.x + 15, displayPos.y - 15);
        ctx.fillText(`${feet.toFixed(1)} LF`, displayPos.x + 15, displayPos.y - 15);
      }
      
      // Polyline preview
      if (activeTool === 'polyline' && tempPoints.length > 0) {
        const polyColor = getMeasurementColor('polyline');
        ctx.strokeStyle = polyColor;
        ctx.lineWidth = 3;
        
        // Draw existing segments
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (displayPos) ctx.lineTo(displayPos.x, displayPos.y);
        ctx.stroke();
        
        // Draw vertices
        tempPoints.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = polyColor;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Segment length
          if (idx < tempPoints.length - 1) {
            const nextP = tempPoints[idx + 1];
            const segLen = pixelsToFeet(distance(p, nextP), project.scale);
            const midX = (p.x + nextP.x) / 2;
            const midY = (p.y + nextP.y) / 2;
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = polyColor;
            ctx.textAlign = 'center';
            ctx.fillText(`${segLen.toFixed(1)}'`, midX, midY - 8);
          }
        });
        
        // Current segment length preview
        if (displayPos && tempPoints.length > 0) {
          const lastP = tempPoints[tempPoints.length - 1];
          const currLen = pixelsToFeet(distance(lastP, displayPos), project.scale);
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = polyColor;
          ctx.textAlign = 'center';
          const midX = (lastP.x + displayPos.x) / 2;
          const midY = (lastP.y + displayPos.y) / 2;
          ctx.fillText(`${currLen.toFixed(1)}'`, midX, midY - 8);
        }
        
        // Total length badge
        let totalLen = calculatePolylineLength(tempPoints, project.scale);
        if (displayPos && tempPoints.length > 0) {
          totalLen += pixelsToFeet(distance(tempPoints[tempPoints.length - 1], displayPos), project.scale);
        }
        
        const badgeX = displayPos?.x || tempPoints[tempPoints.length - 1].x;
        const badgeY = displayPos?.y || tempPoints[tempPoints.length - 1].y;
        const totalText = `Total: ${totalLen.toFixed(1)} LF`;
        const textWidth = ctx.measureText(totalText).width;
        
        ctx.fillStyle = polyColor;
        ctx.fillRect(badgeX + 12, badgeY - 18, textWidth + 12, 22);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(totalText, badgeX + 18, badgeY - 3);
        
        // Instructions
        ctx.font = '11px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('Double-click to complete', badgeX, badgeY + 20);
      }
      
      if ((activeTool === 'area' || activeTool === 'space') && tempPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (displayPos) ctx.lineTo(displayPos.x, displayPos.y);
        
        if (activeTool === 'space') {
          ctx.setLineDash([8, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw vertices
        tempPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = currentColor;
          ctx.fill();
        });
        
        // Show "Double-click to complete" hint
        if (tempPoints.length >= 2 && displayPos) {
          ctx.font = '12px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'left';
          ctx.fillText('Double-click to complete', displayPos.x + 15, displayPos.y - 15);
        }
      }
      
      // Draw temp count points
      if (activeTool === 'count') {
        tempPoints.forEach((p, idx) => {
          ctx.fillStyle = currentColor + '40';
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(idx + 1), p.x, p.y);
        });
      }
    }
    
    // Draw snap indicator
    if (showSnapIndicator && snapResult?.snapped && snapResult.snapPoint && mousePos) {
      const { color } = getSnapIndicatorStyle(snapResult.snapPoint.type);
      const sp = snapResult.point;
      
      // Draw snap crosshair
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(sp.x - 20, sp.y);
      ctx.lineTo(sp.x + 20, sp.y);
      ctx.stroke();
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y - 20);
      ctx.lineTo(sp.x, sp.y + 20);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Draw snap indicator circle
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw snap type label
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.fillText(`⚡ ${snapResult.snapPoint.type}`, sp.x + 12, sp.y - 12);
    }
    
    // Restore canvas state (remove clipping)
    ctx.restore();
  }, [project, selectedMeasurement, tempPoints, mousePos, activeTool, width, height, snapResult, showSnapIndicator, getSnappedPoint]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Pan and text tools don't interact with measurement canvas
    if (activeTool === 'pan' || activeTool === 'text') return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const rawPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    // Apply snap
    const point = project ? getSnappedPoint(rawPoint) : rawPoint;
    
    if (activeTool === 'select') {
      // Check if clicked on a measurement
      const clicked = project?.measurements.find((m) => {
        if (m.type === 'count') {
          return m.points.some((p) => distance(p, point) < 15);
        }
        if (m.type === 'line' && m.points.length >= 2) {
          return m.points.some((p) => distance(p, point) < 10);
        }
        if ((m.type === 'area' || m.type === 'space') && m.points.length >= 3) {
          return m.points.some((p) => distance(p, point) < 10);
        }
        return false;
      });
      selectMeasurement(clicked?.id || null);
      return;
    }
    
    if (activeTool === 'line') {
      if (tempPoints.length === 0) {
        setTempPoints([point]);
      } else {
        const d = distance(tempPoints[0], point);
        const feet = pixelsToFeet(d, project!.scale);
        
        const measurement: Measurement = {
          id: generateId(),
          type: 'line',
          points: [tempPoints[0], point],
          value: feet,
          unit: 'LF',
          color: getMeasurementColor('line'),
        };
        addMeasurement(measurement);
        setTempPoints([]);
      }
    }
    
    // Polyline: add points, double-click to complete
    if (activeTool === 'polyline') {
      setTempPoints([...tempPoints, point]);
    }
    
    // Count: each click adds a marker
    if (activeTool === 'count') {
      // Add point immediately
      const newPoints = [...tempPoints, point];
      setTempPoints(newPoints);
      
      // Auto-save after each click (Kreo-style: each click = 1 count item)
      const measurement: Measurement = {
        id: generateId(),
        type: 'count',
        points: [point],
        value: 1,
        unit: 'EA',
        color: getMeasurementColor('count'),
      };
      addMeasurement(measurement);
      setTempPoints([]); // Reset for next count
    }
    
    if (activeTool === 'area') {
      setTempPoints([...tempPoints, point]);
    }
    
    if (activeTool === 'space') {
      setTempPoints([...tempPoints, point]);
    }
  }, [activeTool, tempPoints, project, addMeasurement, selectMeasurement, getSnappedPoint]);

  const handleDoubleClick = useCallback(() => {
    // Polyline: complete the multi-segment line
    if (activeTool === 'polyline' && tempPoints.length >= 2) {
      const totalLength = calculatePolylineLength(tempPoints, project!.scale);
      const measurement: Measurement = {
        id: generateId(),
        type: 'polyline',
        points: tempPoints,
        value: totalLength,
        unit: 'LF',
        color: getMeasurementColor('polyline'),
      };
      addMeasurement(measurement);
      setTempPoints([]);
    }
    
    if (activeTool === 'area' && tempPoints.length >= 3) {
      const area = calculatePolygonArea(tempPoints, project!.scale);
      const measurement: Measurement = {
        id: generateId(),
        type: 'area',
        points: tempPoints,
        value: area,
        unit: 'SF',
        color: getMeasurementColor('area'),
      };
      addMeasurement(measurement);
      setTempPoints([]);
    }
    
    if (activeTool === 'space' && tempPoints.length >= 3) {
      const spaceName = prompt('Enter room/space name:', 'Room 1');
      if (spaceName) {
        const area = calculatePolygonArea(tempPoints, project!.scale);
        const perimeter = calculatePolygonPerimeter(tempPoints, project!.scale);
        const measurement: Measurement = {
          id: generateId(),
          type: 'space',
          points: tempPoints,
          value: area,
          unit: 'SF',
          color: getMeasurementColor('space'),
          spaceName: spaceName,
          perimeter: perimeter,
          finishes: [],
        };
        addMeasurement(measurement);
      }
      setTempPoints([]);
    }
  }, [activeTool, tempPoints, project, addMeasurement]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const rawPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setMousePos(rawPos);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTempPoints([]);
      setSnapResult(null);
    }
    // Toggle snap with 'S' when not in space tool
    if (e.key === 's' && activeTool !== 'space') {
      setSnapSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    }
  }, [activeTool]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="measurement-canvas"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseMove={handleMouseMove}
        style={{ 
          cursor: activeTool === 'select' ? 'default' 
            : activeTool === 'pan' ? 'grab' 
            : activeTool === 'text' ? 'text' 
            : 'crosshair',
          pointerEvents: activeTool === 'pan' ? 'none' : 'auto'  // Let pan events pass through
        }}
      />
      
      {/* Snap Status Indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-2 text-xs">
        <button
          onClick={() => setSnapSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
          className={`px-2 py-1 rounded ${
            snapSettings.enabled 
              ? 'bg-green-600/80 text-white' 
              : 'bg-gray-700/80 text-white/50'
          }`}
          title="Toggle snap (S)"
        >
          ⚡ Snap {snapSettings.enabled ? 'ON' : 'OFF'}
        </button>
        
        {snapSettings.enabled && (
          <div className="flex gap-1">
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToEndpoints: !prev.snapToEndpoints }))}
              className={`w-7 h-7 rounded flex items-center justify-center ${
                snapSettings.snapToEndpoints ? 'bg-green-600/60' : 'bg-gray-700/60'
              }`}
              title="Endpoints"
            >
              ●
            </button>
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToMidpoints: !prev.snapToMidpoints }))}
              className={`w-7 h-7 rounded flex items-center justify-center ${
                snapSettings.snapToMidpoints ? 'bg-blue-600/60' : 'bg-gray-700/60'
              }`}
              title="Midpoints"
            >
              ◆
            </button>
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToIntersections: !prev.snapToIntersections }))}
              className={`w-7 h-7 rounded flex items-center justify-center ${
                snapSettings.snapToIntersections ? 'bg-amber-600/60' : 'bg-gray-700/60'
              }`}
              title="Intersections"
            >
              ✕
            </button>
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToPerpendicular: !prev.snapToPerpendicular }))}
              className={`w-7 h-7 rounded flex items-center justify-center ${
                snapSettings.snapToPerpendicular ? 'bg-purple-600/60' : 'bg-gray-700/60'
              }`}
              title="Perpendicular"
            >
              ⊥
            </button>
          </div>
        )}
      </div>
    </>
  );
}
