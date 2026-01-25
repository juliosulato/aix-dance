"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateStudentInput,
  createStudentSchema,
  UpdateStudentInput,
  updateStudentSchema,
} from "@/schemas/academic/student.schema";
import { StudentsService } from "@/services/academic/students.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { buildPayload, parseFormData } from "@/utils/server-utils";

export const saveStudent = protectedAction(
  async (
    user,
    formData: FormData,
    isEditingId?: string
  ): Promise<ActionState<CreateStudentInput | UpdateStudentInput>> => {
    const rawData = parseFormData(formData, {
      booleans: ["canLeaveAlone", "active"],
      jsons: ["address", "guardian"],
    });

    const validatedData = !isEditingId
      ? createStudentSchema.safeParse(rawData)
      : updateStudentSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    const payload = buildPayload(validatedData.data);

    console.log("Payload do estudante:", payload);

    try {
      if (!isEditingId) {
        await StudentsService.create(user.tenantId, payload);
      } else {
        await StudentsService.update(user.tenantId, payload, isEditingId);
      }
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar estudante:", error);
      return handleServerActionError(error);
    }
  }
);

export const deleteStudents = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await StudentsService.deleteMany(user.tenantId, { ids: ids });
      return { success: true };
    } catch (error) {
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar conta bancária.",
      };
    }
  }
);
