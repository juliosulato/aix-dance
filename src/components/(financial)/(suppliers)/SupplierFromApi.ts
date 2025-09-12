import { Address, Supplier } from "@prisma/client";

export interface SupplierFromApi extends Supplier {
    address: Address;
}