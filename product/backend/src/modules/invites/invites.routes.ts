import { FastifyInstance } from 'fastify';
import {
  generateInviteSchema,
  validateInviteSchema,
  redeemInviteSchema,
} from './invites.schema.js';
import * as invitesService from './invites.service.js';
import { requireAuth, requireAdmin } from '../auth/auth.middleware.js';
import { sendSuccess, sendCreated, sendPaginated } from '../../lib/response.js';
import { BadRequestError, ForbiddenError } from '../../lib/errors.js';

export async function invitesRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /invites/generate - Admin only
  fastify.post(
    '/generate',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const parsed = generateInviteSchema.safeParse(request.body);

      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
      }

      const inviteCode = await invitesService.createInviteCode({
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
        maxUses: parsed.data.maxUses,
        metadata: parsed.data.metadata,
        createdById: request.user!.id,
      });

      return sendCreated(reply, {
        code: inviteCode.code,
        expiresAt: inviteCode.expiresAt,
        maxUses: inviteCode.maxUses,
      });
    }
  );

  // POST /invites/validate - Public
  fastify.post('/validate', async (request, reply) => {
    const parsed = validateInviteSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const result = await invitesService.validateInviteCode(parsed.data.code);
    return sendSuccess(reply, result);
  });

  // POST /invites/redeem - Requires auth
  fastify.post(
    '/redeem',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const parsed = redeemInviteSchema.safeParse(request.body);

      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
      }

      const result = await invitesService.redeemInviteCode(
        parsed.data.code,
        request.user!.id
      );

      return sendSuccess(reply, result);
    }
  );

  // GET /invites - Admin only, list all codes with stats
  fastify.get(
    '/',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const query = request.query as { page?: string; limit?: string };
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '50', 10);

      const { inviteCodes, total } = await invitesService.listInviteCodes({
        page,
        limit,
      });

      return sendPaginated(reply, inviteCodes, { page, limit, total });
    }
  );

  // GET /invites/:id - Admin only
  fastify.get(
    '/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const inviteCode = await invitesService.getInviteCodeById(id);
      return sendSuccess(reply, inviteCode);
    }
  );

  // DELETE /invites/:id - Admin only
  fastify.delete(
    '/:id',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      await invitesService.deleteInviteCode(id);
      return sendSuccess(reply, { message: 'Invite code deleted' });
    }
  );

  // POST /invites/generate-batch - Admin only, generate multiple codes
  fastify.post(
    '/generate-batch',
    { preHandler: [requireAuth, requireAdmin] },
    async (request, reply) => {
      const body = request.body as { count?: number; maxUses?: number; expiresAt?: string };
      const count = Math.min(body.count || 10, 100); // Max 100 at a time

      const codes = await invitesService.generateBatchCodes(
        count,
        request.user!.id,
        {
          maxUses: body.maxUses,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        }
      );

      return sendCreated(reply, {
        generated: codes.length,
        codes: codes.map((c) => ({
          code: c.code,
          expiresAt: c.expiresAt,
          maxUses: c.maxUses,
        })),
      });
    }
  );
}
