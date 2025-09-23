import { z } from "zod";
import { Gender } from "@prisma/client";

const addressSchema = z.object({
  postalCode: z.string().min(1, { message: "CEP é obrigatório" }),
  street: z.string().min(1, { message: "Rua é obrigatória" }),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(1, { message: "Estado é obrigatório" }),
});

const guardianSchema = z.object({
  firstName: z.string().min(1, { message: "O nome do responsável é obrigatório" }),
  lastName: z.string().min(1, { message: "O sobrenome do responsável é obrigatório" }),
  email: z.string().email({ message: "E-mail do responsável inválido" }),
  cellPhoneNumber: z.string().min(1, { message: "Celular do responsável é obrigatório" }),
  relationship: z.string().optional(),
  phoneNumber: z.string().optional(),
  documentOfIdentity: z.string().optional(),
});

const createStudentSchema = z.object({
  firstName: z.string().min(1, { message: "O nome do aluno é obrigatório" }),
  lastName: z.string().min(1, { message: "O sobrenome do aluno é obrigatório" }),
  gender: z.enum(Gender, { error: "Gênero inválido" }),
  cellPhoneNumber: z.string().min(1, { message: "Celular do aluno é obrigatório" }),
  pronoun: z.string().optional(),
  dateOfBirth: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  phoneNumber: z.string().optional(),
  image: z.string().url({ message: "URL da imagem inválida" }).optional(),
  documentOfIdentity: z.string().optional(),
  email: z.string().email({ message: "E-mail do aluno inválido" }),
  howDidYouMeetUs: z.string().optional(),
  instagramUser: z.string().optional(),
  healthProblems: z.string().optional(),
  medicalAdvice: z.string().optional(),
  painOrDiscomfort: z.string().optional(),
  canLeaveAlone: z.boolean().default(true).optional(),
  address: addressSchema,
  guardian: z.array(guardianSchema).optional(),
});

const updateStudentSchema = createStudentSchema.partial();

export { createStudentSchema, updateStudentSchema };
export type CreateStudentFormData = z.infer<typeof createStudentSchema>;
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;