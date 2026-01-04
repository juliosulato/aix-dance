"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CreateFormsOfReceiptInput, createFormsOfReceiptSchema } from "@/schemas/financial/forms-receipt.schema";
import { FormsOfReceiptService } from "@/services/financial/formsOfReceipt.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";
import z from "zod";

export const createFormOfReceipt = protectedAction(async (user, _prevState: ActionState<CreateFormsOfReceiptInput>, formData: FormData): Promise<ActionState<CreateFormsOfReceiptInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const validatedData = createFormsOfReceiptSchema.safeParse({
      ...rawData,
      fees: JSON.parse(rawData.fees as string),
    });

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error);

        return {
            errors: flattenedErrors.fieldErrors,
            success: false
        }
    }

    try {
        await FormsOfReceiptService.create(user.tenancyId, validatedData.data)

        revalidatePath("/system/financial/forms-of-receipt", "page");
        return { success: true }
    } catch (error: unknown) {
        return handleServerActionError(error);
    }
});