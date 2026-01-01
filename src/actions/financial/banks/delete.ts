"use server";

import { protectedAction } from "@/lib/auth-guards";
import { BanksService } from "@/services/financial/banks.service";
import { ActionResult } from "@/types/action-result.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";

export const deleteBanks = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }
  
    try {
      await BanksService.deleteMany(user.tenancyId, ids)

      revalidatePath("/system/financial/banks", "page")
      ids.forEach((id) => revalidatePath(`/system/financial/banks/${id}`, "page"))
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: getErrorMessage(errorMessage, "Erro ao excluir conta bancária."),
      };
    }
  }
);
