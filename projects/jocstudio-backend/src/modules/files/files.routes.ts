import { FastifyInstance } from 'fastify';
import * as filesService from './files.service.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function filesRoutes(fastify: FastifyInstance): Promise<void> {
  // All routes require authentication
  fastify.addHook('preHandler', requireAuth);

  // POST /files/upload - Upload file
  fastify.post('/upload', async (request, reply) => {
    const data = await request.file();

    if (!data) {
      throw new BadRequestError('No file provided');
    }

    const file = await filesService.uploadFile(
      {
        filename: data.filename,
        mimetype: data.mimetype,
        file: data.file,
        toBuffer: data.toBuffer.bind(data),
      },
      request.user!.id
    );

    return sendCreated(reply, file);
  });

  // GET /files/:id - Get file info
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const file = await filesService.getFile(id);

    return sendSuccess(reply, file);
  });

  // DELETE /files/:id - Delete file
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    await filesService.deleteFile(id, request.user!.id);

    return sendNoContent(reply);
  });
}
