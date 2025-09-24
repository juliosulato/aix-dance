import Breadcrumps from "@/components/ui/Breadcrumps";
import SupplierView from "@/components/(others)/(suppliers)/View";

export default async function SuppliersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <main>
            <Breadcrumps
                items={["Início", "Fornecedores"]}
                menu={[]}
            />
            <br />
            <SupplierView id={id} />
        </main>
    );
}