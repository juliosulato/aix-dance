"use server";

import { protectedAction } from "@/lib/auth-guards";
import { BanksService } from "@/services/financial/banks.service";
import { ActionResult } from "@/types/action-result.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
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
      revalidatePath("/system/financial/manager", "page");
      ids.forEach((id) => revalidatePath(`/system/financial/banks/${id}`, "page"))
      
      return { success: true };
    } catch (error: unknown) {
      const result = handleServerActionError(error);
      return { success: false, error: result.error ?? "Erro ao deletar conta bancária." };
    }
  }
);
