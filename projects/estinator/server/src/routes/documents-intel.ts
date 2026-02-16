/**
 * Document Intelligence API Routes
 * 
 * Provides endpoints for:
 * - Document upload and analysis
 * - Schedule extraction
 * - Room scope aggregation
 * - Natural language Q&A
 * - Project insights
 */

import { Router } from 'express';
import { DocumentIntelligenceEngine } from '../../document-intelligence/engine';
import { ProjectBrain } from '../services/projectBrain';

const router = Router();

// In-memory store for engines (replace with Redis in production)
const engines: Map<string, DocumentIntelligenceEngine> = new Map();

function getEngine(projectId: string): DocumentIntelligenceEngine {
  if (!engines.has(projectId)) {
    engines.set(projectId, new DocumentIntelligenceEngine(projectId));
  }
  return engines.get(projectId)!;
}

/**
 * POST /api/documents/:projectId/analyze
 * Upload and analyze a document
 */
router.post('/:projectId/analyze', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { documentId, content, docType, metadata } = req.body;

    if (!documentId || !content) {
      return res.status(400).json({ error: 'documentId and content required' });
    }

    const engine = getEngine(projectId);
    
    // Load document into engine
    engine.load_document(documentId, docType || 'unknown', content, metadata);
    
    // Extract schedules
    const schedules = engine.extract_schedules(documentId);
    
    // Generate insights
    const insights = engine.detect_document_conflicts();
    
    res.json({
      projectId,
      documentId,
      schedulesFound: schedules.length,
      schedules: schedules.map(s => ({ type: s.type, rows: s.data?.rows?.length || 0 })),
      insights: insights.length,
      status: 'analyzed'
    });
    
  } catch (error) {
    console.error('Document analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * GET /api/documents/:projectId/rooms
 * Get aggregated room scope
 */
router.get('/:projectId/rooms', async (req, res) => {
  try {
    const { projectId } = req.params;
    const engine = getEngine(projectId);
    
    const rooms = engine.aggregate_room_scope();
    
    res.json({
      projectId,
      roomCount: Object.keys(rooms).length,
      rooms
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room scope' });
  }
});

/**
 * GET /api/documents/:projectId/rooms/:roomNumber
 * Get details for a specific room
 */
router.get('/:projectId/rooms/:roomNumber', async (req, res) => {
  try {
    const { projectId, roomNumber } = req.params;
    const engine = getEngine(projectId);
    
    const rooms = engine.aggregate_room_scope();
    const room = rooms[roomNumber];
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({
      projectId,
      roomNumber,
      ...room
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get room details' });
  }
});

/**
 * POST /api/documents/:projectId/query
 * Natural language Q&A
 */
router.post('/:projectId/query', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const engine = getEngine(projectId);
    const result = engine.answer_question(question);
    
    res.json({
      projectId,
      question,
      answer: result.answer,
      data: result.data,
      sources: result.sources
    });
    
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Query failed' });
  }
});

/**
 * GET /api/documents/:projectId/insights
 * Get all detected insights/conflicts
 */
router.get('/:projectId/insights', async (req, res) => {
  try {
    const { projectId } = req.params;
    const engine = getEngine(projectId);
    
    const insights = engine.detect_document_conflicts();
    
    res.json({
      projectId,
      count: insights.length,
      bySeverity: {
        critical: insights.filter(i => i.severity === 'critical').length,
        high: insights.filter(i => i.severity === 'high').length,
        medium: insights.filter(i => i.severity === 'medium').length,
        low: insights.filter(i => i.severity === 'low').length,
      },
      insights: insights.map(i => ({
        category: i.category,
        severity: i.severity,
        title: i.title,
        description: i.description,
        recommendation: i.recommendation
      }))
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

/**
 * GET /api/documents/:projectId/summary
 * Get project summary
 */
router.get('/:projectId/summary', async (req, res) => {
  try {
    const { projectId } = req.params;
    const engine = getEngine(projectId);
    
    const summary = engine.generate_project_summary();
    
    res.json(summary);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

/**
 * POST /api/documents/:projectId/compare
 * Compare documents (e.g., original vs addendum)
 */
router.post('/:projectId/compare', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { docId1, docId2, docType } = req.body;

    // This would use the conflict detector
    // For now, return placeholder
    res.json({
      projectId,
      comparison: {
        documents: [docId1, docId2],
        changes: [],
        additions: [],
        deletions: []
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Comparison failed' });
  }
});

export default router;
