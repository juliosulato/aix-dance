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
        password: { type: "password", name: "password" }
      },
      authorize: async (credentials) => {
        // Aqui você só precisa buscar o usuário e retornar
        // A validação já foi feita na server action
        let user = null;

        if ((credentials.user as string).includes("@")) {
          user = await prisma.user.findUnique({
            where: {
              email: credentials.user as string
            }
          });
        } else {
          user = await prisma.user.findUnique({
            where: {
              user: credentials.user as string
            }
          });
        }

        if (!user) {
          return null;
        }

        const isPasswordIsValid = await compareHashedPasswords(String(credentials.password), user.password)

        if (!isPasswordIsValid) {
          return null;
        }

        return {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email
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
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = (user).role;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig)