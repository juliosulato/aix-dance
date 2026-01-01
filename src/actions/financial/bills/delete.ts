"use server";

import { protectedAction } from "@/lib/auth-guards";
import { BillsService } from "@/services/financial/bills.service";
import { ActionResult } from "@/types/action-result.types";
import { getErrorMessage } from "@/utils/getErrorMessage";

export const deleteBills = protectedAction(
  async (user, data: string[]): Promise<ActionResult> => {
    if (Array.isArray(data) === false || data.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }
  
    try {
      await BillsService.deleteMany(user.tenancyId, data)
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: getErrorMessage(errorMessage, "Erro ao excluir cobrança(s)."),
      };
    }
  }
);
