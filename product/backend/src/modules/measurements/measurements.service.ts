import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../lib/errors.js';
import { getSkipTake, getPaginationMeta } from '../../lib/pagination.js';
import { createChildLogger } from '../../lib/logger.js';
import { checkProjectAccess } from '../projects/projects.service.js';
import type {
  CreateMeasurementInput,
  UpdateMeasurementInput,
  BatchCreateMeasurementsInput,
  ListMeasurementsInput,
} from './measurements.schema.js';

const logger = createChildLogger('measurements-service');

const measurementInclude = {
  layer: { select: { id: true, name: true, color: true } },
  space: { select: { id: true, name: true, type: true } },
  createdBy: { select: { id: true, name: true } },
  jocLineItems: true,
  _count: { select: { children: true } },
};

export async function createMeasurement(
  projectId: string,
  userId: string,
  input: CreateMeasurementInput
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const measurement = await prisma.measurement.create({
    data: {
      type: input.type,
      label: input.label,
      color: input.color,
      geometry: input.geometry as Prisma.JsonObject,
      quantity: input.quantity,
      unit: input.unit,
      projectId,
      layerId: input.layerId,
      spaceId: input.spaceId,
      parentId: input.parentId,
      createdById: userId,
    },
    include: measurementInclude,
  });

  logger.debug({ measurementId: measurement.id }, 'Measurement created');

  return measurement;
}

export async function batchCreateMeasurements(
  projectId: string,
  userId: string,
  input: BatchCreateMeasurementsInput
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const measurements = await prisma.$transaction(
    input.measurements.map((m) =>
      prisma.measurement.create({
        data: {
          type: m.type,
          label: m.label,
          color: m.color,
          geometry: m.geometry as Prisma.JsonObject,
          quantity: m.quantity,
          unit: m.unit,
          projectId,
          layerId: m.layerId,
          spaceId: m.spaceId,
          parentId: m.parentId,
          createdById: userId,
        },
        include: measurementInclude,
      })
    )
  );

  logger.info(
    { projectId, count: measurements.length },
    'Batch measurements created'
  );

  return measurements;
}

export async function listMeasurements(
  projectId: string,
  userId: string,
  input: ListMeasurementsInput
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const { page, limit, type, layerId, spaceId, parentId } = input;
  const { skip, take } = getSkipTake(page, limit);

  const where: Prisma.MeasurementWhereInput = {
    projectId,
    ...(type ? { type } : {}),
    ...(layerId ? { layerId } : {}),
    ...(spaceId ? { spaceId } : {}),
    ...(parentId !== undefined ? { parentId } : {}),
  };

  const [measurements, total] = await Promise.all([
    prisma.measurement.findMany({
      where,
      include: measurementInclude,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.measurement.count({ where }),
  ]);

  return {
    measurements,
    pagination: getPaginationMeta(page, limit, total),
  };
}

export async function getMeasurement(
  projectId: string,
  measurementId: string,
  userId: string
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId);
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const measurement = await prisma.measurement.findFirst({
    where: { id: measurementId, projectId },
    include: {
      ...measurementInclude,
      children: { include: measurementInclude },
      parent: { select: { id: true, label: true } },
    },
  });

  if (!measurement) {
    throw new NotFoundError('Measurement not found');
  }

  return measurement;
}

export async function updateMeasurement(
  projectId: string,
  measurementId: string,
  userId: string,
  input: UpdateMeasurementInput
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Verify measurement exists in project
  const existing = await prisma.measurement.findFirst({
    where: { id: measurementId, projectId },
  });

  if (!existing) {
    throw new NotFoundError('Measurement not found');
  }

  const measurement = await prisma.measurement.update({
    where: { id: measurementId },
    data: {
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.color ? { color: input.color } : {}),
      ...(input.geometry ? { geometry: input.geometry as Prisma.JsonObject } : {}),
      ...(input.quantity ? { quantity: input.quantity } : {}),
      ...(input.unit ? { unit: input.unit } : {}),
      ...(input.layerId !== undefined ? { layerId: input.layerId } : {}),
      ...(input.spaceId !== undefined ? { spaceId: input.spaceId } : {}),
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
    },
    include: measurementInclude,
  });

  logger.debug({ measurementId }, 'Measurement updated');

  return measurement;
}

export async function deleteMeasurement(
  projectId: string,
  measurementId: string,
  userId: string
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  // Verify measurement exists in project
  const existing = await prisma.measurement.findFirst({
    where: { id: measurementId, projectId },
  });

  if (!existing) {
    throw new NotFoundError('Measurement not found');
  }

  await prisma.measurement.delete({
    where: { id: measurementId },
  });

  logger.debug({ measurementId }, 'Measurement deleted');
}

export async function batchDeleteMeasurements(
  projectId: string,
  measurementIds: string[],
  userId: string
) {
  // Check project access
  const hasAccess = await checkProjectAccess(projectId, userId, 'edit');
  if (!hasAccess) {
    throw new ForbiddenError('You do not have access to this project');
  }

  const result = await prisma.measurement.deleteMany({
    where: {
      id: { in: measurementIds },
      projectId,
    },
  });

  logger.info(
    { projectId, count: result.count },
    'Batch measurements deleted'
  );

  return result.count;
}
