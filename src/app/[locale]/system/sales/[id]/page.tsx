import { auth } from "@/auth";
import SaleView from "@/components/(academic)/(students)/(sales)/SaleView";
import Breadcrumps from "@/components/ui/Breadcrumps";
import { getTranslations } from "next-intl/server";

export default async function FormsOfReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const t = await getTranslations("");

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.financial.label"), t("appShell.navbar.financial.financialManager"),t("appShell.navbar.financial.sales") ]}
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
            <SaleView saleId={(await params).id} tenancyId={session?.user.tenancyId} />
        </main>
    );
}