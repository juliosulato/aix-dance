import { Address } from './address.types';
import { Bill } from './bill.types';
import { Tenancy } from './tenancy.types';
import { Product } from './product.types';

export type Supplier = {
    id: string;
    tenancyId: string;
    tenancy?: Tenancy;
    name: string;
    corporateReason: string | null;
    documentType: string | null;
    document: string | null;
    email: string | null;
    phoneNumber: string | null;
    cellPhoneNumber: string | null;
    address?: Address | null;
    bills?: Bill[];
    products?: Product[];
    createdAt: Date;
    updatedAt: Date;
};

