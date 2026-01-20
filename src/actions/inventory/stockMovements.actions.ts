"use server";

import { protectedAction } from "@/lib/auth-guards";
import { createStockMovement, CreateStockMovementInput } from "@/schemas/inventory/stock-movement";
import { StockMovementsService } from "@/services/inventory/stockMovements.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { updateTag } from "next/cache";

export const createStockMovementAction = protectedAction(
  async (
    user,
    _,
    data: CreateStockMovementInput
  ): Promise<ActionState<CreateStockMovementInput>> => {
    const validatedResult = createStockMovement.safeParse({ ...data, userId: user.id });

    if (!validatedResult.success) {
      return handleValidationErrors(validatedResult.error);
    }

    const validatedData = validatedResult.data;

    try {
      await StockMovementsService.create(user.tenancyId, validatedData);

      updateTag("products");

      return { success: true };
    } catch (error) {
      console.error("Error creating stock movement.", error);
      return handleServerActionError(error);
    }
  }
);

export const deletetockMovementAction = protectedAction(
  async (user, _, id: string): Promise<ActionResult> => {
    if (!id) {
      return {
        success: false,
        error:
          "É necessário fornecer um ID para excluir um movimento de estoque.",
      };
    }

    try {
      await StockMovementsService.delete(user.tenancyId, id);

      updateTag("products");

      return { success: true };
    } catch (error) {
      console.error("Erro ao excluir movimentos de estoque.");
      return {
        success: false,
        error:
          handleServerActionError(error).error ?? "Erro ao excluir produtos.",
      };
    }
  }
);
