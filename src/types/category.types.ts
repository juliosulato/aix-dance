import { Bill } from "./bill.types";

export enum BillNature {
    REVENUE = 'REVENUE',
    EXPENSE = 'EXPENSE',
}

export enum BillCategoryType {
    FIXED = 'FIXED',
    VARIABLE = 'VARIABLE',
}

export type CategoryBill = {
    id: string;
    name: string;
    nature: BillNature;
    type: BillCategoryType;
    parentId: string | null;
    parent?: CategoryBill | null;
    children?: CategoryBill[];
    groupId: string | null;
    group?: CategoryGroup | null;
    bills?: Bill[];
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type CategoryGroup = {
    id: string;
    name: string;
    categories?: CategoryBill[];
    tenantId: string;
};
