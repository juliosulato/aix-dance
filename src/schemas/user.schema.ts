import { Gender, RemunerationType, UserRole } from "@prisma/client";
import { z } from "zod";
import { getAddressSchema } from "./address.schema";
import dayjs from "dayjs";

export const getTeacherSchema = (t: (key: string) => string) => {
  const addressSchema = getAddressSchema(t);

  const commissionTierSchema = z.object({
    minStudents: z.number().int().min(1),
    maxStudents: z.number().int().min(1),
    comission: z.number().min(0),
  }).refine(tier => tier.minStudents <= tier.maxStudents, {
    message: t("academic.teachers.modals.create.remuneration.fields.commission.errors.minMax"),
    path: ["minStudents"]
  });

  return z.object({
    cellPhoneNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    document: z.string().min(1, t("forms.general-fields.document.errors.required")),
    gender: z.enum(Gender, { error: t("academic.students.modals.personalData.fields.gender.errors.required") }),
    pronoun: z.string().optional(),
    instagramUser: z.string().optional(),
    professionalRegister: z.string().optional(),
    address: addressSchema.optional(),
    dateOfBirth: z.string().transform((arg) => dayjs(arg, "DD-MM-YYYY").format("YYYY-MM-DD")),

    remunerationType: z.enum(RemunerationType, { error: t("teachers.modals.create.remuneration.fields.contractType.errors.required") }),
    baseAmount: z.number({ error: t("academic.teachers.modals.create.remuneration.fields.baseAmount.errors.required") }).min(1, t("academic.teachers.modals.create.remuneration.fields.baseAmount.errors.min")),
    paymentDay: z.number().int().min(1).max(31).default(5),
    formsOfReceiptId: z.string().optional(),
    paymentData: z.string().optional(),
    observations: z.string().optional(),

    bonusForPresenceAmount: z.number().int().optional(),
    loseBonusWhenAbsent: z.boolean().default(true),

    comissionTiers: z.array(commissionTierSchema).optional()
  });
};

export const getCreateUserSchema = (t: (key: string) => string) => {
  const teacherSchema = getTeacherSchema(t);

  return z.object({
    firstName: z.string().min(1, t("forms.general-fields.firstName.errors.required")),
    lastName: z.string().min(1, t("forms.general-fields.lastName.errors.required")),
    email: z.email(t("forms.general-fields.email.errors.invalid")),
    user: z.string().optional(),
    role: z.enum(UserRole, { error: t("settings.users.modals.create.generalData.fields.role.errors.required") }).default("STAFF"),
    image: z.string().optional(),
    teacher: teacherSchema.optional(),

    password: z.string()
      .min(6, t("academic.teachers.modals.create.accessData.fields.password.errors.min"))
      .regex(/[A-Z]/, t("academic.teachers.modals.create.accessData.fields.password.errors.uppercase"))
      .regex(/[a-z]/, t("academic.teachers.modals.create.accessData.fields.password.errors.lowercase"))
      .regex(/[0-9]/, t("academic.teachers.modals.create.accessData.fields.password.errors.number")),
    confirmPassword: z.string().min(6)
  }).refine(data => data.password === data.confirmPassword, {
    message: t("academic.teachers.modals.create.accessData.fields.confirmPassword.errors.noMatch"),
    path: ["confirmPassword"]
  });
};
export const getUpdateUserSchema = (t: (key: string) => string) =>
  getCreateUserSchema(t)
    .partial()
.extend({
  prevPassword: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
})
.superRefine((data, ctx) => {
  if (data.password || data.confirmPassword) {
    if (!data.password || !data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.confirmPassword.errors.noMatch"),
      });
      return;
    }

    // Força da senha
    if (data.password.length < 6) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.password.errors.min"),
      });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.password.errors.uppercase"),
      });
    }
    if (!/[a-z]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.password.errors.lowercase"),
      });
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({
        path: ["password"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.password.errors.number"),
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.confirmPassword.errors.noMatch"),
      });
    }

    // 🔒 Checar prevPassword
    if (!data.prevPassword) {
      ctx.addIssue({
        path: ["prevPassword"],
        code: "custom",
        message: t("academic.teachers.modals.create.accessData.fields.password.errors.prevRequired"),
      });
    }
  }
});

export type CreateUserInput = z.infer<ReturnType<typeof getCreateUserSchema>>;
export type UpdateUserInput = z.infer<ReturnType<typeof getUpdateUserSchema>>;
