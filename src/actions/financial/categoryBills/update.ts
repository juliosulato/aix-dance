"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateCategoryBillInput, updateCategoryBillSchema } from "@/schemas/financial/category-bill.schema";
import { CategoryBillsService } from "@/services/financial/categoryBills.service";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";
import z from "zod";

export const updateCategoryBill = protectedAction(
  async (
    user,
    _prevState: ActionState<UpdateCategoryBillInput>,
    formData: FormData
  ): Promise<ActionState<UpdateCategoryBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const validatedData = updateCategoryBillSchema.safeParse(rawData);

    if (!validatedData.success) {
      const flattenedErrors = z.flattenError(validatedData.error);

      return {
        errors: flattenedErrors.fieldErrors,
        success: false,
      };
    }

    try {
      await CategoryBillsService.update(user.tenancyId, validatedData.data)

      revalidatePath("/system/financial/categories", "page");

      return { success: true };
    } catch (error: unknown) {
      console.error("Error updating category bill:", error);

      return {
        error: getErrorMessage(error, "Erro ao atualiazar categoria de conta."),
        success: false,
      };
    }
  }
);
