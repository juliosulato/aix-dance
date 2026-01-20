import z from "zod";
import { fileSchema } from "../file.schema";



export const baseProductSchema = z.object({
    file: fileSchema,

    name: z.string().min(1, "O nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.coerce.number("O preço deve ser um número.").min(0.01, "O preço é obrigatório (mínimo R$ 0,01)."),
    priceOfCost: z.coerce.number("O preço de custo deve ser um número.").default(0).optional(),
    barcode: z.string().optional(),
    stock: z.coerce.number("O estoque deve ser zero ou mais.").default(0),
    minStock: z.coerce.number("O estoque mínimo deve ser zero (para não receber alertar) ou mais.").default(0),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
    isActive: z.coerce.boolean().default(true),
});

export const createProductSchema = baseProductSchema;
export const updateProductSchema = baseProductSchema.extend({ id: z.cuid2("id inválido.").min(1, "O id é obrigatório.") }).omit({ minStock: true, stock: true });


export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
export type ProductType = CreateProductInput | UpdateProductInput;