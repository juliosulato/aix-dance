import toTitleCase from "@/utils/toTitleCase";
import z from "zod";

export const getCreateFormsOfReceiptSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('fields.name.errors.required') }).transform(toTitleCase),
  operator: z.string().optional(),
  fees: z.array(z.object({
    minInstallments: z.coerce.number({ error: t('fields.fees.errors.minInstallments_invalid') }).min(1, { message: t('fields.fees.errors.minInstallments_min') }),
    maxInstallments: z.coerce.number({ error: t('fields.fees.errors.maxInstallments_invalid') }).min(1, { message: t('fields.fees.errors.maxInstallments_min') }),
    feePercentage: z.coerce.number({ error: t('fields.fees.errors.feePercentage_invalid') }).min(0, { message: t('fields.fees.errors.feePercentage_min') }),
    customerInterest: z.boolean().default(false),
    receiveInDays: z.coerce.number({ error: t('fields.fees.errors.receiveInDays_invalid') }).min(0, { message: t('fields.fees.errors.receiveInDays_min') }).optional(),
  })).optional(),
}).refine(data => {
    if (data.fees) {
        for (const fee of data.fees) {
            if (fee.minInstallments > fee.maxInstallments) return false;
        }
    }
    return true;
}, {
    message: t('fields.fees.errors.installments_order'),
    path: ['fees']
});

export const getUpdateFormsOfReceiptSchema = (t: (key: string) => string) =>
  getCreateFormsOfReceiptSchema(t).partial();


// Tipos inferidos
export type CreateFormsOfReceiptInput = z.infer<ReturnType<typeof getCreateFormsOfReceiptSchema>>;
export type UpdateFormsOfReceiptInput = z.infer<ReturnType<typeof getUpdateFormsOfReceiptSchema>>;
