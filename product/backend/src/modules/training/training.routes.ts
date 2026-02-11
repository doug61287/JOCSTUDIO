/**
 * Training API Routes
 * Endpoints for logging and analyzing user selections
 * 
 * POST /training/selections      - Log a selection
 * GET  /training/selections      - Get recent selections
 * GET  /training/stats           - Get aggregate statistics
 * GET  /training/path/:path      - Get selections for a specific path
 * GET  /training/keywords        - Get keyword associations
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { trainingService, SelectionData } from './training.service.js';
import { logger } from '../../lib/logger.js';

interface LogSelectionBody {
  sessionId: string;
  measurementId: string;
  measurementType: 'line' | 'count' | 'area' | 'space';
  measurementValue: number;
  measurementLabel?: string;
  path: string[];
  keywords?: string[];
  selectedTaskCode: string;
  selectedDescription: string;
  selectedUnit: string;
  selectedUnitCost: number;
  alternativesShown?: string[];
  timeToSelect?: number;
}

export async function trainingRoutes(fastify: FastifyInstance) {
  /**
   * Log a user selection
   * POST /training/selections
   */
  fastify.post('/selections', {
    schema: {
      tags: ['Training'],
      summary: 'Log a user selection for training',
      body: {
        type: 'object',
        required: ['sessionId', 'measurementId', 'measurementType', 'measurementValue', 'path', 'selectedTaskCode', 'selectedDescription', 'selectedUnit', 'selectedUnitCost'],
        properties: {
          sessionId: { type: 'string' },
          measurementId: { type: 'string' },
          measurementType: { type: 'string', enum: ['line', 'count', 'area', 'space'] },
          measurementValue: { type: 'number' },
          measurementLabel: { type: 'string' },
          path: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
          selectedTaskCode: { type: 'string' },
          selectedDescription: { type: 'string' },
          selectedUnit: { type: 'string' },
          selectedUnitCost: { type: 'number' },
          alternativesShown: { type: 'array', items: { type: 'string' } },
          timeToSelect: { type: 'number' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: LogSelectionBody }>, reply: FastifyReply) => {
    try {
      // Get user ID from JWT if authenticated
      let userId: string | undefined;
      try {
        const decoded = await request.jwtVerify();
        userId = (decoded as any).id;
      } catch {
        // Not authenticated, that's OK for training
      }

      const result = await trainingService.logSelection({
        ...request.body,
        userId,
      });

      return reply.status(201).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error({ error }, 'Failed to log selection');
      return reply.status(500).send({
        success: false,
        error: { message: 'Failed to log selection', code: 'TRAINING_ERROR' },
      });
    }
  });

  /**
   * Get recent selections
   * GET /training/selections?limit=50
   */
  fastify.get('/selections', {
    schema: {
      tags: ['Training'],
      summary: 'Get recent training selections',
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const { limit = 50 } = request.query;
    
    const selections = await trainingService.getRecentSelections(limit);
    
    return reply.send({
      success: true,
      data: selections,
    });
  });

  /**
   * Get training statistics
   * GET /training/stats
   */
  fastify.get('/stats', {
    schema: {
      tags: ['Training'],
      summary: 'Get aggregate training statistics',
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const stats = await trainingService.getStats();
    
    return reply.send({
      success: true,
      data: stats,
    });
  });

  /**
   * Get selections for a specific path
   * GET /training/path/wall/wall-drywall/wall-drywall-5-8-fire
   */
  fastify.get('/path/*', {
    schema: {
      tags: ['Training'],
      summary: 'Get selections for a specific decision tree path',
    },
  }, async (request: FastifyRequest<{ Params: { '*': string } }>, reply: FastifyReply) => {
    const pathString = (request.params as any)['*'];
    const path = pathString.split('/').filter((p: string) => p);
    
    if (path.length === 0) {
      return reply.status(400).send({
        success: false,
        error: { message: 'Path is required', code: 'INVALID_PATH' },
      });
    }

    const selections = await trainingService.getSelectionsForPath(path);
    
    return reply.send({
      success: true,
      data: {
        path,
        selections,
      },
    });
  });

  /**
   * Get keyword associations
   * GET /training/keywords
   */
  fastify.get('/keywords', {
    schema: {
      tags: ['Training'],
      summary: 'Get keyword to item associations from training data',
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const associations = await trainingService.getKeywordAssociations();
    
    return reply.send({
      success: true,
      data: associations,
    });
  });
}
