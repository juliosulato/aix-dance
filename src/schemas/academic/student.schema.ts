import { z } from "zod";
import { Gender } from "@/types/student.types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { isValidCpf } from "@/utils/validateCpf";

dayjs.extend(customParseFormat);

const MIN_BIRTH_DATE = dayjs("1900-01-01");
const MAX_BIRTH_DATE = dayjs();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const addressSchema = z.object({
  postalCode: z.string().min(1, { message: "CEP é obrigatório" }),
  publicPlace: z.string().min(1, { message: "Logradouro é obrigatória" }),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, { message: "Bairro é obrigatório" }),
  city: z.string().min(1, { message: "Cidade é obrigatória" }),
  state: z.string().min(1, { message: "Estado é obrigatório" }),
});

const guardianSchema = z.object({
  firstName: z.string().min(1, { message: "O nome do responsável é obrigatório" }),
  lastName: z.string().min(1, { message: "O sobrenome do responsável é obrigatório" }),
  email: z.string().email({ message: "E-mail do responsável inválido" }).optional().or(z.literal('')),
  cellPhoneNumber: z.string().min(1, { message: "Celular do responsável é obrigatório" }),
  relationship: z.string().optional(),
  phoneNumber: z.string().optional(),
  documentOfIdentity: z.string().optional(),
});

const createStudentSchema = z.object({
  // --- Upload de Arquivo (Adicionado) ---
  file: z
    .custom<File>((val) => {
      // Validação permissiva para funcionar tanto no Client (File) quanto no Node (Blob/Object)
      if (!val) return true;
      return val instanceof File || (typeof val === "object" && "size" in val && "type" in val);
    }, "Imagem inválida")
    .refine((file) => {
      if (!file || file.size === 0) return true;
      return file.size <= MAX_FILE_SIZE;
    }, "O tamanho máximo da imagem é de 5MB.")
    .refine((file) => {
      if (!file || file.size === 0) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Formato inválido. Use .jpg, .jpeg, .png ou .webp")
    .optional()
    .nullable(),

  firstName: z.string().min(1, { message: "O nome do aluno é obrigatório" }),
  lastName: z.string().min(1, { message: "O sobrenome do aluno é obrigatório" }),
  gender: z.enum(Gender, { error: "Gênero inválido" }),
  cellPhoneNumber: z.string().min(1, { message: "Celular do aluno é obrigatório" }),
  pronoun: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  phoneNumber: z.string().optional(),
  documentOfIdentity: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) return true;
      return isValidCpf(digits);
    }, { message: "CPF inválido" }),
  email: z.string().email({ message: "E-mail do aluno inválido" }).optional().or(z.literal('')),
  howDidYouMeetUs: z.string().optional(),
  instagramUser: z.string().optional(),
  healthProblems: z.string().optional(),
  medicalAdvice: z.string().optional(),
  painOrDiscomfort: z.string().optional(),
  canLeaveAlone: z.boolean().default(true).optional(),
  address: addressSchema.optional(),
  guardian: z.array(guardianSchema).optional(),
});

const updateStudentSchema = createStudentSchema.partial();

export { createStudentSchema, updateStudentSchema };
// Exportando como CreateStudentInput para manter consistência com o resto do sistema
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export type CreateStudentFormData = CreateStudentInput;
export type UpdateStudentFormData = UpdateStudentInput;