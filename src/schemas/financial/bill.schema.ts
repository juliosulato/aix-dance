import { z } from 'zod';
import { BillStatus, BillType, RecurrenceType } from '@prisma/client';

export const getCreateBillSchema = (t: (key: string) => string) => z.object({
  type: z.enum(BillType, {
    error: t('fields.type.errors.required')
  }),
  description: z.string().min(1, { message: t('fields.description.errors.required') }),
  amount: z.coerce.number({
    error: t('fields.amount.errors.required'),
  }).positive({ message: t('fields.amount.errors.positive') }),
  dueDate: z.coerce.date({
    error: t('fields.dueDate.errors.required'),
  }),
  status: z.enum([BillStatus.PENDING, BillStatus.PAID, BillStatus.OVERDUE, BillStatus.CANCELLED], {
    error: t('fields.status.errors.required')
  }),
  installments: z.coerce.number().int().positive().default(1),
  recurrence: z.enum([RecurrenceType.NONE, RecurrenceType.MONTHLY, RecurrenceType.BIMONTHLY, RecurrenceType.QUARTERLY, RecurrenceType.SEMIANNUAL, RecurrenceType.ANNUAL]).optional(),
  
  studentId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  paymentMethodId: z.string().optional().nullable(),
  bankId: z.string().optional().nullable(),
});

export type CreateBillInput = z.infer<ReturnType<typeof getCreateBillSchema>>;

