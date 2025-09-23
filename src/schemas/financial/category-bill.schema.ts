import { BillCategoryType, BillNature } from "@prisma/client";
import z from "zod";

export const createCategoryBillSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  nature: z.enum([BillNature.REVENUE, BillNature.EXPENSE], {
    message: 'Natureza é obrigatória',
  }),
  type: z.enum([BillCategoryType.FIXED, BillCategoryType.VARIABLE], {
    message: 'Tipo é obrigatório',
  }),
  groupId: z.string().cuid2({ message: 'Grupo de categoria inválido' }).optional().nullable(),
  parentId: z.string().cuid2({ message: 'Categoria pai inválida' }).optional().nullable(),
});

export const updateCategoryBillSchema = createCategoryBillSchema.partial();

export type CreateCategoryBillInput = z.infer<typeof createCategoryBillSchema>;
export type UpdateCategoryBillInput = z.infer<typeof updateCategoryBillSchema>;