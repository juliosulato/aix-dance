import { SessionData } from "@/lib/auth-server";
import type { User as BetterAuthUser, Session as BetterAuthSession } from "better-auth/types";

interface CustomFields {
  tenantId: string;
  role: string;
  firstName: string;
  lastName: string;
  image: string | null;
}

export type User = BetterAuthUser & CustomFields;

export interface Session {
  session: BetterAuthSession;
  user: User;
}


export interface GetSession {
  session: BetterAuthSession;
  data: {
    user: User;
  }
}

export type AuthenticatedAction<T, A extends any[]> = (
  user: SessionData['user'], 
  ...args: A
) => Promise<T>;
