"use server";

import { protectedAction } from "@/lib/auth-guards";
import { CreateStudentInput, createStudentSchema } from "@/schemas/academic/student.schema";
import { studentService } from "@/services/academic/student.service";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { parseStudentFormData, buildStudentPayload } from "@/utils/server-utils"; // Importe o utilitário
import z from "zod";

export const createStudent = protectedAction(async (user, formData: FormData): Promise<ActionState<CreateStudentInput>> => {
    const rawData = parseStudentFormData(formData);

    const validatedData = createStudentSchema.safeParse(rawData);

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
        await studentService.create(user.tenancyId, payload);
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar estudante:", error);
        return handleServerActionError(error);
    }
});