import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";
import { Plan } from "@prisma/client";
import PlanView from "@/components/(academic)/(plans)/([id])";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("");
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/plans/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const plan: Plan = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.academic.label"), t("appShell.navbar.academic.plans")]}
                menu={[
                    { label: t("appShell.navbar.academic.students"), href: "/system/academic/students" },
                    { label: t("appShell.navbar.academic.classes"), href: "/system/academic/classes" },
                    { label: t("appShell.navbar.academic.teachers"), href: "/system/academic/teachers" },
                    { label: t("appShell.navbar.academic.plans"), href: "/system/academic/plans" },
                    { label: t("appShell.navbar.academic.academicReports"), href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <PlanView plan={plan} tenancyId={session.user.tenancyId} />
        </main>
    );
}