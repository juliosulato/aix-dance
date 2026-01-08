import Breadcrumps from "@/components/ui/Breadcrumps";
import BillView from "@/modules/financial/manager/BillView";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { BillComplete } from "@/types/bill.types";
import { Bank } from "@/types/bank.types";
import { Supplier } from "@/types/supplier.types";
import { CategoryBill } from "@/types/category.types";

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
    const { user } = await requireAuth();
    
    const { id } = await params;

    const bill = await serverFetch<BillComplete>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${user.tenancyId}/bills/${id}`);
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
                items={["Início", "Financeiro", "Gerenciador"]}
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
            <BillView 
                bill={bill.data}
                banks={banks.data}
                suppliers={suppliers.data}
                categories={categories.data}
                user={user}
            />
        </main>
    );
}