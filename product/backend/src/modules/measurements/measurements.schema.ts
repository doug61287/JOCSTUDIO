import { z } from 'zod';

const geometrySchema = z.object({
  points: z.array(z.object({
    x: z.number(),
    y: z.number(),
  })),
  pageIndex: z.number().int().min(0).default(0),
});

export const createMeasurementSchema = z.object({
  type: z.enum(['COUNT', 'LENGTH', 'AREA', 'VOLUME']),
  label: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#EF4444'),
  geometry: geometrySchema,
  quantity: z.number().positive(),
  unit: z.string().default('EA'),
  layerId: z.string().uuid().optional(),
  spaceId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
});

export const updateMeasurementSchema = z.object({
  label: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  geometry: geometrySchema.optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  layerId: z.string().uuid().nullable().optional(),
  spaceId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const batchCreateMeasurementsSchema = z.object({
  measurements: z.array(createMeasurementSchema).min(1).max(100),
});

export const listMeasurementsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  type: z.enum(['COUNT', 'LENGTH', 'AREA', 'VOLUME']).optional(),
  layerId: z.string().uuid().optional(),
  spaceId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
});

export type CreateMeasurementInput = z.infer<typeof createMeasurementSchema>;
export type UpdateMeasurementInput = z.infer<typeof updateMeasurementSchema>;
export type BatchCreateMeasurementsInput = z.infer<typeof batchCreateMeasurementsSchema>;
export type ListMeasurementsInput = z.infer<typeof listMeasurementsSchema>;
