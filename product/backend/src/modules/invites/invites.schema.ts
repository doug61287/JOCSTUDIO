import { z } from 'zod';

export const generateInviteSchema = z.object({
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().int().positive().default(1),
  metadata: z.record(z.any()).optional(),
});

export const validateInviteSchema = z.object({
  code: z.string().min(1, 'Invite code is required'),
});

export const redeemInviteSchema = z.object({
  code: z.string().min(1, 'Invite code is required'),
});

export type GenerateInviteInput = z.infer<typeof generateInviteSchema>;
export type ValidateInviteInput = z.infer<typeof validateInviteSchema>;
export type RedeemInviteInput = z.infer<typeof redeemInviteSchema>;
