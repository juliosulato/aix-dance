import { z } from "zod";

const addressSchema = z.object({
  publicPlace: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export { addressSchema };
export type CreateAddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof addressSchema.partial>;