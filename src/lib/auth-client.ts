import { createAuthClient } from "better-auth/react";
import type { Session } from "./auth-types"; 

export const authClient = createAuthClient({
    baseURL: process.env.BACKEND_URL || "http://localhost:3001",
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