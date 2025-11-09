import { Product, ProductCategory, Supplier } from "@prisma/client";

interface ProductFromAPI  extends Product {
    supplier: Supplier;
    category: ProductCategory;
}

export default ProductFromAPI;