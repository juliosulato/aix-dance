import { auth } from "@/auth";
import SaleView from "@/components/(academic)/(students)/(sales)/SaleView";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function FormsOfReceiptPage({ params }: { params: Promise<{ id: string }> }) {

    return (
        <main>
            <Breadcrumps
                items={["Início", "Financeiro", "Gerenciador", "Vendas"]}
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
            <SaleView saleId={(await params).id} />
        </main>
    );
}