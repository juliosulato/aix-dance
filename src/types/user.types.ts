import { DefaultSession } from "next-auth";

export type User = {
    id: string;
    tenancyId: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified: boolean;
    password: string;
    image: string | null;
    role: "ADMIN" | "TEACHER" | "STAFF";
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STAFF = "STAFF"
}

export type Account = {
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    createdAt: Date;
    updatedAt: Date;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      country: string;
      tenancyId: string;
      role: UserRole;
      teacherId?: string; 
    } & DefaultSession["user"];
    backendToken?: string;
  }
}

export type Session = {
    sessionToken: string;
    userId: string;
    expires: Date;
    createdAt: Date;
    updatedAt: Date;
}
