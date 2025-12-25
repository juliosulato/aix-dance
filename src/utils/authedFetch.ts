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
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
  const backendApiPrefix = "/api/v1";

  // Determina se é uma chamada para nossa API
  const resolveUrl = (raw: string): string => {
    if (!backendBase) {
      return raw;
    }

    try {
      const parsed = new URL(raw, window.location.origin);
      const isLocalApiV1 = parsed.origin === window.location.origin && parsed.pathname.startsWith(backendApiPrefix);
      if (isLocalApiV1) {
        return `${backendBase}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }

      const isBackendAbsolute = parsed.origin === new URL(backendBase).origin;
      if (isBackendAbsolute) {
        return parsed.toString();
      }
    } catch {
      if (raw.startsWith(backendApiPrefix)) {
        return `${backendBase}${raw}`;
      }
    }

    if (raw.startsWith(backendApiPrefix)) {
      return `${backendBase}${raw}`;
    }

    return raw;
  };

  const originalUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const resolvedUrl = resolveUrl(originalUrl);
  const isBackendApiCall = Boolean(backendBase && resolvedUrl.startsWith(backendBase));

  let finalInput: RequestInfo | URL = input;

  if (typeof input === "string") {
    finalInput = resolvedUrl;
  } else if (input instanceof URL) {
    finalInput = new URL(resolvedUrl);
  } else if (resolvedUrl !== input.url) {
    finalInput = new Request(resolvedUrl, input);
  }

  // Se for API e temos token, adiciona Authorization
  if (isBackendApiCall && backendToken) {
    const headers = new Headers(init?.headers || {});
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${backendToken}`);
    }
    return fetch(finalInput, { ...init, headers });
  }

  return fetch(finalInput, init);
}
