"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CategoryGroupsService } from "@/services/categoryGroups.service";
import { ActionResult } from "@/types/action-result.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";

export const deleteCategoryGroups = protectedAction(
  async (user, data: string[]): Promise<ActionResult> => {
    try {
      await CategoryGroupsService.deleteMany(user.tenancyId, data)

      revalidatePath("/system/financial/category-groups", "page");
      
      return { success: true };
    } catch (error: unknown) {
      return {
        error: getErrorMessage(error, "Erro ao deletar grupo."),
        success: false,
      };
    }
  }
);
