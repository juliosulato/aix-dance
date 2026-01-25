import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import Provider from "@/components/Provider";

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
          <Provider>{children}</Provider>
      </body>
    </html>
  );
}
