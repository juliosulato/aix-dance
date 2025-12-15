import toTitleCase from '@/utils/toTitleCase';
import { Gender } from '@prisma/client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { z } from 'zod';
import { isValidCpf } from '@/utils/validateCpf';

dayjs.extend(customParseFormat);

const MIN_BIRTH_DATE = dayjs('1900-01-01');
const MAX_BIRTH_DATE = dayjs();

// Schema simplificado sem dependência de traduções
export const createStudentSchema = z.object({
    // Seção: Informações Pessoais
    firstName: z.string().min(1, { message: "Nome é obrigatório" }).transform(toTitleCase),
    lastName: z.string().min(1, { message: "Sobrenome é obrigatório" }).transform(toTitleCase),
    gender: z.enum(Gender, { message: "Gênero é obrigatório" }),
    cellPhoneNumber: z.string().min(1, { message: "Celular é obrigatório" }),
    pronoun: z.string().optional(),
    dateOfBirth: z.string()
        .min(1, { message: "Data de nascimento é obrigatória" })
        .refine((value) => {
            const parsed = dayjs(value, 'DD/MM/YYYY', true);
            if (!parsed.isValid()) return false;
            if (parsed.isBefore(MIN_BIRTH_DATE)) return false;
            if (parsed.isAfter(MAX_BIRTH_DATE)) return false;
            return true;
        }, { message: "Data de nascimento inválida" }),
    phoneNumber: z.string().optional(),
    documentOfIdentity: z.string().optional().refine((value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, '');
        if (digits.length === 0) return true; // permanece opcional
        return isValidCpf(digits);
    }, { message: "CPF inválido" }),
    email: z.email({ message: "Email inválido" }),
    howDidYouMeetUs: z.string().optional(),
    instagramUser: z.string().optional(),

    // Seção: Saúde e Permissões
    healthProblems: z.string().optional(),
    medicalAdvice: z.string().optional(),
    painOrDiscomfort: z.string().optional(),
    canLeaveAlone: z.boolean().default(true).optional(),

    // Seção: Endereço
    address: z.object({
        publicPlace: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }).optional(),

    guardian: z.array(z.object({
        firstName: z.string().min(1, { message: "Nome do responsável é obrigatório" }),
        lastName: z.string().min(1, { message: "Sobrenome do responsável é obrigatório" }),
        email: z.email({ message: "Email inválido" }).optional().or(z.literal('')),
        cellPhoneNumber: z.string().min(1, { message: "Celular do responsável é obrigatório" }),
        relationship: z.string().optional(),
        phoneNumber: z.string().optional(),
        documentOfIdentity: z.string().optional(),
    })).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
