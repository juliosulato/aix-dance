import { PlanType } from "@prisma/client";
import z from "zod";

const planSchema = z.object({
  name: z.string(),
  frequency: z.number(),
  type: z.enum([
    PlanType.BI_WEEKLY,
    PlanType.MONTHLY,
    PlanType.BI_MONTHLY,
    PlanType.QUARTERLY,
    PlanType.SEMMONTLY,
    PlanType.ANNUAL,
    PlanType.BI_ANNUAL
  ]),
  amount: z.number(),
  contractModelId: z.string().nullable().optional(),

  monthlyInterest: z.number(),
  finePercentage: z.number(),
  discountPercentage: z.number(),

  maximumDiscountPeriod: z.number().optional(),
  interestGracePeriod: z.number().optional(),
  fineGracePeriod: z.number().optional()
});

export const createPlanSchema = planSchema;
export const updatePlanSchema = planSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>