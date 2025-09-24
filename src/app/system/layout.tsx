import AppShell from "@/components/ui/AppShell";

export default async function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
      <AppShell>
        {children}
      </AppShell>
    );
}