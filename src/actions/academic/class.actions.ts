"use server";

import { ActionState } from "@/types/server-actions.types";
import { protectedAction } from "@/lib/auth-guards";
import {
  CreateClassInput,
  createClassSchema,
  UpdateClassInput,
  updateClassSchema,
} from "@/schemas/academic/class.schema";
import { parseFormData } from "@/utils/server-utils";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { updateTag } from "next/cache";
import { ClassesService } from "@/services/academic/classes.service";

const saveClass = protectedAction(
  async (
    user,
    formData: FormData,
  ): Promise<ActionState<CreateClassInput | UpdateClassInput>> => {
    const rawData = parseFormData(formData, {
      booleans: ["online"],
      jsons: ["days", "students"],
    });

    const validatedData = !rawData.id
      ? createClassSchema.safeParse(rawData)
      : updateClassSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      if (!rawData.id) {
        await ClassesService.create(user.tenantId, validatedData.data as CreateClassInput);
      } else {
        const dataToUpdate = validatedData.data as UpdateClassInput;
        await ClassesService.update(
          user.tenantId,
          dataToUpdate,
          dataToUpdate.id,
        );
      }

      updateTag("classes");

      return { success: true };
    } catch (error) {
      !rawData.id
        ? console.error(
            `Erro ao criar turma na tenant ${user.tenantId}:`,
            error,
          )
        : console.error(
            `Erro ao atualizar turma ${rawData.id} na tenant ${user.tenantId}:`,
            error,
          );
      return handleServerActionError(error);
    }
  },
);

const archiveClass = protectedAction(
  async (user, classId: string): Promise<ActionState<null>> => {
    try {
      await ClassesService.archive(user.tenantId, classId);
      updateTag("classes");
      return { success: true };
    }
    catch (error) {
      console.error(
        `Erro ao arquivar turma ${classId} na tenant ${user.tenantId}:`,
        error,
      );
      return handleServerActionError(error);
    }
  }
);

const deleteManyClasses = protectedAction(
  async (user, classIds: string[]): Promise<ActionState<null>> => {
    if (!Array.isArray(classIds) || classIds.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await ClassesService.deleteMany(user.tenantId, { ids: classIds });

      updateTag("classes");
      return { success: true };
    } catch (error) {
      console.error(
        `Erro ao excluir turmas na tenant ${user.tenantId}:`,
        error,
      );
      return handleServerActionError(error);
    }
  },
);

export { saveClass, deleteManyClasses, archiveClass };