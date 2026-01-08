import z from "zod";

export const baseProductSchema = z.object({
    name: z.string().min(1, "O nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.number("O preço deve ser um número.").min(1, "O preço é obrigatório."),
    priceOfCost: z.number("O preço deve ser um número.").min(1, "O preço é obrigatório."),
    barcode: z.string().optional(),
    stock: z.number().default(0),
    minStock: z.number().default(1),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const createProductSchema = baseProductSchema;
export const updateProductSchema = baseProductSchema.extend({ id: z.cuid2("id inválido.").min(1, "O id é obrigatório.") });

export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
