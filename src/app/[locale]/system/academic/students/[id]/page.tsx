import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";
import PlanView from "@/components/(academic)/(plans)/([id])";
import StudentsView from "@/components/(academic)/(students)/StudentView/StudentView";
import { StudentFromApi } from "@/components/(academic)/(students)/StudentFromApi";

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("");
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
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.academic.label"), t("appShell.navbar.academic.students")]}
                menu={[
                    { label: t("appShell.navbar.academic.students"), href: "/system/academic/students" },
                    { label: t("appShell.navbar.academic.classes"), href: "/system/academic/classes" },
                    { label: t("appShell.navbar.academic.teachers"), href: "/system/academic/teachers" },
                    { label: t("appShell.navbar.academic.plans"), href: "/system/academic/plans" },
                    { label: t("appShell.navbar.academic.academicReports"), href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <StudentsView student={student} tenancyId={session.user.tenancyId}/>
        </main>
    );
}