import z from "zod";

export const createModalitySchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
});

export const updateModalitySchema = createModalitySchema.partial();

export type CreateModalityInput = z.infer<typeof createModalitySchema>;
export type UpdateModalityInput = z.infer<typeof updateModalitySchema>;