import z from "zod";

export const createStockMovement = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    reason: z.string().max(255).optional(),
    type: z.enum(["IN", "OUT", "BALANCE"]),
    createdAt: z.coerce.date().optional(),
});

export const updateStockMovementSchema = createStockMovement.partial();

export type CreateStockMovementInput = z.input<typeof createStockMovement>;
export type UpdateStockMovementInput = z.input<typeof updateStockMovementSchema>;