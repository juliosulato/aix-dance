import { z } from "zod";

export enum DAYS_OF_WEEK {
    SUNDAY = "SUNDAY",
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY"
}

const classSchema = z.object({
    name: z.string().min(1, "Nome da turma é obrigatório"),
    modalityId: z.string().min(1, "ID da modalidade é obrigatório"),
    teacherId: z.string().min(1, "ID do professor é obrigatório"),
    assistantId: z.string().optional(),
    online: z.boolean().optional().default(false),
    days: z.array(z.object({
        dayOfWeek: z.enum(DAYS_OF_WEEK, "Dia da semana é obrigatório"),
        initialHour: z.string().min(1, "Horário inicial é obrigatório"),
        endHour: z.string().min(1, "Horário final é obrigatório"),
    })).min(1, "É necessário fornecer pelo menos um dia de aula"),
    students: z.array(z.string()).optional(),
});

export const createClassSchema = classSchema;

export const updateClassSchema = classSchema.partial().extend({ 
    id: z.string() 
}).refine((data) => Object.keys(data).length > 1, {
    message: "Pelo menos um campo além do ID deve ser fornecido para atualização.",
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;