import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { prisma } from "./lib/prisma";
import { compareHashedPasswords } from "./utils/passwords";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        user: { type: "text", name: "user" },
        password: { type: "password", name: "password" },
        remember: { type: "boolean" }
      },
      authorize: async (credentials) => {
        let user = null;

        if ((credentials.user as string).includes("@")) {
          user = await prisma.user.findFirst({
            where: { email: credentials.user as string }
          });
        } else {
          user = await prisma.user.findFirst({
            where: { user: credentials.user as string }
          });
        }

        if (!user) return null;

        const isPasswordIsValid = await compareHashedPasswords(
          String(credentials.password),
          user.password
        );

        if (!isPasswordIsValid) return null;

        return {
          id: user.id,
          role: user.role,
          name: user.firstName,
          email: user.email,
          remember: credentials.remember === "true" || credentials.remember === "on"
        }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true
    }),
    Facebook({
      allowDangerousEmailAccountLinking: true,
      clientId: process.env.AUTH_FACEBOOK_ID!,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET!,
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // default = 1 dia
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.remember = user.remember;

        // Define expiração conforme "lembrar-me"
        token.exp = Math.floor(Date.now() / 1000) + (
          user.remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
        );
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error"
  }
} satisfies NextAuthConfig)
