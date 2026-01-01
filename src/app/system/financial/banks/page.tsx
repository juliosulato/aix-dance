import BankAccountsList from "@/components/(financial)/(banks)/BankAccountsList";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { Bank } from "@/types/bank.types";

export default async function BankAccountsPage() {
  const { user } = await requireAuth();
  const banks = await serverFetch<Bank[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks`)

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
      <BankAccountsList banks={banks} />
    </main>
  );
}
