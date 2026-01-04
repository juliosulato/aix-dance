type ApiError = {
  code?: string;
  message?: string;
  status?: number;
};

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "message" in error)
  );
}
