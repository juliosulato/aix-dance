import { auth } from "@/auth";
import PaymentMethodView from "@/components/(financial)/(payment-method)/([id])";
import Breadcrumps from "@/components/ui/Breadcrumps";
import InfoTerm from "@/components/ui/Infoterm";
import { SimpleGrid } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { PaymentMethod } from "@/components/(financial)/(payment-method)";

export default async function PaymentMethodPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations("");
    const { id } = await params;

    const session = await auth();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${session?.user.tenancyId}/payment-methods/${id}`,
        { headers: { "Accept": "application/json" } }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend returned ${res.status}: ${text}`);
    }

    const paymentMethod: PaymentMethod = await res.json();

    return session?.user.tenancyId && (
        <main>
            <Breadcrumps
                items={[t("appShell.navbar.home.label"), t("appShell.navbar.financial.label"), t("appShell.navbar.financial.financialPaymentMethods")]}
                menu={[
                    { label: t("appShell.navbar.financial.financialSummary"), href: "/system/summary" },
                    { label: t("appShell.navbar.financial.financialManager"), href: "/system/financial/manager" },
                    { label: t("appShell.navbar.financial.financialPaymentMethods"), href: "/system/financial/payment-methods" },
                    { label: t("appShell.navbar.financial.financialCategories"), href: "/system/financial/categories" },
                    { label: t("appShell.navbar.financial.financialAccounts"), href: "/system/financial/accounts" },
                    { label: t("appShell.navbar.financial.financialReports"), href: "/system/financial/reports" },
                ]} />
            <br />
            <PaymentMethodView paymentMethod={paymentMethod} tenancyId={session?.user.tenancyId} />
        </main>
    );
}