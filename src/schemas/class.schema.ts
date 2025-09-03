import { DayOfWeek } from "@prisma/client";
import { z } from "zod";

const timeRangeSchema = z.object({
  from: z.string().regex(/^\d{2}:\d{2}$/, { message: "Horário de início inválido (formato HH:mm)" }),
  to: z.string().regex(/^\d{2}:\d{2}$/, { message: "Horário de término inválido (formato HH:mm)" }),
});

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  ranges: z.array(timeRangeSchema).nonempty({ message: "É necessário informar pelo menos um intervalo de horário" }),
});

export const createClassSchema = z.object({
  name: z.string().min(1, { message: "O nome da turma é obrigatório" }),
  modality: z.string().min(1, { message: "A modalidade é obrigatória" }),
  teacherId: z.string().min(1, { message: "O professor é obrigatório" }),
  assistantId: z.string().optional(),
  online: z.boolean().optional(),
  days: z.array(
    z.object({
      dayOfWeek: z.enum(DayOfWeek, { message: "Dia da semana inválido" }),
      initialHour: z.string().min(1, { message: "Hora inicial é obrigatória" }),
      endHour: z.string().min(1, { message: "Hora final é obrigatória" }),
    })
  ).nonempty({ message: "É necessário informar pelo menos um dia da semana" }),
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

export type CreateClassInput = z.infer<typeof createClassSchema>;
