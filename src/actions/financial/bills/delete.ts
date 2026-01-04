"use server";

import { protectedAction } from "@/lib/auth-guards";
import { BillsService } from "@/services/financial/bills.service";
import { ActionResult } from "@/types/action-result.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";

export const deleteBills = protectedAction(
  async (
    user,
    data: string[] | { id: string; scope: "ONE" | "ALL_FUTURE" }
  ): Promise<ActionResult> => {
    try {
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return { success: false, error: "Nenhum ID fornecido." };
        }
        await BillsService.deleteMany(user.tenancyId, data);

        data.forEach((id) => {
          revalidatePath("/system/financial/manager/" + id);
        });
      } else {
        await BillsService.deleteOne(user.tenancyId, data.id, data.scope);
        revalidatePath("/system/financial/manager/" + data.id);
      }
      return { success: true };
    } catch (error: unknown) {
      console.error(error);
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar cobrança.",
      };
    }
  }
);
