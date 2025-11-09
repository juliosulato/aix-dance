import AllModalityData from "@/components/(academic)/(modalities)/AllModalityData";
import Breadcrumps from "@/components/ui/Breadcrumps";

export default async function ModalitiesPage() {

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
            <AllModalityData />
        </main>
    );
}