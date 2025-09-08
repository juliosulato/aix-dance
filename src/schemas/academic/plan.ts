import toTitleCase from '@/utils/toTitleCase';
import { PlanType } from '@prisma/client';
import { z } from 'zod';

export const getCreatePlanSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t("fields.name.errors.required") }).transform(toTitleCase),
  frequency: z.number({ error:  t("fields.frequency.errors.invalid") }).min(1, { message:  t("fields.frequency.errors.min-one") }),
  type: z.enum(PlanType, { error:  t("fields.planType.errors.invalid") }),
  amount: z.number({ error:  t("fields.amount.errors.invalid") }).min(0, { message: t("fields.amount.errors.min-zero")  }),
  contractModelId: z.string().nullable().optional(),

  monthlyInterest: z.number({ error: t("fields.monthlyInterest.errors.invalid") }).min(0, { message: t("fields.monthlyInterest.errors.min-zero") }),
  finePercentage: z.number({ error: t("fields.finePercentage.errors.invalid") }).min(0, { message: t("fields.finePercentage.errors.min-zero") }),
  discountPercentage: z.number({ error: t("fields.discountPercentage.errors.invalid") }).min(0, { message: t("fields.discountPercentage.errors.min-zero") }),

  maximumDiscountPeriod: z.number().min(0, { message: t("fields.maximumDiscountPeriod.errors.min-zero") }).optional(),
  interestGracePeriod: z.number().min(0, { message: t("fields.interestGracePeriod.errors.min-zero") }).optional(),
  fineGracePeriod: z.number().min(0, { message: t("fields.fineGracePeriod.errors.min-zero") }).optional()
});

export const getUpdatePlanSchema = (t: (key: string) => string) =>
  getCreatePlanSchema(t).partial();

export type CreatePlanInput = z.infer<ReturnType<typeof getCreatePlanSchema>>;
export type UpdatePlanInput = z.infer<ReturnType<typeof getUpdatePlanSchema>>;

