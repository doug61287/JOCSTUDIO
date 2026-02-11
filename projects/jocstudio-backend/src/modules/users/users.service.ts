import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import { NotFoundError } from '../../lib/errors.js';
import { createChildLogger } from '../../lib/logger.js';
import type { UpdateUserInput } from './users.schema.js';

const logger = createChildLogger('users-service');

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  emailVerified: true,
  avatarUrl: true,
  preferences: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
};

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      ...(input.preferences ? { preferences: input.preferences as Prisma.JsonObject } : {}),
    },
    select: userSelect,
  });

  logger.info({ userId }, 'User updated');

  return user;
}

export async function getUserStats(userId: string) {
  const [projectCount, organizationCount] = await Promise.all([
    prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          { organization: { members: { some: { userId } } } },
        ],
      },
    }),
    prisma.organizationMember.count({
      where: { userId },
    }),
  ]);

  return {
    projectCount,
    organizationCount,
  };
}
