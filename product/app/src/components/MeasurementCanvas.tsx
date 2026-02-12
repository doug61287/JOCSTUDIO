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
    selectMeasurement,
    activeJOCItem,
    activeGroupId
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

  // ============================================
  // KREO-STYLE DRAWING HELPERS
  // ============================================
  
  // Draw a rounded rectangle (pill badge)
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

  // Draw a Kreo-style pill badge with text
  const drawPillBadge = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    text: string,
    bgColor: string,
    textColor: string = 'white',
    fontSize: number = 12
  ) => {
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const metrics = ctx.measureText(text);
    const padding = 8;
    const height = fontSize + 8;
    const width = metrics.width + padding * 2;
    const radius = height / 2;
    
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    
    // Background
    ctx.fillStyle = bgColor;
    drawRoundedRect(ctx, x, y - height/2, width, height, radius);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padding, y);
    
    return width;
  };

  // Draw a pin-style marker (Kreo count style)
  const drawPinMarker = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    color: string,
    label: string,
    isSelected: boolean
  ) => {
    const size = 18;
    const pinHeight = 8;
    
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    
    // Pin body (circle)
    ctx.beginPath();
    ctx.arc(x, y - pinHeight, size/2, 0, Math.PI * 2);
    
    // Create gradient
    const gradient = ctx.createRadialGradient(x - 3, y - pinHeight - 3, 0, x, y - pinHeight, size/2);
    gradient.addColorStop(0, lightenColor(color, 30));
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Border
    ctx.strokeStyle = isSelected ? '#FFD700' : darkenColor(color, 20);
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();
    
    // Pin point (triangle)
    ctx.beginPath();
    ctx.moveTo(x - 5, y - pinHeight + 6);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 5, y - pinHeight + 6);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Label
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - pinHeight);
  };

  // Helper to lighten a hex color
  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `rgb(${R},${G},${B})`;
  };

  // Helper to darken a hex color
  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `rgb(${R},${G},${B})`;
  };

  // Get short name for JOC item
  const getShortItemName = (desc: string, maxLen: number = 20): string => {
    const firstPart = desc.split(',')[0].trim();
    return firstPart.length > maxLen ? firstPart.slice(0, maxLen) + '...' : firstPart;
  };

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
      const baseColor = m.color;
      const style: MeasurementStyle = m.style || DEFAULT_STYLE;
      
      // Get line dash pattern from style
      const getLineDash = (lineStyle: string): number[] => {
        switch (lineStyle) {
          case 'dashed': return [10, 5];
          case 'dotted': return [3, 3];
          default: return [];
        }
      };
      
      // ============================================
      // LINE MEASUREMENTS - Kreo Style
      // ============================================
      if (m.type === 'line' && m.points.length >= 2) {
        const [p1, p2] = m.points;
        
        // Line with rounded caps
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Shadow for depth
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = 1;
        
        ctx.strokeStyle = isSelected ? '#FFD700' : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 1 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.shadowColor = 'transparent';
        
        // Endpoint markers with gradient
        [p1, p2].forEach((p) => {
          const grad = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, 7);
          grad.addColorStop(0, lightenColor(baseColor, 40));
          grad.addColorStop(1, baseColor);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = isSelected ? '#FFD700' : 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        
        // Pill badge at midpoint
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        
        // Show JOC item name if assigned and enabled
        if (m.jocItem && style.showItemName) {
          const itemName = getShortItemName(m.jocItem.description, 18);
          drawPillBadge(ctx, midX + 12, midY - 20, itemName, 'rgba(0,0,0,0.75)', baseColor, style.fontSize - 2);
        }
        
        // Show cost if enabled
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          drawPillBadge(ctx, midX + 12, midY + 20, `$${cost}`, '#22c55e', 'white', style.fontSize - 2);
        }
        
        // Length badge (if showValue enabled)
        if (style.showValue) {
          drawPillBadge(ctx, midX + 12, midY, `${m.value.toFixed(1)} LF`, baseColor, 'white', style.fontSize);
        }
      }
      
      // ============================================
      // POLYLINE MEASUREMENTS - Kreo Style
      // ============================================
      if (m.type === 'polyline' && m.points.length >= 2) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 3;
        
        ctx.strokeStyle = isSelected ? '#FFD700' : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 1 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle));
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.shadowColor = 'transparent';
        
        // Vertex markers with segment lengths
        m.points.forEach((p, idx) => {
          // Gradient vertex
          const grad = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, 7);
          grad.addColorStop(0, lightenColor(baseColor, 40));
          grad.addColorStop(1, baseColor);
          
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Segment length (small pill)
          if (idx < m.points.length - 1 && style.showValue) {
            const nextP = m.points[idx + 1];
            const segLen = pixelsToFeet(distance(p, nextP), project.scale);
            const mx = (p.x + nextP.x) / 2;
            const my = (p.y + nextP.y) / 2;
            
            drawPillBadge(ctx, mx - 20, my - 12, `${segLen.toFixed(1)}'`, 'rgba(0,0,0,0.6)', baseColor, style.fontSize - 2);
          }
        });
        
        // Total badge at end
        const lastP = m.points[m.points.length - 1];
        if (m.jocItem && style.showItemName) {
          const itemName = getShortItemName(m.jocItem.description, 18);
          drawPillBadge(ctx, lastP.x + 12, lastP.y - 32, itemName, 'rgba(0,0,0,0.75)', baseColor, style.fontSize - 2);
        }
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          drawPillBadge(ctx, lastP.x + 12, lastP.y + 12, `$${cost}`, '#22c55e', 'white', style.fontSize - 2);
        }
        if (style.showValue) {
          drawPillBadge(ctx, lastP.x + 12, lastP.y - 10, `Total: ${m.value.toFixed(1)} LF`, baseColor, 'white', style.fontSize);
        }
      }
      
      // ============================================
      // COUNT MEASUREMENTS - Kreo Pin Style
      // ============================================
      if (m.type === 'count') {
        m.points.forEach((p, idx) => {
          drawPinMarker(ctx, p.x, p.y, baseColor, String(idx + 1), isSelected);
        });
        
        // Item name + count badge
        if (m.points.length > 0) {
          const lastP = m.points[m.points.length - 1];
          
          if (m.jocItem && style.showItemName) {
            const itemName = getShortItemName(m.jocItem.description, 22);
            drawPillBadge(ctx, lastP.x + 20, lastP.y - 35, itemName, 'rgba(0,0,0,0.8)', baseColor, style.fontSize - 1);
          }
          if (m.jocItem && style.showCost) {
            const cost = (m.value * m.jocItem.unitCost).toFixed(0);
            drawPillBadge(ctx, lastP.x + 20, lastP.y + 8, `$${cost}`, '#22c55e', 'white', style.fontSize - 1);
          }
          if (style.showValue) {
            drawPillBadge(ctx, lastP.x + 20, lastP.y - 12, `${m.value} EA`, baseColor, 'white', style.fontSize);
          }
        }
      }
      
      // ============================================
      // AREA MEASUREMENTS - Kreo Style
      // ============================================
      if (m.type === 'area' && m.points.length >= 3) {
        // Semi-transparent fill
        ctx.fillStyle = baseColor + '35';
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        
        // Border with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 3;
        ctx.strokeStyle = isSelected ? '#FFD700' : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 1 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowColor = 'transparent';
        
        // Vertex markers
        m.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = baseColor;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        
        // Center badge
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        
        if (m.jocItem && style.showItemName) {
          const itemName = getShortItemName(m.jocItem.description, 20);
          drawPillBadge(ctx, cx - 50, cy - 22, itemName, 'rgba(0,0,0,0.8)', baseColor, style.fontSize - 1);
        }
        if (m.jocItem && style.showCost) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          drawPillBadge(ctx, cx - 30, cy + 22, `$${cost}`, '#22c55e', 'white', style.fontSize - 1);
        }
        if (style.showValue) {
          drawPillBadge(ctx, cx - 30, cy, `${m.value.toFixed(1)} SF`, baseColor, 'white', style.fontSize);
        }
      }
      
      // ============================================
      // SPACE (ROOM) MEASUREMENTS - Kreo Style
      // ============================================
      if (m.type === 'space' && m.points.length >= 3) {
        // Lighter fill for rooms
        ctx.fillStyle = baseColor + '25';
        ctx.beginPath();
        ctx.moveTo(m.points[0].x, m.points[0].y);
        m.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        
        // Border (use style line settings)
        ctx.strokeStyle = isSelected ? '#FFD700' : baseColor;
        ctx.lineWidth = isSelected ? style.lineWidth + 1 : style.lineWidth;
        ctx.setLineDash(getLineDash(style.lineStyle) || [10, 5]); // Default dashed for spaces
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Vertex markers
        m.points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = baseColor;
          ctx.fill();
        });
        
        // Room info card at centroid
        const cx = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
        const cy = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
        
        // Card background with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        
        const cardWidth = 130;
        const cardHeight = style.showCost && m.jocItem ? 75 : 60;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        drawRoundedRect(ctx, cx - cardWidth/2, cy - cardHeight/2, cardWidth, cardHeight, 8);
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        
        // Room name
        ctx.font = `bold ${style.fontSize + 2}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = baseColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.spaceName || 'Space', cx, cy - 18);
        
        // Area
        if (style.showValue) {
          ctx.font = `bold ${style.fontSize + 1}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillStyle = 'white';
          ctx.fillText(`${m.value.toFixed(0)} SF`, cx, cy + 2);
        }
        
        // Perimeter
        ctx.font = `${style.fontSize - 1}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText(`${m.perimeter?.toFixed(0) || 0} LF perimeter`, cx, cy + 18);
        
        // Cost
        if (style.showCost && m.jocItem) {
          const cost = (m.value * m.jocItem.unitCost).toFixed(0);
          ctx.font = `bold ${style.fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.fillStyle = '#22c55e';
          ctx.fillText(`$${cost}`, cx, cy + 32);
        }
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
          // Auto-assign active JOC item and group (sticky selection!)
          jocItem: activeJOCItem || undefined,
          groupId: activeGroupId || undefined,
        };
        addMeasurement(measurement);
        setTempPoints([]);
      }
    }
    
    // Polyline: add points, double-click to complete
    if (activeTool === 'polyline') {
      setTempPoints([...tempPoints, point]);
    }
    
    // Count: each click adds a marker (REQUIRES active JOC item for takeoff)
    if (activeTool === 'count') {
      // Warn if no JOC item selected - counts won't appear in takeoff!
      if (!activeJOCItem) {
        // Still allow the count, but show a warning indicator
        console.warn('Count created without JOC item - will not appear in Takeoff summary');
      }
      
      // Auto-save after each click (Kreo-style: each click = 1 count item)
      const measurement: Measurement = {
        id: generateId(),
        type: 'count',
        points: [point],
        value: 1,
        unit: 'EA',
        color: activeJOCItem ? getMeasurementColor('count') : '#6b7280', // Gray if no JOC item
        // Auto-assign active JOC item and group (sticky selection!)
        jocItem: activeJOCItem || undefined,
        groupId: activeGroupId || undefined,
      };
      addMeasurement(measurement);
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
        // Auto-assign active JOC item and group (sticky selection!)
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
        color: getMeasurementColor('area'),
        // Auto-assign active JOC item and group (sticky selection!)
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
          color: getMeasurementColor('space'),
          spaceName: spaceName,
          perimeter: perimeter,
          finishes: [],
          // Auto-assign active JOC item and group (sticky selection!)
          jocItem: activeJOCItem || undefined,
          groupId: activeGroupId || undefined,
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
