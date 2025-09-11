import toTitleCase from "@/utils/toTitleCase";
import z from "zod";

export const getCreateModality = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('fields.name.errors.required') }).transform(toTitleCase),
});

export const getUpdateModality = (t: (key: string) => string) => getCreateModality(t).partial();


export type CreateModalityInput = z.infer<ReturnType<typeof getCreateModality>>;
export type UpdateModalityInput = z.infer<ReturnType<typeof getUpdateModality>>;