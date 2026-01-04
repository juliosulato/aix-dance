import { z } from 'zod';

export const createBankSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }),
  code: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  description: z.string().optional(),
  maintenanceFeeAmount: z.string().transform((val) => val === '' ? null : Number(val.replace(/\,/g, '.'))).optional().default(0),
  maintenanceFeeDue: z.string().transform((val) => val === '' ? null : Number(val.replace(/\,/g, '.'))).nullable().optional(),
});

export const updateBankSchema = createBankSchema.partial().extend({ id: z.string().min(1, { message: 'ID da conta bancária é obrigatório' }) });

export type CreateBankInput = z.infer<typeof createBankSchema>;
export type UpdateBankInput = z.infer<typeof updateBankSchema>;