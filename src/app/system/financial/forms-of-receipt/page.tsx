import FormsOfReceiptsView from "@/components/(financial)/(payment-method)";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function FormsOfReceiptsPage() {

    return (
        <main>
            <Breadcrumps
                items={["Início", "Financeiro"]}
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
            <FormsOfReceiptsView/>
        </main>
    );
}