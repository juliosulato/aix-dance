"use server";

import { protectedAction } from "@/lib/auth-guards";
import { FormsOfReceiptService } from "@/services/financial/formsOfReceipt.service";
import { ActionResult } from "@/types/action-result.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";

export const deleteFormOfReceipt = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }
    
    try {
      await FormsOfReceiptService.deleteMany(user.tenancyId, ids);

      revalidatePath("/system/financial/forms-of-receipt", "page");
      ids.forEach((id) =>
        revalidatePath(`/system/financial/forms-of-receipt/${id}`, "page")
      );

      return { success: true };
    } catch (error: unknown) {
      return {
        error: getErrorMessage(error, "Erro ao deletar categoria."),
        success: false,
      };
    }
  }
);
