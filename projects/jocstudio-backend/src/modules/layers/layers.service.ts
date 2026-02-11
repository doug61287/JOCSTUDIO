import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { createChildLogger } from '../../lib/logger.js';
import { checkProjectAccess } from '../projects/projects.service.js';
import type { CreateLayerInput, UpdateLayerInput, ReorderLayersInput } from './layers.schema.js';

const logger = createChildLogger('layers-service');

export async function createLayer(
  projectId: string,
  userId: string,
  input: CreateLayerInput
) {
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Get max order
  const maxOrder = await prisma.layer.aggregate({
    where: { projectId },
    _max: { order: true },
  });

  const layer = await prisma.layer.create({
    data: {
      name: input.name,
      color: input.color,
      visible: input.visible,
      locked: input.locked,
      opacity: input.opacity,
      order: input.order ?? (maxOrder._max.order ?? -1) + 1,
      projectId,
    },
  });

  logger.debug({ layerId: layer.id }, 'Layer created');

  return layer;
}

export async function listLayers(projectId: string, userId: string) {
  const hasAccess = await checkProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const layers = await prisma.layer.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { measurements: true } },
    },
  });

  return layers;
}

export async function updateLayer(
  projectId: string,
  layerId: string,
  userId: string,
  input: UpdateLayerInput
) {
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const existing = await prisma.layer.findFirst({
    where: { id: layerId, projectId },
  });

  if (!existing) {
    throw new NotFoundError('Layer not found');
  }

  const layer = await prisma.layer.update({
    where: { id: layerId },
    data: input,
    include: {
      _count: { select: { measurements: true } },
    },
  });

  logger.debug({ layerId }, 'Layer updated');

  return layer;
}

export async function deleteLayer(
  projectId: string,
  layerId: string,
  userId: string
) {
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const existing = await prisma.layer.findFirst({
    where: { id: layerId, projectId },
  });

  if (!existing) {
    throw new NotFoundError('Layer not found');
  }

  await prisma.layer.delete({
    where: { id: layerId },
  });

  logger.debug({ layerId }, 'Layer deleted');
}

export async function reorderLayers(
  projectId: string,
  userId: string,
  input: ReorderLayersInput
) {
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Update order for each layer
  await prisma.$transaction(
    input.layerIds.map((id, index) =>
      prisma.layer.updateMany({
        where: { id, projectId },
        data: { order: index },
      })
    )
  );

  logger.debug({ projectId }, 'Layers reordered');

  return listLayers(projectId, userId);
}
