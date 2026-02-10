import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Point, Measurement } from '../types';
import { 
  distance, 
  pixelsToFeet, 
  generateId, 
  getMeasurementColor,
  calculatePolygonArea 
} from '../utils/geometry';

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

  // Draw all measurements
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    
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
        ctx.fillText(`${m.value.toFixed(1)} LF`, midX + 10, midY - 10);
      }
      
      if (m.type === 'count') {
        m.points.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Draw number
          ctx.font = 'bold 12px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(idx + 1), p.x, p.y);
        });
      }
      
      if (m.type === 'area' && m.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw area label at centroid
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`${m.value.toFixed(1)} SF`, cx, cy);
      }
    });
    
    // Draw temporary points
    if (tempPoints.length > 0) {
      ctx.strokeStyle = getMeasurementColor(activeTool as 'line' | 'count' | 'area');
      ctx.fillStyle = ctx.strokeStyle + '40';
      ctx.lineWidth = 2;
      
      if (activeTool === 'line' && tempPoints.length === 1 && mousePos) {
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        
        // Show live measurement
        const d = distance(tempPoints[0], mousePos);
        const feet = pixelsToFeet(d, project.scale);
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(`${feet.toFixed(1)} LF`, mousePos.x + 10, mousePos.y - 10);
      }
      
      if (activeTool === 'area') {
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (mousePos) ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        
        tempPoints.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      
      // Draw temp count points
      if (activeTool === 'count') {
        tempPoints.forEach((p, idx) => {
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
  }, [project, selectedMeasurement, tempPoints, mousePos, activeTool, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const point: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    if (activeTool === 'select') {
      // Check if clicked on a measurement
      const clicked = project?.measurements.find((m) => {
        if (m.type === 'count') {
          return m.points.some((p) => distance(p, point) < 15);
        }
        if (m.type === 'line' && m.points.length >= 2) {
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
    
    if (activeTool === 'count') {
      setTempPoints([...tempPoints, point]);
    }
    
    if (activeTool === 'area') {
      setTempPoints([...tempPoints, point]);
    }
  }, [activeTool, tempPoints, project, addMeasurement, selectMeasurement]);

  const handleDoubleClick = useCallback(() => {
    if (activeTool === 'count' && tempPoints.length > 0) {
      const measurement: Measurement = {
        id: generateId(),
        type: 'count',
        points: tempPoints,
        value: tempPoints.length,
        unit: 'EA',
        color: getMeasurementColor('count'),
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
  }, [activeTool, tempPoints, project, addMeasurement]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setTempPoints([]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="measurement-canvas"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseMove={handleMouseMove}
      style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
    />
  );
}
