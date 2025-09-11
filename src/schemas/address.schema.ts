import { z } from "zod";

// A função de tradução 't' é incluída para consistência e futuras validações
export const getAddressSchema = (t: (key: string) => string) => z.object({
  publicPlace: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

// Mantemos uma exportação padrão para compatibilidade ou uso em locais não internacionalizados
export const addressSchema = getAddressSchema((key: string) => key);

export type CreateAddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<ReturnType<typeof getAddressSchema>['partial']>;
