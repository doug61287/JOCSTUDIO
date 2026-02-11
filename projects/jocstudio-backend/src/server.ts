import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env, isDev } from './config/env.js';
import { prisma, disconnectDatabase, checkDatabaseHealth } from './config/database.js';
import { logger } from './lib/logger.js';
import { AppError, sendError } from './lib/errors.js';

// Import routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { projectsRoutes } from './modules/projects/projects.routes.js';
import { filesRoutes } from './modules/files/files.routes.js';
import { measurementsRoutes } from './modules/measurements/measurements.routes.js';
import { layersRoutes } from './modules/layers/layers.routes.js';

// Create Fastify instance
const fastify = Fastify({
  logger: isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : true,
});

// Register plugins
async function registerPlugins() {
  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Disable for API
  });

  // CORS
  await fastify.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: () => ({
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    }),
  });

  // JWT
  await fastify.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Multipart (file uploads)
  await fastify.register(multipart, {
    limits: {
      fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    },
  });

  // Swagger documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'JOCstudio API',
        description: 'Construction Takeoff & JOC Estimating Platform API',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${env.PORT}`, description: 'Development' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async () => {
    const dbHealthy = await checkDatabaseHealth();
    return {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbHealthy ? 'connected' : 'disconnected',
    };
  });

  // API routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(usersRoutes, { prefix: '/users' });
  await fastify.register(projectsRoutes, { prefix: '/projects' });
  await fastify.register(filesRoutes, { prefix: '/files' });

  // Nested routes under projects
  fastify.register(async (projectScope) => {
    await projectScope.register(measurementsRoutes, { prefix: '/:projectId/measurements' });
    await projectScope.register(layersRoutes, { prefix: '/:projectId/layers' });
  }, { prefix: '/projects' });
}

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error({ err: error, url: request.url }, 'Request error');

  if (error instanceof AppError) {
    return sendError(reply, error);
  }

  // Fastify validation errors
  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.validation,
      },
    });
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    });
  }

  // Default error
  return reply.status(500).send({
    success: false,
    error: {
      message: isDev ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  return reply.status(404).send({
    success: false,
    error: {
      message: `Route ${request.method} ${request.url} not found`,
      code: 'NOT_FOUND',
    },
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal');
  
  try {
    await fastify.close();
    await disconnectDatabase();
    logger.info('Server shut down gracefully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    // Test database connection
    const dbHealthy = await checkDatabaseHealth();
    if (!dbHealthy) {
      throw new Error('Database connection failed');
    }
    logger.info('Database connected');

    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
    logger.info(`📚 API docs at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
