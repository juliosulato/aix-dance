import toTitleCase from '@/utils/toTitleCase';
import { z } from 'zod';

export const getCreateCategoryGroupSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('fields.name.errors.required') }).transform(toTitleCase),
});

export const getUpdateCategoryGroupSchema = (t: (key: string) => string) => getCreateCategoryGroupSchema(t).partial();

export type CreateCategoryGroupInput = z.infer<ReturnType<typeof getCreateCategoryGroupSchema>>;
export type UpdateCategoryGroupInput = z.infer<ReturnType<typeof getUpdateCategoryGroupSchema>>;