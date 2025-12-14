"use client";

import { getSession } from "next-auth/react";

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const session = await getSession();
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  const headers: Record<string, string> = {};

  if (session?.backendToken && backendBase && url.startsWith(backendBase)) {
    headers["Authorization"] = `Bearer ${session.backendToken}`;
  }

  const res = await fetch(url, Object.keys(headers).length ? { headers } : undefined);

  if (!res.ok) {
    throw new Error(`Erro ao buscar: ${res.statusText}`);
  }

  return res.json();
};
