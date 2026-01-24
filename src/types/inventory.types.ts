import { Decimal } from 'decimal.js';
import { Tenancy } from './tenancy.types';
import { Sale, SaleItem } from './sale.types';
import { Student } from './student.types';
import { Product } from './product.types';
import { User } from './user.types';

export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum StockMovementType {
    IN = 'IN',
    OUT = 'OUT',
    BALANCE = 'BALANCE',
}

export type Order = {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    studentId: string;
    student?: Student;
    deliveryDate: Date | null;
    deliveredAt: Date | null;
    deliveryAddress: string | null;
    deliveryNotes: string | null;
    items?: OrderItem[];
    sale?: Sale | null;
    tenantId: string;
    tenancy?: Tenancy;
    createdAt: Date;
    updatedAt: Date;
};

export type OrderItem = {
    id: string;
    productId: string | null;
    product?: Product | null;
    orderId: string;
    order?: Order;
    quantity: number;
    unitPrice: Decimal | null;
    totalPrice: Decimal | null;
};

export type StockMovement = {
    id: string;
    productId: string | null;
    product?: Product | null;
    type: StockMovementType;
    quantity: number;
    reason: string;
    saleItemId: string | null;
    saleItem?: SaleItem | null;
    tenantId: string;
    tenancy?: Tenancy;
    createdAt: Date;
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
};

export type StockMovementWithCreator = StockMovement & {
    createdBy: User;
};