import toTitleCase from '@/utils/toTitleCase';
import { Gender } from '@prisma/client';
import { z } from 'zod';

// Schema simplificado sem dependência de traduções
export const createStudentSchema = z.object({
    // Seção: Informações Pessoais
    firstName: z.string().min(1, { message: "Nome é obrigatório" }).transform(toTitleCase),
    lastName: z.string().min(1, { message: "Sobrenome é obrigatório" }).transform(toTitleCase),
    gender: z.enum(Gender, { message: "Gênero é obrigatório" }),
    cellPhoneNumber: z.string().min(1, { message: "Celular é obrigatório" }),
    pronoun: z.string().optional(),
    dateOfBirth: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
    phoneNumber: z.string().optional(),
    documentOfIdentity: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }),
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
        email: z.string().email({ message: "Email inválido" }).optional().or(z.literal('')),
        cellPhoneNumber: z.string().min(1, { message: "Celular do responsável é obrigatório" }),
        relationship: z.string().optional(),
        phoneNumber: z.string().optional(),
        documentOfIdentity: z.string().optional(),
    })).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// Manter compatibilidade com código existente
export const getCreateStudentSchema = (t?: (key: string) => string) => createStudentSchema;
export const getUpdateStudentSchema = (t?: (key: string) => string) => updateStudentSchema;

export type CreateStudentInput = z.infer<ReturnType<typeof getCreateStudentSchema>>;
export type UpdateStudentInput = z.infer<ReturnType<typeof getUpdateStudentSchema>>;
