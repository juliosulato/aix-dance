import { ActionState } from "@/types/server-actions.types";
import z from "zod";

export function handleValidationErrors<T>(error: z.ZodError): ActionState<T> {
  const flattenedErrors = z.flattenError(error);
  
  return {
    errors: flattenedErrors.fieldErrors,
    success: false,
  };
}
