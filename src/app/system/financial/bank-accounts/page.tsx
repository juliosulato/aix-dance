import AllBanksData from "@/components/(financial)/(banks)/ListBankAccountsData";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function BankAccountsPage() {
  const { user } = await requireAuth();

  const headersList = await headers();
  const cookie = headersList.get("cookie") || "";

  const banksResponse = await fetch(
    `${process.env.BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks`,
    {
      method: "GET",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    }
  );

  if (!banksResponse.ok) {
    return redirect("/errors?code=500");
  }

  const banks = await banksResponse.json();

  return (
    <main>
      <Breadcrumps
        items={["Início", "Financeiro"]}
        menu={[
          { label: "Resumo", href: "/system/summary" },
          { label: "Gerenciador", href: "/system/financial/manager" },
          {
            label: "Formas de Recebimento",
            href: "/system/financial/forms-of-receipt",
          },
          { label: "Categorias", href: "/system/financial/categories" },
          { label: "Grupos", href: "/system/financial/groups" },
          {
            label: "Contas Bancárias",
            href: "/system/financial/bank-accounts",
          },
          { label: "Relatórios", href: "/system/financial/reports" },
        ]}
      />
      <br />
      <AllBanksData banks={banks} user={user} />
    </main>
  );
}
