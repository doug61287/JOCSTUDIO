import { z } from 'zod';

export const projectSettingsSchema = z.object({
  scale: z.object({
    value: z.number().positive(),
    unit: z.enum(['inch', 'foot', 'meter', 'centimeter']),
  }).optional(),
  units: z.enum(['imperial', 'metric']).default('imperial'),
  calibration: z.object({
    pdfX1: z.number(),
    pdfY1: z.number(),
    pdfX2: z.number(),
    pdfY2: z.number(),
    realDistance: z.number(),
    unit: z.string(),
  }).optional(),
}).default({});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional(),
  organizationId: z.string().uuid().optional(),
  settings: projectSettingsSchema.optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ARCHIVED']).optional(),
  settings: projectSettingsSchema.optional(),
  pdfUrl: z.string().url().optional(),
  pdfFilename: z.string().optional(),
  pdfPageCount: z.number().int().positive().optional(),
  pdfFileSize: z.number().int().positive().optional(),
});

export const listProjectsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ARCHIVED']).optional(),
  organizationId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const projectIdSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
