"use client";

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "https://aixdance.mazzaux.com.br";
  const isRelative = url.startsWith("/");
  
  // Se for relativa, junta com a base. Se for absoluta, usa como está.
  const finalUrl = isRelative ? `${backendBase}${url}` : url;

  const res = await fetch(finalUrl, {
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
    }
  });
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    if (contentType.includes("application/json")) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || `Erro ${res.status}: ${res.statusText}`);
    }

    const bodyText = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status}: ${res.statusText} — resposta não-JSON: ${bodyText.slice(0,1000)}`);
  }

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const bodyText = await res.text().catch(() => "");
  throw new Error(`Resposta inválida: esperado JSON, recebido ${contentType}. Corpo: ${bodyText.slice(0,1000)}`);
};