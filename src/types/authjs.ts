import { DefaultSession } from "next-auth";

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      country: string;
      tenancyId: string;
    } & DefaultSession["user"];
  }
}