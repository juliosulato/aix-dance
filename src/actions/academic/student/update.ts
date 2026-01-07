"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateStudentInput, updateStudentSchema } from "@/schemas/academic/student.schema";
import { studentService } from "@/services/academic/student.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { parseStudentFormData, buildStudentPayload } from "@/utils/server-utils";
import z from "zod";

export const updateStudent = protectedAction(async (user, formData: FormData, id: string): Promise<ActionState<UpdateStudentInput>> => {
    const rawData = parseStudentFormData(formData);

    const validatedData = updateStudentSchema.safeParse(rawData);

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error).fieldErrors;
        return {
            error: "Erro de validação",
            errors: flattenedErrors,
            success: false,
        };
    }

    const payload = buildStudentPayload(validatedData.data);

    try {
        await studentService.update(user.tenancyId, payload, id);
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar estudante:", error);
        return handleServerActionError(error);
    }
});