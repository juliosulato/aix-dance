"use client";

import { SWRConfig } from "swr";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/utils/theme";

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
      <SWRConfig
      value={{
        revalidateOnFocus: false,
      }}
    >
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <Notifications className="z-2000!" />
        {children}
      </MantineProvider>
    </SWRConfig>
  );
}
