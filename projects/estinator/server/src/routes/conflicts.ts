/**
 * Conflict Detection API Routes
 */

import { Router } from 'express';
import { ConflictDetectionService } from '../services/conflictDetection';
import { ProjectBrain } from '../services/projectBrain';

const router = Router();

// Initialize service (would be injected in production)
const getService = () => {
  const projectBrain = new ProjectBrain(); // Get from app context
  return new ConflictDetectionService(projectBrain);
};

/**
 * POST /api/conflicts/analyze
 * Analyze project for conflicts
 * 
 * Body: {
 *   projectId: string,
 *   documentIds: string[],
 *   analysisType: 'draw-spec' | 'addendum' | 'schedule' | 'quantity' | 'all'
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { projectId, documentIds, analysisType = 'all' } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId required' });
    }

    const service = getService();
    const result = await service.analyzeProject({
      projectId,
      documentIds: documentIds || [],
      analysisType,
    });

    res.json(result);
  } catch (error) {
    console.error('Conflict analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/conflicts/check-measurement
 * Real-time conflict check for new measurement
 * 
 * Body: {
 *   projectId: string,
 *   measurement: {
 *     itemCode: string,
 *     description: string,
 *     quantity: number,
 *     unit: string
 *   }
 * }
 */
router.post('/check-measurement', async (req, res) => {
  try {
    const { projectId, measurement } = req.body;

    if (!projectId || !measurement) {
      return res.status(400).json({ error: 'projectId and measurement required' });
    }

    const service = getService();
    const conflict = await service.checkMeasurementConflict(projectId, measurement);

    res.json({
      hasConflict: conflict !== null,
      conflict,
    });
  } catch (error) {
    console.error('Measurement check error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});

/**
 * POST /api/conflicts/check-document
 * Check for conflicts when uploading a new document
 * 
 * Body: {
 *   projectId: string,
 *   documentId: string
 * }
 */
router.post('/check-document', async (req, res) => {
  try {
    const { projectId, documentId } = req.body;

    if (!projectId || !documentId) {
      return res.status(400).json({ error: 'projectId and documentId required' });
    }

    const service = getService();
    const conflicts = await service.checkDocumentConflicts(projectId, documentId);

    res.json({
      conflictCount: conflicts.length,
      hasCritical: conflicts.some(c => c.severity === 'critical'),
      conflicts,
    });
  } catch (error) {
    console.error('Document check error:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});

/**
 * GET /api/conflicts/:projectId/summary
 * Get conflict summary for a project
 */
router.get('/:projectId/summary', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Query Project Brain for existing conflicts
    // This would be stored in a database in production
    
    res.json({
      projectId,
      lastAnalyzed: null, // Would be actual timestamp
      summary: {
        total: 0,
        critical: 0,
        warning: 0,
        info: 0,
      },
      message: 'Run POST /api/conflicts/analyze to generate conflict report',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

export default router;
