import { getServerSession, SessionData } from "@/lib/auth-server";
import { AuthenticatedAction } from "@/types/auth-types";
import { redirect } from "next/navigation";


export async function requireAuth(redirectPath: string = "/auth/signin"): Promise<SessionData> {
  const data = await getServerSession();

  if (!data || !data.session) {
    redirect(redirectPath);
  }

  return data;
}


export function protectedAction<T, A extends any[]>(action: AuthenticatedAction<T, A>) {
  return async (...args: A): Promise<T> => {
    const data = await getServerSession();

    if (!data || !data.user || !data.user.tenancyId) {
      throw new Error("Ação não autorizada. Por favor, faça login novamente.");
    }

    return action(data.user, ...args);
  };
}