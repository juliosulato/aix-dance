"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateCategoryBillInput } from "@/schemas/financial/category-bill.schema";
import {
  CreateCategoryGroupInput,
  createCategoryGroupSchema,
  updateCategoryGroupSchema,
} from "@/schemas/financial/category-group.schema";
import { CategoryGroupsService } from "@/services/financial/categoryGroups.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { parseFormData } from "@/utils/server-utils";
import { revalidatePath } from "next/cache";

const PATHS = {
  LIST: "/system/financial/category-groups",
};

export const createCategoryGroup = protectedAction(
  async (
    user,
    _prevState,
    formData: FormData
  ): Promise<ActionState<CreateCategoryGroupInput>> => {
    const rawData = parseFormData(formData);
    const validatedData = createCategoryGroupSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      const response = await CategoryGroupsService.create(
        user.tenancyId,
        validatedData.data
      );
      console.log(response);

      revalidatePath(PATHS.LIST);
      return { success: true };
    } catch (error: unknown) {
      console.error("Error creating category groups.");
      return handleServerActionError(error);
    }
  }
);

export const updateCategoryGroup = protectedAction(
  async (
    user,
    _prevState,
    formData: FormData
  ): Promise<ActionState<UpdateCategoryBillInput>> => {
    const rawData = parseFormData(formData);
    const validatedData = updateCategoryGroupSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await CategoryGroupsService.update(user.tenancyId, validatedData.data);

      revalidatePath(PATHS.LIST);
      revalidatePath(PATHS.LIST + validatedData.data.id, "page");

      return { success: true };
    } catch (error: unknown) {
      console.error("Error creating category groups.");
      return handleServerActionError(error);
    }
  }
);

export const deleteCategoryGroups = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await CategoryGroupsService.deleteMany(user.tenancyId, ids);

      revalidatePath(PATHS.LIST);

      return { success: true };
    } catch (error: unknown) {
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar grupo.",
      };
    }
  }
);
