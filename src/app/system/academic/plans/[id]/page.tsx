import Breadcrumps from "@/components/ui/Breadcrumps";
import { Plan } from "@prisma/client";
import PlanView from "@/components/(academic)/(plans)/([id])";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return  (
        <main>
            <Breadcrumps
                items={["Início", "Acadêmico", "Planos"]}
                menu={[
                    { label: "Alunos", href: "/system/academic/students" },
                    { label: "Turmas", href: "/system/academic/classes" },
                    { label: "Professores", href: "/system/academic/teachers" },
                    { label: "Planos", href: "/system/academic/plans" },
                    { label: "Relatórios", href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <PlanView id={id} />
        </main>
    );
}