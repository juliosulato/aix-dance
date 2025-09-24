import Breadcrumps from "@/components/ui/Breadcrumps";
import CategoryGroupView from "@/components/(financial)/(groups)/([id])";

export default async function CategoryGroupsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
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
            <CategoryGroupView id={id}/>
        </main>
    );
}