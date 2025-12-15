"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import theme from "@/utils/theme";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <Notifications className="!z-[2000]" />
        <AuthFetchBridge>{children}</AuthFetchBridge>
      </MantineProvider>
    </SessionProvider>
  );
}

function AuthFetchBridge({ children }: { children: React.ReactNode }) {
  useAttachBackendTokenToFetch();
  return <>{children}</>;
}

function useAttachBackendTokenToFetch() {
  const { data: session } = useSession();
  const originalFetchRef = useRef<typeof window.fetch>(window.fetch);
  const tokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!originalFetchRef.current) {
      originalFetchRef.current = window.fetch.bind(window);
    }

    const authedFetch: typeof window.fetch = async (input, init) => {
      const targetUrl = typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input?.url;

      // Add auth when calling backend base URL or API paths
      const isRelativeApi = typeof targetUrl === "string" && targetUrl.startsWith("/api/");
      const isBackendAbsolute = typeof targetUrl === "string" && BACKEND_BASE_URL && targetUrl.startsWith(BACKEND_BASE_URL);
      // Handle same-origin absolute URLs like https://dev-aixdance.../api/...
      const isSameOriginApi = (() => {
        if (typeof targetUrl !== "string") return false;
        try {
          const u = new URL(targetUrl, window.location.href);
          return u.origin === window.location.origin && u.pathname.startsWith("/api/");
        } catch {
          return false;
        }
      })();

      // Avoid recursion and special-case: don't try to attach to the session endpoint itself
      const isAuthSessionEndpoint = (() => {
        if (typeof targetUrl !== "string") return false;
        try {
          const u = new URL(targetUrl, window.location.href);
          return u.origin === window.location.origin && u.pathname === "/api/auth/session";
        } catch {
          return false;
        }
      })();

      // Try to resolve a token lazily if needed
      let token = tokenRef.current;
      if ((isBackendAbsolute || isRelativeApi || isSameOriginApi) && !token && !isAuthSessionEndpoint) {
        try {
          const res = await originalFetchRef.current!(new URL("/api/auth/session", window.location.href).toString(), {
            credentials: "include",
          } as RequestInit);
          if (res.ok) {
            const data = await res.json();
            token = data?.backendToken || data?.user?.backendToken || data?.session?.backendToken;
            if (typeof token === "string") tokenRef.current = token;
          }
        } catch {
          // ignore
        }
      }

      // Attach Authorization if we have a token
      if ((isBackendAbsolute || isRelativeApi || isSameOriginApi) && token) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        const nextInit: RequestInit = { ...(init ?? {}), headers };
        return originalFetchRef.current!(input as RequestInfo | URL, nextInit);
      }

      return originalFetchRef.current!(input as RequestInfo | URL, init);
    };

    window.fetch = authedFetch;

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, []);

  // Keep tokenRef up-to-date when session changes
  useEffect(() => {
    if (session?.backendToken) {
      tokenRef.current = session.backendToken as string;
    }
  }, [session?.backendToken]);
}
