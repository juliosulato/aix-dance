import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import PlanView from "@/components/(academic)/(plans)/([id])";
import StudentsView from "@/components/(academic)/(students)/StudentView/StudentView";
import { StudentFromApi } from "@/components/(academic)/(students)/StudentFromApi";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/students/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const student: StudentFromApi = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={["Início", "Acadêmico", "Alunos"]}
                menu={[
                    { label: "Alunos", href: "/system/academic/students" },
                    { label: "Turmas", href: "/system/academic/classes" },
                    { label: "Professores", href: "/system/academic/teachers" },
                    { label: "Planos", href: "/system/academic/plans" },
                    { label: "Relatórios", href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <StudentsView student={student} tenancyId={session.user.tenancyId}/>
        </main>
    );
}