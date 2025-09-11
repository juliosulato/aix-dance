import { DayOfWeek } from "@prisma/client";
import { z } from "zod";

// Função que cria e retorna o schema com as traduções injetadas
export const getCreateClassSchema = (t: (key: string) => string) => {

    // Schema para um dia específico. A validação complexa é feita com `superRefine`.
    const dayScheduleSchema = z.object({
        enabled: z.boolean(),
        ranges: z.array(
            z.object({
                from: z.string(),
                to: z.string(),
            })
        ),
    }).superRefine((data, ctx) => {
        // A validação dos horários só é executada se o dia estiver habilitado (`enabled: true`)
        if (data.enabled) {
            // Verifica se existe pelo menos um intervalo de tempo preenchido
            if (data.ranges.length === 0 || data.ranges.every(r => !r.from || !r.to)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["ranges"],
                    message: t("academic.classes.modals.formSteps.one.classDaysAndHours.hours.errors.at_least_one_range"),
                });
                return;
            }

            // Valida o formato HH:mm para cada intervalo de tempo
            const timeRegex = /^\d{2}:\d{2}$/;
            data.ranges.forEach((range, index) => {
                if (range.from && !timeRegex.test(range.from)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [`ranges`, index, "from"],
                        message: t("academic.classes.modals.formSteps.one.classDaysAndHours.hours.errors.invalid_format"),
                    });
                }
                if (range.to && !timeRegex.test(range.to)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [`ranges`, index, "to"],
                        message: t("academic.classes.modals.formSteps.one.classDaysAndHours.hours.errors.invalid_format"),
                    });
                }
            });
        }
    });

    // Schema principal do formulário
    const mainSchema = z.object({
        name: z.string().min(1, { message: t("academic.classes.modals.formSteps.one.fields.name.errors.required") }),
        modalityId: z.string().min(1, { message: t("academic.classes.modals.formSteps.one.fields.modality.errors.required") }),
        teacherId: z.string().min(1, { message: t("academic.classes.modals.formSteps.one.fields.teacher.errors.required") }),
        assistantId: z.string().optional(),
        online: z.boolean().optional(),
        days: z.array(
            z.object({
                dayOfWeek: z.enum(Object.values(DayOfWeek) as [DayOfWeek, ...DayOfWeek[]]),
                initialHour: z.string().min(1),
                endHour: z.string().min(1),
            })
        ).optional(),
        students: z.array(z.string()).optional(),
        schedules: z.object({
            sunday: dayScheduleSchema,
            monday: dayScheduleSchema,
            tuesday: dayScheduleSchema,
            wednesday: dayScheduleSchema,
            thursday: dayScheduleSchema,
            friday: dayScheduleSchema,
            saturday: dayScheduleSchema,
        }),
    });

    // Validação final para garantir que pelo menos um dia da semana foi habilitado
    return mainSchema.refine(data => {
        return Object.values(data.schedules).some(day => day.enabled);
    }, {
        message: t("academic.classes.modals.formSteps.one.classDaysAndHours.errors.at_least_one_day"),
        path: ["schedules"], 
    });
};


export const getUpdateClassSchema = (t: (key: string) => string) => 
    getCreateClassSchema(t).partial();

// NOVO: Schema para matricular/desmatricular alunos
export const getEnrollStudentsSchema = (t: (key: string) => string) => {
    return z.object({
        studentIds: z.array(z.string()).optional(), // Lista dos IDs dos alunos selecionados
    });
};

// Tipos exportados para uso no frontend
export type CreateClassInput = z.infer<ReturnType<typeof getCreateClassSchema>>;
export type UpdateClassInput = z.infer<ReturnType<typeof getUpdateClassSchema>>;
export type EnrollStudentsInput = z.infer<ReturnType<typeof getEnrollStudentsSchema>>;
