import { z } from "zod";

const UserRoleEnum = z.enum(["GESTOR", "PROFESSOR", "SECRETARIA"]);

const userSchema = z.object({
  user: z.string(),
  email: z.email(),
  cellPhoneNumber: z.string(),
documentOfIdentity: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "NON_BINARY", "OTHER"]),
  role: UserRoleEnum,
  firstName: z.string(),
  lastName: z.string(),
  nickname: z.string().optional(),
  pronoun: z.string().optional(),
  dateOfBirth: z.string().optional(),
  phoneNumber: z.string().optional(),
  image: z.url().optional(),
  address: z.object({
    publicPlace: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  password: z.string(),
  confirmPassword: z.string(),
});
export const createUserSchema = userSchema;
export const updateUserSchema = userSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;