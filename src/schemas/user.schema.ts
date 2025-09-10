import { ActionType, Gender, RemunerationType, ResourceType } from "@prisma/client";
import { z } from "zod";
import { addressSchema } from "./address.schema";

const commissionTierSchema = z.object({
  minStudents: z.number().int().min(1),
  maxStudents: z.number().int().min(1),
  comission: z.number().min(0),
}).refine(tier => tier.minStudents <= tier.maxStudents, {
  message: "teacher.errors.comissionTiers.minMax",
  path: ["minStudents"]
});

const teacherSchema = z.object({
  cellPhoneNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  document: z.string().min(1, "Documento obrigatório"),
  gender: z.enum(Gender, { error: "Gênero inválido."}),
  pronoun: z.string().optional(),
  instagramUser: z.string().optional(),
  professionalRegister: z.string().optional(),
  address: addressSchema.optional(),
  dateOfBirth: z.preprocess(
    val => val instanceof Date ? val.toISOString().split("T")[0] : val,
    z.string().optional()
  ),

  remunerationType: z.enum(RemunerationType, { error: "Selecione uma opção válida." }),
  baseAmount: z.number({ error: "Obrigatório" }).min(1, "O valor da hora aula deve ser acima de R$ 1,00"),
  paymentDay: z.number().int().min(1).max(31).default(5),
  paymentMethodId: z.string().optional(),
  paymentData: z.string().optional(),
  observations: z.string().optional(),

  bonusForPresenceAmount: z.number().int().optional(),
  loseBonusWhenAbsent: z.boolean().default(true),

  comissionTiers: z.array(commissionTierSchema).optional()
});

const userSchema = z.object({
  firstName: z.string().min(1, "Nome obrigatório"),
  lastName: z.string().min(1, "Sobrenome obrigatório"),
  email: z.email("Email inválido"),
  user: z.string().optional(),
  permissions: z.array(z.object({
    resource: z.enum(ResourceType),
    action: z.enum(ActionType),
  })).optional(),
  image: z.string().optional(),
  teacher: teacherSchema.optional(),

  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, {
  message: "user.errors.password.noMatch",
  path: ["confirmPassword"]
});

export const createUserSchema = userSchema;
export const updateUserSchema = userSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
