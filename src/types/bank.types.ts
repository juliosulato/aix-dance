import { Decimal } from 'decimal.js';
import { Bill } from './bill.types';

export type Bank = {
    id: string;
    name: string;
    code: string | null;
    agency: string | null;
    account: string | null;
    description: string | null;
    maintenanceFeeAmount: Decimal | null;
    maintenanceFeeDue: number | null;
    bills?: Bill[];
    tenancyId: string;
    createdAt: Date;
    updatedAt: Date;
};
