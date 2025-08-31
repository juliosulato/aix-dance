import { DayOfWeek } from "@prisma/client";
import { z } from "zod";

const timeRangeSchema = z.object({
  from: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  to: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
});

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  ranges: z.array(timeRangeSchema).nonempty(),
});

export const createClassSchema = z.object({
  name: z.string(),
  modality: z.string(),
  teacherId: z.string(),
  assistantId: z.string().optional(),
  online: z.boolean().optional(),
  days: z.array(z.object({
    dayOfWeek: z.enum(DayOfWeek),
    initialHour: z.string().min(1),
    endHour: z.string().min(1),
  })),
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
