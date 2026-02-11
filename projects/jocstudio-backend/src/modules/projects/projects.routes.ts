import { FastifyInstance } from 'fastify';
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
  projectIdSchema,
} from './projects.schema.js';
import * as projectsService from './projects.service.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../lib/response.js';
import { BadRequestError } from '../../lib/errors.js';

export async function projectsRoutes(fastify: FastifyInstance): Promise<void> {
  // All routes require authentication
  fastify.addHook('preHandler', requireAuth);

  // GET /projects - List projects
  fastify.get('/', async (request, reply) => {
    const parsed = listProjectsSchema.safeParse(request.query);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const result = await projectsService.listProjects(
      request.user!.id,
      parsed.data
    );

    return sendSuccess(reply, result.projects, 200, result.pagination);
  });

  // POST /projects - Create project
  fastify.post('/', async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);
    
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.errors[0].message);
    }

    const project = await projectsService.createProject(
      request.user!.id,
      parsed.data
    );

    return sendCreated(reply, project);
  });

  // GET /projects/:id - Get project
  fastify.get('/:id', async (request, reply) => {
    const params = projectIdSchema.safeParse(request.params);
    
    if (!params.success) {
      throw new BadRequestError(params.error.errors[0].message);
    }

    const project = await projectsService.getProject(
      params.data.id,
      request.user!.id
    );

    return sendSuccess(reply, project);
  });

  // PATCH /projects/:id - Update project
  fastify.patch('/:id', async (request, reply) => {
    const params = projectIdSchema.safeParse(request.params);
    const body = updateProjectSchema.safeParse(request.body);
    
    if (!params.success) {
      throw new BadRequestError(params.error.errors[0].message);
    }
    if (!body.success) {
      throw new BadRequestError(body.error.errors[0].message);
    }

    const project = await projectsService.updateProject(
      params.data.id,
      request.user!.id,
      body.data
    );

    return sendSuccess(reply, project);
  });

  // DELETE /projects/:id - Delete project
  fastify.delete('/:id', async (request, reply) => {
    const params = projectIdSchema.safeParse(request.params);
    
    if (!params.success) {
      throw new BadRequestError(params.error.errors[0].message);
    }

    await projectsService.deleteProject(params.data.id, request.user!.id);

    return sendNoContent(reply);
  });

  // POST /projects/:id/duplicate - Duplicate project
  fastify.post('/:id/duplicate', async (request, reply) => {
    const params = projectIdSchema.safeParse(request.params);
    
    if (!params.success) {
      throw new BadRequestError(params.error.errors[0].message);
    }

    const project = await projectsService.duplicateProject(
      params.data.id,
      request.user!.id
    );

    return sendCreated(reply, project);
  });
}
