import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../lib/errors.js';
import crypto from 'crypto';

// Generate a random alphanumeric code
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const randomBytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return `JOCHERO-${code}`;
}

export interface CreateInviteParams {
  expiresAt?: Date;
  maxUses?: number;
  metadata?: Record<string, unknown>;
  createdById?: string;
}

export async function createInviteCode(params: CreateInviteParams) {
  const { expiresAt, maxUses = 1, metadata = {}, createdById } = params;

  // Generate unique code, retry if collision
  let code: string;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    code = generateCode();
    const existing = await prisma.inviteCode.findUnique({ where: { code } });
    if (!existing) break;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique invite code');
  }

  const inviteCode = await prisma.inviteCode.create({
    data: {
      code: code!,
      expiresAt,
      maxUses,
      metadata,
      createdById,
    },
  });

  return inviteCode;
}

export async function validateInviteCode(code: string) {
  const inviteCode = await prisma.inviteCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!inviteCode) {
    return { valid: false, message: 'Invalid invite code' };
  }

  // Check expiration
  if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
    return { valid: false, message: 'Invite code has expired' };
  }

  // Check uses
  if (inviteCode.currentUses >= inviteCode.maxUses) {
    return { valid: false, message: 'Invite code has reached maximum uses' };
  }

  return { valid: true, message: 'Invite code is valid' };
}

export async function redeemInviteCode(code: string, userId: string) {
  const normalizedCode = code.toUpperCase();
  
  // Validate first
  const validation = await validateInviteCode(normalizedCode);
  if (!validation.valid) {
    throw new BadRequestError(validation.message);
  }

  const inviteCode = await prisma.inviteCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!inviteCode) {
    throw new NotFoundError('Invite code not found');
  }

  // Check if user already redeemed this code
  const existingRedemption = await prisma.inviteRedemption.findFirst({
    where: {
      inviteCodeId: inviteCode.id,
      userId,
    },
  });

  if (existingRedemption) {
    throw new BadRequestError('You have already redeemed this invite code');
  }

  // Check if user is already a beta user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.isBetaUser) {
    throw new BadRequestError('You are already a beta user');
  }

  // Transaction: increment uses, create redemption, update user
  const result = await prisma.$transaction(async (tx) => {
    // Increment current uses
    await tx.inviteCode.update({
      where: { id: inviteCode.id },
      data: { currentUses: { increment: 1 } },
    });

    // Create redemption record
    await tx.inviteRedemption.create({
      data: {
        inviteCodeId: inviteCode.id,
        userId,
      },
    });

    // Update user as beta user
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        isBetaUser: true,
        inviteCodeUsed: normalizedCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isBetaUser: true,
        inviteCodeUsed: true,
      },
    });

    return updatedUser;
  });

  return {
    success: true,
    message: 'Welcome to JOCHero Beta!',
    user: result,
  };
}

export async function listInviteCodes(options: {
  page?: number;
  limit?: number;
} = {}) {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const [inviteCodes, total] = await Promise.all([
    prisma.inviteCode.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true },
        },
        redemptions: {
          select: {
            id: true,
            redeemedAt: true,
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    }),
    prisma.inviteCode.count(),
  ]);

  return { inviteCodes, total, page, limit };
}

export async function getInviteCodeById(id: string) {
  const inviteCode = await prisma.inviteCode.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, email: true, name: true },
      },
      redemptions: {
        select: {
          id: true,
          redeemedAt: true,
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
    },
  });

  if (!inviteCode) {
    throw new NotFoundError('Invite code not found');
  }

  return inviteCode;
}

export async function deleteInviteCode(id: string) {
  const existing = await prisma.inviteCode.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('Invite code not found');
  }

  await prisma.inviteCode.delete({ where: { id } });
  return { success: true };
}

// Generate initial batch of codes
export async function generateBatchCodes(
  count: number,
  createdById?: string,
  options: { maxUses?: number; expiresAt?: Date } = {}
) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = await createInviteCode({
      createdById,
      maxUses: options.maxUses ?? 1,
      expiresAt: options.expiresAt,
    });
    codes.push(code);
  }
  return codes;
}
