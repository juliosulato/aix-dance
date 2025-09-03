import { z } from 'zod';

export const getCreateBankSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('fields.name.errors.required') }),
  code: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  description: z.string().optional(),
  maintenanceFeeAmount: z.coerce.number({
    error: t('fields.maintenanceFeeAmount.errors.invalid'),
  }).optional(),
  maintenanceFeeDue: z.coerce.date({
    error: t('fields.maintenanceFeeDue.errors.invalid'),
  }).optional().nullable(),
});

const baseSchema = getCreateBankSchema(() => '');
export type CreateBankInput = z.infer<typeof baseSchema>;

