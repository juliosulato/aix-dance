import AllTeachersData from "@/components/(academic)/(teachers)";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function TeachersPage() {
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
            <AllTeachersData />
        </main>
    );
}