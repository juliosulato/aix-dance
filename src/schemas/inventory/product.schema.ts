import z from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1, "O nome do produto é obrigatório"),
    description: z.string().optional(),
    price: z.number().optional(),
    priceOfCost: z.number().optional(),
    barCode: z.string().optional(),
    stock: z.number().default(0),
    minStock: z.number().default(1),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
    isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.input<typeof updateProductSchema>;
