"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateBillInput,
  createBillSchema,
  UpdateBillInput,
  updateBillSchema,
} from "@/schemas/financial/bill.schema";
import { BillsService } from "@/services/bills.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { revalidatePath } from "next/cache";

const PATHS = {
    LIST: "/system/financial/manager/"
}

export const createBill = protectedAction(
  async (
    user,
    _prevState,
    formData: FormData
  ): Promise<ActionState<CreateBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createBillSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      await BillsService.create(user.tenancyId, validatedData.data);

      return { success: true };
    } catch (error) {
      console.error(error);
      return handleServerActionError(error);
    }
  }
);

export const updateBill = protectedAction(
  async (
    user,
    _prevState: ActionState<UpdateBillInput>,
    formData: FormData
  ): Promise<ActionState<UpdateBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const inputForValidation: any = { ...rawData };
    if (
      rawData.amount !== undefined &&
      rawData.amount !== null &&
      rawData.amount !== ""
    ) {
      inputForValidation.amount = String(rawData.amount);
    }

    if (
      rawData.amountPaid !== undefined &&
      rawData.amountPaid !== null &&
      rawData.amountPaid !== ""
    ) {
      const cleaned = String(rawData.amountPaid)
        .replace(/\./g, "")
        .replace(",", ".");
      const num = Number(cleaned);
      inputForValidation.amountPaid = Number.isNaN(num) ? undefined : num;
    }

    const validatedData = updateBillSchema.safeParse(inputForValidation);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    const payload = {
      ...validatedData.data,
      paymentDate: validatedData.data.paymentDate
        ? new Date(validatedData.data.paymentDate)
        : undefined,
    };

    revalidatePath(PATHS.LIST + payload.id);

    try {
      const response = await BillsService.update(user.tenancyId, payload);
      console.log(response, validatedData.data);

      return { success: true };
    } catch (error) {
      return handleServerActionError(error);
    }
  }
);

export const deleteBills = protectedAction(
  async (
    user,
    data: string[] | { id: string; scope: "ONE" | "ALL_FUTURE" }
  ): Promise<ActionResult> => {
    try {
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return { success: false, error: "Nenhum ID fornecido." };
        }
        await BillsService.deleteMany(user.tenancyId, data);

        data.forEach((id) => {
          revalidatePath(PATHS.LIST + id);
        });
      } else {
        await BillsService.deleteOne(user.tenancyId, data.id, data.scope);
        revalidatePath(PATHS.LIST + data.id);
      }
      return { success: true };
    } catch (error: unknown) {
      console.error(error);
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar cobrança.",
      };
    }
  }
);
