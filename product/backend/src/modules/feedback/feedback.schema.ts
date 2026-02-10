import { z } from 'zod';

export const feedbackTypes = ['BUG', 'FEATURE_REQUEST', 'GENERAL'] as const;
export type FeedbackType = (typeof feedbackTypes)[number];

export const feedbackStatuses = ['NEW', 'REVIEWED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'] as const;
export type FeedbackStatus = (typeof feedbackStatuses)[number];

// Create feedback schema
export const createFeedbackSchema = z.object({
  type: z.enum(feedbackTypes),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  pageUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  screenshot: z.string().optional(), // Base64 encoded image
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

// Update feedback schema (admin only)
export const updateFeedbackSchema = z.object({
  status: z.enum(feedbackStatuses).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;

// Query schema
export const feedbackQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(feedbackTypes).optional(),
  status: z.enum(feedbackStatuses).optional(),
  sortBy: z.enum(['createdAt', 'type', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type FeedbackQueryInput = z.infer<typeof feedbackQuerySchema>;
