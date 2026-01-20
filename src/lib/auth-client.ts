import { createAuthClient } from "better-auth/react";
import type { Session } from "../types/auth-types"; 

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "https://dev-aixdance-api.com.br",
    fetchOptions: {
      credentials: "include",
    }
});

export const useSession = authClient.useSession as () => {
  data: Session | null;
  isPending: boolean;
  error: any;
};


export const { 
    signIn, 
    signOut, 
    signUp,
} = authClient;