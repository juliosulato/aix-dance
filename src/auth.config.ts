import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { encode } from "next-auth/jwt";
import { prisma } from "./lib/prisma";
import { compareHashedPasswords } from "./utils/passwords";

export default {
  providers: [
    Credentials({
      credentials: {
        email: { type: "text", name: "email" },
        password: { type: "password", name: "password" },
      },
      authorize: async (credentials) => {

        const user = await prisma.user.findFirst({
            where: { email: credentials.email as string },
            include: {
              tenancy: true
            }
          });
        
        if (!user) return null;

        const isPasswordIsValid = await compareHashedPasswords(
          String(credentials.password),
          user.password
        );

        if (!isPasswordIsValid) return null;

        return {
          id: user.id,
          name: user.firstName,
          email: user.email,
          tenancyId: user.tenancyId,
          country: user.tenancy.country,
          role: user.role
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenancyId = user.tenancyId;
        token.country = user.country;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenancyId = token.tenancyId;
        session.user.country = token.country;
        if (process.env.AUTH_SECRET) {
          session.backendToken = await encode({
            token,
            secret: process.env.AUTH_SECRET,
            salt: "",
            maxAge: 60 * 60 * 4,
          });
        }
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  }
} satisfies NextAuthConfig;