"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  UpdateBankInput,
  updateBankSchema,
} from "@/schemas/financial/bank.schema";
import { ApiError } from "@/types/apiError.types";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { headers } from "next/headers";
import z from "zod";

export const updateBank = protectedAction(async (user, _prevState: ActionState<UpdateBankInput>, formData: FormData): Promise<ActionState<UpdateBankInput>> => {
  const rawData = Object.fromEntries(formData.entries());
  const validatedData = updateBankSchema.safeParse(rawData);
  console.log(rawData, validatedData)

  if (!validatedData.success) {
    const flattenedErrors = z.flattenError(validatedData.error);

    return {
      errors: flattenedErrors.fieldErrors,
    };
  }

  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks/${validatedData.data.id}`,
      {
        method: "PUT",
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData.data),
      }
    );
    
     if (!response.ok) {
        const errorData: ApiError = await response.json();

        const errors = errorData.errors.map((err) => {
          return err.message;
        }).join(", ");

        return {
          error: errors || errorData?.message || "Erro ao atualizar conta bancária."
        };
      }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      error: getErrorMessage(errorMessage, "Erro ao atualizar conta bancária."),
    };
  }
}
)