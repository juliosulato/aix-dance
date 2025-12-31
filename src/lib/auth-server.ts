import { headers } from "next/headers";

export interface SessionData {
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    image?: string | null;
    role?: string;
    tenancyId?: string;  
    firstName?: string;
    lastName?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export async function getServerSession(): Promise<SessionData | null> {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");
    const userAgent = headersList.get("user-agent");

    if (!cookie) return null;

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        // Repassa os headers vitais para validação
        cookie: cookie,
        "user-agent": userAgent || "",
      },
      cache: "no-store", // Garante dados frescos
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as SessionData;
  } catch (error) {
    console.error("Erro ao buscar sessão no servidor:", error);
    return null;
  }
}