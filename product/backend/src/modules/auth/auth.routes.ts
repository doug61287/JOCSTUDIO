import { FastifyInstance } from 'fastify';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.schema.js';
import * as authService from './auth.service.js';
import { requireAuth } from './auth.middleware.js';
import { sendSuccess, sendCreated } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/register
  fastify.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { user } = await authService.register(parsed.data);
    
    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { expiresIn: '7d' }
    );
    const refreshToken = await authService.createRefreshToken(user.id);

    return sendCreated(reply, {
      user,
      accessToken,
      refreshToken,
    });
  });

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { user } = await authService.login(parsed.data);
    
    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { expiresIn: '7d' }
    );
    const refreshToken = await authService.createRefreshToken(user.id);

    return sendSuccess(reply, {
      user,
      accessToken,
      refreshToken,
    });
  });

  // POST /auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const parsed = refreshTokenSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const { user, newRefreshToken } = await authService.refreshAccessToken(
      parsed.data.refreshToken
    );
    
    // Generate new access token
    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { expiresIn: '7d' }
    );

    return sendSuccess(reply, {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    });
  });

  // POST /auth/logout
  fastify.post(
    '/logout',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const body = request.body as { refreshToken?: string };
      
      if (body.refreshToken) {
        await authService.revokeRefreshToken(body.refreshToken);
      }

      return sendSuccess(reply, { message: 'Logged out successfully' });
    }
  );

  // GET /auth/me
  fastify.get(
    '/me',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = await authService.getUserById(request.user!.id);
      return sendSuccess(reply, { user });
    }
  );

  // POST /auth/change-password
  fastify.post(
    '/change-password',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const parsed = changePasswordSchema.safeParse(request.body);
      
      if (!parsed.success) {
        throw new BadRequestError(parsed.error.errors[0].message);
      }

      await authService.changePassword(request.user!.id, parsed.data);

      return sendSuccess(reply, { message: 'Password changed successfully' });
    }
  );
}
