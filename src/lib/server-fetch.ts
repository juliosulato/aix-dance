"use server";

import { headers } from "next/headers";
import { ApiError } from "@/types/apiError.types";
import { AppError } from "./AppError";

export async function serverFetch<TResponse = void>(
  input: RequestInfo,
  init?: RequestInit
): Promise<{ data: TResponse }> {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  const response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: cookie,
      "Content-Type": "application/json",
    },
  });

if (!response.ok) {
  const json = await response.json().catch(() => null);
  throw json || { message: "Erro na API", statusCode: response.status };
}

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const minutes = retryAfter ? Math.ceil(Number(retryAfter) / 60) : 15;

    throw new AppError(
      `Rate limit exceeded. Try again in ${minutes}m.`,
      `RATE_LIMIT_EXCEEDED:${minutes}`
    );
  }

  if (response.status === 204) {
    return {} as any;
  }

  return response.json();
}
