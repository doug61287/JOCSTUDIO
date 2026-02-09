import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../../lib/errors.js';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    };
  }
}

// Middleware to require authentication
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // @fastify/jwt adds jwtVerify to request
    await request.jwtVerify();
    
    // After verification, request.user is populated
    if (!request.user) {
      throw new UnauthorizedError('Invalid token');
    }
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// Middleware to optionally get user if authenticated
export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    // Ignore - user is optional
  }
}

// Middleware to require specific roles
export function requireRole(...allowedRoles: Array<'USER' | 'ADMIN' | 'SUPER_ADMIN'>) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await requireAuth(request, reply);
    
    if (!request.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

// Convenience middleware for admin routes
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  return requireRole('ADMIN', 'SUPER_ADMIN')(request, reply);
}

// Convenience middleware for super admin routes
export async function requireSuperAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  return requireRole('SUPER_ADMIN')(request, reply);
}
