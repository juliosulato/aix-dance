import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { CategoryGroup } from "@prisma/client";
import CategoryGroupView from "@/components/(financial)/(groups)/([id])";

export default async function CategoryGroupsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/category-groups/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const categoryGroup: CategoryGroup = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={["Início", "Financeiro", "Grupos"]}
                menu={[
                    { label: "Resumo", href: "/system/summary" },
                    { label: "Gerenciador", href: "/system/financial/manager" },
                    { label: "Formas de Recebimento", href: "/system/financial/forms-of-receipt" },
                    { label: "Categorias", href: "/system/financial/categories" },
                    { label: "Grupos", href: "/system/financial/groups" },
                    { label: "Contas Bancárias", href: "/system/financial/bank-accounts" },
                    { label: "Relatórios", href: "/system/financial/reports" },
                ]} />
            <br />
            <CategoryGroupView categoryGroup={categoryGroup} tenancyId={session?.user.tenancyId} />
        </main>
    );
}