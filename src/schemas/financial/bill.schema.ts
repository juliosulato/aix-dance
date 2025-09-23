import { z } from 'zod';
import { BillStatus, BillType, PaymentMethod, RecurrenceType } from '@prisma/client';

const baseBillSchema = z.object({
  type: z.enum(BillType, {
    message: 'Tipo de conta é obrigatório',
  }),
  description: z.string().optional(),
  amount: z.coerce.number({
    message: 'Valor é obrigatório',
  }).positive({ message: 'Valor deve ser maior que zero' }),
  status: z.enum(BillStatus, {
    message: 'Status é obrigatório',
  }),
  supplierId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  paymentMethod: z.enum(PaymentMethod, {
    message: "Método de pagamento é obrigatório"
  }),
  bankId: z.string().min(1, 'Banco é obrigatório'),
});

const installmentsSchema = baseBillSchema.extend({
  paymentMode: z.literal('INSTALLMENTS'),
  installments: z.coerce.number().int().min(1, { message: 'Número de parcelas é obrigatório' }),
  dueDate: z.coerce.date({
    message: 'Data de vencimento é obrigatória',
  }),
});

const subscriptionSchema = baseBillSchema.extend({
  paymentMode: z.literal('SUBSCRIPTION'),
  recurrence: z.enum(RecurrenceType, { message: 'Recorrência é obrigatória' }),
  recurrenceEndDate: z.coerce.date().optional(),
  recurrenceCount: z.coerce.number().int().positive().optional(),
  endCondition: z.enum(['endDate', 'numberOfCharges']).optional(),
}).superRefine((data, ctx) => {
  if (data.endCondition === 'endDate' && !data.recurrenceEndDate) {
    ctx.addIssue({
      code: "custom",
      path: ['recurrenceEndDate'],
      message: 'Escolha uma data de término ou um número de cobranças',
    });
  }
  if (data.endCondition === 'numberOfCharges' && !data.recurrenceCount) {
    ctx.addIssue({
      code: "custom",
      path: ['recurrenceCount'],
      message: 'Número de cobranças é obrigatório',
    });
  }
});

export const createBillSchema = z.discriminatedUnion('paymentMode', [
  installmentsSchema,
  subscriptionSchema,
]);

export const updateBillSchema = baseBillSchema.extend({
  dueDate: z.coerce.date().optional(),
  installments: z.coerce.number().int().positive().optional(),
  recurrence: z.enum(RecurrenceType).optional(),
  amountPaid: z.coerce.number().positive().optional(),
  paymentDate: z.coerce.date().optional(),
  recurrenceEndDate: z.coerce.date().optional(),
  recurrenceCount: z.coerce.number().int().positive().optional(),
  updateScope: z.enum(['ONE', 'ALL_FUTURE']).optional().default('ONE'),
}).partial();

export const payBillSchema = z.object({
  status: z.enum(BillStatus, { message: 'Status inválido' }),
  amountPaid: z.number().nonnegative(),
  paymentDate: z.date(),
  bankId: z.string().min(1, 'Banco é obrigatório'),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type PayBillInput = z.infer<typeof payBillSchema>;