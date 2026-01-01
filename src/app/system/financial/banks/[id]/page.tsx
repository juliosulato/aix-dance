import Breadcrumps from "@/components/ui/Breadcrumps";
import BankAccountView from "@/components/(financial)/(banks)/BankAccountView";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { Bank } from "@/types/bank.types";

export default async function FormsOfReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAuth();
  const { id } = await params;

  const bank = await serverFetch<Bank>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks/${id}`)

  return (
    <main>
      <Breadcrumps
        items={["Início", "Financeiro", "Contas Bancárias"]}
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
      <BankAccountView bank={bank} />
    </main>
  );
}
