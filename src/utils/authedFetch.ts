"use client";

import { getSession } from "next-auth/react";

/**
 * Wrapper para fetch que adiciona Authorization automaticamente em todas as requisições
 * para o backend (rotas /api/v1/...).
 * 
 * @param input - URL ou Request object
 * @param init - RequestInit options
 * @returns Promise<Response>
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const session = await getSession();
  const backendToken = session?.backendToken as string | undefined;

  // Determina se é uma chamada para nossa API
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const isApiCall = url.startsWith("/api/") || url.includes("/api/v1/");

  // Se for API e temos token, adiciona Authorization
  if (isApiCall && backendToken) {
    const headers = new Headers(init?.headers || {});
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${backendToken}`);
    }
    return fetch(input, { ...init, headers });
  }

  return fetch(input, init);
}
