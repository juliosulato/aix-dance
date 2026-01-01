import CategoryGroupsList from "@/components/(financial)/(category-groups)/CategoryGroupsList";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { CategoryGroup } from "@/types/category.types";

export default async function CategoryGroupsPage() {
  const { user } = await requireAuth();

    const categoryGroups = await serverFetch<CategoryGroup[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user.tenancyId}/category-groups`);

    return (
        <main>
            <Breadcrumps
                items={["Início", "Financeiro"]}
                menu={[
                    { label: "Resumo", href: "/system/summary" },
                    { label: "Gerenciador", href: "/system/financial/manager" },
                    { label: "Formas de Recebimento", href: "/system/financial/forms-of-receipt" },
                    { label: "Categorias", href: "/system/financial/categories" },
                    { label: "Grupos", href: "/system/financial/category-groups" },
                    { label: "Contas Bancárias", href: "/system/financial/bank-accounts" },
                    { label: "Relatórios", href: "/system/financial/reports" },
                ]} />
            <br />
            <CategoryGroupsList categoryGroups={categoryGroups}/>
        </main>
    );
}