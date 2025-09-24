"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import theme from "@/utils/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <Notifications className="!z-[2000]" />
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}
