"use server";

import { protectedAction } from "@/lib/auth-guards";
import { ApiError } from "@/types/apiError.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { headers } from "next/headers";

type DeleteBankResult = { success: true } | { success: false; error: string };

export const deleteBanks = protectedAction(
  async (user, data: string[]): Promise<DeleteBankResult> => {
    if (Array.isArray(data) === false || data.length === 0) {
      return {
        success: false,
        error: "Nenhum ID fornecido para exclusão.",
      };
    }

    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";

    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks`,
        {
          method: "DELETE",
          headers: {
            Cookie: cookie,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: data }),
        }
      );

      if (!response.ok) {
        const errorData: ApiError = await response.json();

        const errors = errorData.errors
          .map((err) => {
            return err.message;
          })
          .join(", ");

        return {
          success: false,
          error:
            errors || errorData?.message || "Erro ao criar conta bancária.",
        };
      }

      return { success: true };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: getErrorMessage(errorMessage, "Erro ao excluir conta bancária."),
      };
    }
  }
);
