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

    if (!cookie) return null;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    console.log("Cookie", cookie); // debug line to check host value
    console.log("userAgent", userAgent); // debug line to check host value
    console.log("Host", host); // debug line to check host value
    console.log("Origin", origin); // debug line to check host value

    const response = await fetch(`${backendUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
        "user-agent": userAgent,
        Origin: origin || process.env.NODE_ENV === "production" ? `https://${host}` : `http://${host}`,
        Host: host || "localhost:3000",
      },
      cache: "no-store",
    });

    const responseText = await response.text();
    console.log("Response Text from backend:", responseText); // debug line to check raw response

    const responseData = await response.json();

    if (!response.ok || !responseData.session) {
      console.error(
        `Erro Auth Backend [${response.status}]:`,
        await response.text(),
      );
      return null;
    }
    const { user, ...rest } = responseData;

    console.log("Sessão obtida do backend:", { user, ...rest }); // debug line to check session data

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
