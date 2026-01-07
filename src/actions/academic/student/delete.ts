"use server";

import { protectedAction } from "@/lib/auth-guards";
import { studentService } from "@/services/academic/student.service";
import { ActionResult } from "@/types/action-result.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { revalidatePath } from "next/cache";

/**
 * Server Action para deletar estudantes.
 * Remove a lógica de fetch do client-side.
 */
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
      ids.forEach((id) => revalidatePath(`/system/academic/students/${id}`, "page"))

      return { success: true }
    } catch (error) {
      const result = handleServerActionError(error);
      return {
        success: false,
        error: result.error ?? "Erro ao deletar conta bancária.",
      };
    }
  }
);
