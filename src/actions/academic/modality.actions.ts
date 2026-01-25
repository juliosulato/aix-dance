"use server";

import { ActionState } from "@/types/server-actions.types";
import { protectedAction } from "@/lib/auth-guards";
import {
  CreateModalityInput,
  createModalitySchema,
  UpdateModalityInput,
  updateModalitySchema,
} from "@/schemas/academic/modality.schema";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { updateTag } from "next/cache";
import { ModalitiesService } from "@/services/academic/modalities.service";

const saveModality = protectedAction(
  async (
    user,
    formData: FormData,
  ): Promise<ActionState<CreateModalityInput | UpdateModalityInput>> => {
    const rawData = Object.fromEntries(formData);


    const validatedData = !rawData.id
      ? createModalitySchema.safeParse(rawData)
      : updateModalitySchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    try {
      if (!rawData.id) {
        await ModalitiesService.create(user.tenantId, validatedData.data as CreateModalityInput);
      } else {
        const dataToUpdate = validatedData.data as UpdateModalityInput;
        await ModalitiesService.update(
          user.tenantId,
          dataToUpdate,
          rawData.id as string,
        );
      }

      updateTag("modalities");

      return { success: true };
    } catch (error) {
      !rawData.id
        ? console.error(
            `Erro ao criar modalidade na tenant ${user.tenantId}:`,
            error,
          )
        : console.error(
            `Erro ao atualizar modalidade ${rawData.id} na tenant ${user.tenantId}:`,
            error,
          );
      return handleServerActionError(error);
    }
  },
);

const deleteManyModalities = protectedAction(
  async (user, modalityIds: string[]): Promise<ActionState<null>> => {
    if (!Array.isArray(modalityIds) || modalityIds.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await ModalitiesService.deleteMany(user.tenantId, { ids: modalityIds });

      updateTag("modalities");
      return { success: true };
    } catch (error) {
      console.error(
        `Erro ao excluir modalidades na tenant ${user.tenantId}:`,
        error,
      );
      return handleServerActionError(error);
    }
  },
);

export { saveModality, deleteManyModalities };
