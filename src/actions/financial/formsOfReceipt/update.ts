"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateFormsOfReceiptInput, updateFormsOfReceiptSchema } from "@/schemas/financial/forms-receipt.schema";
import { FormsOfReceiptService } from "@/services/financial/formsOfReceipt.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";
import z from "zod";

export const updateFormOfReceipt = protectedAction(async (user, _prevState: ActionState<UpdateFormsOfReceiptInput>, formData: FormData): Promise<ActionState<UpdateFormsOfReceiptInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const validatedData = updateFormsOfReceiptSchema.safeParse({
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
        await FormsOfReceiptService.update(user.tenancyId, validatedData.data)

        revalidatePath("/system/financial/forms-of-receipt", "page");
        revalidatePath("/system/financial/forms-of-receipt/" + validatedData.data.id, "page");
        
        return { success: true }
    } catch (error: unknown) {
        console.error(error)
        return handleServerActionError(error);
    }
});