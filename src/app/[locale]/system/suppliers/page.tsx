import AllSuppliersData from "@/components/(financial)/(suppliers)/SupplierList";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";

export default async function SuppliersPage() {
    const t = await getTranslations("");

    return (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label")]}
                menu={[]} />
            <br />
            <AllSuppliersData/>
        </main>
    );
}