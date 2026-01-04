import Breadcrumps from "@/components/ui/Breadcrumps";
import CategoryBillView from "@/components/(financial)/(categories)/CategoryBillView";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { CategoryBill, CategoryGroup } from "@/types/category.types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user } = await requireAuth();

  const categoryGroups = await serverFetch<CategoryGroup[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user.tenancyId}/categories/groups`);
  const categoryBills = await serverFetch<CategoryBill[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user.tenancyId}/categories/bills`);
  const categoryBill = await serverFetch<CategoryBill>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user.tenancyId}/categories/bills/${id}`);

  return (
    <main>
      <Breadcrumps
        items={["Início", "Financeiro", "Categorias"]}
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
      <CategoryBillView
        categoryBill={categoryBill.data}
        categoryBills={categoryBills.data}
        categoryGroups={categoryGroups.data}
      />
    </main>
  );
}
