import {headers} from "next/headers";

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

    if (!cookie) {
      console.log("[getServerSession] No cookie found");
      return null;
    }

    const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    const fetchUrl = `${backendUrl}/api/auth/get-session`;

    const requestOrigin = origin || (process.env.NODE_ENV === "production"
        ? `https://${host}`
        : `http://${host}`);

    console.log("[getServerSession] Request details:", {
      fetchUrl,
      origin: requestOrigin,
      hasCookie: !!cookie,
    });

    const response = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
        "User-Agent": userAgent,
        Origin: requestOrigin,
      },
      credentials: "include",
      cache: "no-store",
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(
        `Erro Auth Backend [${response.status}]:`,
        await response.text(),
      );
      return null;
    }

    const { user, ...rest } = responseData;

    return {
      ...rest,
      user: {
        ...user,
        firstName: user.name,
      },
    };
  } catch (error) {
    console.error("Erro ao buscar sessão no servidor:", error);
    return null;
  }
}
