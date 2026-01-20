import Decimal from "decimal.js";
import { Supplier } from "./supplier.types";
import { OrderItem, StockMovement } from "./inventory.types";
import { SaleItem } from "./sale.types";
import { Tenancy } from "./tenancy.types";

export type Product = {
    id: string;
    sku: number;
    name: string;
    description: string | null;
    price: Decimal | null;
    priceOfCost: Decimal | null;
    barcode: string | null;
    stock: number;
    minStock: number;
    image: string | null;
    categoryId: string | null;
    category?: ProductCategory | null;
    isActive: boolean;
    supplierId: string | null;
    supplier?: Supplier | null;
    orderItems?: OrderItem[];
    saleItems?: SaleItem[];
    stockMovements?: StockMovement[];
    createdAt: Date;
    updatedAt: Date;
    tenancyId: string;
    tenancy?: Tenancy;
};


export type ProductCategory = {
    id: string;
    name: string;
    products?: Product[];
    tenancyId: string;
    tenancy?: Tenancy;
    createdAt: Date;
    updatedAt: Date;
};

export interface ProductWithStockMovement extends Product {
    stockMovements: StockMovement[];
}