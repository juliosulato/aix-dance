import { BillStatus, BillType, PaymentMethod, RecurrenceType } from '@/types/bill.types';
import { z } from 'zod';

// --- Helpers e Utilitários ---
const emptyToUndefined = z.preprocess((val) => {
  if (val === '' || val === null) return undefined;
  return val;
}, z.string().optional());

const billTypeValues = Object.values(BillType) as [string, ...string[]];
const billStatusValues = Object.values(BillStatus) as [string, ...string[]];
const paymentMethodValues = Object.values(PaymentMethod) as [string, ...string[]];
const recurrenceTypeValues = Object.values(RecurrenceType) as [string, ...string[]];

// --- Schemas Base ---
const baseBillSchema = z.object({
  type: z.enum(billTypeValues, {
    error: 'Tipo de conta inválido. Use PAYABLE ou RECEIVABLE.',
  }),

  description: z.string({ error: 'A descrição é obrigatória.' })
    .max(500, 'A descrição é muito longa.'),
  
  complement: z.string().max(255, 'O complemento é muito longo.').optional().nullable(),

  amount: z.coerce.number({ error: 'O valor é obrigatório e deve ser um número.' })
    .positive('O valor deve ser maior que zero.')
    .transform((val) => Number(val.toFixed(2))),

  status: z.enum(billStatusValues).default(BillStatus.PENDING),

  studentId: emptyToUndefined,
  supplierId: emptyToUndefined,
  categoryId: emptyToUndefined,
  formsOfReceiptId: emptyToUndefined,
  bankId: emptyToUndefined,
  
  paymentMethod: z.enum(paymentMethodValues).optional().nullable(),
});

// --- Modos de Pagamento ---

// 1. Pagamento Único (À vista)
const oneTimeSchema = baseBillSchema.extend({
  paymentMode: z.literal('ONE_TIME'),
  dueDate: z.coerce.date({ error: 'A data de vencimento é obrigatória.' }),
 installments: z.coerce.number()
    .refine(val => val === 1, { message: "Pagamento à vista deve ter apenas 1 parcela." })
    .default(1),
  recurrence: z.literal('NONE').default('NONE'),
});

// 2. Parcelado
const installmentsSchema = baseBillSchema.extend({
  paymentMode: z.literal('INSTALLMENTS'),
  dueDate: z.coerce.date({ error: 'A data de vencimento da 1ª parcela é obrigatória.' }),
  installments: z.coerce.number()
    .int('O número de parcelas deve ser inteiro.')
    .min(2, 'Para parcelamento, o mínimo são 2 parcelas.')
    .max(999, 'Número de parcelas excede o limite permitido.'),
  recurrence: z.literal('NONE').default('NONE'),
});

// 3. Assinatura (Recorrência)
const subscriptionSchema = baseBillSchema.extend({
  paymentMode: z.literal('SUBSCRIPTION'),
  dueDate: z.coerce.date({ error: 'O vencimento da primeira cobrança é obrigatório.' }),
  
  recurrence: z.enum(recurrenceTypeValues).refine((val) => val !== 'NONE', {
    message: "Para assinaturas, selecione uma periodicidade válida (Mensal, Anual, etc).",
  }),

  endCondition: z.enum(['noDateSet', 'chooseData', 'numberOfCharges'], {
    error: 'Condição de encerramento inválida.',
  }),

  recurrenceEndDate: z.coerce.date().optional().nullable(),
  recurrenceCount: z.coerce.number().int().positive().optional().nullable(),
}).superRefine((data, ctx) => {
  // Validação: Data Fixa
  if (data.endCondition === 'chooseData') {
    if (!data.recurrenceEndDate) {
      ctx.addIssue({
        code: "custom",
        message: 'Selecione a data final da assinatura.',
        path: ['recurrenceEndDate'],
      });
    } else if (data.recurrenceEndDate <= data.dueDate) {
      ctx.addIssue({
        code: "custom",
        message: 'A data final deve ser posterior ao primeiro vencimento.',
        path: ['recurrenceEndDate'],
      });
    }
  }

  // Validação: Número de Cobranças
  if (data.endCondition === 'numberOfCharges') {
    if (!data.recurrenceCount) {
      ctx.addIssue({
        code: "custom",
        message: 'Informe o número total de cobranças.',
        path: ['recurrenceCount'],
      });
    } else if (data.recurrenceCount < 2) {
      ctx.addIssue({
        code: "custom",
        message: 'Assinaturas devem ter pelo menos 2 ocorrências.',
        path: ['recurrenceCount'],
      });
    }
  }
});

export const createBillSchema = z.discriminatedUnion('paymentMode', [
  oneTimeSchema,
  installmentsSchema,
  subscriptionSchema,
]).superRefine((data, ctx) => {
  if (data.type === 'RECEIVABLE' && !data.studentId && !data.description.toLowerCase().includes('avulso')) {
     ctx.addIssue({
       code: "custom",
       message: 'Para contas a receber, vincule um Aluno ou use uma descrição detalhada.',
       path: ['studentId'],
     });
  }
});


// --- Schema de Atualização ---
export const updateBillSchema = z.object({
  id: z.cuid2({ error: 'ID da conta inválido.' }),
  description: z.string().max(500, "A descrição é muito longa.").optional(),
  complement: z.string().max(255, "O complemento é muito longa.").optional(),
  dueDate: z.coerce.date().optional(),
  amount: z.coerce.number().positive().optional(),
  
  recurrence: z.enum(recurrenceTypeValues).optional(),
  
  status: z.enum(billStatusValues).optional(),
  amountPaid: z.coerce.number().min(0).optional(),
  paymentDate: z.coerce.date().optional(),
  
  studentId: emptyToUndefined,
  supplierId: emptyToUndefined,
  categoryId: emptyToUndefined,
  bankId: emptyToUndefined,
  
  updateScope: z.enum(['ONE', 'ALL_FUTURE']).default('ONE'),
});

// --- Schema de Consulta ---
export const billQuerySchema = z.object({
  type: z.enum(billTypeValues).optional(),
  status: z.enum(billStatusValues).optional(),
  
  studentId: z.string().optional(),
  supplierId: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethod: z.enum(paymentMethodValues).optional(),
  
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().optional(), 
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).refine((data) => {
  // Validação: Se tiver Data Fim, deve ter Data Início
  if (data.dateTo && !data.dateFrom) return false;
  if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) return false;
  return true;
}, {
  message: "Intervalo de datas inválido.",
  path: ['dateFrom'],
});

const payBillSchema = z.object({
  id: z.cuid2({ error: 'ID da conta inválido.' }),
  paymentDate: z.coerce.date({ error: 'A data de pagamento é obrigatória.' }),
  amountPaid: z.coerce.number({ error: 'O valor pago é obrigatório.' })
    .positive('O valor pago deve ser maior que zero.'),
  status: z.enum(billStatusValues, { error: 'Status inválido.' }),
  bankId: emptyToUndefined,
});

// --- Inferência de Tipos ---
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type BillQueryInput = z.infer<typeof billQuerySchema>;
export type PayBillInput = z.infer<typeof payBillSchema>;