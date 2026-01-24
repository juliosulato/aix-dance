"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateFormsOfReceiptInput,
  createFormsOfReceiptSchema,
  UpdateFormsOfReceiptInput,
  updateFormsOfReceiptSchema,
} from "@/schemas/financial/forms-receipt.schema";
import { FormsOfReceiptService } from "@/services/financial/formsOfReceipt.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { parseFormData } from "@/utils/server-utils";
import { revalidatePath } from "next/cache";

const PATHS = {
    LIST: `/system/financial/forms-of-receipt`
}
export const createFormOfReceipt = protectedAction(
  async (
    user,
    _prevState: ActionState<CreateFormsOfReceiptInput>,
    formData: FormData
  ): Promise<ActionState<CreateFormsOfReceiptInput>> => {
    const rawData = parseFormData(formData);

    const validatedData = createFormsOfReceiptSchema.safeParse({
      ...rawData,
      fees: JSON.parse(rawData.fees as string),
    });

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await FormsOfReceiptService.create(user.tenantId, validatedData.data);

      revalidatePath("/system/financial/forms-of-receipt");
      return { success: true };
    } catch (error: unknown) {
      return handleServerActionError(error);
    }
  }
);

export const updateFormOfReceipt = protectedAction(
  async (
    user,
    _prevState: ActionState<UpdateFormsOfReceiptInput>,
    formData: FormData
  ): Promise<ActionState<UpdateFormsOfReceiptInput>> => {
    const rawData = parseFormData(formData);

    const validatedData = updateFormsOfReceiptSchema.safeParse({
      ...rawData,
      fees: JSON.parse(rawData.fees as string),
    });

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await FormsOfReceiptService.update(user.tenantId, validatedData.data);

      revalidatePath(PATHS.LIST);
      revalidatePath(PATHS.LIST + validatedData.data.id);

      return { success: true };
    } catch (error: unknown) {
      console.error(error);
      return handleServerActionError(error);
    }
  }
);

export const deleteFormOfReceipt = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await FormsOfReceiptService.deleteMany(user.tenantId, ids);

      revalidatePath("/system/financial/forms-of-receipt");
      return { success: true };
    } catch (error: unknown) {
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar forma de recebimento.",
      };
    }
  }
);
