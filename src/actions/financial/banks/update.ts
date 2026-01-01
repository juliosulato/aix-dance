"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  UpdateBankInput,
  updateBankSchema,
} from "@/schemas/financial/bank.schema";
import { BanksService } from "@/services/financial/banks.service";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
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

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        error: getErrorMessage(
          errorMessage,
          "Erro ao atualizar conta bancária."
        ),
        success: false,
      };
    }
  }
);
