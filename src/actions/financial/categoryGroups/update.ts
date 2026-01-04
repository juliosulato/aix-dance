"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateCategoryBillInput } from "@/schemas/financial/category-bill.schema";
import { updateCategoryGroupSchema } from "@/schemas/financial/category-group.schema";
import { CategoryGroupsService } from "@/services/financial/categoryGroups.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";
import z from "zod";

export const updateCategoryGroup = protectedAction(async (user, _prevState, formData: FormData): Promise<ActionState<UpdateCategoryBillInput>> => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = updateCategoryGroupSchema.safeParse(rawData);

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error);
        
        return {
            errors: flattenedErrors.fieldErrors,
            error: "Erro ao atualizar grupo.",
            success: false
        }
    }

    try {
        await CategoryGroupsService.update(user.tenancyId, validatedData.data)
        
        revalidatePath("/system/financial/category-groups", "page")
        
        return { success: true }
    } catch (error: unknown) {
        console.error("Error creating category groups.");
        return handleServerActionError(error);
    }
})