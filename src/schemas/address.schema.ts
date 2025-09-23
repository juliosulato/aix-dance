import { z } from "zod";

// Schema simplificado sem dependência de traduções
export const addressSchema = z.object({
  publicPlace: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// Manter compatibilidade com código existente
export const getAddressSchema = (t?: (key: string) => string) => addressSchema;

export type CreateAddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = Partial<CreateAddressInput>;
