import { FastifyInstance } from 'fastify';
import {
  createLayerSchema,
  updateLayerSchema,
  reorderLayersSchema,
} from './layers.schema.js';
import * as layersService from './layers.service.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function layersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  // GET /projects/:projectId/layers
  fastify.get('/', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const layers = await layersService.listLayers(projectId, request.user!.id);

    return sendSuccess(reply, layers);
  });

  // POST /projects/:projectId/layers
  fastify.post('/', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parsed = createLayerSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const layer = await layersService.createLayer(
      projectId,
      request.user!.id,
      parsed.data
    );

    return sendCreated(reply, layer);
  });

  // PATCH /projects/:projectId/layers/:id
  fastify.patch('/:id', async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const parsed = updateLayerSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const layer = await layersService.updateLayer(
      projectId,
      id,
      request.user!.id,
      parsed.data
    );

    return sendSuccess(reply, layer);
  });

  // DELETE /projects/:projectId/layers/:id
  fastify.delete('/:id', async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };

    await layersService.deleteLayer(projectId, id, request.user!.id);

    return sendNoContent(reply);
  });

  // POST /projects/:projectId/layers/reorder
  fastify.post('/reorder', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parsed = reorderLayersSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const layers = await layersService.reorderLayers(
      projectId,
      request.user!.id,
      parsed.data
    );

    return sendSuccess(reply, layers);
  });
}
