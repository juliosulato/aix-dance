import AllContractModelsPage from "@/components/(others)/(contract-templates)/list";
import AllSuppliersData from "@/components/(others)/(suppliers)/SupplierList";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function ContractModelsPage() {

    return (
        <main>
            <Breadcrumps
                items={["Início"]}
                menu={[]} />
            <br />
            <AllContractModelsPage/>
        </main>
    );
}