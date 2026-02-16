/**
 * Conflict Detection Service for Estinator
 * 
 * Integrates the Conflict Detector with the Estinator backend
 * Provides API endpoints and RAG-based conflict analysis
 */

import { ConflictDetector, Conflict } from '../conflict-detector/conflict_detector';
import { ProjectBrain } from './projectBrain';

export interface ConflictAnalysisRequest {
  projectId: string;
  documentIds: string[];
  analysisType: 'draw-spec' | 'addendum' | 'schedule' | 'quantity' | 'all';
}

export interface ConflictAnalysisResult {
  projectId: string;
  analyzedAt: string;
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
  };
  conflicts: Conflict[];
  recommendations: string[];
}

export class ConflictDetectionService {
  private detector: ConflictDetector;
  private projectBrain: ProjectBrain;

  constructor(projectBrain: ProjectBrain) {
    this.detector = new ConflictDetector();
    this.projectBrain = projectBrain;
  }

  /**
   * Analyze a project for conflicts
   */
  async analyzeProject(request: ConflictAnalysisRequest): Promise<ConflictAnalysisResult> {
    const conflicts: Conflict[] = [];

    // Get project documents from Project Brain
    const documents = await this.getProjectDocuments(request.projectId, request.documentIds);

    switch (request.analysisType) {
      case 'draw-spec':
        conflicts.push(...await this.analyzeDrawSpecConflicts(documents));
        break;
      case 'addendum':
        conflicts.push(...await this.analyzeAddendumConflicts(documents));
        break;
      case 'schedule':
        conflicts.push(...await this.analyzeScheduleConflicts(documents));
        break;
      case 'quantity':
        conflicts.push(...await this.analyzeQuantityConflicts(documents));
        break;
      case 'all':
        conflicts.push(...await this.analyzeDrawSpecConflicts(documents));
        conflicts.push(...await this.analyzeAddendumConflicts(documents));
        conflicts.push(...await this.analyzeScheduleConflicts(documents));
        conflicts.push(...await this.analyzeQuantityConflicts(documents));
        break;
    }

    const summary = this.detector.getSummary();

    return {
      projectId: request.projectId,
      analyzedAt: new Date().toISOString(),
      summary: {
        total: summary.total,
        critical: summary.critical,
        warning: summary.warning,
        info: summary.info,
      },
      conflicts,
      recommendations: this.generateRecommendations(conflicts),
    };
  }

  /**
   * Real-time conflict detection during takeoff
   * Checks if a new measurement conflicts with existing data
   */
  async checkMeasurementConflict(
    projectId: string,
    measurement: {
      itemCode: string;
      description: string;
      quantity: number;
      unit: string;
    }
  ): Promise<Conflict | null> {
    // Query Project Brain for existing quantities
    const existingQuery = await this.projectBrain.query(
      `What is the total quantity for ${measurement.itemCode} ${measurement.description}?`,
      projectId
    );

    // Parse existing quantity from response
    const existingQty = this.parseQuantityFromResponse(existingQuery);

    if (existingQty !== null) {
      return this.detector.detectQuantityDiscrepancy(
        measurement.quantity,
        existingQty,
        `${measurement.itemCode}: ${measurement.description}`,
        0.10  // 10% tolerance
      );
    }

    return null;
  }

  /**
   * Check for conflicts when uploading a new document
   */
  async checkDocumentConflicts(
    projectId: string,
    newDocumentId: string
  ): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // Get new document content
    const newDoc = await this.projectBrain.getDocument(newDocumentId);
    
    // Compare against existing documents
    const existingDocs = await this.projectBrain.getProjectDocuments(projectId);

    for (const existingDoc of existingDocs) {
      if (existingDoc.id === newDocumentId) continue;

      // Check for addendum relationship
      if (newDoc.type === 'addendum' || existingDoc.type === 'addendum') {
        const addendumConflicts = this.detector.detectAddendumChanges(
          existingDoc.content,
          newDoc.content,
          newDoc.name || 'New Document'
        );
        conflicts.push(...addendumConflicts);
      }

      // Check drawing vs spec conflicts
      if ((newDoc.type === 'drawing' && existingDoc.type === 'spec') ||
          (newDoc.type === 'spec' && existingDoc.type === 'drawing')) {
        const drawSpecConflicts = this.detector.detectDrawSpecConflict(
          newDoc.type === 'drawing' ? newDoc.content : existingDoc.content,
          newDoc.type === 'spec' ? newDoc.content : existingDoc.content,
          newDoc.type === 'drawing' ? newDoc.name : existingDoc.name,
          newDoc.type === 'spec' ? newDoc.name : existingDoc.name
        );
        conflicts.push(...addendumConflicts);
      }
    }

    return conflicts;
  }

  /**
   * Generate human-readable recommendations from conflicts
   */
  private generateRecommendations(conflicts: Conflict[]): string[] {
    const recommendations: string[] = [];

    // Group by type
    const byType = conflicts.reduce((acc, c) => {
      acc[c.type] = acc[c.type] || [];
      acc[c.type].push(c);
      return acc;
    }, {} as Record<string, Conflict[]>);

    // Generate recommendations
    if (byType['material']) {
      recommendations.push(
        `Review ${byType['material'].length} material specification conflicts before ordering.`
      );
    }

    if (byType['quantity']) {
      const criticalQty = byType['quantity'].filter(c => c.severity === 'critical');
      if (criticalQty.length > 0) {
        recommendations.push(
          `URGENT: ${criticalQty.length} quantity discrepancies exceed tolerance. Recalculate takeoff.`
        );
      }
    }

    if (byType['addendum']) {
      recommendations.push(
        `Update estimate for ${byType['addendum'].length} addendum changes. Check for cost impacts.`
      );
    }

    if (byType['schedule']) {
      recommendations.push(
        `Verify ${byType['schedule'].length} schedule conflicts with architect.`
      );
    }

    return recommendations;
  }

  // Private helper methods
  private async getProjectDocuments(projectId: string, documentIds: string[]) {
    // Implementation would fetch from Project Brain
    return [];
  }

  private async analyzeDrawSpecConflicts(documents: any[]): Promise<Conflict[]> {
    // Group by drawing/spec pairs
    return [];
  }

  private async analyzeAddendumConflicts(documents: any[]): Promise<Conflict[]> {
    // Find original + addendum pairs
    return [];
  }

  private async analyzeScheduleConflicts(documents: any[]): Promise<Conflict[]> {
    // Extract schedules and compare
    return [];
  }

  private async analyzeQuantityConflicts(documents: any[]): Promise<Conflict[]> {
    // Compare BOQ vs takeoff
    return [];
  }

  private parseQuantityFromResponse(response: string): number | null {
    // Extract numeric quantity from RAG response
    const match = response.match(/(\d+(?:\.\d+)?)\s*(?:CY|SF|LF|EA|TON)/i);
    return match ? parseFloat(match[1]) : null;
  }
}
