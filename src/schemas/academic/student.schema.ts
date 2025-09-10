import toTitleCase from '@/utils/toTitleCase';
import { Gender } from '@prisma/client';
import { z } from 'zod';

// Usamos uma função para que o schema possa receber a função de tradução (t)
export const getCreateStudentSchema = (t: (key: string) => string) => z.object({
    // Seção: Informações Pessoais
    firstName: z.string().min(1, { message: t("academic.students.modals.personalData.fields.firstName.errors.required") }).transform(toTitleCase),
    lastName: z.string().min(1, { message: t("academic.students.modals.personalData.fields.lastName.errors.required") }).transform(toTitleCase),
    gender: z.enum(Gender, { error: t("academic.students.modals.personalData.fields.gender.errors.required") }),
    cellPhoneNumber: z.string().min(1, { message: t("academic.students.modals.personalData.fields.cellPhoneNumber.errors.required") }),
    pronoun: z.string().optional(),
    dateOfBirth: z.string().min(1, { message: t("academic.students.modals.personalData.fields.dateOfBirth.errors.required") }),
    phoneNumber: z.string().optional(),
    documentOfIdentity: z.string().optional(),
    email: z.email({ message: t("academic.students.modals.personalData.fields.email.errors.invalid") }),
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
        firstName: z.string().min(1, { message: t("academic.students.modals.guardians.fields.firstName.errors.required") }),
        lastName: z.string().min(1, { message: t("academic.students.modals.guardians.fields.lastName.errors.required") }),
        email: z.email({ message: t("academic.students.modals.guardians.fields.email.errors.invalid") }).optional().or(z.literal('')),
        cellPhoneNumber: z.string().min(1, { message: t("academic.students.modals.guardians.fields.cellPhoneNumber.errors.required") }),
        relationship: z.string().optional(),
        phoneNumber: z.string().optional(),
        documentOfIdentity: z.string().optional(),
    })).optional(),
});

export const getUpdateStudentSchema = (t: (key: string) => string) =>
    getCreateStudentSchema(t).partial();

export type CreateStudentInput = z.infer<ReturnType<typeof getCreateStudentSchema>>;
export type UpdateStudentInput = z.infer<ReturnType<typeof getUpdateStudentSchema>>;
