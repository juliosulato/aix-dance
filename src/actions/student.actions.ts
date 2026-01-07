"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateStudentInput,
  createStudentSchema,
  UpdateStudentInput,
  updateStudentSchema,
} from "@/schemas/academic/student.schema";
import { studentService } from "@/services/student.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import {
  parseStudentFormData,
  buildStudentPayload,
} from "@/utils/server-utils";
import { revalidatePath } from "next/cache";

export const createStudent = protectedAction(
  async (
    user,
    formData: FormData
  ): Promise<ActionState<CreateStudentInput>> => {
    const rawData = parseStudentFormData(formData);

    const validatedData = createStudentSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    const payload = buildStudentPayload(validatedData.data);

    try {
      await studentService.create(user.tenancyId, payload);
      return { success: true };
    } catch (error) {
      console.error("Erro ao criar estudante:", error);
      return handleServerActionError(error);
    }
  }
);

export const updateStudent = protectedAction(
  async (
    user,
    formData: FormData,
    id: string
  ): Promise<ActionState<UpdateStudentInput>> => {
    const rawData = parseStudentFormData(formData);

    const validatedData = updateStudentSchema.safeParse(rawData);
    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    const payload = buildStudentPayload(validatedData.data);

    try {
      await studentService.update(user.tenancyId, payload, id);
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar estudante:", error);
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
      await studentService.deleteSingleOrMany(user.tenancyId, { ids: ids });
      ids.forEach((id) =>
        revalidatePath(`/system/academic/students/${id}`)
      );

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
