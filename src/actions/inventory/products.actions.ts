import { protectedAction } from "@/lib/auth-guards";
import {
  CreateProductInput,
  createProductSchema,
  UpdateProductInput,
  updateProductSchema,
} from "@/schemas/inventory/product.schema";
import { ProductsService } from "@/services/inventory/products.service";
import { ActionResult } from "@/types/action-result.types";
import { ActionState } from "@/types/server-actions.types";
import { handleServerActionError } from "@/utils/handlerApiErrors";
import { handleValidationErrors } from "@/utils/handleValidationErrors";
import { buildPayload, parseFormData } from "@/utils/server-utils";

type ProductType = CreateProductInput | UpdateProductInput;

export const saveProductAction = protectedAction(
  async (
    user,
    _prevData: ActionState<ProductType>,
    formData: FormData,
    isEditing?: boolean
  ): Promise<ActionState<ProductType>> => {
    const rawData = parseFormData(formData);
    const validatedData = !isEditing
      ? createProductSchema.safeParse(rawData)
      : updateProductSchema.safeParse(rawData);

    if (!validatedData.success) {
      return handleValidationErrors(validatedData.error);
    }

    const payload = buildPayload(validatedData);

    try {
      if (!isEditing) {
        await ProductsService.create(user.tenancyId, payload);
      } else if ((validatedData.data as UpdateProductInput).id) {
        await ProductsService.update(
          user.tenancyId,
          (validatedData.data as UpdateProductInput).id,
          payload
        );
      }

      return { success: true };
    } catch (error) {
      console.error("Error creating product:", error);
      return handleServerActionError(error);
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
      await ProductsService.deleteMany(user.tenancyId, ids);
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
