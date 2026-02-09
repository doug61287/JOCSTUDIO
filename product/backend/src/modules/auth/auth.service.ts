import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../lib/errors.js';
import { createChildLogger } from '../../lib/logger.js';
import type {
  RegisterInput,
  LoginInput,
  UserResponse,
  ChangePasswordInput,
} from './auth.schema.js';

const logger = createChildLogger('auth-service');

const SALT_ROUNDS = 12;

// Convert user to safe response
function toUserResponse(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    emailVerified: user.emailVerified,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(input: RegisterInput): Promise<{
  user: UserResponse;
}> {
  logger.debug({ email: input.email }, 'Registering new user');

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
      emailVerifyToken: uuid(),
    },
  });

  logger.info({ userId: user.id }, 'User registered successfully');

  return {
    user: toUserResponse(user),
  };
}

export async function login(input: LoginInput): Promise<{
  user: UserResponse;
  accessToken?: string;
  refreshToken?: string;
}> {
  logger.debug({ email: input.email }, 'User login attempt');

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info({ userId: user.id }, 'User logged in successfully');

  return {
    user: toUserResponse(user),
  };
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = uuid();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  user: UserResponse;
  newRefreshToken: string;
}> {
  // Find and validate refresh token
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (tokenRecord.revokedAt) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has expired');
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  });

  // Create new refresh token
  const newRefreshToken = await createRefreshToken(tokenRecord.userId);

  return {
    user: toUserResponse(tokenRecord.user),
    newRefreshToken,
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getUserById(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return toUserResponse(user);
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash
  );

  if (!isValidPassword) {
    throw new BadRequestError('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Revoke all refresh tokens
  await revokeAllUserTokens(userId);

  logger.info({ userId }, 'Password changed successfully');
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });

  logger.info({ userId }, 'User deleted');
}
