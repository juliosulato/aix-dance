"use client";
import DataView from "@/components/ui/DataView";
import { useState } from "react";
import NewPaymentMethod from "./newPaymentMethod";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { LoadingOverlay } from "@mantine/core";
import { useSession } from "next-auth/react";
import { PaymentFee, PaymentMethod as PrismaPaymentMethod } from "@prisma/client";

interface PaymentMethod extends PrismaPaymentMethod {
    fees: PaymentFee[];
}

export default function PaymentMethodsView() {
    const [open, setOpen] = useState<boolean>(false);
    const t = useTranslations("");

    const { data: sessionData, status } = useSession();

    const { data: paymentMethods, error, isLoading } = useSWR<PaymentMethod[]>(
        () =>
            sessionData?.user?.tenancyId
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tenancies/${sessionData.user.tenancyId}/payment-methods`
                : null,
        fetcher
    );

    if (status === "loading" || isLoading) return <LoadingOverlay visible />;
    if (status !== "authenticated") return <div>Você precisa estar logado para criar estudantes.</div>;
    if (error) return <p>Error</p>;

    return (
        <>
            <DataView<PaymentMethod>
                data={paymentMethods || []}
                openNewModal={{
                    func: () => setOpen(true),
                    label: "Novo Aluno"
                }}
                pageTitle="Alunos e Matrículas"
                renderCard={(item) => (
                    <>
                        <div>
                            {item.name}

                            <div>
                                
                            </div>
                        </div>
                    </>
                )
                }

                columns={[
                    { key: "name", label: "Nome" },
                    { key: "operator", label: "Operador" }
                ]}
                searchbarPlaceholder="Pesquise por alguma informação..."
            />
            <NewPaymentMethod opened={open} onClose={() => setOpen(false)} />

        </>
    );
}