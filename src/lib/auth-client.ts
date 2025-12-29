import { createAuthClient } from "better-auth/react";
import type { Session } from "./auth-types"; 

export const authClient = createAuthClient({
    baseURL: "https://dev-aixdance-api.mazzaux.com.br", 
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