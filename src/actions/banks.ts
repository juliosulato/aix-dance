"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateBankInput,
  createBankSchema,
  UpdateBankInput,
  updateBankSchema,
} from "@/schemas/financial/bank.schema";
import { BanksService } from "@/services/financial/banks.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { parseFormData } from "@/utils/parserFormData";
import { revalidatePath } from "next/cache";

const PATHS = {
  BANKS_LIST: "/system/financial/banks",
  FINANCIAL_MANAGER: "/system/financial/manager",
};

export const createBank = protectedAction(
  async (
    user,
    _prevState: ActionState<CreateBankInput>,
    formData: FormData
  ): Promise<ActionState<CreateBankInput>> => {
    const rawData = parseFormData(formData);
    const validatedData = createBankSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await BanksService.create(user.tenancyId, validatedData.data);

      revalidatePath(PATHS.FINANCIAL_MANAGER);
      revalidatePath(PATHS.BANKS_LIST);
      
      return { success: true };
    } catch (error: unknown) {
      return handleServerActionError(error);
    }
  }
);

export const updateBank = protectedAction(
  async (
    user,
    _prevState: ActionState<UpdateBankInput>,
    formData: FormData
  ): Promise<ActionState<UpdateBankInput>> => {
    const rawData = parseFormData(formData);
    const validatedData = updateBankSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await BanksService.update(user.tenancyId, validatedData.data);

      revalidatePath(PATHS.BANKS_LIST);
      revalidatePath(PATHS.FINANCIAL_MANAGER);

      return { success: true };
    } catch (error: unknown) {
      return handleServerActionError(error);
    }
  }
);

export const deleteBanks = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }
  
    try {
      await BanksService.deleteMany(user.tenancyId, ids);

      revalidatePath(PATHS.BANKS_LIST);
      revalidatePath(PATHS.FINANCIAL_MANAGER);
      return { success: true };
    } catch (error: unknown) {
      const { error: errorMsg } = handleServerActionError(error);
      return { success: false, error: errorMsg ?? "Erro ao deletar conta bancária." };
    }
  }
);