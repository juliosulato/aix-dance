import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import theme from "@/utils/theme";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { SessionProvider } from "next-auth/react";
import Script from "next/script";

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
      <head>
        <Script src="/runtime-config.js" />
      </head>

      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <MantineProvider defaultColorScheme="light" theme={theme}>
            <Notifications className="!z-[2000]" />
            {children}
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
