"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CreateBillInput, createBillSchema } from "@/schemas/financial/bill.schema";
import { BillsService } from "@/services/financial/bills.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import z from "zod";

export const createBill = protectedAction(async (user, _prevState, formData: FormData): Promise<ActionState<CreateBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());
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
        console.error(error);
        return handleServerActionError(error);
    }
})