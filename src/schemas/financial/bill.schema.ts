import { z } from 'zod';
import { BillStatus, BillType, RecurrenceType } from '@prisma/client';

// Função para tradução
type Translator = (key: string) => string;

// Schema base com os campos comuns
const baseBillSchema = (t: Translator) => z.object({
  type: z.enum(BillType, {
    error: t('fields.type.errors.required')
  }),
  description: z.string().optional(),
  amount: z.coerce.number({
    error: t('fields.amount.errors.required'),
  }).positive({ message: t('fields.amount.errors.positive') }),
  status: z.enum(BillStatus, {
    error: t('fields.status.errors.required')
  }),
  supplierId: z.string().cuid2().optional().nullable(),
  categoryId: z.string().cuid2().optional().nullable(),
  paymentMethodId: z.string().cuid2().optional().nullable(),
  bankId: z.string().cuid2().optional().nullable(),
});

// Schema para o modo "À vista ou Parcelado" (Criação)
const installmentsSchema = (t: Translator) => baseBillSchema(t).extend({
  paymentMode: z.literal('INSTALLMENTS'),
  installments: z.coerce.number().int().min(1, { message: t('fields.installments.errors.required') }),
  dueDate: z.coerce.date({
    error: t('fields.dueDate.errors.required'),
  }),
});

// Schema para o modo "Assinatura" (Criação)
const subscriptionSchema = (t: Translator) => baseBillSchema(t).extend({
  paymentMode: z.literal('SUBSCRIPTION'),
  recurrence: z.enum(RecurrenceType).refine(val => val !== RecurrenceType.NONE, {
    message: t('fields.subscription.frequency.errors.required')
  }),
  dueDate: z.coerce.date({
    error: t('fields.subscription.dueDate.errors.required'),
  }),
  endCondition: z.enum(['noDateSet', 'chooseData', 'numberOfCharges']),
  recurrenceEndDate: z.coerce.date().optional().nullable(),
  recurrenceCount: z.coerce.number().int().positive().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.endCondition === 'chooseData' && !data.recurrenceEndDate) {
    ctx.addIssue({
      code: "custom",
      path: ['recurrenceEndDate'],
      message: t('fields.subscription.chooseData.errors.required'),
    });
  }
  if (data.endCondition === 'numberOfCharges' && !data.recurrenceCount) {
    ctx.addIssue({
      code: "custom",
      path: ['recurrenceCount'],
      message: t('fields.subscription.numberOfCharges.errors.required'),
    });
  }
});

// Schema de CRIAÇÃO usa união discriminada
export const getCreateBillSchema = (t: Translator) => z.discriminatedUnion('paymentMode', [
  installmentsSchema(t),
  subscriptionSchema(t),
]);

// Schema de ATUALIZAÇÃO é um objeto simples com todos os campos possíveis como opcionais
export const getUpdateBillSchema = (t: Translator) => baseBillSchema(t).extend({
  dueDate: z.coerce.date(),
  installments: z.coerce.number().int().positive(),
  recurrence: z.enum(RecurrenceType),
  amountPaid: z.coerce.number().positive(),
  paymentDate: z.coerce.date(),
  recurrenceEndDate: z.coerce.date(),
  recurrenceCount: z.coerce.number().int().positive(),
  updateScope: z.enum(['ONE', 'ALL_FUTURE']).optional().default('ONE'),
}).partial(); // .partial() torna todos os campos opcionais

export const getPayBillSchema = (t: Translator) => z.object({
  status: z.enum(BillStatus, t('errors.status')),
  amountPaid: z.number().nonnegative(),
  paymentDate: z.date()
});

export type CreateBillInput = z.infer<ReturnType<typeof getCreateBillSchema>>;
export type UpdateBillInput = z.infer<ReturnType<typeof getUpdateBillSchema>>;

