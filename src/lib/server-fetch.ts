"use server";

import { headers } from "next/headers";
import { ApiError } from "@/types/apiError.types";

export async function serverFetch<TResponse = void>(
  input: RequestInfo,
  init?: RequestInit
): Promise<TResponse> {
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
    const error: ApiError = await response.json();
    throw error;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json();
}