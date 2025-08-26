import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";

export default async function StudentsPage() {
    const t = await getTranslations("appShell");
    return (
        <main>
            <Breadcrumps

                items={[ t("navbar.home.label"),  t("navbar.academic.label")]}
                menu={[
                    { label: t("navbar.academic.students"), href: "/system/students" },
                    { label: t("navbar.academic.classes"), href: "/system/academic/classes" },
                    { label: t("navbar.academic.teachers"), href: "/system/academic/professores" },
                    { label: t("navbar.academic.academicReports"), href: "/system/academic/relatorios" },
                ]} />
        </main>
    )

}