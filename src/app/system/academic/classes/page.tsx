import Breadcrumps from "@/components/ui/Breadcrumps";
import ClassesData from "@/modules/academic/classes/ClassesData";
import { requireAuth } from "@/lib/auth-guards";
import { serverFetch } from "@/lib/server-fetch";
import { Class } from "@/types/class.types";
import { PaginatedResponse } from "@/types/data-view.types";

export default async function ClassesPageRoute() {
    const { user } = await requireAuth();

    const { data } = await serverFetch<PaginatedResponse<Class>>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user.tenantId}/academic/classes`, {
        method: "GET",
        next: { tags: ["classes"] },
    });

    return (
        <main>
            <Breadcrumps
                items={["Início", "Acadêmico"]}
                menu={[
                    { label: "Alunos", href: "/system/academic/students" },
                    { label: "Turmas", href: "/system/academic/classes" },
                    { label: "Professores", href: "/system/academic/teachers" },
                    { label: "Planos", href: "/system/academic/plans" },
                    { label: "Relatórios", href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <ClassesData data={data} />
        </main>
    );
}