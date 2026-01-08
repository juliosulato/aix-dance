import FormOfReceiptView from "@/modules/financial/forms-of-receipt/FormOfReceiptView";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { FormsOfReceipt } from "@/types/receipt.types";

export default async function FormsOfReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await requireAuth();
    const { id } = await params;

    const formOfReceipt = await serverFetch<FormsOfReceipt>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user.tenancyId}/forms-of-receipt/${id}`)

    return (
        <main>
            <Breadcrumps
                items={["Início", "Financeiro", "Formas de Recebimento"]}
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
            <FormOfReceiptView formOfReceipt={formOfReceipt.data} />
        </main>
    );
}