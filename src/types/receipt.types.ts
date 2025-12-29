import { Bill } from "./bill.types";

export type FormsOfReceipt = {
    id: string;
    name: string;
    operator: string | null;
    fees?: PaymentFee[];
    bills?: Bill[];
    tenancyId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type PaymentFee = {
    id: string;
    formsOfReceiptId: string;
    formsOfReceipt?: FormsOfReceipt;
    minInstallments: number;
    maxInstallments: number;
    feePercentage: number;
    customerInterest: boolean;
    receiveInDays: number | null;
    createdAt: Date;
};
