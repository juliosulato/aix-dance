import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { ClassFromApi } from "@/components/(academic)/(class)";
import ClassView from "@/components/(academic)/(class)/ClassView/ClassView";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/classes/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const classes: ClassFromApi = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={["Início", "Acadêmico", "Turmas"]}
                menu={[
                    { label: "Alunos", href: "/system/academic/students" },
                    { label: "Turmas", href: "/system/academic/classes" },
                    { label: "Professores", href: "/system/academic/teachers" },
                    { label: "Planos", href: "/system/academic/plans" },
                    { label: "Relatórios", href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <ClassView classData={classes as any}  tenancyId={session?.user.tenancyId}/>
        </main>
    );
}