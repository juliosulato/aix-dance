import { auth } from "@/auth";
import AppShell from "@/components/ui/AppShell";
import { redirect } from "next/navigation";

export default async function SystemLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string; }>
}>) {
    const session = await auth();

    if (!session) redirect("/auth/signin")
    
    return (
      <AppShell>
        {children}
      </AppShell>
    );
}