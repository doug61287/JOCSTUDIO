import { FastifyReply } from 'fastify';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code?: string) {
    super(message, 400, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found', code?: string) {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code?: string) {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public errors?: Record<string, string[]>
  ) {
    super(message, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalError extends AppError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(message, 500, code);
    this.name = 'InternalError';
  }
}

// Error response helper
export function sendError(
  reply: FastifyReply,
  error: AppError | Error
): FastifyReply {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && error.errors
          ? { errors: error.errors }
          : {}),
      },
    });
  }

  // Unknown error
  console.error('Unhandled error:', error);
  return reply.status(500).send({
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
