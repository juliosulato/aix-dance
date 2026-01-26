import { PlanType } from '@/types/plan.types';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(1, { message: "O nome do plano é obrigatório" }),
  frequency: z.number({ error: "Frequência inválida" }).min(1, { message: "Frequência deve ser maior que zero" }),
  type: z.enum(PlanType, { error: "Tipo de plano inválido" }),
  amount: z.number({ error: "Valor do plano inválido" }).min(0, { message: "O valor do plano deve ser maior ou igual a zero" }),
  contractModelId: z.string().nullable().optional(),
  monthlyInterest: z.number({ error: "Juros mensal inválido" }).min(0, { message: "Juros mensal deve ser maior ou igual a zero" }),
  finePercentage: z.number({ error: "Multa inválida" }).min(0, { message: "Multa deve ser maior ou igual a zero" }),
  discountPercentage: z.number({ error: "Desconto inválido" }).min(0, { message: "Desconto deve ser maior ou igual a zero" }),
  maximumDiscountPeriod: z.number().min(0, { message: "Período máximo de desconto inválido" }).optional(),
  interestGracePeriod: z.number().min(0, { message: "Período de carência para juros inválido" }).optional(),
  fineGracePeriod: z.number().min(0, { message: "Período de carência para multa inválido" }).optional()
});

export const createPlanSchema = planSchema;
export const updatePlanSchema = planSchema.partial().extend({ id: z.string() }).refine((data) => Object.keys(data).length > 1, {
  message: "Pelo menos um campo além do ID deve ser fornecido para atualização.",
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;