import Breadcrumps from "@/components/ui/Breadcrumps";
import CategoryGroupView from "@/modules/financial/category-groups/CategoryGroupView";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { CategoryGroup } from "@/types/category.types";

export default async function CategoryGroupsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { user } = await requireAuth();
    
    const categoryGroup = await serverFetch<CategoryGroup>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user.tenantId}/categories/groups/${id}`);

    return (
        <main>
            <Breadcrumps
                items={["Início", "Financeiro", "Grupos"]}
                menu={[
                    { label: "Resumo", href: "/system/summary" },
                    { label: "Gerenciador", href: "/system/financial/manager" },
                    { label: "Formas de Recebimento", href: "/system/financial/forms-of-receipt" },
                    { label: "Categorias", href: "/system/financial/categories" },
                    { label: "Grupos", href: "/system/financial/category-groups" },
                    { label: "Contas Bancárias", href: "/system/financial/banks" },
                    { label: "Relatórios", href: "/system/financial/reports" },
                ]} />
            <br />
            <CategoryGroupView categoryGroup={categoryGroup.data}/>
        </main>
    );
}