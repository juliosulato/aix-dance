import authConfig from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const publicRoutes = [
    "/api/auth/",
    "/auth/signin",
    "/_next",
    "/favicon.ico",
    "/api/auth"
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return;
  }

  if (pathname.startsWith("/system") || pathname.startsWith("/api")) {
    if (!isLoggedIn) {
      if (pathname.startsWith("/api")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return Response.redirect(new URL("/auth/signin", req.url));
    }
  }
});