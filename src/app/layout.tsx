import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "@/utils/theme";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

const inter = Inter({
  variable: "--font-inter",
  weight: "variable",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  subsets: ["latin-ext", "latin"],
});

export const metadata: Metadata = {
  title: "AIX Dance",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>
          <SWRConfig value={{
            revalidateOnFocus: false
          }}>
            <SessionProvider>
          <MantineProvider defaultColorScheme="light" theme={theme}>
            <Notifications className="!z-[2000]" />
            {children}
          </MantineProvider>
        </SessionProvider>
          </SWRConfig>
      </body>
    </html>
  );
}
