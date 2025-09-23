import AllSuppliersData from "@/components/(others)/(suppliers)/SupplierList";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function SuppliersPage() {

    return (
        <main>
            <Breadcrumps
                items={["Início"]}
                menu={[]} />
            <br />
            <AllSuppliersData/>
        </main>
    );
}