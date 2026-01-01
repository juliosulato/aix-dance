import z from "zod";

export const createFormsOfReceiptSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  operator: z.string().optional(),
  fees: z.array(z.object({
    minInstallments: z.number({ message: 'Mínimo de parcelas inválido' }).min(1, { message: 'Mínimo de parcelas deve ser 1 ou mais' }),
    maxInstallments: z.number({ message: 'Máximo de parcelas inválido' }).min(1, { message: 'Máximo de parcelas deve ser 1 ou mais' }),
    feePercentage: z.number({ message: 'Taxa de porcentagem inválida' }).min(0, { message: 'Taxa de porcentagem deve ser 0 ou mais' }),
    customerInterest: z.boolean(),
    receiveInDays: z.number({ message: 'Receber em dias inválido' }).min(0, { message: 'Receber em dias deve ser 0 ou mais' }).optional(),
  })).optional(),
}).refine(data => {
    if (data.fees) {
        for (const fee of data.fees) {
            if (fee.minInstallments > fee.maxInstallments) return false;
        }
    }
    return true;
}, {
    message: 'O número mínimo de parcelas não pode ser maior que o máximo',
    path: ['fees']
});

export const updateFormsOfReceiptSchema = createFormsOfReceiptSchema.partial();

export type CreateFormsOfReceiptInput = z.infer<typeof createFormsOfReceiptSchema>;
export type UpdateFormsOfReceiptInput = z.infer<typeof updateFormsOfReceiptSchema>;