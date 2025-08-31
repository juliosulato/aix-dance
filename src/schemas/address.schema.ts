import { z } from "zod";

const addressSchema = z.object({
  publicPlace: z.string(),
  number: z.string(),
  complement: z.string().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
});

export { addressSchema };
export type CreateAddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof addressSchema.partial>;