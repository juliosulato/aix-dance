"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  createProductSchema,
  UpdateProductInput,
  updateProductSchema,
  ProductType,
} from "@/schemas/inventory/product.schema";
import { ProductsService } from "@/services/inventory/products.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { buildPayload, parseFormData } from "@/utils/server-utils";
import { updateTag } from "next/cache";

export const saveProductAction = protectedAction(
  async (
    user,
    _prevData: ActionState<ProductType>,
    formData: FormData
  ): Promise<ActionState<ProductType>> => {
    const rawData = parseFormData(formData);
    const validatedData = !rawData.id
      ? createProductSchema.safeParse(rawData)
      : updateProductSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    const payload = buildPayload(validatedData.data);

    try {
      if (!rawData.id) {
        await ProductsService.create(user.tenantId, payload);
      } else if ((validatedData.data as UpdateProductInput).id) {
        const id = (validatedData.data as UpdateProductInput).id;
        await ProductsService.update(user.tenantId, id, payload);
      }

      updateTag("products");

      return { success: true };
    } catch (error) {
      console.error(
        `Error ${
          (validatedData.data as UpdateProductInput)?.id
            ? "updating"
            : "creating"
        } product:`,
        error
      );
      return handleServerActionError(error);
    }
  }
);

export const bulkUpdateProductsStatusAction = protectedAction(
  async (user, ids: string[], isActive: boolean): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      console.log("Nenhum id")
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await ProductsService.bulkUpdateStatus(user.tenantId, { ids, isActive });

      updateTag("products");

      return {
        success: true,
      };
    } catch (error) {
      console.error(error)
      return {
        success: false,
        error:
          handleServerActionError(error).error ?? "Erro ao excluir produtos.",
      };
    }
  }
);

export const deleteProductsAction = protectedAction(
  async (user, ids: string[]): Promise<ActionResult> => {
    if (Array.isArray(ids) === false || ids.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    try {
      await ProductsService.bulkDelete(user.tenantId, ids);
      updateTag("products");

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          handleServerActionError(error).error ?? "Erro ao excluir produtos.",
      };
    }
  }
);
