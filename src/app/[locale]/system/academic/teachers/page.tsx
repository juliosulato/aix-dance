import AllTeachersData from "@/components/(academic)/(teachers)";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";

export default async function TeachersPage() {
    const t = await getTranslations("");

    return (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.academic.label")]}
                menu={[
                    { label: t("appShell.navbar.academic.students"), href: "/system/academic/students" },
                    { label: t("appShell.navbar.academic.classes"), href: "/system/academic/classes" },
                    { label: t("appShell.navbar.academic.teachers"), href: "/system/academic/teachers" },
                    { label: t("appShell.navbar.academic.plans"), href: "/system/academic/plans" },
                    { label: t("appShell.navbar.academic.academicReports"), href: "/system/academic/academic-reports" }
                ]}
            />
            <br />
            <AllTeachersData />
        </main>
    );
}