import ContractModelView from "@/components/(others)/(contract-models)/view";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function ContractModelPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <main>
            <Breadcrumps
                items={["Modelos de Contrato"]}
                menu={[]}
            />
            <br />
            <ContractModelView id={id} />
        </main>
    );
}
