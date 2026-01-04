import { z } from 'zod';

export const createCategoryGroupSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
});

export const updateCategoryGroupSchema = createCategoryGroupSchema.partial().extend({ id: z.cuid2() });

export type CreateCategoryGroupInput = z.infer<typeof createCategoryGroupSchema>;
export type UpdateCategoryGroupInput = z.infer<typeof updateCategoryGroupSchema>;