import { Product, ProductCategory, Supplier } from "@prisma/client";

type ProductBase = Omit<Product, "image" | "barcode"> & {
    imageUrl?: string | null;
    barCode?: string | null;
};

interface ProductFromAPI  extends ProductBase {
    supplier: Supplier | null;
    category: ProductCategory | null;
}

export default ProductFromAPI;