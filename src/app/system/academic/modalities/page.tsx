import Breadcrumps from "@/components/ui/Breadcrumps";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import ModalitiesData from "@/modules/academic/modalities/ModalitiesData";
import { Modality } from "@/types/class.types";
import { PaginatedResponseLocal } from "@/types/pagination.types";

export default async function ModalitiesPage() {
    const { user } = await requireAuth();
    const modalities = await serverFetch<Modality>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user.tenantId}/academic/modalities`)
    return (
        <main>
            <Breadcrumps
                items={["Início", "Acadêmico"]}
                menu={[
                    { label: "Alunos", href: "/system/academic/students" },
                    { label: "Turmas", href: "/system/academic/classes" },
                    { label: "Professores", href: "/system/academic/teachers" },
                    { label: "Planos", href: "/system/academic/plans" },
                    { label: "Modalidades", href: "/system/academic/modalities" },
                    { label: "Relatórios", href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <ModalitiesData data={modalities.data} />
        </main>
    );
}