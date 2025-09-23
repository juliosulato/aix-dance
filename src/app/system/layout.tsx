import { auth } from "@/auth";
import AppShell from "@/components/ui/AppShell";
import { redirect } from "next/navigation";

export default async function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const session = await auth();

    if (!session) redirect("/auth/signin")
    
    return (
      <AppShell>
        {children}
      </AppShell>
    );
}