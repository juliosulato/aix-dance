import z from "zod";

export const createStockMovement = z.object({
    productId: z.cuid("O ID do produto é obrigatório."),
    quantity: z.number("A quantidade deve ser um número.").min(1, "A quantidade deve ser maior ou igual a 1."),
    reason: z.string().max(255, "O motivo deve ser até 255 caracteres.").optional(),
    type: z.enum(["IN", "OUT", "BALANCE"]),
    createdAt: z.coerce.date("A data de criação deve ser do tipo date.").optional(),
    userId: z.string().optional()
});

export type CreateStockMovementInput = z.input<typeof createStockMovement>;