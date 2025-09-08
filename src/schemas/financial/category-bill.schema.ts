import toTitleCase from "@/utils/toTitleCase";
import { BillCategoryType, BillNature } from "@prisma/client";
import z from "zod";

export const getCreateCategoryBillSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('fields.name.errors.required') }).transform(toTitleCase),
  nature: z.enum([BillNature.REVENUE, BillNature.EXPENSE], {
    error: t('fields.nature.errors.required'),
  }),
  type: z.enum([BillCategoryType.FIXED, BillCategoryType.VARIABLE], {
    error: t('fields.type.errors.required'),
  }),
  groupId: z.cuid2({ message: t('fields.group.errors.invalid') }).optional().nullable(),
  parentId: z.cuid2({ message: t('fields.parent.errors.invalid') }).optional().nullable(),
});

export const getUpdateCategorySchema = (t: (key: string) => string) => getCreateCategoryBillSchema(t).partial();


export type CreateCategoryBillInput = z.infer<ReturnType<typeof getCreateCategoryBillSchema>>;
export type UpdateCategoryBillInput = z.infer<ReturnType<typeof getUpdateCategorySchema>>;