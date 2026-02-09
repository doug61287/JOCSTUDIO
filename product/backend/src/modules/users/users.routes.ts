import { FastifyInstance } from 'fastify';
import { updateUserSchema } from './users.schema.js';
import * as usersService from './users.service.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { sendSuccess } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.addHook('preHandler', requireAuth);

  // GET /users/me
  fastify.get('/me', async (request, reply) => {
    const user = await usersService.getUser(request.user!.id);
    return sendSuccess(reply, user);
  });

  // PATCH /users/me
  fastify.patch('/me', async (request, reply) => {
    const parsed = updateUserSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const user = await usersService.updateUser(request.user!.id, parsed.data);
    return sendSuccess(reply, user);
  });

  // GET /users/me/stats
  fastify.get('/me/stats', async (request, reply) => {
    const stats = await usersService.getUserStats(request.user!.id);
    return sendSuccess(reply, stats);
  });
}
