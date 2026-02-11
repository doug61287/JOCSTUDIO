import type { Point, Measurement } from '../types';
import { distance } from './geometry';

export interface SnapPoint {
  point: Point;
  type: 'endpoint' | 'midpoint' | 'intersection' | 'perpendicular' | 'grid';
  sourceId?: string; // ID of the measurement this snap point comes from
}

export interface SnapResult {
  snapped: boolean;
  point: Point;
  snapPoint?: SnapPoint;
}

export interface SnapSettings {
  enabled: boolean;
  tolerance: number; // pixels
  snapToEndpoints: boolean;
  snapToMidpoints: boolean;
  snapToIntersections: boolean;
  snapToPerpendicular: boolean;
  snapToGrid: boolean;
  gridSize: number; // pixels
}

export const DEFAULT_SNAP_SETTINGS: SnapSettings = {
  enabled: true,
  tolerance: 15,
  snapToEndpoints: true,
  snapToMidpoints: true,
  snapToIntersections: true,
  snapToPerpendicular: true,
  snapToGrid: false,
  gridSize: 20,
};

/**
 * Get all possible snap points from existing measurements
 */
export function getSnapPoints(
  measurements: Measurement[],
  settings: SnapSettings,
  activePoint?: Point // Current drawing point (for perpendicular snaps)
): SnapPoint[] {
  const snapPoints: SnapPoint[] = [];

  measurements.forEach((m) => {
    // Endpoints
    if (settings.snapToEndpoints) {
      m.points.forEach((p) => {
        snapPoints.push({
          point: p,
          type: 'endpoint',
          sourceId: m.id,
        });
      });
    }

    // Midpoints (for lines)
    if (settings.snapToMidpoints && m.type === 'line' && m.points.length >= 2) {
      const mid: Point = {
        x: (m.points[0].x + m.points[1].x) / 2,
        y: (m.points[0].y + m.points[1].y) / 2,
      };
      snapPoints.push({
        point: mid,
        type: 'midpoint',
        sourceId: m.id,
      });
    }

    // Midpoints for polygon edges
    if (settings.snapToMidpoints && (m.type === 'area' || m.type === 'space') && m.points.length >= 2) {
      for (let i = 0; i < m.points.length; i++) {
        const p1 = m.points[i];
        const p2 = m.points[(i + 1) % m.points.length];
        const mid: Point = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };
        snapPoints.push({
          point: mid,
          type: 'midpoint',
          sourceId: m.id,
        });
      }
    }
  });

  // Perpendicular snaps from active point to existing lines
  if (settings.snapToPerpendicular && activePoint) {
    measurements.forEach((m) => {
      if (m.type === 'line' && m.points.length >= 2) {
        const perpPoint = getPerpendicularPoint(activePoint, m.points[0], m.points[1]);
        if (perpPoint && isPointOnLineSegment(perpPoint, m.points[0], m.points[1])) {
          snapPoints.push({
            point: perpPoint,
            type: 'perpendicular',
            sourceId: m.id,
          });
        }
      }
    });
  }

  // Line intersections
  if (settings.snapToIntersections) {
    const lines: { p1: Point; p2: Point; id: string }[] = [];
    
    measurements.forEach((m) => {
      if (m.type === 'line' && m.points.length >= 2) {
        lines.push({ p1: m.points[0], p2: m.points[1], id: m.id });
      }
      // Include polygon edges
      if ((m.type === 'area' || m.type === 'space') && m.points.length >= 2) {
        for (let i = 0; i < m.points.length; i++) {
          lines.push({
            p1: m.points[i],
            p2: m.points[(i + 1) % m.points.length],
            id: m.id,
          });
        }
      }
    });

    // Find all intersection points
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const intersection = getLineIntersection(
          lines[i].p1, lines[i].p2,
          lines[j].p1, lines[j].p2
        );
        if (intersection) {
          snapPoints.push({
            point: intersection,
            type: 'intersection',
          });
        }
      }
    }
  }

  return snapPoints;
}

/**
 * Find the nearest snap point to the cursor
 */
export function findNearestSnap(
  cursorPoint: Point,
  snapPoints: SnapPoint[],
  tolerance: number
): SnapResult {
  let nearest: SnapPoint | undefined;
  let nearestDist = Infinity;

  snapPoints.forEach((sp) => {
    const d = distance(cursorPoint, sp.point);
    if (d < nearestDist && d <= tolerance) {
      nearestDist = d;
      nearest = sp;
    }
  });

  if (nearest) {
    return {
      snapped: true,
      point: nearest.point,
      snapPoint: nearest,
    };
  }

  return {
    snapped: false,
    point: cursorPoint,
  };
}

/**
 * Apply snap to a point
 */
export function applySnap(
  cursorPoint: Point,
  measurements: Measurement[],
  settings: SnapSettings,
  activePoint?: Point
): SnapResult {
  if (!settings.enabled) {
    return { snapped: false, point: cursorPoint };
  }

  // Grid snap (if enabled and no other snap found)
  let gridSnappedPoint: Point | undefined;
  if (settings.snapToGrid) {
    gridSnappedPoint = {
      x: Math.round(cursorPoint.x / settings.gridSize) * settings.gridSize,
      y: Math.round(cursorPoint.y / settings.gridSize) * settings.gridSize,
    };
  }

  const snapPoints = getSnapPoints(measurements, settings, activePoint);
  const result = findNearestSnap(cursorPoint, snapPoints, settings.tolerance);

  if (result.snapped) {
    return result;
  }

  // Fall back to grid snap if enabled
  if (settings.snapToGrid && gridSnappedPoint) {
    const gridDist = distance(cursorPoint, gridSnappedPoint);
    if (gridDist <= settings.tolerance) {
      return {
        snapped: true,
        point: gridSnappedPoint,
        snapPoint: { point: gridSnappedPoint, type: 'grid' },
      };
    }
  }

  return { snapped: false, point: cursorPoint };
}

/**
 * Get the perpendicular projection of a point onto a line
 */
function getPerpendicularPoint(point: Point, lineP1: Point, lineP2: Point): Point | null {
  const dx = lineP2.x - lineP1.x;
  const dy = lineP2.y - lineP1.y;
  const lenSq = dx * dx + dy * dy;
  
  if (lenSq === 0) return null;

  const t = ((point.x - lineP1.x) * dx + (point.y - lineP1.y) * dy) / lenSq;
  
  return {
    x: lineP1.x + t * dx,
    y: lineP1.y + t * dy,
  };
}

/**
 * Check if a point lies on a line segment
 */
function isPointOnLineSegment(point: Point, lineP1: Point, lineP2: Point, tolerance = 0.01): boolean {
  const d1 = distance(lineP1, point);
  const d2 = distance(point, lineP2);
  const lineLen = distance(lineP1, lineP2);
  
  return Math.abs(d1 + d2 - lineLen) < tolerance;
}

/**
 * Get intersection point of two line segments
 */
function getLineIntersection(
  p1: Point, p2: Point,
  p3: Point, p4: Point
): Point | null {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  
  if (Math.abs(denom) < 0.0001) return null; // Parallel lines

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  // Check if intersection is within both line segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    };
  }

  return null;
}

/**
 * Get snap indicator style based on snap type
 */
export function getSnapIndicatorStyle(type: SnapPoint['type']): {
  color: string;
  symbol: string;
} {
  switch (type) {
    case 'endpoint':
      return { color: '#22c55e', symbol: '●' }; // Green dot
    case 'midpoint':
      return { color: '#3b82f6', symbol: '◆' }; // Blue diamond
    case 'intersection':
      return { color: '#f59e0b', symbol: '✕' }; // Orange X
    case 'perpendicular':
      return { color: '#8b5cf6', symbol: '⊥' }; // Purple perpendicular
    case 'grid':
      return { color: '#6b7280', symbol: '⊞' }; // Gray grid
    default:
      return { color: '#ffffff', symbol: '○' };
  }
}
