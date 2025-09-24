import Breadcrumps from "@/components/ui/Breadcrumps";
import ClassView from "@/components/(academic)/(class)/ClassView/ClassView";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  return (
    <main>
      <Breadcrumps
        items={["Início", "Acadêmico", "Turmas"]}
        menu={[
          { label: "Alunos", href: "/system/academic/students" },
          { label: "Turmas", href: "/system/academic/classes" },
          { label: "Professores", href: "/system/academic/teachers" },
          { label: "Planos", href: "/system/academic/plans" },
          { label: "Relatórios", href: "/system/academic/academic-reports" },
        ]}
      />
      <br />
      <ClassView id={id} />
    </main>
  );
}
