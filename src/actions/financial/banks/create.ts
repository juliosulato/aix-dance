"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateBankInput,
  createBankSchema,
} from "@/schemas/financial/bank.schema";
import { BanksService } from "@/services/financial/banks.service";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";
import z from "zod";

export const createBank = protectedAction(
  async (
    user,
    _prevState: ActionState<CreateBankInput>,
    formData: FormData
  ): Promise<ActionState<CreateBankInput>> => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createBankSchema.safeParse(rawData);

    if (!validatedData.success) {
      const flattenedErrors = z.flattenError(validatedData.error);

      return {
        errors: flattenedErrors.fieldErrors,
        success: false,
      };
    }

    try {
      await BanksService.create(user.tenancyId, validatedData.data)

      revalidatePath("/system/financial/banks", "page")
      return { success: true };
    } catch (error: unknown) {
      return {
        error: getErrorMessage(error, "Erro ao criar conta bancária."),
        success: false,
      };
    }
  }
);
