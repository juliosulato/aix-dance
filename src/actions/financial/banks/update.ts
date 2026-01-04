"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  UpdateBankInput,
  updateBankSchema,
} from "@/schemas/financial/bank.schema";
import { BanksService } from "@/services/financial/banks.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";
import z from "zod";

export const updateBank = protectedAction(
  async (
    user,
    _prevState: ActionState<UpdateBankInput>,
    formData: FormData
  ): Promise<ActionState<UpdateBankInput>> => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateBankSchema.safeParse(rawData);

    if (!validatedData.success) {
      const flattenedErrors = z.flattenError(validatedData.error);

      return {
        errors: flattenedErrors.fieldErrors,
        success: false,
      };
    }

    try {
      await BanksService.update(user.tenancyId, validatedData.data);

      revalidatePath("/system/financial/banks", "page");
      revalidatePath("/system/financial/manager", "page");

      return { success: true };
    } catch (error: unknown) {
      return handleServerActionError(error);
    }
  }
);
