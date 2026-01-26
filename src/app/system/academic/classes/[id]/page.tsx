import Breadcrumps from "@/components/ui/Breadcrumps";
import ClassView from "@/components/(academic)/(class)/ClassView/ClassView";
import { serverFetch } from "@/lib/server-fetch";
import { requireAuth } from "@/lib/auth-guards";
import { Class } from "@/types/class.types";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireAuth();
  const { id } = await params;

  const { data } = await serverFetch<Class>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenants/${user.tenantId}/academic/classes/${id}`, {
          method: "GET",
          next: { tags: ["classes"] },
      });
  
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
