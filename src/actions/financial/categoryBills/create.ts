"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateCategoryBillInput,
  createCategoryBillSchema,
} from "@/schemas/financial/category-bill.schema";
import { CategoryBillsService } from "@/services/financial/categoryBills.service";
import { ActionState } from "@/types/server-actions.types";
import { revalidatePath } from "next/cache";
import z from "zod";
import { handleServerActionError } from "@/utils/handlerApiErrors";

export const createCategoryBill = protectedAction(
  async (
    user,
    _prevState: ActionState<CreateCategoryBillInput>,
    formData: FormData
  ): Promise<ActionState<CreateCategoryBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const validatedData = createCategoryBillSchema.safeParse(rawData);

    if (!validatedData.success) {
      const flattenedErrors = z.flattenError(validatedData.error);

      return {
        errors: flattenedErrors.fieldErrors,
        success: false,
      };
    }

    try {
      await CategoryBillsService.create(user.tenancyId, validatedData.data);
      
      revalidatePath("/system/financial/categories", "page");

      return { success: true };
    } catch (error: unknown) {
      return handleServerActionError(error);
    }
  }
);
