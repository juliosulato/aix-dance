"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CreateBillInput, createBillSchema } from "@/schemas/financial/bill.schema";
import { BillsService } from "@/services/financial/bills.service";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import z from "zod";

export const createBill = protectedAction(async (user, _prevState, formData: FormData): Promise<ActionState<CreateBillInput>> => {
    const rawData = Object.entries(formData.entries());
    const validatedData = createBillSchema.safeParse(rawData);

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error);

        return {
            success: false,
            errors: flattenedErrors.fieldErrors
        }
    }

    try {
        await BillsService.create(user.tenancyId, validatedData.data);
        
        return { success: true }
    } catch (error) {
        return {
            error: getErrorMessage(error, "Erro inesperado ao criar cobrança. Tente novamente mais tarde."),
            success: false
        }
    }
})