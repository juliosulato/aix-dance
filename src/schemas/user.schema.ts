import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { addressSchema } from "./address.schema";
import { isValidCpf } from "@/utils/validateCpf";
import { Gender } from "@/types/student.types";
import { RemunerationType } from "@/types/bill.types";
import { UserRole } from "@/types/user.types";

dayjs.extend(customParseFormat);

const teacherSchema = z.object({
  phoneNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  document: z.string()
    .min(1, "Documento é obrigatório")
    .refine((value) => isValidCpf(value), { message: "CPF inválido" }),
  gender: z.enum(Gender, { error: "Gênero é obrigatório" }),
  pronoun: z.string().optional(),
  instagramUser: z.string().optional(),
  professionalRegister: z.string().optional(),
  address: addressSchema.optional(),
  dateOfBirth: z.date("Data de nascimento inválida"),
  remunerationType: z.enum(RemunerationType, { error: "Tipo de remuneração é obrigatório" }),
  baseAmount: z.number({ error: "Valor base é obrigatório" }).min(1, "O valor base deve ser no mínimo 1"),
  paymentDay: z.number().int().min(1).max(31).default(5).optional(),
  formsOfReceiptId: z.string().optional(),
  paymentData: z.string().optional(),
  observations: z.string().optional(),
  bonusForPresenceAmount: z.number().int().optional(),
  loseBonusWhenAbsent: z.boolean().default(true).optional(),
  comissionTiers: z.array(z.object({
    minStudents: z.number().int().min(1),
    maxStudents: z.number().int().min(1),
    comission: z.number().min(0),
  }).refine(tier => tier.minStudents <= tier.maxStudents, {
    message: "O número mínimo de alunos deve ser menor ou igual ao número máximo",
    path: ["minStudents"]
  })).optional()
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.email("E-mail inválido"),
  role: z.enum(UserRole, { error: "Papel do usuário é obrigatório" }),
  image: z.string().optional(),
  teacher: teacherSchema.optional(),
  password: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório").optional(),
  lastName: z.string().min(1, "Sobrenome é obrigatório").optional(),
  email: z.email("E-mail inválido").optional(),
  role: z.enum(UserRole, { error: "Papel do usuário é obrigatório" }).optional(),
  image: z.string().optional(),
  teacher: teacherSchema.optional(),
  prevPassword: z.string().optional(),
  password: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password || data.confirmPassword) {
    if (!data.password || !data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "As senhas não coincidem",
      });
      return;
    }
    if (data.password.length < 6) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "A senha deve ter no mínimo 6 caracteres",
      });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "A senha deve conter pelo menos uma letra maiúscula",
      });
    }
    if (!/[a-z]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "A senha deve conter pelo menos uma letra minúscula",
      });
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: "A senha deve conter pelo menos um número",
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "As senhas não coincidem",
      });
    }
    if (!data.prevPassword) {
      ctx.addIssue({
        path: ["prevPassword"],
        code: "custom",
        message: "A senha anterior é obrigatória",
      });
    }
  }
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;