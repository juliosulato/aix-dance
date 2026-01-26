"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CreatePlanInput, createPlanSchema, UpdatePlanInput, updatePlanSchema } from "@/schemas/academic/plan.schema";
import { PlanService } from "@/services/academic/plans.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";

export const savePlan = protectedAction(async (user, formData: FormData): Promise<ActionState<CreatePlanInput | UpdatePlanInput>> => {
    const rawData = Object.fromEntries(formData);

    const validatedData = !rawData.id
        ? createPlanSchema.safeParse(rawData)
        : updatePlanSchema.safeParse(rawData);

    if (!validatedData.success) {
        return handleValidationErrors(validatedData.error);
    }

    try {
        if (!rawData.id) {
            const planData = validatedData.data as CreatePlanInput;
            await PlanService.create(user.tenantId, planData);
        } else {
            const dataToUpdate = validatedData.data as UpdatePlanInput;
            await PlanService.update(user.tenantId, dataToUpdate);
        }

        return { success: true };
    } catch (error) {
        !rawData.id
            ? console.error(`Erro ao criar plano na tenant ${user.tenantId}:`, error)
            : console.error(`Erro ao atualizar plano ${rawData.id} na tenant ${user.tenantId}:`, error);
        return handleServerActionError(error);
    }
})