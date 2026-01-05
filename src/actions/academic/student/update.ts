"use server";

import { protectedAction } from "@/lib/auth-guards";
import { UpdateStudentFormData, UpdateStudentInput, updateStudentSchema } from "@/schemas/academic/student.schema";
import { studentService } from "@/services/academic/student.service";
import { ActionState } from "@/types/server-actions.types";
import z from "zod";

export const updateStudent = protectedAction(async (user, formData: FormData, id: string): Promise<ActionState<UpdateStudentInput>> => {
    const rawData: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
        if (!['address', 'guardian', 'file'].includes(key)) {
            rawData[key] = value;
        }
    }

    const file = formData.get('file');
    if (file && file instanceof File && file.size > 0) {
        rawData.file = file;
    }

    const addressString = formData.get('address') as string;
    if (addressString) {
        try {
            rawData.address = JSON.parse(addressString);
        } catch {
            rawData.address = undefined;
        }
    }

    const guardianString = formData.get('guardian') as string;
    if (guardianString) {
        try {
            rawData.guardian = JSON.parse(guardianString);
        } catch {
            rawData.guardian = [];
        }
    }

    const validatedData = updateStudentSchema.safeParse(rawData);

    if (!validatedData.success) {
        const flattenedErrors = z.flattenError(validatedData.error).fieldErrors;
        return {
            error: "Erro de validação",
            errors: flattenedErrors,
            success: false,
        };
    }

    const payload = new FormData();

    Object.entries(validatedData.data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'file' && key !== 'address' && key !== 'guardian') {
            payload.append(key, String(value));
        }
    });

    if (validatedData.data.file instanceof File) {
        payload.append('file', validatedData.data.file);
    }

    if (validatedData.data.address) {
        payload.append('address', JSON.stringify(validatedData.data.address));
    }
    
    if (validatedData.data.guardian) {
        payload.append('guardian', JSON.stringify(validatedData.data.guardian));
    }

    try {
        await studentService.update(user.tenancyId, payload, id);
        
        return { success: true };
    } catch (error) {
        console.error("Erro ao criar estudante:", error);
        return {
            success: false,
            error: "Falha ao criar estudante. Tente novamente."
        };
    }
});