import { getServerSession, SessionData } from "@/lib/auth-server";
import { redirect } from "next/navigation";

/**
 * GUARD PARA SERVER COMPONENTS (Pages/Layouts)
 * Busca a sessão. Se não existir, redireciona para o login imediatamente.
 * Retorna os dados da sessão garantidos (não nulos).
 */
export async function requireAuth(redirectPath: string = "/auth/signin"): Promise<SessionData> {
  const data = await getServerSession();

  if (!data || !data.session) {
    redirect(redirectPath);
  }

  return data;
}

/**
 * GUARD PARA SERVER ACTIONS
 * Higher-Order Function que envolve sua action.
 * Verifica a sessão antes de executar e injeta o `user` como primeiro argumento.
 */
type AuthenticatedAction<T, A extends any[]> = (
  user: SessionData['user'], 
  ...args: A
) => Promise<T>;

export function protectedAction<T, A extends any[]>(action: AuthenticatedAction<T, A>) {
  return async (...args: A): Promise<T> => {
    const data = await getServerSession();

    if (!data || !data.user) {
      throw new Error("Ação não autorizada. Por favor, faça login novamente.");
    }

    // Executa a action original injetando o usuário seguro
    return action(data.user, ...args);
  };
}