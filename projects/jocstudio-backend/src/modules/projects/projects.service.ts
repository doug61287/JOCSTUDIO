import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { getSkipTake, getPaginationMeta } from '../../lib/pagination.js';
import { createChildLogger } from '../../lib/logger.js';
import type { CreateProjectInput, UpdateProjectInput, ListProjectsInput } from './projects.schema.js';

const logger = createChildLogger('projects-service');

// Include relations for full project data
const projectInclude = {
  owner: {
    select: { id: true, name: true, email: true },
  },
  organization: {
    select: { id: true, name: true, slug: true },
  },
  layers: {
    orderBy: { order: 'asc' as const },
  },
  _count: {
    select: {
      measurements: true,
      spaces: true,
    },
  },
};

export async function createProject(userId: string, input: CreateProjectInput) {
  logger.debug({ userId, name: input.name }, 'Creating project');

  // If organizationId provided, verify user is a member
  if (input.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: input.organizationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenError('You are not a member of this organization');
    }
  }

  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: userId,
      organizationId: input.organizationId,
      settings: input.settings ?? {},
      // Create default layer
      layers: {
        create: {
          name: 'Default',
          color: '#3B82F6',
          order: 0,
        },
      },
    },
    include: projectInclude,
  });

  logger.info({ projectId: project.id }, 'Project created');

  return project;
}

export async function listProjects(userId: string, input: ListProjectsInput) {
  const { page, limit, status, organizationId, search, sortBy, sortOrder } = input;
  const { skip, take } = getSkipTake(page, limit);

  // Build where clause
  const where: Prisma.ProjectWhereInput = {
    OR: [
      { ownerId: userId },
      {
        organization: {
          members: {
            some: { userId },
          },
        },
      },
    ],
    archivedAt: status === 'ARCHIVED' ? { not: null } : null,
    ...(status && status !== 'ARCHIVED' ? { status } : {}),
    ...(organizationId ? { organizationId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: projectInclude,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: getPaginationMeta(page, limit, total),
  };
}

export async function getProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      ...projectInclude,
      measurements: {
        include: {
          layer: true,
          space: true,
          jocLineItems: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      spaces: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Check access
  const hasAccess = await checkProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput
) {
  // Check access
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to edit this project');
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...input,
      ...(input.status === 'ARCHIVED' ? { archivedAt: new Date() } : {}),
    },
    include: projectInclude,
  });

  logger.info({ projectId }, 'Project updated');

  return project;
}

export async function deleteProject(projectId: string, userId: string) {
  // Check if owner
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  if (project.ownerId !== userId) {
    throw new ForbiddenError('Only the project owner can delete it');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  logger.info({ projectId }, 'Project deleted');
}

export async function duplicateProject(projectId: string, userId: string) {
  const source = await getProject(projectId, userId);

  // Create new project with copied data
  const newProject = await prisma.project.create({
    data: {
      name: `${source.name} (Copy)`,
      description: source.description,
      ownerId: userId,
      organizationId: source.organizationId,
      settings: source.settings as Prisma.JsonObject,
      pdfUrl: source.pdfUrl,
      pdfFilename: source.pdfFilename,
      pdfPageCount: source.pdfPageCount,
      pdfFileSize: source.pdfFileSize,
      // Copy layers
      layers: {
        create: source.layers.map((layer) => ({
          name: layer.name,
          color: layer.color,
          visible: layer.visible,
          locked: layer.locked,
          order: layer.order,
          opacity: layer.opacity,
        })),
      },
    },
    include: projectInclude,
  });

  logger.info({ sourceId: projectId, newId: newProject.id }, 'Project duplicated');

  return newProject;
}

// Helper to check project access
export async function checkProjectAccess(
  projectId: string,
  userId: string,
  level: 'view' | 'edit' = 'view'
): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      organizationId: true,
    },
  });

  if (!project) {
    return false;
  }

  // Owner has full access
  if (project.ownerId === userId) {
    return true;
  }

  // Check organization membership
  if (project.organizationId) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: project.organizationId,
          userId,
        },
      },
    });

    if (membership) {
      if (level === 'view') {
        return true;
      }
      // Edit requires at least MEMBER role
      return ['OWNER', 'ADMIN', 'MEMBER'].includes(membership.role);
    }
  }

  return false;
}
