import ListAllUsers from "@/components/(settings)/users/ListAllUsers";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";

export default async function UsersPage() {
    const t = await getTranslations("");

    return (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.settings.label")]}
                menu={[
                    { label: t("appShell.navbar.settings.company"), href: "/system/settings/company" },
                    { label: t("appShell.navbar.settings.users"), href: "/system/settings/users" },
                ]}
            />
            <ListAllUsers />
        </main>
    );
}