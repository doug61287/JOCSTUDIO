import type { Point } from '../types';

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function pixelsToFeet(pixels: number, scale: number): number {
  return pixels / scale;
}

export function feetToPixels(feet: number, scale: number): number {
  return feet * scale;
}

export function calculateLineLength(points: Point[], scale: number): number {
  if (points.length < 2) return 0;
  const pixelLength = distance(points[0], points[1]);
  return pixelsToFeet(pixelLength, scale);
}

export function calculatePolygonArea(points: Point[], scale: number): number {
  if (points.length < 3) return 0;
  
  // Shoelace formula
  let area = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  
  area = Math.abs(area) / 2;
  
  // Convert from square pixels to square feet
  return area / (scale * scale);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getMeasurementColor(type: 'line' | 'count' | 'area'): string {
  switch (type) {
    case 'line': return '#3B82F6'; // Blue
    case 'count': return '#10B981'; // Green
    case 'area': return '#F59E0B'; // Orange
    default: return '#6B7280'; // Gray
  }
}

export function formatMeasurement(value: number, unit: string): string {
  if (unit === 'EA') {
    return `${Math.round(value)} ${unit}`;
  }
  return `${value.toFixed(1)} ${unit}`;
}
