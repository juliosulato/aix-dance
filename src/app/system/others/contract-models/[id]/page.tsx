import { auth } from "@/auth";
import ContractModelView from "@/components/(others)/(contract-models)/view";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { ContractModel } from "@prisma/client";

export default async function ContractModelPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();

    // Busca os dados do modelo de contrato específico na API
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/contract-models/${id}`,
        { 
            headers: { "Accept": "application/json" },
            cache: 'no-store' // Garante que os dados estejam sempre atualizados
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`O backend retornou ${res.status}: ${text}`);
    }

    const contractModel: ContractModel = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={["Modelos de Contrato", contractModel.title]}
                menu={[]}
            />
            <br />
            <ContractModelView contractModel={contractModel} tenancyId={session?.user.tenancyId} />
        </main>
    );
}
