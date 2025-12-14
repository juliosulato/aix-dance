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
  const originalFetchRef = useRef<typeof window.fetch>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!originalFetchRef.current) {
      originalFetchRef.current = window.fetch.bind(window);
    }

    if (!BACKEND_BASE_URL || !session?.backendToken) {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
      return;
    }

    const authedFetch: typeof window.fetch = async (input, init) => {
      const targetUrl = typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input?.url;

      if (typeof targetUrl === "string" && targetUrl.startsWith(BACKEND_BASE_URL) && session.backendToken) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${session.backendToken}`);
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
  }, [session?.backendToken]);
}
