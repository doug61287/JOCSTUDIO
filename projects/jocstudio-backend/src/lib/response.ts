import { FastifyReply } from 'fastify';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): FastifyReply {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
  return reply.status(statusCode).send(response);
}

export function sendCreated<T>(reply: FastifyReply, data: T): FastifyReply {
  return sendSuccess(reply, data, 201);
}

export function sendNoContent(reply: FastifyReply): FastifyReply {
  return reply.status(204).send();
}

export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): FastifyReply {
  return sendSuccess(reply, data, 200, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit),
  });
}
