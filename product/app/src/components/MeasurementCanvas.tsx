import { useRef, useEffect, useState, useCallback } from 'react';
import { useProjectStore } from '../stores/projectStore';
import type { Point, Measurement, MeasurementStyle } from '../types';
import { DEFAULT_STYLE } from '../types';
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
import { Magnet, CircleDot, Diamond, X } from 'lucide-react';

interface MeasurementCanvasProps {
  width: number;
  height: number;
  pageNumber: number;
}

// Design tokens - matching our new UI
const COLORS = {
  line: '#3b82f6',      // Blue
  polyline: '#8b5cf6',  // Purple
  count: '#f59e0b',     // Amber
  area: '#10b981',      // Emerald
  space: '#ec4899',     // Pink
  selected: '#fbbf24',  // Yellow/Gold
  cost: '#22c55e',      // Green
  warning: '#6b7280',   // Gray
};

export function MeasurementCanvas({ width, height, pageNumber }: MeasurementCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    project, 
    activeTool, 
    addMeasurement,
    updateMeasurement,
    selectedMeasurement,
    selectMeasurement,
    activeJOCItem,
    activeGroupId
  } = useProjectStore();
  
  const [tempPoints, setTempPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [snapResult, setSnapResult] = useState<SnapResult | null>(null);
  const [snapSettings, setSnapSettings] = useState<SnapSettings>(DEFAULT_SNAP_SETTINGS);

  // Get snapped position for current mouse position
  const getSnappedPoint = useCallback((rawPoint: Point): Point => {
    if (!project || !snapSettings.enabled) return rawPoint;
    
    const activePoint = tempPoints.length > 0 ? tempPoints[tempPoints.length - 1] : undefined;
    const result = applySnap(rawPoint, project.measurements, snapSettings, activePoint);
    setSnapResult(result);
    return result.point;
  }, [project, snapSettings, tempPoints]);

  // ============================================
  // DRAWING HELPERS - Clean, Modern Style
  // ============================================
  
  // Draw a rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, y: number, 
    w: number, h: number, 
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Clean pill badge - modern flat design
  const drawBadge = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    text: string,
    bgColor: string,
    textColor: string = 'white',
    fontSize: number = 12,
    align: 'left' | 'center' = 'left'
  ) => {
    ctx.font = `600 ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
    const metrics = ctx.measureText(text);
    const paddingX = 10;
    const paddingY = 6;
    const height = fontSize + paddingY * 2;
    const width = metrics.width + paddingX * 2;
    const radius = 6;
    
    const drawX = align === 'center' ? x - width / 2 : x;
    
    // Subtle shadow
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    
    // Background
    ctx.fillStyle = bgColor;
    drawRoundedRect(ctx, drawX, y - height/2, width, height, radius);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, drawX + paddingX, y);
    
    return width;
  };

  // Modern count marker - clean circle with number
  const drawCountMarker = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    color: string,
    label: string,
    isSelected: boolean
  ) => {
    const size = 24;
    
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    
    // Circle
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Selection ring
    if (isSelected) {
      ctx.strokeStyle = COLORS.selected;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Inner border
    ctx.beginPath();
    ctx.arc(x, y, size/2 - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Label
    ctx.font = '700 11px Inter, -apple-system, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  };

  // Modern endpoint dot
  const drawEndpoint = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    color: string,
    isSelected: boolean,
    size: number = 8
  ) => {
    // Outer ring
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = COLORS.selected;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  };

  // Get short name for JOC item
  const getShortItemName = (desc: string, maxLen: number = 20): string => {
    const firstPart = desc.split(',')[0].trim();
    return firstPart.length > maxLen ? firstPart.slice(0, maxLen) + '…' : firstPart;
  };

  // Get line dash pattern
  const getLineDash = (lineStyle: string): number[] => {
    switch (lineStyle) {
      case 'dashed': return [12, 6];
      case 'dotted': return [4, 4];
      default: return [];
    }
  };

  // Draw all measurements
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project || width <= 0 || height <= 0) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.clip();
    
    // Draw existing measurements (filtered by current page)
    const pageMeasurements = project.measurements.filter(m => m.pageNumber === pageNumber);
    pageMeasurements.forEach((m) => {
      const isSelected = m.id === selectedMeasurement;
      const baseColor = m.color;
      const style: MeasurementStyle = m.style || DEFAULT_STYLE;
      
      // ============================================
      // LINE MEASUREMENTS
      // ============================================
      if (m.type === 'line' && m.points.length >= 2) {
        const [p1, p2] = m.points;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Line
        ctx.strokeStyle = isSelected ? COLORS.selected : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 2 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Endpoints
        drawEndpoint(ctx, p1.x, p1.y, baseColor, isSelected);
        drawEndpoint(ctx, p2.x, p2.y, baseColor, isSelected);
        
        // Labels at midpoint
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        let badgeY = midY;
        
        if (style.showValue) {
          drawBadge(ctx, midX + 16, badgeY, `${m.value.toFixed(1)} LF`, baseColor);
          badgeY += 24;
        }
        
        if (m.jocItem && style.showItemName) {
          const itemName = getShortItemName(m.jocItem.description, 22);
          drawBadge(ctx, midX + 16, badgeY, itemName, 'rgba(0,0,0,0.8)', baseColor, 11);
          badgeY += 22;
        }
        
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          drawBadge(ctx, midX + 16, badgeY, `$${cost}`, COLORS.cost, 'white', 11);
        }
      }
      
      // ============================================
      // POLYLINE MEASUREMENTS
      // ============================================
      if (m.type === 'polyline' && m.points.length >= 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Line
        ctx.strokeStyle = isSelected ? COLORS.selected : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 2 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle));
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Vertices with segment lengths
        m.points.forEach((p, idx) => {
          drawEndpoint(ctx, p.x, p.y, baseColor, isSelected, 6);
          
          // Segment length
          if (idx < m.points.length - 1 && style.showValue) {
            const nextP = m.points[idx + 1];
            const segLen = pixelsToFeet(distance(p, nextP), project.scale);
            const mx = (p.x + nextP.x) / 2;
            const my = (p.y + nextP.y) / 2;
            
            ctx.font = '600 10px Inter, -apple-system, sans-serif';
            ctx.fillStyle = baseColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Small background
            const text = `${segLen.toFixed(1)}'`;
            const tw = ctx.measureText(text).width;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            drawRoundedRect(ctx, mx - tw/2 - 4, my - 10, tw + 8, 16, 4);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.fillText(text, mx, my - 2);
          }
        });
        
        // Total badge at end
        const lastP = m.points[m.points.length - 1];
        let badgeY = lastP.y - 8;
        
        if (style.showValue) {
          drawBadge(ctx, lastP.x + 16, badgeY, `${m.value.toFixed(1)} LF`, baseColor);
          badgeY += 24;
        }
        
        if (m.jocItem && style.showItemName) {
          const itemName = getShortItemName(m.jocItem.description, 20);
          drawBadge(ctx, lastP.x + 16, badgeY, itemName, 'rgba(0,0,0,0.8)', baseColor, 11);
          badgeY += 22;
        }
        
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          drawBadge(ctx, lastP.x + 16, badgeY, `$${cost}`, COLORS.cost, 'white', 11);
        }
      }
      
      // ============================================
      // COUNT MEASUREMENTS
      // ============================================
      if (m.type === 'count') {
        m.points.forEach((p, idx) => {
          drawCountMarker(ctx, p.x, p.y, baseColor, String(idx + 1), isSelected);
        });
        
        // Info badge near last point
        if (m.points.length > 0) {
          const lastP = m.points[m.points.length - 1];
          let badgeY = lastP.y - 20;
          
          if (style.showValue) {
            drawBadge(ctx, lastP.x + 20, badgeY, `${m.value} EA`, baseColor);
            badgeY += 24;
          }
          
          if (m.jocItem && style.showItemName) {
            const itemName = getShortItemName(m.jocItem.description, 20);
            drawBadge(ctx, lastP.x + 20, badgeY, itemName, 'rgba(0,0,0,0.8)', baseColor, 11);
            badgeY += 22;
          }
          
          if (m.jocItem && style.showCost) {
            const cost = (m.value * m.jocItem.unitCost).toFixed(0);
            drawBadge(ctx, lastP.x + 20, badgeY, `$${cost}`, COLORS.cost, 'white', 11);
          }
        }
      }
      
      // ============================================
      // AREA MEASUREMENTS
      // ============================================
      if (m.type === 'area' && m.points.length >= 3) {
        // Fill
        ctx.fillStyle = baseColor + '30';
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        
        // Border
        ctx.strokeStyle = isSelected ? COLORS.selected : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 2 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Vertices
        m.points.forEach((p) => {
          drawEndpoint(ctx, p.x, p.y, baseColor, isSelected, 5);
        });
        
        // Center badge
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        
        let badgeY = cy - 12;
        
        if (style.showValue) {
          drawBadge(ctx, cx, badgeY, `${m.value.toFixed(1)} SF`, baseColor, 'white', 13, 'center');
          badgeY += 26;
        }
        
        if (m.jocItem && style.showItemName) {
          const itemName = getShortItemName(m.jocItem.description, 22);
          drawBadge(ctx, cx, badgeY, itemName, 'rgba(0,0,0,0.8)', baseColor, 11, 'center');
          badgeY += 22;
        }
        
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          drawBadge(ctx, cx, badgeY, `$${cost}`, COLORS.cost, 'white', 11, 'center');
        }
      }
      
      // ============================================
      // SPACE (ROOM) MEASUREMENTS
      // ============================================
      if (m.type === 'space' && m.points.length >= 3) {
        // Lighter fill
        ctx.fillStyle = baseColor + '20';
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        
        // Dashed border
        ctx.strokeStyle = isSelected ? COLORS.selected : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 1 : style.lineWidth;
        ctx.setLineDash([8, 4]);
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Small vertices
        m.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = baseColor;
          ctx.fill();
        });
        
        // Room card at centroid
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        
        const cardWidth = 140;
        const cardHeight = m.jocItem && style.showCost ? 80 : 65;
        
        // Card shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        
        // Card background
        ctx.fillStyle = 'rgba(15,23,42,0.95)';
        drawRoundedRect(ctx, cx - cardWidth/2, cy - cardHeight/2, cardWidth, cardHeight, 10);
        ctx.fill();
        
        // Selection border
        if (isSelected) {
          ctx.strokeStyle = COLORS.selected;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Room name
        ctx.font = '700 14px Inter, -apple-system, sans-serif';
        ctx.fillStyle = baseColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.spaceName || 'Space', cx, cy - 18);
        
        // Area
        if (style.showValue) {
          ctx.font = '700 16px Inter, -apple-system, sans-serif';
          ctx.fillStyle = 'white';
          ctx.fillText(`${m.value.toFixed(0)} SF`, cx, cy + 2);
        }
        
        // Perimeter
        ctx.font = '500 11px Inter, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(`${m.perimeter?.toFixed(0) || 0} LF perimeter`, cx, cy + 20);
        
        // Cost
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          ctx.font = '700 12px Inter, -apple-system, sans-serif';
          ctx.fillStyle = COLORS.cost;
          ctx.fillText(`$${cost}`, cx, cy + 35);
        }
      }
    });
    
    // ============================================
    // TEMPORARY DRAWING (in-progress measurements)
    // ============================================
    if (tempPoints.length > 0 || mousePos) {
      const currentColor = getMeasurementColor(activeTool as 'line' | 'polyline' | 'count' | 'area' | 'space');
      const displayPos = mousePos ? getSnappedPoint(mousePos) : null;
      
      // LINE preview
      if (activeTool === 'line' && tempPoints.length === 1 && displayPos) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        ctx.lineTo(displayPos.x, displayPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        drawEndpoint(ctx, tempPoints[0].x, tempPoints[0].y, currentColor, false, 6);
        
        // Live measurement
        const d = distance(tempPoints[0], displayPos);
        const feet = pixelsToFeet(d, project.scale);
        drawBadge(ctx, displayPos.x + 16, displayPos.y - 16, `${feet.toFixed(1)} LF`, currentColor);
      }
      
      // POLYLINE preview
      if (activeTool === 'polyline' && tempPoints.length > 0) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (displayPos) {
          ctx.setLineDash([6, 4]);
          ctx.lineTo(displayPos.x, displayPos.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Vertices
        tempPoints.forEach((p) => {
          drawEndpoint(ctx, p.x, p.y, currentColor, false, 5);
        });
        
        // Total length
        let totalLen = calculatePolylineLength(tempPoints, project.scale);
        if (displayPos && tempPoints.length > 0) {
          totalLen += pixelsToFeet(distance(tempPoints[tempPoints.length - 1], displayPos), project.scale);
        }
        
        const badgePos = displayPos || tempPoints[tempPoints.length - 1];
        drawBadge(ctx, badgePos.x + 16, badgePos.y - 16, `${totalLen.toFixed(1)} LF`, currentColor);
        
        // Hint
        ctx.font = '500 11px Inter, -apple-system, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.textAlign = 'left';
        ctx.fillText('Double-click to complete', badgePos.x + 16, badgePos.y + 8);
      }
      
      // AREA/SPACE preview
      if ((activeTool === 'area' || activeTool === 'space') && tempPoints.length > 0) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        if (activeTool === 'space') ctx.setLineDash([8, 4]);
        
        ctx.beginPath();
        ctx.moveTo(tempPoints[0].x, tempPoints[0].y);
        tempPoints.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (displayPos) ctx.lineTo(displayPos.x, displayPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        tempPoints.forEach((p) => {
          drawEndpoint(ctx, p.x, p.y, currentColor, false, 4);
        });
        
        if (tempPoints.length >= 2 && displayPos) {
          ctx.font = '500 11px Inter, -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.textAlign = 'left';
          ctx.fillText('Double-click to complete', displayPos.x + 16, displayPos.y - 12);
        }
      }
      
      // COUNT preview - show where next marker will go
      if (activeTool === 'count' && displayPos) {
        ctx.globalAlpha = 0.5;
        drawCountMarker(ctx, displayPos.x, displayPos.y, currentColor, '?', false);
        ctx.globalAlpha = 1;
      }
    }
    
    // ============================================
    // SNAP INDICATOR
    // ============================================
    if (snapResult?.snapped && snapResult.snapPoint && mousePos) {
      const { color } = getSnapIndicatorStyle(snapResult.snapPoint.type);
      const sp = snapResult.point;
      
      // Crosshair
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      ctx.beginPath();
      ctx.moveTo(sp.x - 16, sp.y);
      ctx.lineTo(sp.x + 16, sp.y);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(sp.x, sp.y - 16);
      ctx.lineTo(sp.x, sp.y + 16);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Circle
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Label
      ctx.font = '600 10px Inter, -apple-system, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.fillText(snapResult.snapPoint.type.toUpperCase(), sp.x + 10, sp.y - 10);
    }
    
    ctx.restore();
  }, [project, selectedMeasurement, tempPoints, mousePos, activeTool, width, height, snapResult, getSnappedPoint, pageNumber]);

  useEffect(() => {
    draw();
  }, [draw]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pan' || activeTool === 'text') return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const rawPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    const point = project ? getSnappedPoint(rawPoint) : rawPoint;
    
    if (activeTool === 'select') {
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
          pageNumber,
          color: getMeasurementColor('line'),
          jocItem: activeJOCItem || undefined,
          groupId: activeGroupId || undefined,
        };
        addMeasurement(measurement);
        setTempPoints([]);
      }
    }
    
    if (activeTool === 'polyline') {
      setTempPoints([...tempPoints, point]);
    }
    
    if (activeTool === 'count') {
      // Check if there's a selected count measurement to add to
      const selectedCount = selectedMeasurement 
        ? project?.measurements.find(m => m.id === selectedMeasurement && m.type === 'count')
        : null;
      
      if (selectedCount) {
        // Add to existing count - increment value and add point
        updateMeasurement(selectedCount.id, {
          points: [...selectedCount.points, point],
          value: selectedCount.value + 1,
        });
      } else {
        // Create new count measurement
        const measurement: Measurement = {
          id: generateId(),
          type: 'count',
          points: [point],
          value: 1,
          unit: 'EA',
          pageNumber,
          color: activeJOCItem ? getMeasurementColor('count') : COLORS.warning,
          jocItem: activeJOCItem || undefined,
          groupId: activeGroupId || undefined,
        };
        addMeasurement(measurement);
      }
    }
    
    if (activeTool === 'area' || activeTool === 'space') {
      setTempPoints([...tempPoints, point]);
    }
  }, [activeTool, tempPoints, project, addMeasurement, updateMeasurement, selectedMeasurement, selectMeasurement, getSnappedPoint, activeJOCItem, activeGroupId, pageNumber]);

  const handleDoubleClick = useCallback(() => {
    if (activeTool === 'polyline' && tempPoints.length >= 2) {
      const totalLength = calculatePolylineLength(tempPoints, project!.scale);
      const measurement: Measurement = {
        id: generateId(),
        type: 'polyline',
        points: tempPoints,
        value: totalLength,
        unit: 'LF',
        pageNumber,
        color: getMeasurementColor('polyline'),
        jocItem: activeJOCItem || undefined,
        groupId: activeGroupId || undefined,
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
        pageNumber,
        color: getMeasurementColor('area'),
        jocItem: activeJOCItem || undefined,
        groupId: activeGroupId || undefined,
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
          pageNumber,
          color: getMeasurementColor('space'),
          spaceName: spaceName,
          perimeter: perimeter,
          finishes: [],
          jocItem: activeJOCItem || undefined,
          groupId: activeGroupId || undefined,
        };
        addMeasurement(measurement);
      }
      setTempPoints([]);
    }
  }, [activeTool, tempPoints, project, addMeasurement, activeJOCItem, activeGroupId, pageNumber]);

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
      setSnapResult(null);
    }
  }, []);

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
          pointerEvents: activeTool === 'pan' ? 'none' : 'auto'
        }}
      />
      
      {/* Snap Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <button
          onClick={() => setSnapSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            ${snapSettings.enabled 
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
              : 'bg-white/[0.03] border border-white/[0.06] text-white/40'
            }
          `}
          title="Toggle snap"
        >
          <Magnet className="w-3.5 h-3.5" />
          Snap
        </button>
        
        {snapSettings.enabled && (
          <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToEndpoints: !prev.snapToEndpoints }))}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                snapSettings.snapToEndpoints 
                  ? 'bg-emerald-500/30 text-emerald-400' 
                  : 'text-white/30 hover:text-white/60'
              }`}
              title="Endpoints"
            >
              <CircleDot className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToMidpoints: !prev.snapToMidpoints }))}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                snapSettings.snapToMidpoints 
                  ? 'bg-blue-500/30 text-blue-400' 
                  : 'text-white/30 hover:text-white/60'
              }`}
              title="Midpoints"
            >
              <Diamond className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToIntersections: !prev.snapToIntersections }))}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                snapSettings.snapToIntersections 
                  ? 'bg-amber-500/30 text-amber-400' 
                  : 'text-white/30 hover:text-white/60'
              }`}
              title="Intersections"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSnapSettings(prev => ({ ...prev, snapToPerpendicular: !prev.snapToPerpendicular }))}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                snapSettings.snapToPerpendicular 
                  ? 'bg-purple-500/30 text-purple-400' 
                  : 'text-white/30 hover:text-white/60'
              }`}
              title="Perpendicular"
            >
              <span className="text-xs font-bold">⊥</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
