/**
 * JOC Catalogue API Routes
 * 
 * GET  /catalogue/search?q=...&limit=...&division=...  - Search catalogue
 * GET  /catalogue/item/:taskCode                        - Get single item
 * GET  /catalogue/divisions                             - List all divisions
 * GET  /catalogue/divisions/:code                       - Get items in division
 * POST /catalogue/translate                             - Translate description to JOC items
 * GET  /catalogue/stats                                 - Get catalogue stats
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { catalogueService } from './catalogue.service.js';
import { logger } from '../../lib/logger.js';

// Request schemas
interface SearchQuery {
  q: string;
  limit?: number;
  division?: string;
}

interface TranslateBody {
  description: string;
  limit?: number;
  minScore?: number;
}

interface DivisionParams {
  code: string;
}

interface ItemParams {
  taskCode: string;
}

export async function catalogueRoutes(fastify: FastifyInstance) {
  // Load catalogue on startup
  await catalogueService.load();

  /**
   * Search catalogue
   * GET /catalogue/search?q=sprinkler&limit=20&division=21
   */
  fastify.get('/search', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Search JOC catalogue',
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', description: 'Search query (keywords or task code)' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
          division: { type: 'string', pattern: '^\\d{2}$', description: 'CSI division code (e.g., 21, 22)' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      taskCode: { type: 'string' },
                      description: { type: 'string' },
                      unit: { type: 'string' },
                      unitCost: { type: 'number' },
                    },
                  },
                },
                total: { type: 'number' },
                query: { type: 'string' },
                took: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Querystring: SearchQuery }>, reply: FastifyReply) => {
    const { q, limit, division } = request.query;
    
    const result = catalogueService.search(q, { limit, division });
    
    logger.info({ query: q, results: result.total, took: result.took }, 'Catalogue search');
    
    return reply.send({
      success: true,
      data: result,
    });
  });

  /**
   * Get item by task code
   * GET /catalogue/item/21131113-0001
   */
  fastify.get('/item/:taskCode', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Get JOC item by task code',
      params: {
        type: 'object',
        properties: {
          taskCode: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: ItemParams }>, reply: FastifyReply) => {
    const { taskCode } = request.params;
    
    const item = catalogueService.getByCode(taskCode);
    
    if (!item) {
      return reply.status(404).send({
        success: false,
        error: { message: `Item ${taskCode} not found`, code: 'NOT_FOUND' },
      });
    }
    
    return reply.send({
      success: true,
      data: item,
    });
  });

  /**
   * List all divisions
   * GET /catalogue/divisions
   */
  fastify.get('/divisions', {
    schema: {
      tags: ['Catalogue'],
      summary: 'List all CSI divisions with item counts',
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const divisions = catalogueService.getDivisions();
    
    return reply.send({
      success: true,
      data: divisions,
    });
  });

  /**
   * Get items in a division
   * GET /catalogue/divisions/21?limit=50
   */
  fastify.get('/divisions/:code', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Get items in a CSI division',
      params: {
        type: 'object',
        properties: {
          code: { type: 'string', pattern: '^\\d{2}$' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 500, default: 100 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Params: DivisionParams; Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const { code } = request.params;
    const { limit = 100 } = request.query;
    
    const items = catalogueService.getByDivision(code, limit);
    
    return reply.send({
      success: true,
      data: {
        division: code,
        items,
        count: items.length,
      },
    });
  });

  /**
   * Translate description to JOC items
   * POST /catalogue/translate
   * Body: { description: "install 10 sprinkler heads", limit: 5 }
   */
  fastify.post('/translate', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Translate plain English to JOC line items',
      body: {
        type: 'object',
        required: ['description'],
        properties: {
          description: { type: 'string', description: 'Plain English work description' },
          limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
          minScore: { type: 'number', minimum: 0, maximum: 1, default: 0.2 },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: TranslateBody }>, reply: FastifyReply) => {
    const { description, limit, minScore } = request.body;
    
    const result = catalogueService.translate(description, { limit, minScore });
    
    logger.info({ 
      description, 
      keywords: result.context.keywords,
      expandedKeywords: result.context.expandedKeywords,
      quantity: result.context.quantity,
      suggestedDivisions: result.context.suggestedDivisions,
      results: result.items.length,
      took: result.took,
    }, 'Catalogue translation');
    
    return reply.send({
      success: true,
      data: {
        items: result.items,
        keywords: result.context.keywords,
        expandedKeywords: result.context.expandedKeywords,
        quantity: result.context.quantity,
        unit: result.context.unit,
        suggestedDivisions: result.context.suggestedDivisions,
        took: result.took,
      },
    });
  });

  /**
   * Get catalogue stats
   * GET /catalogue/stats
   */
  fastify.get('/stats', {
    schema: {
      tags: ['Catalogue'],
      summary: 'Get catalogue statistics',
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const stats = catalogueService.getStats();
    
    return reply.send({
      success: true,
      data: stats,
    });
  });
}
