"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CreateCategoryGroupInput, createCategoryGroupSchema } from "@/schemas/financial/category-group.schema";
import { CategoryGroupsService } from "@/services/categoryGroups.service";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidatePath } from "next/cache";
import z from "zod";

export const createCategoryGroup = protectedAction(async (user, _prevState, formData: FormData): Promise<ActionState<CreateCategoryGroupInput>> => {
    const rawData = Object.entries(formData.entries());
    const validatedData = createCategoryGroupSchema.safeParse(rawData);

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error);

        return {
            errors: flattenedErrors.fieldErrors,
            success: false
        }
    }

    try {
        await CategoryGroupsService.create(user.tenancyId, validatedData.data)

        revalidatePath("/system/financial/category-groups")
        return { success: true }
    } catch (error: unknown) {
        console.error("Error creating category groups.")

        return {
            error: getErrorMessage(error, "Erro inesperado ao criar grupo, tente novamente mais tarde."),
            success: false
        }
    }
});