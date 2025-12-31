"use server";

import { protectedAction } from "@/lib/auth-guards";
import {
  CreateBankInput,
  createBankSchema,
} from "@/schemas/financial/bank.schema";
import { ApiError } from "@/types/apiError.types";
import { ActionState } from "@/types/server-actions.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { headers } from "next/headers";
import z from "zod";

export const createBank = protectedAction(async (user, _prevState: ActionState<CreateBankInput>,  formData: FormData
  ): Promise<ActionState<CreateBankInput>> => {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = createBankSchema.safeParse(rawData);

    if (!validatedData.success) {
      const flattenedErrors = z.flattenError(validatedData.error);

      return {
        errors: flattenedErrors.fieldErrors,
      };
    }

    console.log(validatedData.data);
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks`,
        {
          method: "POST",
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
          error: errors || errorData?.message || "Erro ao criar conta bancária."
        };
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        error: getErrorMessage(errorMessage, "Erro ao criar conta bancária."),
      };
    }
  }
);
