/**
 * Training Service
 * Collects user selections to improve the Translation Machine
 */

import { prisma } from '../../config/database.js';
import { logger } from '../../lib/logger.js';

export interface SelectionData {
  userId?: string;
  sessionId: string;
  measurementId: string;
  measurementType: 'line' | 'count' | 'area' | 'space';
  measurementValue: number;
  measurementLabel?: string;
  path: string[];  // Decision tree path taken
  keywords?: string[];  // Keywords user typed (if any)
  selectedTaskCode: string;
  selectedDescription: string;
  selectedUnit: string;
  selectedUnitCost: number;
  alternativesShown?: string[];  // Other task codes that were shown
  timeToSelect?: number;  // Milliseconds from start to selection
}

export interface SelectionStats {
  totalSelections: number;
  uniqueSessions: number;
  topPaths: Array<{ path: string; count: number }>;
  topItems: Array<{ taskCode: string; description: string; count: number }>;
  avgTimeToSelect: number;
}

class TrainingService {
  /**
   * Log a user selection for training
   */
  async logSelection(data: SelectionData): Promise<{ id: string }> {
    try {
      const selection = await prisma.trainingSelection.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
          measurementId: data.measurementId,
          measurementType: data.measurementType,
          measurementValue: data.measurementValue,
          measurementLabel: data.measurementLabel,
          path: data.path,
          keywords: data.keywords || [],
          selectedTaskCode: data.selectedTaskCode,
          selectedDescription: data.selectedDescription,
          selectedUnit: data.selectedUnit,
          selectedUnitCost: data.selectedUnitCost,
          alternativesShown: data.alternativesShown || [],
          timeToSelect: data.timeToSelect,
        },
      });

      logger.info({
        selectionId: selection.id,
        taskCode: data.selectedTaskCode,
        path: data.path,
      }, 'Training selection logged');

      return { id: selection.id };
    } catch (error) {
      logger.error({ error, data }, 'Failed to log training selection');
      throw error;
    }
  }

  /**
   * Get selection statistics for analysis
   */
  async getStats(): Promise<SelectionStats> {
    const selections = await prisma.trainingSelection.findMany({
      select: {
        sessionId: true,
        path: true,
        selectedTaskCode: true,
        selectedDescription: true,
        timeToSelect: true,
      },
    });

    // Count unique sessions
    const uniqueSessions = new Set(selections.map(s => s.sessionId)).size;

    // Count paths
    const pathCounts: Record<string, number> = {};
    selections.forEach(s => {
      const pathKey = (s.path as string[]).join(' → ');
      pathCounts[pathKey] = (pathCounts[pathKey] || 0) + 1;
    });

    const topPaths = Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count items
    const itemCounts: Record<string, { description: string; count: number }> = {};
    selections.forEach(s => {
      if (!itemCounts[s.selectedTaskCode]) {
        itemCounts[s.selectedTaskCode] = { description: s.selectedDescription, count: 0 };
      }
      itemCounts[s.selectedTaskCode].count++;
    });

    const topItems = Object.entries(itemCounts)
      .map(([taskCode, { description, count }]) => ({ taskCode, description, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Average time to select
    const timesWithValues = selections.filter(s => s.timeToSelect != null).map(s => s.timeToSelect!);
    const avgTimeToSelect = timesWithValues.length > 0
      ? timesWithValues.reduce((a, b) => a + b, 0) / timesWithValues.length
      : 0;

    return {
      totalSelections: selections.length,
      uniqueSessions,
      topPaths,
      topItems,
      avgTimeToSelect,
    };
  }

  /**
   * Get selections for a specific path (for learning patterns)
   */
  async getSelectionsForPath(path: string[]): Promise<Array<{
    taskCode: string;
    description: string;
    count: number;
  }>> {
    const selections = await prisma.trainingSelection.findMany({
      where: {
        path: {
          equals: path,
        },
      },
      select: {
        selectedTaskCode: true,
        selectedDescription: true,
      },
    });

    const counts: Record<string, { description: string; count: number }> = {};
    selections.forEach(s => {
      if (!counts[s.selectedTaskCode]) {
        counts[s.selectedTaskCode] = { description: s.selectedDescription, count: 0 };
      }
      counts[s.selectedTaskCode].count++;
    });

    return Object.entries(counts)
      .map(([taskCode, { description, count }]) => ({ taskCode, description, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get keyword associations (what keywords lead to what items)
   */
  async getKeywordAssociations(): Promise<Record<string, Array<{
    taskCode: string;
    count: number;
  }>>> {
    const selections = await prisma.trainingSelection.findMany({
      where: {
        keywords: {
          isEmpty: false,
        },
      },
      select: {
        keywords: true,
        selectedTaskCode: true,
      },
    });

    const associations: Record<string, Record<string, number>> = {};
    
    selections.forEach(s => {
      const keywords = s.keywords as string[];
      keywords.forEach(kw => {
        if (!associations[kw]) associations[kw] = {};
        associations[kw][s.selectedTaskCode] = (associations[kw][s.selectedTaskCode] || 0) + 1;
      });
    });

    // Convert to sorted arrays
    const result: Record<string, Array<{ taskCode: string; count: number }>> = {};
    Object.entries(associations).forEach(([keyword, items]) => {
      result[keyword] = Object.entries(items)
        .map(([taskCode, count]) => ({ taskCode, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    });

    return result;
  }

  /**
   * Get recent selections for debugging/review
   */
  async getRecentSelections(limit = 50): Promise<SelectionData[]> {
    const selections = await prisma.trainingSelection.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return selections.map(s => ({
      userId: s.userId || undefined,
      sessionId: s.sessionId,
      measurementId: s.measurementId,
      measurementType: s.measurementType as 'line' | 'count' | 'area' | 'space',
      measurementValue: s.measurementValue,
      measurementLabel: s.measurementLabel || undefined,
      path: s.path as string[],
      keywords: s.keywords as string[] || undefined,
      selectedTaskCode: s.selectedTaskCode,
      selectedDescription: s.selectedDescription,
      selectedUnit: s.selectedUnit,
      selectedUnitCost: s.selectedUnitCost,
      alternativesShown: s.alternativesShown as string[] || undefined,
      timeToSelect: s.timeToSelect || undefined,
    }));
  }
}

export const trainingService = new TrainingService();
