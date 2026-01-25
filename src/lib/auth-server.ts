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
    image?: string | null;
    role: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  };
}

export async function getServerSession(): Promise<SessionData | null> {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie");
    const userAgent = headersList.get("user-agent") || "";
    const host = headersList.get("host");
    const origin = headersList.get("origin");

    if (!cookie) return null;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    console.log(host); // debug line to check host value

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
        "user-agent": userAgent,
        Origin: origin || `http://${host}`,
        Host: host || "localhost:3000",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Erro Auth Backend [${response.status}]:`,
        await response.text(),
      );
      return null;
    }
    const { user, ...rest } = await response.json();

    const data: SessionData = {
      ...rest,
      user: {
        ...user,
        firstName: user.name,
      },
    };

    return data;
  } catch (error) {
    console.error("Erro ao buscar sessão no servidor:", error);
    return null;
  }
}
