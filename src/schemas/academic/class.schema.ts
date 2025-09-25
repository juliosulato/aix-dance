import { DayOfWeek } from "@prisma/client";
import { z } from "zod";

// Schema simplificado sem dependência de traduções
const dayScheduleSchema = z.object({
    enabled: z.boolean(),
    ranges: z.array(
        z.object({
            from: z.string(),
            to: z.string(),
        })
    ),
}).superRefine((data, ctx) => {
    // A validação dos horários só é executada se o dia estiver habilitado
    if (data.enabled) {
        // Verifica se existe pelo menos um intervalo de tempo preenchido
        if (data.ranges.length === 0 || data.ranges.every(r => !r.from || !r.to)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["ranges"],
                message: "Pelo menos um horário deve ser definido para o dia habilitado",
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
                    message: "Formato de hora inválido. Use HH:mm",
                });
            }
            if (range.to && !timeRegex.test(range.to)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [`ranges`, index, "to"],
                    message: "Formato de hora inválido. Use HH:mm",
                });
            }
        });
    }
});

// Schema principal do formulário
export const createClassSchema = z.object({
    name: z.string().min(1, { message: "Nome da turma é obrigatório" }),
    modalityId: z.string().min(1, { message: "Modalidade é obrigatória" }),
    teacherId: z.string({ error: "Professor é obrigatório"}).min(1, { message: "Professor é obrigatório" }),
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
}).refine(data => {
    return Object.values(data.schedules).some((day: any) => day.enabled);
}, {
    message: "Pelo menos um dia da semana deve ser habilitado",
    path: ["schedules"], 
});

export const updateClassSchema = createClassSchema.partial();

// Schema para matricular/desmatricular alunos
export const enrollStudentsSchema = z.object({
    studentIds: z.array(z.string()).optional(),
});

// Tipos exportados para uso no frontend
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type EnrollStudentsInput = z.infer<typeof enrollStudentsSchema>;
