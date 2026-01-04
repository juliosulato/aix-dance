import AllBillsData from "@/components/(financial)/(manager)/BillsList";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { Bank } from "@/types/bank.types";
import { CategoryBill } from "@/types/category.types";
import { Supplier } from "@/types/supplier.types";

export default async function PayablePage() {
  const { user } = await requireAuth();
  const banks = await serverFetch<Bank[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/banks`
  );
    const suppliers = await serverFetch<Supplier[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/suppliers`
  );
    const categories = await serverFetch<CategoryBill[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user?.tenancyId}/categories/bills`
  );

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
      <AllBillsData categories={categories.data}  user={user} banks={banks.data} suppliers={suppliers.data} />
    </main>
  );
}
