import { z } from 'zod';
import { addressSchema } from './address.schema';


const createSupplierSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  corporateReason: z.string().optional(),
  documentType: z.string().optional(),
  document: z.string().optional(),
  email: z.email({ message: "E-mail inválido" }).optional(),
  phoneNumber: z.string().optional(),
  cellPhoneNumber: z.string().optional(),
  address: addressSchema.optional(),
});

const updateSupplierSchema = createSupplierSchema.partial();

export { createSupplierSchema, updateSupplierSchema };
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;