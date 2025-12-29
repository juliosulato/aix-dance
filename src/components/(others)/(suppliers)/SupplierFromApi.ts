import { Address } from "@/types/address.types";
import { Supplier } from "@/types/supplier.types";

export interface SupplierFromApi extends Supplier {
    address: Address;
}