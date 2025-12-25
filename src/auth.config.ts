import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!apiBase) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is required for auth");
}

export default {
  providers: [
    Credentials({
      credentials: {
        email: { type: "text", name: "email" },
        password: { type: "password", name: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${apiBase}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        if (!data?.token || !data?.user) return null;

        return {
          id: data.user.id,
          name: data.user.firstName || data.user.name || data.user.email,
          email: data.user.email,
          tenancyId: data.user.tenancyId,
          country: data.user.country,
          role: data.user.role,
          backendToken: data.token,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 6 * 60 * 60, // 6 horas - sessão expira após 6h de inatividade
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenancyId = user.tenancyId;
        token.country = user.country;
        token.backendToken = user.backendToken;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenancyId = token.tenancyId;
        session.user.country = token.country;
        session.backendToken = token.backendToken;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig;
