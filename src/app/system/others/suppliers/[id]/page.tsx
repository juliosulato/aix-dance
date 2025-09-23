import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import SupplierView from "@/components/(others)/(suppliers)/View";
import { SupplierFromApi } from "@/components/(others)/(suppliers)/SupplierFromApi";

export default async function SuppliersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/suppliers/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const supplier: SupplierFromApi = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={["Início", "Fornecedores"]}
                menu={[]}
            />
            <br />
            <SupplierView supplier={supplier} tenancyId={session?.user.tenancyId} />
        </main>
    );
}