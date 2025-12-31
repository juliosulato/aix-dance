export function getErrorMessage(error: unknown, fallback = "Erro desconhecido"): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallback;
}