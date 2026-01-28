import { z } from "zod";
import { Gender } from "@/types/student.types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { isValidCpf } from "@/utils/validateCpf";
import { fileSchema } from "../file.schema";

dayjs.extend(customParseFormat);

const addressSchema = z.object({
  zipCode: z.string().min(1, { message: "CEP é obrigatório" }),
  publicPlace: z.string().min(1, { message: "Logradouro é obrigatória" }),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(1, { message: "Estado é obrigatório" }),
  country: z.string().default("Brasil").optional()
});

const guardianSchema = z.object({
  firstName: z.string().min(1, { message: "O nome do responsável é obrigatório" }),
  lastName: z.string().min(1, { message: "O sobrenome do responsável é obrigatório" }),
  email: z.email({ message: "E-mail do responsável inválido" }).optional().or(z.literal('')),
  phoneNumber: z.string().min(1, { message: "Celular do responsável é obrigatório" }),
  relationship: z.string().optional(),
  phoneNumber2: z.string().optional(),
  nationalId: z.string().optional(),
});

const createStudentSchema = z.object({
  file: fileSchema,

  firstName: z.string().min(1, { message: "O nome do aluno é obrigatório" }),
  lastName: z.string().min(1, { message: "O sobrenome do aluno é obrigatório" }),
  gender: z.enum(Gender, { error: "Gênero inválido" }),
  phoneNumber: z.string().min(1, { message: "Celular do aluno é obrigatório" }),
  pronoun: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  phoneNumber2: z.string().optional(),
  nationalId: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) return true;
      return isValidCpf(digits);
    }, { message: "CPF inválido" }),
  email: z.email({ message: "E-mail do aluno inválido" }).optional().or(z.literal('')),
  howDidYouMeetUs: z.string().optional(),
  instagramUser: z.string().optional(),
  healthProblems: z.string().optional(),
  medicalAdvice: z.string().optional(),
  painOrDiscomfort: z.string().optional(),
  canLeaveAlone: z.boolean().default(true).optional(),
  address: addressSchema.optional(),
  guardian: z.array(guardianSchema).optional(),
});

const updateStudentSchema = z.object({
  file: fileSchema.optional(),

  firstName: z.string().min(1, { message: "O nome do aluno é obrigatório" }).optional(),
  lastName: z.string().min(1, { message: "O sobrenome do aluno é obrigatório" }).optional(),
  gender: z.enum(Gender, { error: "Gênero inválido" }).optional(),
  phoneNumber: z.string().min(1, { message: "Celular do aluno é obrigatório" }).optional(),
  pronoun: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  phoneNumber2: z.string().optional(),
  nationalId: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) return true;
      return isValidCpf(digits);
    }, { message: "CPF inválido" }),
  email: z.email({ message: "E-mail do aluno inválido" }).optional().or(z.literal('')),
  howDidYouMeetUs: z.string().optional(),
  instagramUser: z.string().optional(),
  healthProblems: z.string().optional(),
  medicalAdvice: z.string().optional(),
  painOrDiscomfort: z.string().optional(),
  canLeaveAlone: z.boolean().default(true).optional(),
  address: addressSchema.optional(),
  guardian: z.array(guardianSchema).optional(),
});

export { createStudentSchema, updateStudentSchema };

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export type CreateStudentFormData = CreateStudentInput;
export type UpdateStudentFormData = UpdateStudentInput;