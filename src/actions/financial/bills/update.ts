"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateBillInput, updateBillSchema } from "@/schemas/financial/bill.schema";
import { BillsService } from "@/services/financial/bills.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";
import z from "zod";

export const updateBill = protectedAction(async (user, _prevState: ActionState<UpdateBillInput>, formData: FormData): Promise<ActionState<UpdateBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());

    const inputForValidation: any = { ...rawData };
    if (rawData.amount !== undefined && rawData.amount !== null && rawData.amount !== "") {
        inputForValidation.amount = String(rawData.amount);
    }

    if (rawData.amountPaid !== undefined && rawData.amountPaid !== null && rawData.amountPaid !== "") {
        const cleaned = String(rawData.amountPaid).replace(/\./g, '').replace(',', '.');
        const num = Number(cleaned);
        inputForValidation.amountPaid = Number.isNaN(num) ? undefined : num;
    }

    const validatedData = updateBillSchema.safeParse(inputForValidation);
    console.log(rawData, validatedData);

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error);

        return {
            success: false,
            errors: flattenedErrors.fieldErrors
        }
    }

    const payload = {
        ...validatedData.data,
        paymentDate: validatedData.data.paymentDate ? new Date(validatedData.data.paymentDate) : undefined,
    }

    revalidatePath("/system/financial/manager/" + payload.id);

    try {
        const response = await BillsService.update(user.tenancyId, payload);
        console.log(response, validatedData.data);

        return { success: true }
    } catch (error) {
        return handleServerActionError(error);
    }
})