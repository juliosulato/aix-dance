import toTitleCase from '@/utils/toTitleCase';
import { z } from 'zod';

export const getCreateBankSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t('modals.fields.name.errors.required') }).transform(toTitleCase),
  code: z.string().optional(),
  agency: z.string().optional(),
  account: z.string().optional(),
  description: z.string().optional(),
  maintenanceFeeAmount: z.coerce.number({
    error: t('modals.fields.maintenanceFeeAmount.errors.invalid'),
  }).optional(),
maintenanceFeeDue: z.number()
  .int()
  .nonnegative({ error: t("modals.fields.maintenanceFeeDue.errors.nonnegative") })
  .min(1, t("modals.fields.maintenanceFeeDue.errors.minAndMax"))
  .max(31, t("modals.fields.maintenanceFeeDue.errors.nonnegative"))
  .optional()});

export const getUpdateBankSchema = (t: (key: string) => string) =>
  getCreateBankSchema(t).partial();

export type CreateBankInput = z.infer<ReturnType<typeof getCreateBankSchema>>;
export type UpdateBankInput = z.infer<ReturnType<typeof getUpdateBankSchema>>;

