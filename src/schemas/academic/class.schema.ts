import { z } from "zod";

enum DAYS_OF_WEEK {
    SUNDAY = "SUNDAY",
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY",
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY"
}

const classSchema = z.object({
    name: z.string("Esperado um valor do tipo string")
        .min(1, "Nome da turma é obrigatório"),
    modalityId: z.string("Esperado um valor do tipo string")
        .min(1, "ID da modalidade é obrigatório"),
    teacherId: z.string("Esperado um valor do tipo string")
        .min(1, "ID do professor é obrigatório"),
    assistantId: z.string("Esperado um valor do tipo string")
        .optional(),
    online: z.boolean("Esperado um valor do tipo boolean")
        .optional()
        .default(false),
    days: z.array(z.object({
        dayOfWeek: z.enum(DAYS_OF_WEEK, "O dia da semana deve ser válido."),
        initialHour: z.string("Esperado um valor do tipo string")
            .min(1, "Horário inicial é obrigatório"),
        endHour: z.string("Esperado um valor do tipo string")
            .min(1, "Horário final é obrigatório"),
    }))
        .min(1, "É necessário fornecer pelo menos um dia de aula"),
    students: z.array(
        z.string("Esperado um valor do tipo string")
    )
        .optional()
});

export const createClassSchema = classSchema;
export const updateClassSchema = classSchema.partial().extend({ id: z.string() }).refine((data) => Object.keys(data).length > 1, {
    message: "Pelo menos um campo além do ID deve ser fornecido para atualização.",
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;