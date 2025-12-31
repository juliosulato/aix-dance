"use client";

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const backendBase = "https://dev-aixdance-api.mazzaux.com.br"; 
  const isRelative = url.startsWith("/");
  
  // Se for relativa, junta com a base. Se for absoluta, usa como está.
  const finalUrl = isRelative ? `${backendBase}${url}` : url;

  const res = await fetch(finalUrl, {
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || `Erro ${res.status}: ${res.statusText}`);
  }

  return res.json();
};