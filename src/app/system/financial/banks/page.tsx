import BankAccountsList from "@/modules/financial/banks/BankAccountsList";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { Bank } from "@/types/bank.types";

export default async function BankAccountsPage() {
  const { user } = await requireAuth();

  const banks = await serverFetch<Bank[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user?.tenantId}/financial/banks`)

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
          { label: "Grupos", href: "/system/financial/category-groups" },
          {
            label: "Contas Bancárias",
            href: "/system/financial/banks",
          },
          { label: "Relatórios", href: "/system/financial/reports" },
        ]}
      />
      <br />
      <BankAccountsList banks={banks.data} />
    </main>
  );
}
