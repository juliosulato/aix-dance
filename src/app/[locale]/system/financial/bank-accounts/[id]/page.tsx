import { auth } from "@/auth";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";
import BanksView from "@/components/(financial)/(banks)/([id])";
import { Bank } from "@prisma/client";

export default async function FormsOfReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("");
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/banks/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const bank: Bank = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.financial.label"), t("appShell.navbar.financial.financialAccounts")]}
                menu={[
                    { label: t("appShell.navbar.financial.financialSummary"), href: "/system/summary" },
                    { label: t("appShell.navbar.financial.financialManager"), href: "/system/financial/manager" },
                    { label: t("appShell.navbar.financial.financialFormsOfReceipts"), href: "/system/financial/forms-of-receipt" },
                    { label: t("appShell.navbar.financial.financialCategories"), href: "/system/financial/categories" },
                    { label: t("appShell.navbar.financial.financialGroups"), href: "/system/financial/groups" },
                    { label: t("appShell.navbar.financial.financialAccounts"), href: "/system/financial/bank-accounts" },
                    { label: t("appShell.navbar.financial.financialReports"), href: "/system/financial/reports" },
                ]} />
            <br />
            <BanksView bank={bank} tenancyId={session?.user.tenancyId} />
        </main>
    );
}