"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateCategoryBillInput,
  createCategoryBillSchema,
  UpdateCategoryBillInput,
  updateCategoryBillSchema,
} from "@/schemas/financial/category-bill.schema";
import { CategoryBillsService } from "@/services/categoryBills.service";
import { ActionState } from "@/types/server-actions.types";
import { revalidatePath } from "next/cache";
import z from "zod";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { ActionResult } from "@/types/action-result.types";
import { handleValidationErrors } from "@/utils/handleValidationErrors";

const PATHS = {
  LIST: "/system/financial/categories"
}

export const createCategoryBill = protectedAction(
  async (
    user,
    _prevState: ActionState<CreateCategoryBillInput>,
    formData: FormData
  ): Promise<ActionState<CreateCategoryBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const validatedData = createCategoryBillSchema.safeParse(rawData);
  
      if (!validatedData.success) {
        return handleValidationErrors(validatedData.error);
      }

    try {
      await CategoryBillsService.create(user.tenancyId, validatedData.data);

      revalidatePath(PATHS.LIST);

      return { success: true };
    } catch (error: unknown) {
      return handleServerActionError(error);
    }
  }
);

export const updateCategoryBill = protectedAction(
  async (
    user,
    _prevState: ActionState<UpdateCategoryBillInput>,
    formData: FormData
  ): Promise<ActionState<UpdateCategoryBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const validatedData = updateCategoryBillSchema.safeParse(rawData);
    console.log(rawData, validatedData);

    if (!validatedData.success) {
        return handleValidationErrors(validatedData.error);
      }

    try {
      await CategoryBillsService.update(user.tenancyId, validatedData.data);

      revalidatePath(PATHS.LIST);

      return { success: true };
    } catch (error: unknown) {
      console.error("Error updating category bill:", error);
      return handleServerActionError(error);
    }
  }
);

export const deleteCategoryBills = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await CategoryBillsService.deleteMany(user.tenancyId, ids);

      revalidatePath(PATHS.LIST);
      ids.forEach((id) =>
        revalidatePath(`${PATHS.LIST}/${id}`)
      );

      return { success: true };
    } catch (error: unknown) {
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar categoria.",
      };
    }
  }
);
