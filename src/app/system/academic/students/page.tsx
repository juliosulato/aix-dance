import AllPlansData from "@/components/(academic)/(plans)";
import AllStudentsData from "@/components/(academic)/(students)";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function StudentsPage() {
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
            <AllStudentsData />
        </main>
    );
}