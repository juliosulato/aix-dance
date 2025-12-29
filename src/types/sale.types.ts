import { Decimal } from 'decimal.js';
import { Tenancy } from './tenancy.types';
import { Student } from './student.types';
import { Bill } from './bill.types';
import { Plan } from './plan.types';
import { Order, StockMovement } from './inventory.types';
import { Product } from './product.types';

export enum FulfillmentType {
    IMMEDIATE = 'IMMEDIATE',
    SCHEDULED = 'SCHEDULED',
}

export enum SaleItemType {
    PLAN = 'PLAN',
    PRODUCT = 'PRODUCT',
}

export type Sale = {
    id: number;
    saleNumber: string;
    tenancyId: string;
    studentId: string;
    totalAmount: Decimal;
    discountPercentage: number;
    paidAmount: Decimal;
    fulfillmentType: FulfillmentType;
    orderId: string | null;
    order?: Order | null;
    items?: SaleItem[];
    bills?: Bill[];
    student?: Student;
    tenancy?: Tenancy;
    createdAt: Date;
    updatedAt: Date;
};

export type SaleItem = {
    id: string;
    saleId: number;
    type: SaleItemType;
    description: string;
    unitAmount: Decimal;
    quantity: number;
    totalAmount: Decimal;
    isBackOrder: boolean;
    planId: string | null;
    plan?: Plan | null;
    productId: string | null;
    product?: Product | null;
    stockMovements?: StockMovement[];
    sale?: Sale;
};

