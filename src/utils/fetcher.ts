"use client";

import { getSession } from "next-auth/react";

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const session = await getSession();
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  const headers: Record<string, string> = {};

  // Determine if the request targets our API (relative /api/*, same-origin absolute /api/*, or absolute backend base)
  let isApiTarget = false;
  try {
    const u = new URL(url, window.location.href);
    const sameOriginApi = u.origin === window.location.origin && u.pathname.startsWith("/api/");
    const relativeApi = typeof url === "string" && url.startsWith("/api/");
    const absoluteBackend = Boolean(backendBase && typeof url === "string" && url.startsWith(backendBase));
    isApiTarget = sameOriginApi || relativeApi || absoluteBackend;
  } catch {
    // If URL constructor fails, fallback to simple check
    isApiTarget = url.startsWith("/api/");
  }

  if (session?.backendToken && isApiTarget) {
    headers["Authorization"] = `Bearer ${session.backendToken}`;
  }

  const res = await fetch(url, Object.keys(headers).length ? { headers } : undefined);

  if (!res.ok) {
    throw new Error(`Erro ao buscar: ${res.statusText}`);
  }

  return res.json();
};
