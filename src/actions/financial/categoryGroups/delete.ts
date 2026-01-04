"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CategoryGroupsService } from "@/services/financial/categoryGroups.service";
import { ActionResult } from "@/types/action-result.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";

export const deleteCategoryGroups = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      const service = await CategoryGroupsService.deleteMany(user.tenancyId, ids)

      revalidatePath("/system/financial/category-groups");

      return { success: true };
    } catch (error: unknown) {
      const result = handleServerActionError(error);
      return { success: false, error: result.error ?? "Erro ao deletar grupo." };
    }
  }
);
