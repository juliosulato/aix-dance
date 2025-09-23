import { z } from 'zod';

const addressSchema = z.object({
  postalCode: z.string().min(1, { message: "CEP é obrigatório" }),
  street: z.string().min(1, { message: "Rua é obrigatória" }),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(1, { message: "Estado é obrigatório" }),
});

const createSupplierSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório" }),
  corporateReason: z.string().optional(),
  documentType: z.string().optional(),
  document: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido" }).optional(),
  phoneNumber: z.string().optional(),
  cellPhoneNumber: z.string().optional(),
  address: addressSchema.optional(),
});

const updateSupplierSchema = createSupplierSchema.partial();

export { createSupplierSchema, updateSupplierSchema };
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;