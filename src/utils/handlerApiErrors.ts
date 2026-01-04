import { ActionState } from "@/types/server-actions.types";
import { ApiErrorResponse, ErrorCodes } from "@/types/api.types";
import { getErrorMessage } from "./getErrorMessage";

function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "success" in error &&
    (error as any).success === false &&
    "error" in error
  );
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === "object" && error !== null && "message" in error;
}

export function handleServerActionError<T>(
  error:
    | { message: string; statusCode: string; validationErrors: unknown }
    | unknown
): ActionState<T> {
  if (isErrorWithMessage(error)) {
    if (error.message && error.message === "CATEGORY_ALREADY_EXISTS") {
      return {
        success: false,
        errors: {
          name: ["Já existe uma categoria com este nome."],
        } as any,
      };
    }

    if (error.message === ErrorCodes.UNAUTHORIZED) {
      return {
        success: false,
        error: "Sessão expirada. Faça login novamente.",
      };
    }

    if (error.message === ErrorCodes.RATE_LIMIT_EXCEEDED) {
      return {
        success: false,
        error: "Limite de requisições excedido. Tente novamente mais tarde.",
      };
    }

    return {
      success: false,
      error: "Erro desconhecido: " + error.message,
    }
  }
  
  if (isApiErrorResponse(error)) {
    const { statusCode, message, validationErrors } = error.error;

    console.error(error)

    if (validationErrors && validationErrors.length > 0) {
      const fieldErrors: Record<string, string[] | undefined> = {};

      validationErrors.forEach((err) => {
        if (!fieldErrors[err.field]) {
          fieldErrors[err.field] = [];
        }
        fieldErrors[err.field]?.push(err.message);
      });

      return {
        success: false,
        errors: fieldErrors as any,
        error: message,
      };
    }

    return {
      success: false,
      error: message || "Ocorreu um erro no servidor.",
    };
  }

  return {
    success: false,
    error: getErrorMessage(
      error,
      "Erro inesperado ao processar a solicitação."
    ),
  };
}
