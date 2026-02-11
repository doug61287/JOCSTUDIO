import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  createMeasurementSchema,
  updateMeasurementSchema,
  batchCreateMeasurementsSchema,
  listMeasurementsSchema,
} from './measurements.schema.js';
import * as measurementsService from './measurements.service.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function measurementsRoutes(fastify: FastifyInstance): Promise<void> {
  // All routes require authentication
  fastify.addHook('preHandler', requireAuth);

  // GET /projects/:projectId/measurements
  fastify.get('/', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parsed = listMeasurementsSchema.safeParse(request.query);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const result = await measurementsService.listMeasurements(
      projectId,
      request.user!.id,
      parsed.data
    );

    return sendSuccess(reply, result.measurements, 200, result.pagination);
  });

  // POST /projects/:projectId/measurements
  fastify.post('/', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parsed = createMeasurementSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const measurement = await measurementsService.createMeasurement(
      projectId,
      request.user!.id,
      parsed.data
    );

    return sendCreated(reply, measurement);
  });

  // POST /projects/:projectId/measurements/batch
  fastify.post('/batch', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parsed = batchCreateMeasurementsSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const measurements = await measurementsService.batchCreateMeasurements(
      projectId,
      request.user!.id,
      parsed.data
    );

    return sendCreated(reply, measurements);
  });

  // GET /projects/:projectId/measurements/:id
  fastify.get('/:id', async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };

    const measurement = await measurementsService.getMeasurement(
      projectId,
      id,
      request.user!.id
    );

    return sendSuccess(reply, measurement);
  });

  // PATCH /projects/:projectId/measurements/:id
  fastify.patch('/:id', async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };
    const parsed = updateMeasurementSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const measurement = await measurementsService.updateMeasurement(
      projectId,
      id,
      request.user!.id,
      parsed.data
    );

    return sendSuccess(reply, measurement);
  });

  // DELETE /projects/:projectId/measurements/:id
  fastify.delete('/:id', async (request, reply) => {
    const { projectId, id } = request.params as { projectId: string; id: string };

    await measurementsService.deleteMeasurement(
      projectId,
      id,
      request.user!.id
    );

    return sendNoContent(reply);
  });

  // DELETE /projects/:projectId/measurements/batch
  fastify.delete('/batch', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = z.object({
      ids: z.array(z.string().uuid()).min(1).max(100),
    }).safeParse(request.body);
    
    if (!body.success) {
      throw new BadRequestError(body.error.errors[0].message);
    }

    const count = await measurementsService.batchDeleteMeasurements(
      projectId,
      body.data.ids,
      request.user!.id
    );

    return sendSuccess(reply, { deleted: count });
  });
}
