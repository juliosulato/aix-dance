import Breadcrumps from "@/components/ui/Breadcrumps";
import TeacherView from "@/components/(academic)/(teachers)/TeacherView";

export default async function TeacherPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <main>
            <Breadcrumps
                items={["Início", "Acadêmico", "Professores"]}
                menu={[
                    { label: "Alunos", href: "/system/academic/students" },
                    { label: "Turmas", href: "/system/academic/classes" },
                    { label: "Professores", href: "/system/academic/teachers" },
                    { label: "Planos", href: "/system/academic/plans" },
                    { label: "Relatórios", href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <TeacherView id={id} />
        </main>
    );
}