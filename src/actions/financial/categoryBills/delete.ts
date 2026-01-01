"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CategoryBillsService } from "@/services/categoryBills.service";
import { ActionResult } from "@/types/action-result.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";

export const deleteCategoryBills = protectedAction(
  async (user, data: string[]): Promise<ActionResult> => {
    try {
      await CategoryBillsService.deleteMany(user.tenancyId, data)

      revalidatePath("/system/financial/categories", "page");
      
      return { success: true };
    } catch (error: unknown) {
      return {
        error: getErrorMessage(error, "Erro ao deletar categoria."),
        success: false,
      };
    }
  }
);
