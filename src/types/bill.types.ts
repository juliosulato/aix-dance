import { Decimal } from 'decimal.js';
import { CategoryBill } from './category.types';
import { FormsOfReceipt } from './receipt.types';
import { Bank } from './bank.types';
import { Supplier } from './supplier.types';

export enum BillType {
    PAYABLE = 'PAYABLE',
    RECEIVABLE = 'RECEIVABLE',
}

export enum RemunerationType {
    HOURLY = "HOURLY",
    FIXED = "FIXED"
}

export enum BillStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    AWAITING_RECEIPT = 'AWAITING_RECEIPT',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum RecurrenceType {
    NONE = 'NONE',
    MONTHLY = 'MONTHLY',
    BIMONTHLY = 'BIMONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMIANNUAL = 'SEMIANNUAL',
    ANNUAL = 'ANNUAL',
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    CASH = 'CASH',
    BANK_SLIP = 'BANK_SLIP',
    BANK_TRANSFER = 'BANK_TRANSFER',
    PIX = 'PIX',
}

export type Bill = {
    id: string;
    type: BillType;
    description: string;
    amount: Decimal;
    amountPaid: Decimal | null;
    dueDate: Date;
    paymentDate: Date | null;
    expectedReceiveDate: Date | null;
    status: BillStatus;
    feeAmount: Decimal | null;
    netAmount: Decimal | null;
    originalAmount: Decimal | null;
    penaltyAmount: Decimal | null;
    penaltyApplied: boolean;
    penaltyExempted: boolean;
    penaltyExemptedBy: string | null;
    penaltyExemptedAt: Date | null;
    penaltyExemptedReason: string | null;
    installments: number;
    installmentNumber: string | null;
    recurrence: RecurrenceType | null;
    recurrenceEndDate: Date | null;
    recurrenceCount: number | null;
    complement: string | null;
    parentId: string | null;
    parent?: Bill | null;
    children?: Bill[];
    subscriptionId: string | null;
    saleId: number | null;
    studentId: string | null;
    supplierId: string | null;
    categoryId: string | null;
    formsOfReceiptId: string | null;
    paymentMethodId: string | null;
    paymentMethod: PaymentMethod;
    bankId: string | null;
    attachments?: BillAttachment[];
    tenancyId: string;
    createdAt: Date;
    updatedAt: Date;
    notifications?: Notification[];
    formsOfReceipt: FormsOfReceipt | null,
};

export type BillAttachment = {
    id: string;
    url: string;
    billId: string;
    bill?: Bill;
    createdAt: Date;
};

export type BillWithCategory = Bill & {
    category?: CategoryBill | null;
};

export type BillWithAttachment = Bill & {
    attachments?: BillAttachment[];
};

export type BillComplete = Bill & {
    category?: CategoryBill;
    bank?: Bank;
    totalInstallments: number;
    supplier?: Supplier;
};