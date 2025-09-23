import { z } from 'zod';

export const createBankSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  code: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  description: z.string().optional(),
  maintenanceFeeAmount: z.coerce.number({
    error: 'Valor da taxa de manutenção inválido',
  }).optional(),
  maintenanceFeeDue: z.number()
    .int()
    .nonnegative({ message: 'A data de vencimento da taxa de manutenção deve ser um número não negativo' })
    .min(1, 'A data de vencimento da taxa de manutenção deve ser um número entre 1 e 31')
    .max(31, 'A data de vencimento da taxa de manutenção deve ser um número entre 1 e 31')
    .optional(),
});

export const updateBankSchema = createBankSchema.partial();

export type CreateBankInput = z.infer<typeof createBankSchema>;
export type UpdateBankInput = z.infer<typeof updateBankSchema>;