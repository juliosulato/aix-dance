import { auth } from "@/auth";
import FormsOfReceiptView from "@/components/(financial)/(payment-method)/([id])";
import Breadcrumps from "@/components/ui/Breadcrumps";
import InfoTerm from "@/components/ui/Infoterm";
import { SimpleGrid } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { FormsOfReceipt } from "@/components/(financial)/(payment-method)";

export default async function FormsOfReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("");
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/forms-of-receipt/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const formsOfReceipt: FormsOfReceipt = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.financial.label"), t("appShell.navbar.financial.financialFormsOfReceipts")]}
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
            <FormsOfReceiptView formsOfReceipt={formsOfReceipt} tenancyId={session?.user.tenancyId} />
        </main>
    );
}