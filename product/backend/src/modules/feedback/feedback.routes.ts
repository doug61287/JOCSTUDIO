import { FastifyInstance } from 'fastify';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  feedbackQuerySchema,
} from './feedback.schema.js';
import * as feedbackService from './feedback.service.js';
import { requireAuth, requireAdmin } from '../auth/auth.middleware.js';
import { sendSuccess, sendCreated } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function feedbackRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /feedback - Submit new feedback (public, but captures user if authenticated)
  fastify.post('/', async (request, reply) => {
    const parsed = createFeedbackSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    // Try to get user from optional auth
    let userId: string | undefined;
    try {
      await request.jwtVerify();
      userId = request.user?.id;
    } catch {
      // Not authenticated, that's fine
    }

    const userAgent = request.headers['user-agent'];
    const feedback = await feedbackService.createFeedback(parsed.data, userId, userAgent);

    return sendCreated(reply, { feedback });
  });

  // GET /feedback - List all feedback (admin only)
  fastify.get(
    '/',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const parsed = feedbackQuerySchema.safeParse(request.query);
      
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
      }

      const result = await feedbackService.listFeedback(parsed.data);
      return sendSuccess(reply, result);
    }
  );

  // GET /feedback/stats - Get feedback statistics (admin only)
  fastify.get(
    '/stats',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const stats = await feedbackService.getFeedbackStats();
      return sendSuccess(reply, { stats });
    }
  );

  // GET /feedback/:id - Get single feedback (admin only)
  fastify.get(
    '/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const feedback = await feedbackService.getFeedback(id);
      return sendSuccess(reply, { feedback });
    }
  );

  // PATCH /feedback/:id - Update feedback status/notes (admin only)
  fastify.patch(
    '/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const parsed = updateFeedbackSchema.safeParse(request.body);
      
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
      }

      const feedback = await feedbackService.updateFeedback(id, parsed.data);
      return sendSuccess(reply, { feedback });
    }
  );

  // DELETE /feedback/:id - Delete feedback (admin only)
  fastify.delete(
    '/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await feedbackService.deleteFeedback(id);
      return sendSuccess(reply, { message: 'Feedback deleted successfully' });
    }
  );
}
