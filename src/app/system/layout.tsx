import AppShell from "@/components/ui/AppShell";
import { requireAuth } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function SystemLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 const data = await requireAuth();

  return (
    <AppShell session={data}> 
      {children}
    </AppShell>
  );
}