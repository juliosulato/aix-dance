import toTitleCase from '@/utils/toTitleCase';
import { z } from 'zod';
import { addressSchema } from './address.schema';

export const getCreateSupplierSchema = (t: (key: string) => string) => z.object({
  name: z.string({ error: t("general.errors.string")}).min(1, { message: t('supplier.modals.fields.name.errors.required') }).transform(toTitleCase),
  corporateReason: z.string({ error: t("general.errors.string")}).optional(),
  documentType: z.string({ error: t("general.errors.string")}).optional(),
  document: z.string({ error: t("general.errors.string")}).optional(),
  email: z.string({ error: t("general.errors.string")}).optional(),
  phoneNumber: z.string({ error: t("general.errors.string")}).optional(),
  cellPhoneNumber: z.string({ error: t("general.errors.string")}).optional(),
  address: addressSchema.optional(),
});

export const getUpdateSupplierSchema = (t: (key: string) => string) =>
  getCreateSupplierSchema(t).partial();

export type CreateSupplierInput = z.infer<ReturnType<typeof getCreateSupplierSchema>>;
export type UpdateSupplierInput = z.infer<ReturnType<typeof getUpdateSupplierSchema>>;

