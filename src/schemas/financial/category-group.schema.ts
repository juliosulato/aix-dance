import { z } from 'zod';

export const getCreateCategoryGroupSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('fields.name.errors.required') }),
});

export type CreateCategoryGroupInput = z.infer<ReturnType<typeof getCreateCategoryGroupSchema>>;

