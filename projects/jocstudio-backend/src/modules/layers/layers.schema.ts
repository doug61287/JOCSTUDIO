import { z } from 'zod';

export const createLayerSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  opacity: z.number().min(0).max(1).default(1),
  order: z.number().int().optional(),
});

export const updateLayerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  opacity: z.number().min(0).max(1).optional(),
  order: z.number().int().optional(),
});

export const reorderLayersSchema = z.object({
  layerIds: z.array(z.string().uuid()),
});

export type CreateLayerInput = z.infer<typeof createLayerSchema>;
export type UpdateLayerInput = z.infer<typeof updateLayerSchema>;
export type ReorderLayersInput = z.infer<typeof reorderLayersSchema>;
